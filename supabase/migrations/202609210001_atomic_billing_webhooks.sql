-- Run before deploying the application: missing RPC fails closed and providers retry.
alter table public.subscription_status add column if not exists grace_period_ends_at timestamptz;
create or replace function public.commit_billing_webhook(
  p_event_id text, p_event_type text, p_user_id text,
  p_expected_updated_at timestamptz, p_expected_credits integer,
  p_snapshot jsonb, p_customer jsonb
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  inserted_id text;
  current_row public.subscription_status%rowtype;
  row_exists boolean;
begin
  insert into public.stripe_processed_events(stripe_event_id, event_type)
    values (p_event_id, p_event_type)
    on conflict (stripe_event_id) do nothing returning stripe_event_id into inserted_id;
  if inserted_id is null then return 'duplicate'; end if;
  if p_user_id is not null and p_snapshot is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_user_id, 0));
    select * into current_row from public.subscription_status
      where user_id = p_user_id for update;
    row_exists := found;
    if (row_exists and (current_row.updated_at is distinct from p_expected_updated_at
        or current_row.topup_credits is distinct from p_expected_credits))
        or (not row_exists and p_expected_updated_at is not null) then
      delete from public.stripe_processed_events where stripe_event_id = p_event_id;
      return 'conflict';
    end if;
    insert into public.subscription_status(
      user_id, plan_id, status, current_period_end, cancel_at_period_end,
      stripe_customer_id, stripe_subscription_id, topup_credits, updated_at, source, grace_period_ends_at
    ) values (
      p_user_id, p_snapshot->>'plan_id', p_snapshot->>'status',
      (p_snapshot->>'current_period_end')::timestamptz,
      (p_snapshot->>'cancel_at_period_end')::boolean,
      p_snapshot->>'stripe_customer_id', p_snapshot->>'stripe_subscription_id',
      (p_snapshot->>'topup_credits')::integer, clock_timestamp(), p_snapshot->>'source',
      (p_snapshot->>'grace_period_ends_at')::timestamptz
    ) on conflict (user_id) do update set
      plan_id = excluded.plan_id, status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_subscription_id = excluded.stripe_subscription_id,
      topup_credits = excluded.topup_credits, updated_at = excluded.updated_at,
      source = excluded.source, grace_period_ends_at = excluded.grace_period_ends_at;
    if p_customer is not null then
      insert into public.billing_customers(user_id, dodo_customer_id, stripe_customer_id, billing_email)
      values (p_user_id, p_customer->>'dodoCustomerId',
        p_customer->>'stripeCustomerId', p_customer->>'billingEmail')
      on conflict (user_id) do update set
        dodo_customer_id = coalesce(excluded.dodo_customer_id, billing_customers.dodo_customer_id),
        stripe_customer_id = coalesce(excluded.stripe_customer_id, billing_customers.stripe_customer_id),
        billing_email = coalesce(excluded.billing_email, billing_customers.billing_email),
        updated_at = now();
    end if;
  end if;
  return 'applied';
end;
$$;
revoke all on function public.commit_billing_webhook(text,text,text,timestamptz,integer,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.commit_billing_webhook(text,text,text,timestamptz,integer,jsonb,jsonb) to service_role;
