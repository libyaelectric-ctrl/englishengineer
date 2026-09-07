-- Canonical persistent learning data for vocabulary, grammar, reading, listening,
-- writing, speaking, and the progress overview.

create table if not exists public.learning_progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (char_length(user_id) between 1 and 200),
  module text not null check (module in ('vocabulary', 'grammar', 'reading', 'listening')),
  item_id text not null check (char_length(item_id) between 1 and 200),
  result text check (result is null or result in ('correct', 'incorrect')),
  score numeric check (score is null or score between 0 and 100),
  category text not null default 'general',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.learning_writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (char_length(user_id) between 1 and 200),
  prompt_id text not null check (char_length(prompt_id) between 1 and 200),
  content text not null,
  score integer not null check (score between 0 and 100),
  grammar_score integer not null check (grammar_score between 0 and 100),
  vocabulary_score integer not null check (vocabulary_score between 0 and 100),
  coherence_score integer not null check (coherence_score between 0 and 100),
  structure_score integer not null check (structure_score between 0 and 100),
  feedback jsonb not null default '{}'::jsonb,
  status text not null default 'graded' check (status = 'graded'),
  submitted_at timestamptz not null default now()
);

create table if not exists public.learning_speaking_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (char_length(user_id) between 1 and 200),
  prompt_id text not null check (char_length(prompt_id) between 1 and 200),
  audio_url text,
  transcript text,
  pronunciation_score integer check (pronunciation_score is null or pronunciation_score between 0 and 100),
  fluency_score integer check (fluency_score is null or fluency_score between 0 and 100),
  grammar_score integer check (grammar_score is null or grammar_score between 0 and 100),
  vocabulary_score integer check (vocabulary_score is null or vocabulary_score between 0 and 100),
  overall_score integer check (overall_score is null or overall_score between 0 and 100),
  feedback jsonb not null default '{}'::jsonb,
  status text not null check (status in ('not_graded', 'graded')),
  reason text,
  submitted_at timestamptz not null default now(),
  constraint speaking_grade_consistency check (
    (status = 'not_graded' and overall_score is null)
    or (status = 'graded' and overall_score is not null)
  )
);

create index if not exists learning_progress_user_module_time_idx
  on public.learning_progress_events(user_id, module, occurred_at desc);
create index if not exists learning_progress_user_item_idx
  on public.learning_progress_events(user_id, module, item_id);
create index if not exists learning_writing_user_time_idx
  on public.learning_writing_submissions(user_id, submitted_at desc);
create index if not exists learning_speaking_user_time_idx
  on public.learning_speaking_submissions(user_id, submitted_at desc);

create or replace function public.can_manage_learning_user(target_user_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members manager
    join public.organization_members learner
      on learner.organization_id = manager.organization_id
    where manager.user_id = auth.uid()
      and manager.role in ('owner', 'manager')
      and learner.user_id::text = target_user_id
  );
$$;

revoke all on function public.can_manage_learning_user(text) from public;
grant execute on function public.can_manage_learning_user(text) to authenticated;
grant execute on function public.can_manage_learning_user(text) to service_role;

alter table public.learning_progress_events enable row level security;
alter table public.learning_writing_submissions enable row level security;
alter table public.learning_speaking_submissions enable row level security;

drop policy if exists "learning progress owner read" on public.learning_progress_events;
create policy "learning progress owner read" on public.learning_progress_events
  for select to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning progress owner insert" on public.learning_progress_events;
create policy "learning progress owner insert" on public.learning_progress_events
  for insert to authenticated with check (user_id = auth.uid()::text);
drop policy if exists "learning progress owner delete" on public.learning_progress_events;
create policy "learning progress owner delete" on public.learning_progress_events
  for delete to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning progress manager read" on public.learning_progress_events;
create policy "learning progress manager read" on public.learning_progress_events
  for select to authenticated using (public.can_manage_learning_user(user_id));
drop policy if exists "learning progress service role" on public.learning_progress_events;
create policy "learning progress service role" on public.learning_progress_events
  for all to service_role using (true) with check (true);

drop policy if exists "learning writing owner read" on public.learning_writing_submissions;
create policy "learning writing owner read" on public.learning_writing_submissions
  for select to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning writing owner insert" on public.learning_writing_submissions;
create policy "learning writing owner insert" on public.learning_writing_submissions
  for insert to authenticated with check (user_id = auth.uid()::text);
drop policy if exists "learning writing owner delete" on public.learning_writing_submissions;
create policy "learning writing owner delete" on public.learning_writing_submissions
  for delete to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning writing manager read" on public.learning_writing_submissions;
create policy "learning writing manager read" on public.learning_writing_submissions
  for select to authenticated using (public.can_manage_learning_user(user_id));
drop policy if exists "learning writing service role" on public.learning_writing_submissions;
create policy "learning writing service role" on public.learning_writing_submissions
  for all to service_role using (true) with check (true);

drop policy if exists "learning speaking owner read" on public.learning_speaking_submissions;
create policy "learning speaking owner read" on public.learning_speaking_submissions
  for select to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning speaking owner insert" on public.learning_speaking_submissions;
create policy "learning speaking owner insert" on public.learning_speaking_submissions
  for insert to authenticated with check (user_id = auth.uid()::text);
drop policy if exists "learning speaking owner delete" on public.learning_speaking_submissions;
create policy "learning speaking owner delete" on public.learning_speaking_submissions
  for delete to authenticated using (user_id = auth.uid()::text);
drop policy if exists "learning speaking manager read" on public.learning_speaking_submissions;
create policy "learning speaking manager read" on public.learning_speaking_submissions
  for select to authenticated using (public.can_manage_learning_user(user_id));
drop policy if exists "learning speaking service role" on public.learning_speaking_submissions;
create policy "learning speaking service role" on public.learning_speaking_submissions
  for all to service_role using (true) with check (true);

grant select, insert, delete on public.learning_progress_events to authenticated;
grant select, insert, delete on public.learning_writing_submissions to authenticated;
grant select, insert, delete on public.learning_speaking_submissions to authenticated;
grant all on public.learning_progress_events to service_role;
grant all on public.learning_writing_submissions to service_role;
grant all on public.learning_speaking_submissions to service_role;

create or replace function public.export_learning_user_data(target_user_id text)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and target_user_id <> auth.uid()::text then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'progressEvents', coalesce((select jsonb_agg(row_to_json(event_row)) from public.learning_progress_events event_row where user_id = target_user_id), '[]'::jsonb),
    'writingSubmissions', coalesce((select jsonb_agg(row_to_json(writing_row)) from public.learning_writing_submissions writing_row where user_id = target_user_id), '[]'::jsonb),
    'speakingSubmissions', coalesce((select jsonb_agg(row_to_json(speaking_row)) from public.learning_speaking_submissions speaking_row where user_id = target_user_id), '[]'::jsonb),
    'exportedAt', now()
  );
end;
$$;
revoke all on function public.export_learning_user_data(text) from public;
grant execute on function public.export_learning_user_data(text) to authenticated;
grant execute on function public.export_learning_user_data(text) to service_role;

create or replace function public.delete_learning_user_data(target_user_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.learning_progress_events where user_id = target_user_id;
  delete from public.learning_writing_submissions where user_id = target_user_id;
  delete from public.learning_speaking_submissions where user_id = target_user_id;
end;
$$;
revoke all on function public.delete_learning_user_data(text) from public;
grant execute on function public.delete_learning_user_data(text) to service_role;

create or replace function public.purge_expired_learning_data(retention interval default interval '730 days')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_rows bigint := 0;
  affected bigint := 0;
begin
  delete from public.learning_progress_events where occurred_at < now() - retention;
  get diagnostics affected = row_count;
  deleted_rows := deleted_rows + affected;
  delete from public.learning_writing_submissions where submitted_at < now() - retention;
  get diagnostics affected = row_count;
  deleted_rows := deleted_rows + affected;
  delete from public.learning_speaking_submissions where submitted_at < now() - retention;
  get diagnostics affected = row_count;
  return deleted_rows + affected;
end;
$$;
revoke all on function public.purge_expired_learning_data(interval) from public;
grant execute on function public.purge_expired_learning_data(interval) to service_role;
