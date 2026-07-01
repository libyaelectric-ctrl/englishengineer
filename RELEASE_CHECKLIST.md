# EngineerOS v4.0.1 Release Verification Checklist

## Build

- [ ] `npm ci`
- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run e2e`
- [ ] `npm run e2e:browser`
- [ ] `npm run test:coverage`
- [ ] `npm run build`
- [ ] `npm run quality:gate`
- [ ] `npm --prefix backend ci`
- [ ] `npm --prefix backend test`
- [ ] Verify no unexpected bundle growth.

## Environment

- [ ] `VITE_AI_PROVIDER=backend`
- [ ] `VITE_APP_VERSION=4.0.1`
- [ ] `VITE_ENVIRONMENT_MODE=production`
- [ ] `VITE_AI_PROXY_URL` configured
- [ ] `VITE_AUTH_PROVIDER=supabase`
- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] `VITE_BILLING_API_URL` configured
- [ ] No `.env` or `.env.local` committed
- [ ] Optional error monitoring configured only through deployment env

## Supabase

- [ ] `profiles` table exists
- [ ] `user_progress_snapshots` table exists
- [ ] RLS enabled
- [ ] Users can read/write only their own profile and progress
- [ ] Email/password auth enabled
- [ ] Password reset redirect configured

## Stripe

- [ ] Products and prices configured
- [ ] Checkout Session endpoint deployed
- [ ] Customer Portal endpoint deployed
- [ ] Subscription status endpoint deployed
- [ ] Webhook signature verification enabled
- [ ] Invoice history endpoint planned or deployed

## AI Backend

- [ ] Backend proxy deployed
- [ ] `GET /api/health` deployed
- [ ] Vendor API keys server-only
- [ ] Timeout and retry policy verified
- [ ] Malformed responses return stable errors
- [ ] CORS allows production app origin
- [ ] Backend `AI_PROVIDER` and matching server-only key configured

## Backend Package

- [ ] `GET /api/health` returns safe booleans only
- [ ] `backend/.env` is excluded from source packages
- [ ] No backend secret uses a `VITE_` prefix
- [ ] Durable subscription and webhook idempotency repository connected
- [ ] Billing routes enforce authenticated user identity

## Cloud Sync

- [ ] Offline local progress remains available
- [ ] Online-return sync succeeds
- [ ] Retry limit works
- [ ] Merge strategy documented and accepted

## Authentication

- [ ] Local mode still works for development
- [ ] Supabase sign in works
- [ ] Supabase sign up works
- [ ] Logout works
- [ ] Session restore works

## Product Modules

- [ ] Dashboard loads
- [ ] Reading loads
- [ ] Writing loads
- [ ] Listening loads
- [ ] Speaking loads
- [ ] Vocabulary loads
- [ ] AI Coach handles backend errors
- [ ] Analytics free/pro entitlement gates work
- [ ] Gamification free/pro entitlement gates work

## Release

- [ ] `EngineerOS_TITAN_HARDENING_Report.md` reviewed
- [ ] `EngineerOS_Production_Verification_Report.md` reviewed
- [ ] `EngineerOS_Release_Evidence.md` reviewed
- [ ] `EngineerOS_Test_Summary.md` reviewed
- [ ] `RELEASE_CANDIDATE_REPORT.md` reviewed
- [ ] `KNOWN_LIMITATIONS.md` reviewed
- [ ] No production SaaS claim without deployed backend evidence
- [ ] Closed beta group and feedback process defined
- [ ] Staging smoke test complete
- [ ] Production deployment approved
- [ ] Rollback artifact available
- [ ] Monitoring dashboards ready
- [ ] Release notes prepared
