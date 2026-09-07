begin;

create table if not exists public.ai_credit_consumptions (
  user_id text not null,
  request_id text not null,
  consumed boolean not null default false,
  remaining_credits integer not null default 0 check (remaining_credits >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

alter table public.ai_credit_consumptions enable row level security;
revoke all on public.ai_credit_consumptions from anon, authenticated;
grant select, insert, update, delete on public.ai_credit_consumptions to service_role;

alter table public.ai_sessions add column if not exists request_id text;
create unique index if not exists ai_sessions_user_request_id_uidx
  on public.ai_sessions (user_id, request_id)
  where request_id is not null;

create or replace function public.consume_ai_topup_credit(p_user_id text, p_request_id text)
returns table(consumed boolean, duplicate boolean, remaining_credits integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  next_remaining integer;
  existing_consumed boolean;
  existing_remaining integer;
begin
  if p_user_id is null or btrim(p_user_id) = '' or p_request_id is null or btrim(p_request_id) = '' then
    raise exception 'user_id and request_id are required' using errcode = '22023';
  end if;

  insert into public.ai_credit_consumptions(user_id, request_id)
  values (p_user_id, p_request_id)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    select c.consumed, c.remaining_credits
      into existing_consumed, existing_remaining
      from public.ai_credit_consumptions c
      where c.user_id = p_user_id and c.request_id = p_request_id;
    return query select existing_consumed, true, existing_remaining;
    return;
  end if;

  update public.subscription_status
     set topup_credits = topup_credits - 1,
         updated_at = now(),
         source = 'ai_atomic_credit_consumption'
   where user_id = p_user_id and topup_credits > 0
   returning topup_credits into next_remaining;

  if found then
    update public.ai_credit_consumptions
       set consumed = true, remaining_credits = next_remaining
     where user_id = p_user_id and request_id = p_request_id;
    return query select true, false, next_remaining;
  else
    select coalesce(s.topup_credits, 0) into next_remaining
      from public.subscription_status s where s.user_id = p_user_id;
    next_remaining := coalesce(next_remaining, 0);
    update public.ai_credit_consumptions
       set consumed = false, remaining_credits = next_remaining
     where user_id = p_user_id and request_id = p_request_id;
    return query select false, false, next_remaining;
  end if;
end;
$$;

revoke all on function public.consume_ai_topup_credit(text, text) from public, anon, authenticated;
grant execute on function public.consume_ai_topup_credit(text, text) to service_role;

commit;
