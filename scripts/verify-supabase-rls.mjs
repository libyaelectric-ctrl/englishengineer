import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = resolve('supabase/migrations');
const sql = readdirSync(directory)
  .filter((file) => file.endsWith('.sql'))
  .map((file) => readFileSync(resolve(directory, file), 'utf8'))
  .join('\n')
  .toLowerCase();

const checks = [
  ['RLS enable statements', sql.includes('enable row level security')],
  ['RLS policy statements', sql.includes('create policy')],
  ['User ownership checks', sql.includes('auth.uid()')],
  [
    'Stripe processed events table',
    sql.includes('create table if not exists public.stripe_processed_events'),
  ],
  [
    'Stripe events service-role boundary',
    sql.includes(
      'revoke all on table public.stripe_processed_events from anon, authenticated'
    ) &&
      sql.includes(
        'grant all on table public.stripe_processed_events to service_role'
      ),
  ],
  [
    'Team organization tables',
    [
      'public.organizations',
      'public.organization_members',
      'public.organization_invitations',
      'public.team_progress_summaries',
    ].every((table) => sql.includes(`create table if not exists ${table}`)),
  ],
  [
    'Team role helpers',
    sql.includes('function public.is_organization_member') &&
      sql.includes('function public.is_organization_manager'),
  ],
  [
    'Team summary privacy policy',
    sql.includes('learners see self and managers see summaries') &&
      sql.includes('user_id = auth.uid()') &&
      sql.includes('public.is_organization_manager(organization_id)'),
  ],
];

const failed = checks.filter(([, passed]) => !passed);
checks.forEach(([label, passed]) =>
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`)
);

if (failed.length > 0) process.exit(1);
console.log(
  'Static RLS migration checks passed. Live user-isolation proof still requires a configured Supabase project.'
);
