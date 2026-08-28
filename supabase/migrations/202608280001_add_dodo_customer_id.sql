-- Add dodo_customer_id column to billing_customers for DodoPayments integration
-- The existing stripe_customer_id column is kept for backward compatibility

ALTER TABLE public.billing_customers
  ADD COLUMN IF NOT EXISTS dodo_customer_id text UNIQUE;

-- Create index for faster lookups by dodo_customer_id
CREATE INDEX IF NOT EXISTS idx_billing_customers_dodo_customer_id
  ON public.billing_customers(dodo_customer_id)
  WHERE dodo_customer_id IS NOT NULL;

COMMENT ON COLUMN public.billing_customers.dodo_customer_id IS 'DodoPayments customer ID (cus_xxx format)';
COMMENT ON COLUMN public.billing_customers.stripe_customer_id IS 'Legacy Stripe customer ID (kept for backward compatibility)';
