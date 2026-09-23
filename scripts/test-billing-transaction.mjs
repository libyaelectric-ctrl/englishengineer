import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

// Disposable PostgreSQL, without published ports or production credentials.
const name = 'engvox-billing-check-' + Date.now();
const docker = (args, input) =>
  execFileSync('docker', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 60000,
  });
const sql = (statement) =>
  docker(
    ['exec', '-i', name, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'],
    statement
  ).trim();
let started = false;
try {
  docker([
    'run',
    '--rm',
    '-d',
    '--network',
    'none',
    '--name',
    name,
    '-e',
    'POSTGRES_HOST_AUTH_METHOD=trust',
    'postgres:16-alpine',
  ]);
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      sql('select 1;');
      ready = true;
      break;
    } catch {
      await sleep(500);
    }
  }
  assert.ok(ready, 'PostgreSQL did not start');
  sql(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as 'select null::uuid';
    create table public.subscription_status (
      user_id uuid primary key references auth.users(id), plan_id text, status text,
      current_period_end timestamptz, cancel_at_period_end boolean,
      stripe_customer_id text, stripe_subscription_id text, topup_credits integer default 0,
      updated_at timestamptz not null default now(), source text
    );
    create table public.billing_customers(
      user_id uuid primary key references auth.users(id), stripe_customer_id text unique,
      dodo_customer_id text unique, billing_email text, updated_at timestamptz default now()
    );
    create policy billing_select_own on public.billing_customers for select using(user_id=auth.uid());
    create policy subscription_select_own on public.subscription_status for select using(user_id=auth.uid());
    create table public.stripe_processed_events(
      stripe_event_id text primary key, event_type text, processed_at timestamptz default now(),
      metadata jsonb default '{}'::jsonb
    );
    insert into auth.users values('00000000-0000-0000-0000-000000000001');
    insert into public.billing_customers(user_id) values('00000000-0000-0000-0000-000000000001');
  `);
  for (const file of [
    'supabase/migrations/202609210000_billing_identity_conversion.sql',
    'supabase/migrations/202609210001_atomic_billing_webhooks.sql',
  ])
    sql(readFileSync(file, 'utf8'));
  assert.equal(sql('select count(*) from billing_customers;'), '1');
  const snapshot = (credits) =>
    JSON.stringify({
      plan_id: 'free',
      status: 'none',
      current_period_end: null,
      cancel_at_period_end: false,
      stripe_customer_id: 'customer_1',
      stripe_subscription_id: null,
      topup_credits: credits,
      source: 'test',
      grace_period_ends_at: '2030-01-01T00:00:00Z',
    });
  const commit = (event, expected, credits, customer = 'customer_1') =>
    sql(`
    select public.commit_billing_webhook('${event}','checkout.session.completed','firebase-user',
      ${expected ? "'" + expected + "'" : 'null'},${expected ? 50 : 'null'},
      '${snapshot(credits)}'::jsonb,
      '{"dodoCustomerId":"${customer}"}'::jsonb);
  `);
  assert.equal(commit('first', null, 50), 'applied');
  assert.equal(commit('first', null, 50), 'duplicate');
  assert.equal(commit('second', null, 100), 'conflict');
  assert.equal(
    sql("select count(*) from stripe_processed_events where stripe_event_id='second';"),
    '0'
  );
  const expected = sql("select updated_at from subscription_status where user_id='firebase-user';");
  sql("insert into billing_customers(user_id,dodo_customer_id) values('other','reserved');");
  assert.throws(() => commit('rollback', expected, 100, 'reserved'));
  assert.equal(
    sql("select topup_credits from subscription_status where user_id='firebase-user';"),
    '50'
  );
  assert.equal(
    sql("select count(*) from stripe_processed_events where stripe_event_id='rollback';"),
    '0'
  );
  assert.equal(commit('second', expected, 100), 'applied');
  assert.equal(
    sql("select topup_credits from subscription_status where user_id='firebase-user';"),
    '100'
  );
  assert.equal(
    sql(
      "select grace_period_ends_at is not null from subscription_status where user_id='firebase-user';"
    ),
    't'
  );
  assert.equal(
    sql(
      "select has_function_privilege('anon','public.commit_billing_webhook(text,text,text,timestamptz,integer,jsonb,jsonb)','execute');"
    ),
    'f'
  );
  console.log(
    'PASS: UUID conversion, retained rows, duplicate, conflict, rollback, retry, grace and permissions.'
  );
} finally {
  if (started) docker(['rm', '-f', name]);
}
