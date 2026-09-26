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
 *   6. With `--check` it deploys nothing and asserts only the property the watcher above keeps
 *      breaking: the commit `main` points at is the commit serving traffic, on an instance
 *      that is still pinned. Run every fifteen minutes
 *      (`.github/workflows/health-check.yml`), that converts "a delivery was dropped and
 *      nobody noticed" from an invisible fact about production into a red run — the five hours
 *      between PR #240 landing and an operator deploying it by hand would have been fifteen
 *      minutes of red instead.
 *
 * Usage:
 *   node scripts/render-deploy.mjs [--commit <sha>] [--wait <seconds>] [--force] [--dry-run]
 *   node scripts/render-deploy.mjs --check [--wait <seconds>]
 *
 * Environment:
 *   RENDER_API_KEY       required — Render API key (`rnd_…`)
 *   RENDER_SERVICE_ID    optional — `srv-…`; discovered by name when unset
 *   RENDER_SERVICE_NAME  optional — default `englishengineer-backend`
 *   RENDER_DEPLOY_BRANCH optional — default `main`
 *   RENDER_DEPLOY_REPO   optional — default `libyaelectric-ctrl/englishengineer`
 *   EXPECTED_COMMIT      optional — the commit to deploy; falls back to GITHUB_SHA, then HEAD
 *   BACKEND_URL          optional — probe this instance instead of the service's own URL
 *   GITHUB_TOKEN         optional — read the head of the branch authenticated in `--check`
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
  --check           deploy nothing: assert that the commit this run is given is the live one
  --grace <secs>    how long a push may still be converging in --check (default: --wait)
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
    check: false,
    grace: undefined,
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
    else if (name === '--check') options.check = true;
    else if (name === '--grace') options.grace = Number(value());
    else stop(`unknown argument: ${arg}\n\n${USAGE}`, 2);
  }
  if (options.check && options.grace === undefined) options.grace = options.wait;
  if (options.grace !== undefined && (!Number.isFinite(options.grace) || options.grace < 0))
    stop('--grace must be a number', 2);
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
  return { sha: resolved.trim().toLowerCase(), source, pushedAt: null };
};

/**
 * The head of the branch, read from GitHub instead of the local clone: a scheduled run has a
 * checkout only as fresh as its own trigger, and the whole point of the check is to see what
 * `main` says *now*. The commit's own timestamp comes back with it, which is what lets the
 * check tell "the pipeline has not finished yet" apart from "nothing is coming".
 */
const fetchBranchHead = async (repo, branch) => {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'engvox-deploy-check' };
  const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`,
      { headers, signal: AbortSignal.timeout(20_000) }
    );
  } catch (error) {
    note(`could not reach GitHub for the head of ${branch}: ${error.message}`);
    return null;
  }
  if (!response.ok) {
    note(`GitHub answered ${response.status} for the head of ${branch}`);
    return null;
  }
  const body = await response.json();
  if (typeof body?.sha !== 'string') return null;
  const pushedAt = Date.parse(body.commit?.committer?.date || body.commit?.author?.date || '');
  return { sha: body.sha.toLowerCase(), pushedAt: Number.isFinite(pushedAt) ? pushedAt : null };
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

/**
 * Asks the running instance, not the dashboard, whether the new code is serving and sane.
 * `BACKEND_URL` overrides which instance is asked, which is what lets the pin arm of this check
 * be exercised against a stub instead of against production.
 */
const verifyRuntime = async (url, { requirePin = false } = {}) => {
  const base = (process.env.BACKEND_URL || url || '').replace(/\/+$/, '');
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
  } else if (requirePin) {
    // The pin is an operator-set environment variable, so it can be deleted from the dashboard
    // without touching a single file in this repository — the exact silent removal the
    // scheduled check exists to catch, since `render.yaml` would still declare it.
    fail(
      'the live runtime reports no expectedProjectRef: the Supabase project pin is unset on the ' +
        'service, so a misdirected migration would boot silently. Re-set EXPECTED_SUPABASE_PROJECT_REF ' +
        '(runbook: "Pin the runtime to the Supabase project")'
    );
  } else {
    skip('the live runtime has no Supabase pin to compare against');
  }
};

/**
 * The read-only half of this script: assert that the commit `main` points at is the commit
 * serving traffic, and that the instance is still pinned. Nothing in here writes to Render,
 * which is what makes it safe on a timer — a check that "fixes" drift would be a deploy
 * command wearing a monitor's name.
 */
/** One snapshot of the service's deploy history, phrased as the questions the check asks. */
const readProduction = async (serviceId, sha) => {
  const deploys = await listDeploys(serviceId);
  const target = deploys.find((deploy) => sameCommit(deploy.commit?.id, sha)) || null;
  const live = deploys.find((deploy) => deploy.status === LIVE) || null;
  const liveCommit = String(live?.commit?.id || '').slice(0, 8) || '';
  const converged = Boolean(target?.status === LIVE || (live && sameCommit(live.commit?.id, sha)));
  // A deploy of the right commit that has not finished: the pipeline is working, so waiting is
  // the correct answer rather than reporting the drift the wait exists to tolerate.
  const inFlight = target && RUNNING.has(target.status) ? target : null;
  const message = inFlight
    ? `a deploy of ${sha} is ${inFlight.status} (${inFlight.id})`
    : live
      ? `the live backend is ${liveCommit || '(unknown commit)'} (${live.id}), which is not ${sha}`
      : 'no deploy is live on this service';
  return { converged, row: target?.status === LIVE ? target : live, inFlight, liveCommit, message };
};

const checkProduction = async (options, expected, service, url) => {
  const startedAt = Date.now();
  // A merge that landed seconds ago is converging, not drifted: the deploy workflow has to be
  // picked up and a build has to finish before production can be right. The commit's own push
  // time bounds that patience — otherwise a genuine drift, whose commit is minutes or days old,
  // would be waited on for the full window before anyone was told.
  const patienceEnds =
    expected.pushedAt !== null
      ? expected.pushedAt + options.grace * 1000
      : startedAt + options.grace * 1000;
  const hardDeadline = startedAt + options.wait * 1000;
  let lastNote = null;

  const report = async (snapshot) => {
    pass(
      `commit ${expected.sha} is the live backend (${snapshot.row.id}, live since ` +
        `${snapshot.row.finishedAt || snapshot.row.createdAt})`
    );
    await verifyRuntime(url, { requirePin: true });
  };

  for (;;) {
    const snapshot = await readProduction(service.id, expected.sha);
    if (snapshot.converged) return report(snapshot);
    if (snapshot.message !== lastNote) {
      note(snapshot.message);
      lastNote = snapshot.message;
    }
    // An unfinished deploy earns the full window; a commit that was pushed long ago and is not
    // being built has already used up its grace, so it fails on the first pass.
    if (Date.now() >= (snapshot.inFlight ? hardDeadline : patienceEnds)) break;
    await new Promise((resolve) => setTimeout(resolve, options.interval * 1000));
  }

  const final = await readProduction(service.id, expected.sha);
  if (final.converged) return report(final);

  if (final.inFlight) {
    fail(
      `a deploy of ${expected.sha} has been ${final.inFlight.status} for over ${options.wait}s — ` +
        `production is still ${final.liveCommit || 'unknown'}: ${deployUrl(service.id, final.inFlight.id)}`
    );
    return;
  }
  const liveCommit = final.liveCommit || '(nothing)';
  fail(
    `${options.branch} points at ${expected.sha} but production is running ${liveCommit} — the pushed ` +
      "commit never reached the service. Render's push webhook is the delivery that goes missing " +
      '(2026-09-18 → 09-23: eight merges, no deploy, no failed deploy, nothing in its events feed), ' +
      'and the "Deploy to Render" workflow is what closes that hole. Check that workflow\u2019s last ' +
      'run and its RENDER_API_KEY secret, then deploy by hand with: npm run render:deploy'
  );
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  let { sha, source, pushedAt } = resolveCommit(options);
  // In check mode the local checkout is only a fallback: what matters is where the branch points
  // right now, which is a fact GitHub holds and the checkout may not (a scheduled run checks out
  // the commit it was triggered with). An explicit `--commit` still wins, so the drift arm of
  // this check can be exercised deliberately.
  if (options.check && !options.commit) {
    const repo = normalizeRepo(process.env.RENDER_DEPLOY_REPO || DEFAULT_REPO);
    const head = await fetchBranchHead(repo, options.branch);
    if (head) {
      if (!sameCommit(head.sha, sha)) {
        note(
          `${options.branch} is at ${head.sha.slice(0, 8)} on GitHub, not ${sha.slice(0, 8)} from ` +
            'the checkout — checking the former'
        );
      }
      sha = head.sha;
      source = `the head of ${options.branch} on GitHub`;
      pushedAt = head.pushedAt;
    }
  }
  console.log(`PROBE deploy target ${sha} (from ${source})`);
  if (options.dryRun) note('dry run: no deploy will be triggered');

  const { service, discoveredBy } = await resolveService(options);
  console.log(`PROBE service ${service.name} (${service.id}, found by ${discoveredBy})`);
  const { url } = auditService(service, options);

  // A check must never fall through into the deploy path below: it would POST a deploy of a
  // commit it just reported as missing, turning the monitor into the thing it monitors.
  if (options.check) {
    await checkProduction(options, { sha, pushedAt }, service, url);
    if (failures.length > 0) {
      console.error(`\nFAILED (${failures.length})`);
      failures.forEach((message) => console.error(`- ${message}`));
      process.exit(1);
    }
    console.log(`\nPASS production is running ${sha}, the commit ${options.branch} points at.`);
    return;
  }

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
    await verifyRuntime(url);
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
