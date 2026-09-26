-- The audit store's user identity has to follow the app's identity model.
--
-- `202607100002_audit_logs.sql` declares `user_id uuid references auth.users(id)`, which
-- predates the move to Firebase: the backend writes `payload.sub` from a Firebase ID token
-- (`backend/src/auth.ts`), a string that is not a uuid. Every audited action then fails with
-- `22P02 invalid input syntax for type uuid`, and audited actions fail closed
-- (`backend/src/audit-log.ts` → `persistAuditRecord`), so the customer never sees a schema
-- error: checkout refuses with a 503 `audit_log_unavailable`, which
-- `src/features/billing/billing.failure-copy.ts` renders as "Billing could not be started
-- because the service is temporarily unavailable. Please try again in a few minutes."
--
-- That is why billing can be down while `/api/health` answers 200 and the plan catalogue,
-- pricing page, provider keys and checkout route are all healthy: the audit store sits in
-- front of checkout, and this column is what breaks it.
--
-- `subscription_status` (202608190001) and `ai_credit_consumptions` (202609070003) already
-- carry `user_id text` for the same reason, and 202608280001 drops the `auth.users` foreign
-- keys on the billing tables. `202609210000_billing_identity_conversion.sql` converts the two
-- billing tables; this migration is the audit store's half. It is idempotent — on a table that
-- is already `text`, or that never received the uuid column, both statements are no-ops — so
-- it is safe on every environment, including the ones that were repaired by hand.
--
-- Verify after applying; this must return `text`:
--
--   select data_type from information_schema.columns
--   where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'user_id';
--
-- The same question is asked statically by `scripts/check-schema-identity.mjs`, which reads the
-- migrations rather than the database and is wired into CI as `npm run verify:schema-identity`.
--
-- Rollback, and only together with a reverted write path: a Firebase uid is not a uuid, so the
-- conversion back cannot preserve rows.
--
--   alter table public.audit_logs alter column user_id type uuid using user_id::uuid;
--   alter table public.audit_logs add constraint audit_logs_user_id_fkey
--     foreign key (user_id) references auth.users(id) on delete set null;

begin;

-- The obsolete relation to Supabase's own user table goes first: the column cannot be retyped
-- while a foreign key into `auth.users` still constrains it.
alter table public.audit_logs drop constraint if exists audit_logs_user_id_fkey;

alter table public.audit_logs alter column user_id type text using user_id::text;

commit;
