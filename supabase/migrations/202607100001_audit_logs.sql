create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  action text not null,
  user_id uuid references auth.users(id) on delete set null,
  details jsonb,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error', 'critical'))
);

create index if not exists idx_audit_logs_timestamp on public.audit_logs (timestamp desc);
create index if not exists idx_audit_logs_user_id on public.audit_logs (user_id);
create index if not exists idx_audit_logs_action on public.audit_logs (action);

alter table public.audit_logs enable row level security;

create policy "Service role can manage audit logs"
  on public.audit_logs
  for all
  using (auth.role() = 'service_role');
