#!/usr/bin/env node
/**
 * Deploys one exact commit to Render and does not return until that commit is the one
 * serving traffic.
 *
 * Why the pipeline owns this instead of trusting the provider's push webhook: Render's
 * GitHub App delivers a `push` event, and when a delivery is lost Render never reconciles —
 * nothing polls the branch, so the service keeps running the previous commit forever while
 * `main` moves on. That is not hypothetical here. The service is configured correctly
 * (`autoDeploy: yes`, `autoDeployTrigger: commit`, branch `main`, no build filter), and the
 * deploys still stopped dead:
 *
 *   - 2026-09-18T10:15:56Z  dep for 2def6f9f, trigger `new_commit`   ← last automatic deploy
 *   - … eight merges land on `main` in the next five days, no deploy, no event, not even a
 *     failed one; Render's own events feed has nothing to show for them
 *   - 2026-09-23T07:37:28Z  dep for 346d9020, trigger `new_commit`   ← delivery arrives again
 *   - 2026-09-23T09:29:00Z  b2f5f755 lands on `main` (PR #240) … nothing
 *
 * Those eight were harmless by luck — none of them touched `backend/`, so the older code was
 * behaviourally equivalent. The ninth window, PR #240, deployed only because an operator
 * triggered it by hand through the API five hours later. A push nobody notices is a backend
 * change that never reaches production, and the only visible symptom is a customer-facing bug
 * that "was already fixed".
 *
 * The frontend does not have this problem because the pipeline deploys it
 * (`.github/workflows/vercel-deploy.yml`). This script gives the backend the same property:
 *
 *   1. It resolves the commit that `main` says should be running.
 *   2. It audits the service before touching it — the repo, the branch and `autoDeploy` are
 *      the settings whose silent drift produces exactly the failure above.
 *   3. It looks for an existing deploy of that commit and reuses it, so the webhook arriving
 *      *and* the pipeline running produce one deploy, not two restarts of production.
 *   4. It triggers `POST /services/{id}/deploys` with an explicit `commitId` when nothing is
 *      arriving, and waits for a terminal status.
 *   5. It asks the live instance whether it is healthy, and whether its Supabase project
 *      matches the one it was pinned to.
 *
 * Usage:
 *   node scripts/render-deploy.mjs [--commit <sha>] [--wait <seconds>] [--force] [--dry-run]
 *
 * Environment:
 *   RENDER_API_KEY       required — Render API key (`rnd_…`)
 *   RENDER_SERVICE_ID    optional — `srv-…`; discovered by name when unset
 *   RENDER_SERVICE_NAME  optional — default `englishengineer-backend`
 *   RENDER_DEPLOY_BRANCH optional — default `main`
 *   RENDER_DEPLOY_REPO   optional — default `libyaelectric-ctrl/englishengineer`
 *   EXPECTED_COMMIT      optional — the commit to deploy; falls back to GITHUB_SHA, then HEAD
 */
import { execFileSync } from 'node:child_process';

const API = 'https://api.render.com/v1';

const DEFAULT_SERVICE_NAME = 'englishengineer-backend';
const DEFAULT_REPO = 'libyaelectric-ctrl/englishengineer';
const DEFAULT_BRANCH = 'main';

/** The only status that means "this commit is serving traffic". */
const LIVE = 'live';
/** Terminal, in progress, and terminal-bad, kept apart so a wait is never a silent timeout. */
const RUNNING = new Set([
  'created',
  'build_in_progress',
  'update_in_progress',
  'pre_deploy_in_progress',
]);
const FAILED = new Set(['build_failed', 'update_failed', 'pre_deploy_failed']);
/**
 * Superseded or cancelled rather than broken: the commit is simply not the live one, so the
 * answer is to deploy it again instead of reporting a failure the code did not cause.
 */
const SUPERSEDED = new Set(['deactivated', 'canceled', 'cancelled']);

const USAGE = `node scripts/render-deploy.mjs [options]

  --commit <sha>    commit to deploy (default: EXPECTED_COMMIT, GITHUB_SHA, then git HEAD)
  --wait <seconds>  how long to wait for a terminal deploy status (default: 900)
  --interval <secs> poll interval while waiting (default: 10)
  --service <id>    Render service id (default: RENDER_SERVICE_ID, then lookup by name)
  --branch <name>   branch the service must be wired to (default: main)
  --force           trigger a new deploy even when this commit already has one
  --dry-run         report what would happen; never POST
  --help            this text`;

const parseArgs = (argv) => {
  const options = {
    commit: undefined,
    wait: 900,
    interval: 10,
    service: undefined,
    branch: process.env.RENDER_DEPLOY_BRANCH || DEFAULT_BRANCH,
    force: false,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [name, inline] = arg.includes('=') ? arg.split(/=(.*)/s, 2) : [arg, undefined];
    const value = () => {
      if (inline !== undefined) return inline;
      index += 1;
      if (index >= argv.length) stop(`${name} needs a value`, 2);
      return argv[index];
    };
    if (name === '--help' || name === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (name === '--commit') options.commit = value();
    else if (name === '--wait') options.wait = Number(value());
    else if (name === '--interval') options.interval = Number(value());
    else if (name === '--service') options.service = value();
    else if (name === '--branch') options.branch = value();
    else if (name === '--force') options.force = true;
    else if (name === '--dry-run') options.dryRun = true;
    else stop(`unknown argument: ${arg}\n\n${USAGE}`, 2);
  }
  if (!Number.isFinite(options.wait) || options.wait < 0) stop('--wait must be a number', 2);
  if (!Number.isFinite(options.interval) || options.interval < 1)
    stop('--interval must be >= 1', 2);
  return options;
};

const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const note = (message) => console.log(`     ${message}`);
const fail = (message) => {
  failures.push(message);
  console.error(`FAIL ${message}`);
};
const skip = (message) => console.log(`SKIP ${message}`);

const stop = (message, code) => {
  console.error(`FAIL ${message}`);
  process.exit(code);
};

const git = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
};

/** `a` may be abbreviated (`b2f5f75`); GitHub and Render both hand out full shas. */
const sameCommit = (left, right) => {
  const a = String(left || '').toLowerCase();
  const b = String(right || '').toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 7 && long.startsWith(short);
};

const normalizeRepo = (value) =>
  String(value || '')
    .replace(/^git@github\.com:/i, '')
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();

const deployUrl = (serviceId, deployId) =>
  `https://dashboard.render.com/web/${serviceId}/deploys/${deployId}`;

const apiKey = () => {
  const key = process.env.RENDER_API_KEY?.trim();
  if (!key) {
    stop(
      'RENDER_API_KEY is not set. The pipeline reads it from the `RENDER_API_KEY` repository secret; ' +
        'locally, export it before running this command.',
      2
    );
  }
  return key;
};

/** A call whose failure the caller wants to interpret rather than turn into an immediate exit. */
const apiRaw = async (path, init = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    ok: response.ok,
    status: response.status,
    text,
    json,
    method: init.method || 'GET',
    path,
  };
};

const api = async (path, init = {}) => {
  const result = await apiRaw(path, init);
  if (!result.ok) {
    stop(
      `Render API ${result.method} ${path} answered ${result.status}: ${result.text.slice(0, 400)}`,
      1
    );
  }
  if (!result.json && result.text) {
    stop(
      `Render API ${path} answered with a body that is not JSON: ${result.text.slice(0, 200)}`,
      1
    );
  }
  return result.json;
};

/** Render wraps list entries as `{ deploy, cursor }` and single reads as the deploy itself. */
const unwrap = (entry) => (entry && entry.deploy ? entry.deploy : entry);

const resolveCommit = (options) => {
  const explicit = options.commit || process.env.EXPECTED_COMMIT || process.env.GITHUB_SHA;
  const resolved = explicit || git(['rev-parse', 'HEAD']);
  if (!resolved || !/^[0-9a-f]{7,40}$/i.test(resolved.trim())) {
    stop(`could not resolve the commit to deploy (got ${JSON.stringify(resolved)})`, 2);
  }
  const source = explicit ? 'argument/environment' : 'git HEAD';
  return { sha: resolved.trim().toLowerCase(), source };
};

const resolveService = async (options) => {
  const serviceId = options.service || process.env.RENDER_SERVICE_ID?.trim();
  if (serviceId) {
    const body = await api(`/services/${serviceId}`);
    return { service: body.service || body, discoveredBy: 'id' };
  }
  const name = process.env.RENDER_SERVICE_NAME?.trim() || DEFAULT_SERVICE_NAME;
  const listed = await api(`/services?limit=100&name=${encodeURIComponent(name)}`);
  const match = listed.map((entry) => entry.service || entry).find((entry) => entry.name === name);
  if (!match)
    stop(`no Render service named ${name}; set RENDER_SERVICE_ID or RENDER_SERVICE_NAME`, 1);
  const body = await api(`/services/${match.id}`);
  return { service: body.service || body, discoveredBy: 'name' };
};

/**
 * The settings whose silent drift re-creates the missed-deploy failure. Each one is checked
 * against what the pipeline assumes, so a dashboard change shows up as a red run on the next
 * push instead of as production running last week's code.
 */
const auditService = (service, options) => {
  const repo = normalizeRepo(service.repo);
  const expectedRepo = normalizeRepo(process.env.RENDER_DEPLOY_REPO || DEFAULT_REPO);
  if (repo !== expectedRepo) {
    fail(
      `the service deploys from ${repo || '(no repo)'} but this pipeline deploys ${expectedRepo}; ` +
        'RENDER_DEPLOY_REPO did not follow the service'
    );
  } else {
    pass(`service deploys from ${repo}`);
  }

  if (service.branch !== options.branch) {
    fail(
      `the service auto-deploys branch ${service.branch}, not ${options.branch}; a ${options.branch} push ` +
        'would never reach it'
    );
  } else {
    pass(`service is wired to ${service.branch}`);
  }

  if ((service.autoDeploy || 'no') !== 'yes') {
    // Not fatal: this script deploys over the API, which does not need auto-deploy. But an
    // operator should know the webhook path is switched off on purpose, not broken.
    skip(`Render auto-deploy is off for this service — the pipeline is the only deploy path`);
  } else {
    pass(`Render auto-deploy is on (trigger: ${service.autoDeployTrigger || 'commit'})`);
  }

  const url = service.serviceDetails?.url || null;
  if (!url) skip('the service has no public URL, so the runtime check is skipped');
  return { url };
};

const listDeploys = async (serviceId) => {
  const entries = await api(`/services/${serviceId}/deploys?limit=30`);
  return entries.map(unwrap).filter(Boolean);
};

const findDeployForCommit = (deploys, sha) =>
  deploys.find((deploy) => sameCommit(deploy.commit?.id, sha)) || null;

const waitForDeploy = async (serviceId, deployId, options) => {
  const deadline = Date.now() + options.wait * 1000;
  let lastStatus = null;
  for (;;) {
    const body = await api(`/services/${serviceId}/deploys/${deployId}`);
    const deploy = unwrap(body);
    const status = deploy.status;
    if (status !== lastStatus) {
      console.log(
        `     ${deployId} ${status}${deploy.finishedAt ? ` at ${deploy.finishedAt}` : ''}`
      );
      lastStatus = status;
    }
    if (status === LIVE) return deploy;
    if (FAILED.has(status)) return deploy;
    if (status === 'deactivated') return deploy;
    if (!RUNNING.has(status)) return deploy;
    if (Date.now() >= deadline) {
      fail(
        `deploy ${deployId} was still ${status} after ${options.wait}s — it may still finish, but the ` +
          `pipeline cannot claim this commit is live: ${deployUrl(serviceId, deployId)}`
      );
      return { ...deploy, timedOut: true };
    }
    await new Promise((resolve) => setTimeout(resolve, options.interval * 1000));
  }
};

/** Asks the running instance, not the dashboard, whether the new code is serving and sane. */
const verifyRuntime = async (url, fallbackUrl) => {
  const base = (url || fallbackUrl || '').replace(/\/+$/, '');
  if (!base) {
    skip('no service URL to probe');
    return;
  }
  let health;
  try {
    const response = await fetch(`${base}/api/health`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    health = await response.json();
  } catch (error) {
    fail(`the live runtime did not answer /api/health: ${error.message}`);
    return;
  }
  if (health.status !== 'ok') {
    fail(`the live runtime reports status ${health.status} after the deploy`);
    return;
  }
  pass(`the live runtime answers /api/health with status ok (version ${health.version})`);

  const supabase = health.checks?.supabase;
  if (supabase?.expectedProjectRef && supabase.projectRef !== supabase.expectedProjectRef) {
    fail(
      `the live runtime resolves Supabase project ${supabase.projectRef} while it is pinned to ` +
        `${supabase.expectedProjectRef} — migrations and runtime are pointed at different projects`
    );
    return;
  }
  if (supabase?.expectedProjectRef) {
    pass(`the live runtime is pinned to and resolving ${supabase.projectRef}`);
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const { sha, source } = resolveCommit(options);
  console.log(`PROBE deploy target ${sha} (from ${source})`);
  if (options.dryRun) note('dry run: no deploy will be triggered');

  const { service, discoveredBy } = await resolveService(options);
  console.log(`PROBE service ${service.name} (${service.id}, found by ${discoveredBy})`);
  const { url } = auditService(service, options);

  let deploy = options.force ? null : findDeployForCommit(await listDeploys(service.id), sha);
  // Only a run that actually watched this commit go live may say it is the live backend; a dry
  // run that claims it would be the same silent success this script exists to remove.
  let targetIsLive = false;

  if (deploy && deploy.status === LIVE) {
    pass(`commit ${sha} is already live (${deploy.id}) — no second deploy triggered`);
    targetIsLive = true;
  } else if (deploy && RUNNING.has(deploy.status)) {
    pass(
      `a deploy of ${sha} is already ${deploy.status} (${deploy.id}) — waiting instead of duplicating`
    );
  } else if (deploy && FAILED.has(deploy.status)) {
    fail(
      `the deploy of ${sha} ended ${deploy.status} (${deploy.id}); re-running the same commit would ` +
        `fail the same way — read the build log first: ${deployUrl(service.id, deploy.id)}`
    );
    deploy = null;
  } else {
    if (deploy && SUPERSEDED.has(deploy.status)) {
      note(`an earlier deploy of ${sha} was superseded (${deploy.id}); triggering a fresh one`);
    }
    if (options.dryRun) {
      pass(`a deploy of ${sha} would be triggered for ${service.name}`);
      deploy = { id: null, status: 'dry-run' };
    } else {
      const created = await apiRaw(`/services/${service.id}/deploys`, {
        method: 'POST',
        body: JSON.stringify({ commitId: sha, clearCache: 'do_not_clear' }),
      });
      if (created.ok) {
        deploy = unwrap(created.json);
        pass(`triggered deploy ${deploy.id} for ${sha} (status ${deploy.status})`);
        note(deployUrl(service.id, deploy.id));
      } else if (created.status === 404 && /does not have a commit/i.test(created.text)) {
        // Render builds from its own clone of the repository, and a commit it has not fetched
        // cannot be deployed by id — the failure mode of exactly the case this command exists
        // for, since the delivery that would have made it fetch is the one that went missing.
        // Asking for the branch head instead makes Render fetch the repository again; the
        // created deploy names the commit it picked, so the promise is still checked.
        note(
          `Render's clone does not have ${sha} yet (a lost webhook is also a lost fetch) — ` +
            `deploying the head of ${options.branch} instead`
        );
        const fallback = await api(`/services/${service.id}/deploys`, {
          method: 'POST',
          body: JSON.stringify({ clearCache: 'do_not_clear' }),
        });
        deploy = unwrap(fallback);
        if (!sameCommit(deploy.commit?.id, sha)) {
          fail(
            `the branch deploy picked ${deploy.commit?.id || '(no commit)'} instead of ${sha}` +
              `: ${deployUrl(service.id, deploy.id)} — the branch has moved past the commit this ` +
              'run was asked to deploy'
          );
          // Leave `deploy` unset rather than returning here: the tail of `main` is what prints the
          // failure summary and exits non-zero, and a `return` would report the same FAIL lines
          // with a green exit code — the silent success this script exists to remove.
          deploy = null;
        } else {
          pass(
            `triggered deploy ${deploy.id} for ${sha} from the branch head (status ${deploy.status})`
          );
          note(deployUrl(service.id, deploy.id));
        }
      } else {
        stop(
          `Render API POST /services/${service.id}/deploys answered ${created.status}: ` +
            created.text.slice(0, 400),
          1
        );
      }
    }
  }

  if (deploy && deploy.id && !options.dryRun) {
    const finished = await waitForDeploy(service.id, deploy.id, options);
    if (finished.status === LIVE) {
      targetIsLive = true;
      pass(`deploy ${deploy.id} is live (finished ${finished.finishedAt || 'now'})`);
    } else if (!finished.timedOut) {
      fail(
        `deploy ${deploy.id} ended ${finished.status}: ${deployUrl(service.id, deploy.id)} — the previous ` +
          'version keeps serving until a deploy goes live'
      );
    }
  }

  // Probing the runtime only means something once this commit is the one serving: otherwise the
  // answer describes whatever version happens to be live.
  if (targetIsLive && failures.length === 0) {
    await verifyRuntime(url, process.env.BACKEND_URL);
  }

  if (failures.length > 0) {
    console.error(`\nFAILED (${failures.length})`);
    failures.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }
  if (targetIsLive) {
    console.log(`\nPASS commit ${sha} is the live backend on ${service.name}.`);
    return;
  }
  if (options.dryRun) {
    console.log(
      `\nPASS dry run: commit ${sha} would be deployed to ${service.name}; nothing was triggered` +
        ' and nothing is claimed about the running version.'
    );
    return;
  }
  fail(`commit ${sha} was never confirmed live on ${service.name}`);
  console.error(`\nFAILED (${failures.length})`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
};

main().catch((error) => stop(error?.stack || String(error), 1));
