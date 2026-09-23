-- CREATE TABLE IF NOT EXISTS does not convert existing UUID identity columns.
-- Billing is backend-only; preserve rows while removing the obsolete Supabase-auth relation.
begin;
drop policy if exists "billing customers are owned by user" on public.billing_customers;
drop policy if exists "billing_select_own" on public.billing_customers;
drop policy if exists "subscription status is owned by user" on public.subscription_status;
drop policy if exists "subscription_select_own" on public.subscription_status;
alter table public.billing_customers drop constraint if exists billing_customers_user_id_fkey;
alter table public.subscription_status drop constraint if exists subscription_status_user_id_fkey;
alter table public.billing_customers alter column user_id type text using user_id::text;
alter table public.subscription_status alter column user_id type text using user_id::text;
alter table public.billing_customers enable row level security;
alter table public.subscription_status enable row level security;
revoke all on table public.billing_customers, public.subscription_status from anon, authenticated;
grant all on table public.billing_customers, public.subscription_status to service_role;
commit;
