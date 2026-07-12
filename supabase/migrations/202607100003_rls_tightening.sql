-- RLS Tightening Migration
-- Ensures users can only access their own data
-- Adds admin access for audit_logs and profiles

-- Helper function: check if user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper function: check if request is from service role (backend)
create or replace function public.is_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_setting('role') = 'service_role'
    or auth.role() = 'service_role';
$$;

-- profiles: tighten to own data only + admin read
drop policy if exists "profiles are owned by user" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_own"
  on public.profiles for delete
  using (id = auth.uid());

create policy "profiles_admin_select_all"
  on public.profiles for select
  using (public.is_admin());

-- user_settings: tighten to own data only
drop policy if exists "user settings are owned by user" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  using (user_id = auth.uid());

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (user_id = auth.uid());

create policy "user_settings_update_own"
  on public.user_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (user_id = auth.uid());

-- user_progress_snapshots: tighten to own data only
drop policy if exists "progress snapshots are owned by user" on public.user_progress_snapshots;
create policy "progress_select_own"
  on public.user_progress_snapshots for select
  using (user_id = auth.uid());

create policy "progress_insert_own"
  on public.user_progress_snapshots for insert
  with check (user_id = auth.uid());

create policy "progress_update_own"
  on public.user_progress_snapshots for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progress_delete_own"
  on public.user_progress_snapshots for delete
  using (user_id = auth.uid());

-- assessment_snapshots: tighten to own data only
drop policy if exists "assessment snapshots are owned by user" on public.assessment_snapshots;
create policy "assessment_select_own"
  on public.assessment_snapshots for select
  using (user_id = auth.uid());

create policy "assessment_insert_own"
  on public.assessment_snapshots for insert
  with check (user_id = auth.uid());

create policy "assessment_delete_own"
  on public.assessment_snapshots for delete
  using (user_id = auth.uid());

-- task_attempts: tighten to own data only
drop policy if exists "task attempts are owned by user" on public.task_attempts;
create policy "task_attempts_select_own"
  on public.task_attempts for select
  using (user_id = auth.uid());

create policy "task_attempts_insert_own"
  on public.task_attempts for insert
  with check (user_id = auth.uid());

create policy "task_attempts_delete_own"
  on public.task_attempts for delete
  using (user_id = auth.uid());

-- writing_attempts: tighten to own data only
drop policy if exists "writing attempts are owned by user" on public.writing_attempts;
create policy "writing_attempts_select_own"
  on public.writing_attempts for select
  using (user_id = auth.uid());

create policy "writing_attempts_insert_own"
  on public.writing_attempts for insert
  with check (user_id = auth.uid());

create policy "writing_attempts_delete_own"
  on public.writing_attempts for delete
  using (user_id = auth.uid());

-- listening_attempts: tighten to own data only
drop policy if exists "listening attempts are owned by user" on public.listening_attempts;
create policy "listening_attempts_select_own"
  on public.listening_attempts for select
  using (user_id = auth.uid());

create policy "listening_attempts_insert_own"
  on public.listening_attempts for insert
  with check (user_id = auth.uid());

create policy "listening_attempts_delete_own"
  on public.listening_attempts for delete
  using (user_id = auth.uid());

-- speaking_attempts: tighten to own data only
drop policy if exists "speaking attempts are owned by user" on public.speaking_attempts;
create policy "speaking_attempts_select_own"
  on public.speaking_attempts for select
  using (user_id = auth.uid());

create policy "speaking_attempts_insert_own"
  on public.speaking_attempts for insert
  with check (user_id = auth.uid());

create policy "speaking_attempts_delete_own"
  on public.speaking_attempts for delete
  using (user_id = auth.uid());

-- vocabulary_reviews: tighten to own data only
drop policy if exists "vocabulary reviews are owned by user" on public.vocabulary_reviews;
create policy "vocab_reviews_select_own"
  on public.vocabulary_reviews for select
  using (user_id = auth.uid());

create policy "vocab_reviews_insert_own"
  on public.vocabulary_reviews for insert
  with check (user_id = auth.uid());

create policy "vocab_reviews_delete_own"
  on public.vocabulary_reviews for delete
  using (user_id = auth.uid());

-- ai_sessions: tighten to own data only
drop policy if exists "ai sessions are owned by user" on public.ai_sessions;
create policy "ai_sessions_select_own"
  on public.ai_sessions for select
  using (user_id = auth.uid());

create policy "ai_sessions_insert_own"
  on public.ai_sessions for insert
  with check (user_id = auth.uid());

create policy "ai_sessions_delete_own"
  on public.ai_sessions for delete
  using (user_id = auth.uid());

-- billing_customers: tighten to own data only
drop policy if exists "billing customers are owned by user" on public.billing_customers;
create policy "billing_select_own"
  on public.billing_customers for select
  using (user_id = auth.uid());

-- subscription_status: tighten to own data only
drop policy if exists "subscription status is owned by user" on public.subscription_status;
create policy "subscription_select_own"
  on public.subscription_status for select
  using (user_id = auth.uid());

-- audit_logs: service role only for writes, admin for reads
drop policy if exists "Service role can manage audit logs" on public.audit_logs;
create policy "audit_logs_service_insert"
  on public.audit_logs for insert
  with check (public.is_service_role());

create policy "audit_logs_admin_select"
  on public.audit_logs for select
  using (public.is_admin() or public.is_service_role());

create policy "audit_logs_service_select"
  on public.audit_logs for select
  using (public.is_service_role());

-- workspaces: tighten to own data only
drop policy if exists "Service role can manage workspaces" on public.workspaces
  if exists;

-- organization policies (from team_readiness migration)
-- Already has proper RLS via is_organization_member function
