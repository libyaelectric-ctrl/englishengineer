create table if not exists public.stripe_processed_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists stripe_processed_events_processed_at_idx
  on public.stripe_processed_events(processed_at desc);

alter table public.stripe_processed_events enable row level security;

-- Billing webhook state is backend-only. The service role bypasses RLS;
-- browser roles receive no policy and no direct table privileges.
revoke all on table public.stripe_processed_events from anon, authenticated;
grant all on table public.stripe_processed_events to service_role;
