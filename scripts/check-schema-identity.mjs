/**
 * The identity columns the runtime writes have to match the identity the app signs users
 * in with.
 *
 * The app authenticates with Firebase, and the backend reads the user id straight out of
 * the token (`backend/src/auth.ts` → `payload.sub`) — an opaque string. Four tables are
 * written with that id and are the reason this check exists:
 *
 *   public.audit_logs.user_id              backend/src/supabase-audit-log-repository.ts
 *   public.subscription_status.user_id     backend/src/supabase-billing-repository.ts
 *   public.billing_customers.user_id        backend/src/supabase-billing-repository.ts
 *   public.ai_credit_consumptions.user_id  backend/src/supabase-billing-repository.ts (rpc)
 *
 * Declaring one of them `uuid` (or pointing it at `auth.users`) does not fail at deploy
 * time: it fails at the first write, as `22P02 invalid input syntax for type uuid`. In the
 * audit store that write is fail-closed, so the customer does not see a schema error — they
 * see checkout refuse with `audit_log_unavailable`. That is exactly how this reached
 * production once; this check makes it a build failure instead.
 *
 * It reads the migrations the way an environment applies them (every `*.sql` in
 * `supabase/migrations`, in filename order) and reports the *effective* type, so a `create
 * table` that is later corrected by an `alter column` passes while an uncorrected one does
 * not. `scripts/verify-audit-collision-attribution.mjs` proves the same thing against a real
 * Postgres; this one runs everywhere, in a second.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// The columns this guard enforces are shared with `scripts/apply-schema-identity.mjs`, which
// checks and converts the same list against a live database. One list, so the static guard
// cannot pass a column that the applier still has to repair, or the other way round.
import { IDENTITY_COLUMNS, REPORTED_COLUMNS } from './lib/schema-identity.mjs';

const DIRECTORY = resolve('supabase/migrations');

const key = (table, column) => `${table}.${column}`;

/** Splits a `create table` body on its top-level commas (checks carry commas of their own). */
const splitColumns = (body) => {
  const columns = [];
  let depth = 0;
  let current = '';
  for (const character of body) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      columns.push(current.trim());
      current = '';
      continue;
    }
    current += character;
  }
  if (current.trim()) columns.push(current.trim());
  return columns;
};

const stripComment = (text) => text.replace(/--[^\n]*/g, ' ');

const readStatements = () => {
  const statements = [];
  for (const file of readdirSync(DIRECTORY)
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    const lines = readFileSync(resolve(DIRECTORY, file), 'utf8').split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (!/^\s*(create\s+table|alter\s+table)\b/i.test(lines[index])) continue;
      let text = lines[index];
      let end = index;
      while (!/;\s*$/.test(text) && end + 1 < lines.length) {
        end += 1;
        text += ` ${lines[end]}`;
      }
      statements.push({
        file,
        line: index + 1,
        text: stripComment(text).replace(/\s+/g, ' ').trim(),
      });
      index = end;
    }
  }
  return statements;
};

const declared = new Map();

const remember = (table, column, type, hasForeignKey, statement) => {
  declared.set(key(table, column), {
    table,
    column,
    type,
    hasForeignKey,
    file: statement.file,
    line: statement.line,
  });
};

for (const statement of readStatements()) {
  const text = statement.text;

  const created = text.match(
    /^create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/i
  );
  if (created) {
    const table = created[1].toLowerCase();
    const body = text.slice(created[0].length).replace(/\)\s*;?\s*$/, '');
    for (const column of splitColumns(body)) {
      const parsed = column.match(/^([a-z_][a-z0-9_]*)\s+([a-z_][a-z0-9_]*)/i);
      if (!parsed) continue;
      const [, name, type] = parsed;
      const tracks = [...IDENTITY_COLUMNS, ...REPORTED_COLUMNS].some(
        ([candidate, column]) => candidate === table && column === name.toLowerCase()
      );
      if (!tracks) continue;
      remember(
        table,
        name.toLowerCase(),
        type.toLowerCase(),
        /references\s+auth\.users/i.test(column),
        statement
      );
    }
    continue;
  }

  const altered = text.match(
    /^alter\s+table\s+(?:only\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s+alter\s+column\s+([a-z_][a-z0-9_]*)\s+(?:set\s+data\s+type|type)\s+([a-z_][a-z0-9_]*)/i
  );
  if (altered) {
    const [, table, column, type] = altered;
    const existing = declared.get(key(table.toLowerCase(), column.toLowerCase()));
    if (!existing) continue;
    remember(
      table.toLowerCase(),
      column.toLowerCase(),
      type.toLowerCase(),
      existing.hasForeignKey,
      statement
    );
    continue;
  }

  const dropped = text.match(
    /^alter\s+table\s+(?:only\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s+drop\s+constraint\s+(?:if\s+exists\s+)?([a-z_][a-z0-9_]*)/i
  );
  if (dropped) {
    // Only Postgres's default name for a column's foreign key (`<table>_<column>_fkey`)
    // is understood; a differently named constraint is left to the live harness.
    const table = dropped[1].toLowerCase();
    const column = dropped[2]
      .toLowerCase()
      .replace(new RegExp(`^${table}_`), '')
      .replace(/_fkey$/, '');
    // The type's provenance stays with the statement that declared it; only the foreign
    // key changes here.
    const tracked = declared.get(key(table, column));
    if (tracked) tracked.hasForeignKey = false;
    continue;
  }

  const added = text.match(
    /^alter\s+table\s+(?:only\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s+add\s+constraint\s+([a-z_][a-z0-9_]*)\s+foreign\s+key\s*\(\s*([a-z_][a-z0-9_]*)\s*\)\s+references\s+auth\.users/i
  );
  if (added) {
    const [, table, , column] = added;
    const tracked = declared.get(key(table.toLowerCase(), column.toLowerCase()));
    if (tracked) tracked.hasForeignKey = true;
  }
}

const failures = [];
const notes = [];

for (const [table, column] of IDENTITY_COLUMNS) {
  const found = declared.get(key(table, column));
  if (!found) {
    failures.push(
      `public.${table}.${column} is never declared by a migration, yet the backend writes the Firebase user id into it`
    );
    continue;
  }
  if (found.type !== 'text') {
    failures.push(
      `public.${table}.${column} is ${found.type}, not text — the runtime writes the Firebase uid here (${found.file}:${found.line}), and a ${found.type} column rejects it with 22P02 at the first write`
    );
  }
  if (found.hasForeignKey) {
    failures.push(
      `public.${table}.${column} references auth.users, but the app's users come from Firebase and are absent from that table, so every write would be refused (${found.file}:${found.line})`
    );
  }
}

for (const [table, column] of REPORTED_COLUMNS) {
  const found = declared.get(key(table, column));
  if (!found) continue;
  if (found.type !== 'text' || found.hasForeignKey) {
    notes.push(
      `public.${table}.${column} is ${found.type}${found.hasForeignKey ? ' referencing auth.users' : ''} (${found.file}:${found.line}) — the same mismatch, not yet enforced for this table`
    );
  }
}

for (const [table, column] of IDENTITY_COLUMNS) {
  const found = declared.get(key(table, column));
  if (found && !failures.some((failure) => failure.startsWith(`public.${table}.${column}`))) {
    console.log(
      `PASS public.${table}.${column} = ${found.type}, no auth.users foreign key (${found.file}:${found.line})`
    );
  }
}
for (const note of notes) console.warn(`[note] ${note}`);

if (failures.length > 0) {
  console.error('\nFAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(
  `Identity columns match the runtime identity model (${IDENTITY_COLUMNS.length} checked across ${readdirSync(DIRECTORY).filter((name) => name.endsWith('.sql')).length} migrations).`
);
