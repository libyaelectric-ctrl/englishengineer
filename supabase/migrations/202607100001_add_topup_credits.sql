-- Migration: Add topup_credits column to subscription_status
alter table public.subscription_status
  add column if not exists topup_credits integer not null default 0;
