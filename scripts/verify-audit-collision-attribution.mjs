#!/usr/bin/env node
/**
 * Proves, on a real Postgres + PostgREST carrying the project's real migrations,
 * that the audit write path tells these two collisions apart:
 *
 *   1. a unique violation naming the identity of the record this attempt wrote
 *      ("my write landed and only its acknowledgement was lost") — the audited
 *      action proceeds; and
 *   2. a unique violation on any *other* key ("someone else's row is in the way")
 *      — the audited action is refused, because no payment may proceed without its
 *      own audit record.
 *
 * Case 2 measured `ok` before the seam carried a structured duplicate signal, so
 * it is pinned here against the engine that produces the signal rather than
 * against a hand-written error string. The second unique key that case 2 needs is
 * created in this throwaway database only — it is deliberately not shipped, see
 * the note at `SECOND_UNIQUE_KEY` below.
 *
 * Requires Docker. Exits non-zero on any failed invariant.
 */
import { spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const PG_CONTAINER = 'engvox-audit-harness-pg';
const PGRST_CONTAINER = 'engvox-audit-harness-pgrst';
const NETWORK = 'engvox-audit-harness';
const POSTGREST_PORT = Number(process.env.AUDIT_HARNESS_PORT ?? 5599);
// PostgREST needs at least 32 bytes for an HS256 secret.
const JWT_SECRET = 'engvox-audit-harness-jwt-secret-0123456789';
const HARNESS_DIR = resolve(REPO, 'node_modules/.audit-harness');

/**
 * A second unique key on `public.audit_logs`, present only inside the throwaway
 * database above, so case 2 is exercised against a real constraint instead of an
 * imagined one.
 *
 * It is NOT shipped as a migration on purpose. Request-scoped keys are reusable
 * by clients (`x-request-id` is echoed back verbatim), so a unique index on one
 * turns an ordinary repeated action into the same 503 this path exists to avoid —
 * measured: with this key in place and no attribution for it, the second audited
 * action is refused. Shipping deduplication needs the key carried on the record
 * *and* attributed by the seam, which is a product decision, not a schema tweak.
 */
const SECOND_UNIQUE_KEY = `
create unique index if not exists audit_logs_correlation_key
  on public.audit_logs ((details->>'correlationKey'))
  where details ? 'correlationKey';
`;

const failures = [];
const failed = (message) => failures.push(message);

const docker = (args, options = {}) =>
  spawnSync('docker', args, { encoding: 'utf8', ...options, env: process.env });

const requireDocker = () => {
  const probe = docker(['info', '--format', '{{.ServerVersion}}']);
  if (probe.status !== 0) {
    console.error(
      'This proof needs a running Docker daemon (it applies the real migrations to a throwaway Postgres).'
    );
    console.error(String(probe.stderr || probe.error || '').trim());
    process.exit(1);
  }
};

const sql = (statement) => {
  const result = docker(
    [
      'exec',
      '-i',
      PG_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-q',
      '-t',
      '-A',
      '-f',
      '-',
    ],
    { input: statement }
  );
  if (result.status !== 0) throw new Error(`psql failed: ${result.stderr || result.stdout}`);
  return String(result.stdout ?? '').trim();
};

const waitFor = async (label, probe, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await probe()) return true;
    await new Promise((done) => setTimeout(done, 1_000));
  }
  failed(`${label} did not become ready within ${timeoutMs}ms`);
  return false;
};

const teardown = () => {
  docker(['rm', '-f', PGRST_CONTAINER, PG_CONTAINER]);
  docker(['network', 'rm', NETWORK]);
  rmSync(HARNESS_DIR, { recursive: true, force: true });
};

const applyMigrations = () => {
  const files = readdirSync(resolve(REPO, 'supabase/migrations'))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const stubs = readFileSync(resolve(REPO, 'scripts/fixtures/supabase-harness-stubs.sql'), 'utf8');
  sql(stubs);

  const drift = [];
  for (const file of files) {
    const result = docker(
      ['exec', '-i', PG_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-q', '-f', '-'],
      { input: readFileSync(resolve(REPO, 'supabase/migrations', file), 'utf8') }
    );
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    if (result.status !== 0 || /ERROR/.test(output)) {
      drift.push({ file, output: output.trim() });
    }
  }

  // The audit table's own schema has to build cleanly; anything else that has
  // never applied is reported rather than silently tolerated.
  for (const entry of drift) {
    const touchesAudit = entry.output.includes('audit_logs');
    if (touchesAudit)
      failed(`migration ${entry.file} failed on public.audit_logs:\n${entry.output}`);
    else console.warn(`[drift] ${entry.file} does not apply cleanly:\n${entry.output}`);
  }
  console.log(`Applied ${files.length} migrations (${drift.length} drift)`);

  // The migrations create the tables before this file grants on them.
  sql(
    'grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;'
  );
};

const measureUniqueKeys = () => {
  const rows = sql(`
    select indexname || ' :: ' || indexdef
      from pg_indexes
     where schemaname = 'public' and tablename = 'audit_logs' and indexdef like 'CREATE UNIQUE INDEX%'
     order by indexname;
  `)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  console.log('Unique keys on public.audit_logs:');
  rows.forEach((row) => console.log(`  ${row}`));

  if (rows.length !== 1 || !rows[0].startsWith('audit_logs_pkey :: CREATE UNIQUE INDEX'))
    failed(
      `expected audit_logs to carry exactly one unique key (its primary key on id), measured ${rows.length}: ${rows.join(', ')}`
    );

  return rows;
};

const jwt = (role) => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ role, exp: 4_102_444_800 });
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
};

const probeSource = () => `
import { initAuditLog, auditLog, getAuditLogStatus } from '../../backend/src/audit-log.js';
import { createSupabaseAuditLogRepository } from '../../backend/src/supabase-audit-log-repository.js';

const baseUrl = process.env.AUDIT_HARNESS_URL;
const key = process.env.AUDIT_HARNESS_KEY;
const run = String(Date.now());

// Supabase serves PostgREST behind a gateway under /rest/v1, which is the path
// supabase-js builds. This reproduces only that path layout: every request still
// reaches the real PostgREST and every response is its own.
const gatewayFetch = (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  return fetch(url.replace('/rest/v1/', '/'), init);
};

const record = (id, correlationKey) => ({
  id,
  timestamp: new Date().toISOString(),
  action: 'checkout_created',
  details: correlationKey ? { correlationKey } : { planId: 'pro' },
  severity: 'info',
});

const describe = (error) => ({
  code: error.code,
  message: error.message,
  duplicatesRequestedRecord: error.duplicatesRequestedRecord,
});

const results = {};
const repository = createSupabaseAuditLogRepository(
  { supabaseUrl: baseUrl, supabaseServiceRoleKey: key },
  gatewayFetch
);
if (!repository) throw new Error('harness repository not configured');

// Case 1: the retry of the record this attempt wrote.
await repository.insert(record(\`probe_own_\${run}\`));
try {
  await repository.insert(record(\`probe_own_\${run}\`));
  results.ownKeyCollision = 'unexpectedly succeeded';
} catch (error) {
  results.ownKeyCollision = describe(error);
}

// Case 2: a collision on the other unique key, naming a value that is not this
// record's identity.
await repository.insert(record(\`probe_other_a_\${run}\`, \`req_shared_\${run}\`));
try {
  await repository.insert(record(\`probe_other_b_\${run}\`, \`req_shared_\${run}\`));
  results.otherKeyCollision = 'unexpectedly succeeded';
} catch (error) {
  results.otherKeyCollision = describe(error);
}

// The seam, end to end, against the same real store.
await initAuditLog(
  {
    environment: 'production',
    workspace: { configured: true, supabaseUrl: baseUrl, supabaseServiceRoleKey: key },
  },
  gatewayFetch
);
results.statusAfterInit = getAuditLogStatus().status;

await auditLog({ action: 'checkout_created', details: { correlationKey: \`req_seam_\${run}\` } });
results.firstAuditedAction = 'ok';

try {
  await auditLog({ action: 'checkout_created', details: { correlationKey: \`req_seam_\${run}\` } });
  results.secondAuditedAction = 'ok';
} catch (error) {
  results.secondAuditedAction = \`\${error.status} \${error.code} \${error.message}\`;
}
results.statusAfterCollision = getAuditLogStatus().status;

await auditLog({ action: 'checkout_created', details: { correlationKey: \`req_seam_other_\${run}\` } });
results.thirdAuditedAction = 'ok';

console.log('PROBE_RESULT ' + JSON.stringify(results));
`;

const runProbe = () => {
  // `.mts` so the probe is unambiguously ESM (it uses top-level await) even
  // though it is written under node_modules.
  mkdirSync(HARNESS_DIR, { recursive: true });
  const probeFile = resolve(HARNESS_DIR, 'probe.mts');
  writeFileSync(probeFile, probeSource(), 'utf8');

  // Node runs tsx's CLI directly: `npx` is a shell shim on Windows and spawnSync
  // does not resolve those.
  const tsx = resolve(REPO, 'backend/node_modules/tsx/dist/cli.mjs');
  if (!existsSync(tsx)) {
    failed(`tsx is not installed (${tsx}); run \`npm --prefix backend ci\` first`);
    return null;
  }

  const result = spawnSync(process.execPath, [tsx, probeFile], {
    cwd: resolve(REPO, 'backend'),
    encoding: 'utf8',
    env: {
      ...process.env,
      AUDIT_HARNESS_URL: `http://127.0.0.1:${POSTGREST_PORT}`,
      AUDIT_HARNESS_KEY: jwt('service_role'),
    },
  });

  const line = String(result.stdout ?? '')
    .split('\n')
    .find((entry) => entry.startsWith('PROBE_RESULT '));
  if (!line) {
    failed(
      `probe produced no result: ${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`
    );
    return null;
  }
  return JSON.parse(line.slice('PROBE_RESULT '.length));
};

const assertProbe = (results) => {
  if (!results) return;
  console.log('Probe result:', JSON.stringify(results));

  if (results.ownKeyCollision?.duplicatesRequestedRecord !== true)
    failed(
      `a retry that collided with its own record was not recognised as landed: ${JSON.stringify(results.ownKeyCollision)}`
    );
  if (results.otherKeyCollision?.code !== '23505')
    failed(
      `the other-constraint collision was not a unique violation: ${JSON.stringify(results.otherKeyCollision)}`
    );
  if (results.otherKeyCollision?.duplicatesRequestedRecord === true)
    failed('a unique violation on a different constraint was misread as this record having landed');
  if (results.statusAfterInit !== 'ready')
    failed(`audit did not initialise: ${results.statusAfterInit}`);
  if (!String(results.secondAuditedAction ?? '').startsWith('503'))
    failed(
      `an audited action whose record was not written did not fail closed: ${results.secondAuditedAction}`
    );
  if (results.thirdAuditedAction !== 'ok')
    failed(`an audited action under its own key was refused: ${results.thirdAuditedAction}`);
};

const main = async () => {
  requireDocker();
  teardown();

  docker(['network', 'create', NETWORK]);
  docker([
    'run',
    '-d',
    '--name',
    PG_CONTAINER,
    '--network',
    NETWORK,
    '-e',
    'POSTGRES_PASSWORD=postgres',
    '-e',
    'POSTGRES_DB=postgres',
    'postgres:16-alpine',
  ]);

  const pgReady = await waitFor(
    'postgres',
    () => docker(['exec', PG_CONTAINER, 'pg_isready', '-U', 'postgres']).status === 0
  );
  if (!pgReady) return;

  applyMigrations();
  measureUniqueKeys();
  sql(SECOND_UNIQUE_KEY);

  docker([
    'run',
    '-d',
    '--name',
    PGRST_CONTAINER,
    '--network',
    NETWORK,
    '-p',
    `127.0.0.1:${POSTGREST_PORT}:3000`,
    '-e',
    `PGRST_DB_URI=postgres://authenticator:postgres@${PG_CONTAINER}:5432/postgres`,
    '-e',
    'PGRST_DB_SCHEMAS=public',
    '-e',
    'PGRST_DB_ANON_ROLE=anon',
    '-e',
    `PGRST_JWT_SECRET=${JWT_SECRET}`,
    'postgrest/postgrest:v12.2.3',
  ]);

  const restReady = await waitFor('postgrest', async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${POSTGREST_PORT}/`);
      return response.ok;
    } catch {
      return false;
    }
  });
  if (!restReady) return;

  assertProbe(runProbe());
};

await main();
teardown();

if (failures.length > 0) {
  console.error('\nFAILED');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}
console.log('\nAudit collision attribution is distinguishable on the real schema.');
