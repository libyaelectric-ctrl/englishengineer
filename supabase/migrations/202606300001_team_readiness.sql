create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'member')),
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('manager', 'member')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_progress_summaries (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cefr_estimate text,
  overall_progress numeric not null default 0 check (overall_progress between 0 and 100),
  completed_tasks integer not null default 0 check (completed_tasks >= 0),
  skill_summary jsonb not null default '{}'::jsonb,
  mistake_categories jsonb not null default '[]'::jsonb,
  recommended_tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_organization_manager(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and role in ('owner', 'manager')
  );
$$;

create or replace function public.create_organization_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.is_organization_manager(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.is_organization_manager(uuid) to authenticated;

drop trigger if exists organizations_create_owner_membership on public.organizations;
create trigger organizations_create_owner_membership
  after insert on public.organizations
  for each row execute function public.create_organization_owner_membership();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.team_progress_summaries enable row level security;

create policy "organization members can read their organization"
  on public.organizations for select
  using (public.is_organization_member(id));

create policy "authenticated users can create an organization"
  on public.organizations for insert
  with check (created_by = auth.uid());

create policy "organization owners can update their organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "members see self and managers see roster"
  on public.organization_members for select
  using (
    user_id = auth.uid()
    or public.is_organization_manager(organization_id)
  );

create policy "managers administer organization members"
  on public.organization_members for all
  using (public.is_organization_manager(organization_id))
  with check (public.is_organization_manager(organization_id));

create policy "managers administer invitations"
  on public.organization_invitations for all
  using (public.is_organization_manager(organization_id))
  with check (
    public.is_organization_manager(organization_id)
    and invited_by = auth.uid()
  );

create policy "learners see self and managers see summaries"
  on public.team_progress_summaries for select
  using (
    user_id = auth.uid()
    or public.is_organization_manager(organization_id)
  );

create policy "service role owns summary writes"
  on public.team_progress_summaries for all
  to service_role
  using (true)
  with check (true);

create index if not exists organization_members_user_idx
  on public.organization_members(user_id);
create index if not exists organization_invitations_org_status_idx
  on public.organization_invitations(organization_id, status);
create index if not exists team_progress_summaries_org_updated_idx
  on public.team_progress_summaries(organization_id, updated_at desc);

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

drop trigger if exists organization_invitations_set_updated_at on public.organization_invitations;
create trigger organization_invitations_set_updated_at
  before update on public.organization_invitations
  for each row execute function public.set_updated_at();
