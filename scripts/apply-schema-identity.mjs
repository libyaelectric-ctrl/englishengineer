#!/usr/bin/env node
/**
 * Applies, and then proves, the one schema change billing cannot work without: the columns
 * the backend writes the Firebase user id into have to be `text`.
 *
 * Why this exists as a command rather than a paragraph in the runbook: the migrations in
 * `supabase/migrations` are applied by an operator, not by any deploy step, so a migration
 * that has not been run by hand is a migration that does not exist at runtime. That is how a
 * `uuid` column stayed in front of checkout: the fix was written, reviewed and green in CI,
 * and never reached the database. A command that reports what it found, converts only what is
 * wrong, and re-reads the result is harder to leave undone than a note.
 *
 * What it does, per column in `IDENTITY_COLUMNS`, idempotently:
 *
 *   1. drops any foreign key on the column (`auth.users` cannot contain a Firebase user, so
 *      a foreign key there refuses every write);
 *   2. retypes the column to `text` with `using <col>::text`, which preserves every existing
 *      row — a uuid value survives the widening as its text form.
 *
 * Both changes run in one transaction: a half-converted schema is worse than an unconverted
 * one, because `create table if not exists` cannot correct it afterwards.
 *
 * The failure it repairs reaches customers as "Billing could not be started because the
 * service is temporarily unavailable." — the audit store is fail-closed and sits in front of
 * checkout, so a wrong column type there is indistinguishable from a billing outage. See
 * `docs/DEPLOYMENT_RUNBOOK.md` for the whole chain, and `scripts/check-schema-identity.mjs`
 * for the static half of this problem, which fails CI before anything ships.
 *
 * Usage:
 *
 *   npm run apply:schema-identity            # convert what is wrong, then verify
 *   npm run apply:schema-identity -- --check # verify only; changes nothing; non-zero if wrong
 *
 * Two ways in, tried in this order:
 *
 *   1. `SUPABASE_ACCESS_TOKEN` (a `sbp_…` personal access token) — reaches the database over
 *      Supabase's own Management API (`POST /v1/projects/{ref}/database/query`), so it needs
 *      neither a database password nor Docker. The project ref comes from
 *      `SUPABASE_PROJECT_REF`, or is read out of `SUPABASE_URL` / `VITE_SUPABASE_URL` /
 *      `VITE_DATA_CDN_URL` when one of those is set.
 *   2. A connection string, read from the environment and never from an argument, so it does
 *      not end up in a shell history or a process list: `POSTGRES_URL_NON_POOLING`, then
 *      `SUPABASE_DB_URL`, then `DATABASE_URL`, then `POSTGRES_URL`. Prefer the non-pooling
 *      string: DDL through a transaction pooler arrives on a connection that is not
 *      guaranteed to be the one the transaction runs on, and this script warns when the only
 *      string it can find looks pooled. It reaches the database with `psql` when that is
 *      installed, and with a throwaway `postgres:16-alpine` container when it is not.
 *
 * Either way it names the database it found — and how many rows each tracked table holds —
 * before it changes anything. That line exists because the wrong database is easy to reach and
 * hard to notice: a second Supabase project with the same schema (a Vercel integration creates
 * one) accepts every statement, reports success, changes nothing, and leaves checkout broken.
 */
import { spawnSync } from 'node:child_process';

import { IDENTITY_COLUMNS, REPORTED_COLUMNS } from './lib/schema-identity.mjs';

const CHECK_ONLY = process.argv.includes('--check') || process.argv.includes('--verify');

/** Ordered so a direct connection wins over a pooled one. */
const URL_VARIABLES = [
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_DB_URL',
  'DATABASE_URL',
  'POSTGRES_URL',
];

const IMAGE = 'postgres:16-alpine';

const API_BASE = 'https://api.supabase.com/v1';

/** Column order of the two queries whose rows are parsed positionally. */
const INSPECT_COLUMNS = ['table_name', 'column_name', 'data_type', 'has_foreign_key'];
const CONSTRAINT_COLUMNS = ['conname'];
const COUNT_COLUMNS = ['table_name', 'rows'];

/** The project ref, wherever the environment happens to spell it out (`VITE_DATA_CDN_URL` included). */
const refFromEnvironment = () => {
  const explicit = (process.env.SUPABASE_PROJECT_REF ?? '').trim();
  if (explicit) return explicit;
  for (const name of ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'VITE_DATA_CDN_URL']) {
    const value = (process.env[name] ?? '').trim();
    const found = /^https?:\/\/([a-z0-9]+)\.supabase\.(?:co|in)\b/i.exec(value);
    if (found) return found[1];
  }
  return null;
};

const apiFetch = async (token, path, init = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  if (!response.ok)
    throw new Error(
      `${init.method ?? 'GET'} ${path} -> ${response.status} ${text.slice(0, 240).replace(/\s+/g, ' ')}`
    );
  return text ? JSON.parse(text) : null;
};

const quote = (identifier) => `"${identifier.replace(/"/g, '""')}"`;

const tableKey = (table, column) => `${table}.${column}`;

/** Parses the connection string into libpq's own variables, so no secret is ever an argv. */
const pgEnvFrom = (url) => {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  if (!parsed.hostname || !database) {
    throw new Error(
      'The connection string is missing a host or a database name; expected postgres://host:5432/db.'
    );
  }
  return {
    PGHOST: parsed.hostname,
    PGPORT: parsed.port || '5432',
    PGUSER: decodeURIComponent(parsed.username),
    PGPASSWORD: decodeURIComponent(parsed.password),
    PGDATABASE: database,
    PGSSLMODE: parsed.searchParams.get('sslmode') || 'require',
    PGCONNECT_TIMEOUT: '20',
  };
};

const hasLocalPsql = () =>
  spawnSync('psql', ['--version'], { encoding: 'utf8', shell: false }).status === 0;

const hasDocker = () =>
  spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
    encoding: 'utf8',
    shell: false,
  }).status === 0;

const runLocalPsql = (sql, env) =>
  spawnSync('psql', ['-At', '-F', '|', '-v', 'ON_ERROR_STOP=1', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
    env,
  });

const runContainerPsql = (sql, env) => {
  const forwarded = [
    'PGHOST',
    'PGPORT',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
    'PGSSLMODE',
    'PGCONNECT_TIMEOUT',
  ];
  const args = ['run', '--rm', '-i'];
  // Forwarded by name, so the password travels in the environment and not in argv.
  for (const name of forwarded) args.push('-e', name);
  args.push(IMAGE, 'psql', '-At', '-F', '|', '-v', 'ON_ERROR_STOP=1', '-f', '-');
  return spawnSync('docker', args, { input: sql, encoding: 'utf8', env });
};

const explainConnectionError = (stderr) => {
  const text = stderr ?? '';
  if (/could not translate host name|Name or service not known/i.test(text))
    return 'the database host could not be resolved from this machine.';
  if (/password authentication failed/i.test(text))
    return 'the password in the connection string was rejected.';
  if (/timeout expired|could not connect/i.test(text))
    return 'the database did not accept the connection in time (is the network reachable?).';
  if (/no pg_hba.conf entry|SSL/i.test(text)) return 'the connection was refused (TLS?).';
  return text.trim().split('\n')[0] || 'psql failed without a message.';
};

/**
 * Two ways in. Both answer in `psql -At -F '|'`'s own shape — one row per line, cells joined by
 * a pipe, `t`/`f` for booleans, empty for null — so the reporting below needs a single parser
 * and a single set of assertions whether the run went through the Management API or through psql.
 */
const createApiChannel = async (token) => {
  const ref = refFromEnvironment();
  if (!ref) {
    console.error(
      'SUPABASE_ACCESS_TOKEN is set, but there is no project to point it at: set SUPABASE_PROJECT_REF, or SUPABASE_URL.'
    );
    process.exit(2);
  }

  let name = '';
  try {
    name = (await apiFetch(token, `/projects/${ref}`))?.name ?? '';
  } catch (error) {
    // The usual cause is a token scoped to a different project: the account lists its own
    // projects happily while every request for this one answers 403.
    console.error(`The token cannot reach project ${ref}: ${error.message}`);
    process.exit(2);
  }

  return {
    label: `${ref}${name ? ` (${name})` : ''}, via the Management API`,
    run: async (sql, columns = []) => {
      try {
        const rows = await apiFetch(token, `/projects/${ref}/database/query`, {
          method: 'POST',
          body: JSON.stringify({ query: sql }),
        });
        const lines = (Array.isArray(rows) ? rows : []).map((row) =>
          columns
            .map((column) => {
              const value = row?.[column];
              if (value === null || value === undefined) return '';
              if (value === true) return 't';
              if (value === false) return 'f';
              return String(value);
            })
            .join('|')
        );
        return { status: 0, stdout: lines.length > 0 ? `${lines.join('\n')}\n` : '', stderr: '' };
      } catch (error) {
        return { status: 1, stdout: '', stderr: error.message };
      }
    },
  };
};

const createPsqlChannel = () => {
  const variable = URL_VARIABLES.find((name) => (process.env[name] ?? '').trim().length > 0);
  if (!variable) return null;

  const url = process.env[variable].trim();
  const env = { ...process.env, ...pgEnvFrom(url) };
  const looksPooled = env.PGPORT === '6543' || /pooler\.supabase\.com/i.test(env.PGHOST);
  if (looksPooled) {
    console.warn(
      `[warn] ${variable} looks like a pooled connection (${env.PGHOST}:${env.PGPORT}). DDL is safer on the direct connection string.`
    );
  }

  const run = hasLocalPsql()
    ? (sql) => runLocalPsql(sql, env)
    : hasDocker()
      ? (sql) => runContainerPsql(sql, env)
      : null;

  if (!run) {
    console.error(
      'Neither psql nor Docker is available, and one of them is needed to reach the database. Install the Postgres client, or start Docker.'
    );
    process.exit(2);
  }

  return { label: `${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE} (via ${variable})`, run };
};

/** Which of the tracked columns exist, with their type and any foreign key on them. */
const INSPECT_SQL = `
select c.table_name, c.column_name, c.data_type,
       coalesce((
         select bool_or(true)
         from pg_constraint con
         join pg_class rel on rel.oid = con.conrelid
         join pg_namespace ns on ns.oid = rel.relnamespace
         join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (con.conkey)
         where con.contype = 'f'
           and ns.nspname = 'public'
           and rel.relname = c.table_name
           and att.attname = c.column_name
       ), false) as has_foreign_key
from information_schema.columns c
where c.table_schema = 'public'
  and c.column_name = 'user_id'
  and c.table_name in (${[...IDENTITY_COLUMNS, ...REPORTED_COLUMNS]
    .map(([table]) => `'${table}'`)
    .join(', ')});
`;

const CONSTRAINT_SQL = (table, column) => `
select con.conname
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace ns on ns.oid = rel.relnamespace
join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (con.conkey)
where con.contype = 'f'
  and ns.nspname = 'public'
  and rel.relname = '${table}'
  and att.attname = '${column}';
`;

const parseRows = (stdout) =>
  (stdout ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split('|').map((cell) => cell.trim()));

const main = async () => {
  const token = (process.env.SUPABASE_ACCESS_TOKEN ?? '').trim();
  const channel = token ? await createApiChannel(token) : createPsqlChannel();
  if (!channel) {
    console.error(
      `No way to reach the database. Set SUPABASE_ACCESS_TOKEN (an sbp_… personal access token), or one of ${URL_VARIABLES.join(', ')} — in a Supabase project, that is the direct connection string (port 5432), not the pooler.`
    );
    process.exit(2);
  }

  const run = channel.run;

  const inspect = async () => {
    const result = await run(INSPECT_SQL, INSPECT_COLUMNS);
    if (result.status !== 0) {
      console.error(
        `Could not read the schema from ${channel.label}: ${explainConnectionError(result.stderr)}`
      );
      process.exit(2);
    }
    const found = new Map();
    for (const [table, column, dataType, hasForeignKey] of parseRows(result.stdout)) {
      found.set(tableKey(table, column), { table, column, dataType, hasForeignKey });
    }
    return found;
  };

  /**
   * Row counts are the cheapest way to tell two projects with the same schema apart — the trap
   * that once made "the migration ran" and "nothing changed" true at the same time.
   */
  const reportFingerprint = async (columns) => {
    const tables = [
      ...new Set([...IDENTITY_COLUMNS, ...REPORTED_COLUMNS].map(([table]) => table)),
    ].filter((table) => [...columns.keys()].some((key) => key.startsWith(`${table}.`)));
    if (tables.length === 0) return;

    const sql = tables
      .map(
        (table) =>
          `select '${table}' as table_name, count(*)::text as rows from public.${quote(table)}`
      )
      .join('\nunion all\n');
    const result = await run(sql, COUNT_COLUMNS);
    if (result.status !== 0) return;

    console.log(
      'Rows in the tables this command tracks (a fingerprint of which database this is):'
    );
    for (const [table, rows] of parseRows(result.stdout)) console.log(`  public.${table}: ${rows}`);
  };

  const before = await inspect();

  console.log(`Database: ${channel.label}`);
  await reportFingerprint(before);
  console.log('Identity columns as stored right now:');
  const broken = [];
  const skipped = [];
  for (const [table, column] of IDENTITY_COLUMNS) {
    const state = before.get(tableKey(table, column));
    if (!state) {
      skipped.push(`${tableKey(table, column)} (table or column is absent here)`);
      console.log(`  ${tableKey(table, column)} — not present, skipped`);
      continue;
    }
    const wrongType = state.dataType !== 'text';
    const wrongKey = state.hasForeignKey === 't';
    if (wrongType || wrongKey) broken.push(state);
    console.log(
      `  ${tableKey(table, column)} = ${state.dataType}${wrongKey ? ' + foreign key on auth.users' : ''}${wrongType || wrongKey ? "   <-- blocks the runtime's write" : '   ok'}`
    );
  }
  for (const [table, column] of REPORTED_COLUMNS) {
    const state = before.get(tableKey(table, column));
    if (state && (state.dataType !== 'text' || state.hasForeignKey === 't'))
      console.log(
        `  [note] ${tableKey(table, column)} = ${state.dataType}${state.hasForeignKey === 't' ? ' + foreign key' : ''} — same mismatch, not covered by this command`
      );
  }
  for (const entry of skipped) console.log(`  [note] ${entry}`);

  if (CHECK_ONLY) {
    if (broken.length > 0) {
      console.error(
        `\nFAILED: ${broken.length} identity column(s) still reject the Firebase user id. Run without --check to convert them.`
      );
      process.exit(1);
    }
    console.log('\nOK: every identity column is text and free of auth.users foreign keys.');
    return;
  }

  if (broken.length === 0) {
    console.log('\nNothing to change: every identity column is already text.');
    return;
  }

  const statements = [];
  for (const state of broken) {
    if (state.hasForeignKey === 't') {
      // The real constraint name, plus Postgres's conventional name in case it was renamed
      // after this inspection.
      const constraintRows = await run(
        CONSTRAINT_SQL(state.table, state.column),
        CONSTRAINT_COLUMNS
      );
      const names = new Set([
        ...parseRows(constraintRows.stdout).map(([name]) => name),
        `${state.table}_${state.column}_fkey`,
      ]);
      for (const name of names) {
        if (name)
          statements.push(
            `alter table public.${quote(state.table)} drop constraint if exists ${quote(name)};`
          );
      }
    }
  }
  for (const state of broken) {
    if (state.dataType !== 'text') {
      statements.push(
        `alter table public.${quote(state.table)} alter column ${quote(state.column)} type text using ${quote(state.column)}::text;`
      );
    }
  }

  console.log(`\nConverting ${broken.length} column(s) in one transaction:`);
  for (const statement of statements) console.log(`  ${statement}`);

  const applied = await run(`begin;\n${statements.join('\n')}\ncommit;\n`);
  if (applied.status !== 0) {
    console.error(`\nFAILED to convert: ${explainConnectionError(applied.stderr)}`);
    process.exit(1);
  }

  const after = await inspect();
  const stillBroken = IDENTITY_COLUMNS.map(([table, column]) =>
    after.get(tableKey(table, column))
  ).filter((state) => state && (state.dataType !== 'text' || state.hasForeignKey === 't'));

  console.log('\nRe-read after the change:');
  for (const [table, column] of IDENTITY_COLUMNS) {
    const state = after.get(tableKey(table, column));
    if (state) console.log(`  ${tableKey(table, column)} = ${state.dataType}`);
  }

  if (stillBroken.length > 0) {
    console.error(`\nFAILED: ${stillBroken.length} column(s) are still not text.`);
    process.exit(1);
  }

  console.log(
    '\nDone: the runtime can write the Firebase user id. Audited actions recover on their own on the next request — no redeploy is needed.'
  );
};

await main();
