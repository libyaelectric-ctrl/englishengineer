-- Create subscription_status table for billing system
-- This table stores user subscription data for Dodo Payments / Stripe integration

CREATE TABLE IF NOT EXISTS public.subscription_status (
  user_id text PRIMARY KEY,
  plan_id text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'none',
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'backend',
  topup_credits integer NOT NULL DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS subscription_status_updated_at_idx
  ON public.subscription_status(updated_at desc);

-- Enable RLS
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- Billing state is backend-only. Service role bypasses RLS.
-- Browser roles receive no policy and no direct table privileges.
REVOKE ALL ON TABLE public.subscription_status FROM anon, authenticated;
GRANT ALL ON TABLE public.subscription_status TO service_role;
