create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text,
  discipline text,
  target_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  schema_version integer not null default 1,
  local_updated_at timestamptz,
  server_updated_at timestamptz not null default now(),
  conflict_strategy text not null default 'last-write-wins-with-local-offline-queue',
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  mission_id text not null,
  score numeric not null check (score >= 0 and score <= 100),
  xp integer not null default 0,
  elo_delta integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.writing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  content text not null,
  evaluation jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.listening_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  listening_time_seconds integer not null default 0,
  completion_ratio numeric not null default 0,
  replay_count integer not null default 0,
  evaluation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  transcript text not null,
  evaluation jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_id text not null,
  correct boolean not null,
  quality integer not null check (quality >= 0 and quality <= 5),
  spaced_repetition jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode_id text not null,
  provider text not null,
  operation text not null,
  success boolean not null,
  duration_ms integer,
  result_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  billing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null default 'free',
  status text not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  source text not null default 'local-development',
  updated_at timestamptz not null default now()
);

create index if not exists assessment_snapshots_user_created_idx
  on public.assessment_snapshots(user_id, created_at desc);
create index if not exists task_attempts_user_created_idx
  on public.task_attempts(user_id, created_at desc);
create index if not exists writing_attempts_user_created_idx
  on public.writing_attempts(user_id, created_at desc);
create index if not exists listening_attempts_user_created_idx
  on public.listening_attempts(user_id, created_at desc);
create index if not exists speaking_attempts_user_created_idx
  on public.speaking_attempts(user_id, created_at desc);
create index if not exists vocabulary_reviews_user_reviewed_idx
  on public.vocabulary_reviews(user_id, reviewed_at desc);
create index if not exists ai_sessions_user_created_idx
  on public.ai_sessions(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_progress_snapshots enable row level security;
alter table public.assessment_snapshots enable row level security;
alter table public.task_attempts enable row level security;
alter table public.writing_attempts enable row level security;
alter table public.listening_attempts enable row level security;
alter table public.speaking_attempts enable row level security;
alter table public.vocabulary_reviews enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscription_status enable row level security;

drop policy if exists "profiles are owned by user" on public.profiles;
create policy "profiles are owned by user"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "user settings are owned by user" on public.user_settings;
create policy "user settings are owned by user"
  on public.user_settings for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "progress snapshots are owned by user" on public.user_progress_snapshots;
create policy "progress snapshots are owned by user"
  on public.user_progress_snapshots for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "assessment snapshots are owned by user" on public.assessment_snapshots;
create policy "assessment snapshots are owned by user"
  on public.assessment_snapshots for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "task attempts are owned by user" on public.task_attempts;
create policy "task attempts are owned by user"
  on public.task_attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "writing attempts are owned by user" on public.writing_attempts;
create policy "writing attempts are owned by user"
  on public.writing_attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "listening attempts are owned by user" on public.listening_attempts;
create policy "listening attempts are owned by user"
  on public.listening_attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "speaking attempts are owned by user" on public.speaking_attempts;
create policy "speaking attempts are owned by user"
  on public.speaking_attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "vocabulary reviews are owned by user" on public.vocabulary_reviews;
create policy "vocabulary reviews are owned by user"
  on public.vocabulary_reviews for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "ai sessions are owned by user" on public.ai_sessions;
create policy "ai sessions are owned by user"
  on public.ai_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "billing customers are owned by user" on public.billing_customers;
create policy "billing customers are owned by user"
  on public.billing_customers for select
  using (user_id = auth.uid());

drop policy if exists "subscription status is owned by user" on public.subscription_status;
create policy "subscription status is owned by user"
  on public.subscription_status for select
  using (user_id = auth.uid());

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

drop trigger if exists user_progress_snapshots_set_updated_at on public.user_progress_snapshots;
create trigger user_progress_snapshots_set_updated_at
  before update on public.user_progress_snapshots
  for each row execute function public.set_updated_at();

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row execute function public.set_updated_at();
