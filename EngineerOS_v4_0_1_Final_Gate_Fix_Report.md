# EngineerOS v4.0.1 Final Gate Fix Report

## Release decision

EngineerOS is evaluated as a **95/100 controlled paid beta candidate** only after the bounded exit checks and complete quality gate pass. This is not a public SaaS readiness claim. Live Supabase, Stripe, AI provider, and deployment evidence remain required.

## Files changed

- `vitest.config.ts`
- `src/test/setup.ts`
- `scripts/run-with-timeout.mjs`
- `package.json`
- `backend/src/config.js`
- `backend/src/app.js`
- `backend/src/subscription-repository.js`
- `backend/src/supabase-billing-repository.js`
- `backend/test/backend.test.js`
- `backend/test/supabase-billing-repository.test.js`
- `backend/.env.example`
- `backend/README.md`
- `supabase/migrations/202606270001_stripe_processed_events.sql`
- `scripts/verify-supabase-rls.mjs`
- `SECURITY_HARDENING_NOTES.md`
- `STRIPE.md`
- `SUPABASE.md`
- `TESTING.md`
- `scripts/verify-release.mjs`

## Test exit root cause and fix

Repository search found no test-owned `setInterval`, `setTimeout`, fake timer, user-event, observer, or event-listener handle in the reported test files. A later independent run showed that multi-process fork teardown was still unstable in its audit environment.

Vitest now uses a single `threads` worker, avoiding the multi-process fork lifecycle while keeping test isolation deterministic. Global cleanup unmounts React trees, clears and restores mocks, unstubs globals, restores real timers, and clears browser storage. No test was removed, skipped, or force-terminated in the normal test script.

Cross-platform evidence scripts wrap the unchanged normal commands with external deadlines:

- `npm run verify:test-exit`: 90-second deadline around `npm run test`.
- `npm run verify:quality-exit`: 180-second deadline around `npm run quality:gate`.

The wrapper returns `124` only if the child exceeds its deadline. It does not alter Vitest or call `process.exit` to manufacture success.

## Billing persistence boundary

Option A was implemented. `createSupabaseBillingRepository()` persists `subscription_status` and `stripe_processed_events` through Supabase REST with the backend-only service-role key. Production automatically selects Supabase persistence when service-role configuration is present, or it can be selected explicitly with `BILLING_REPOSITORY=supabase`.

The new migration creates durable Stripe event idempotency storage, enables RLS, revokes browser-role access, and grants the backend service role. Memory mode remains available for development and tests and remains blocked by default in production.

Implementation tests use mocked Supabase responses. A real migration and live webhook flow have not been claimed.

## Anthropic model decision

Anthropic now requires an explicit non-empty `AI_MODEL`; no `latest` model is guessed. OpenAI intentionally retains `gpt-4.1-mini` as its configured default. Empty model values fail clearly for real providers. Tests cover all three cases.

## Frontend/backend auth clarity

Local/demo frontend requests require `ALLOW_INSECURE_DEV_AUTH=true` on the local backend. Production requires a validated Supabase JWT or an internal bearer for trusted server-to-server calls. `ENGINEEROS_INTERNAL_API_SECRET` must never appear in `VITE_*` variables or browser code.

## Browser E2E status

Browser E2E is recorded as passed only when `npm run e2e:browser` actually executes with installed Chromium. Environments without the executable must report: `Browser E2E not verified: Playwright browser not installed.` Browser installation is intentionally separate through `npm run e2e:browser:install`.

## Final evidence

All requested commands completed with exit code `0` in the final run:

- `npm ci`: 308 packages installed; 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npm run verify:test-exit`: two consecutive runs completed before the 90-second deadline; 29 files and 137 tests passed in 52.91 and 47.57 seconds.
- `npm run build`: 2,309 modules transformed; main entry 259.87 kB raw / 81.46 kB gzip.
- `npm run e2e`: 20 tests passed.
- `npm run backend:install`: 71 packages installed; 0 vulnerabilities.
- `npm run backend:test`: 29 tests passed, including three Supabase repository tests.
- `npm run verify:release`: passed; 13 WAV assets and existing content counts preserved.
- `npm run verify:rls`: passed, including the Stripe event table and service-role boundary checks.
- `npm run verify:quality-exit`: the repair run completed before the 180-second deadline with exit code `0` in 87.8 seconds. Its normal unit-test phase passed in 51.30 seconds.
- `npm run e2e:browser`: Chromium was installed in this verification environment; the repair run passed 9 tests in 48.7 seconds.

Browser E2E remains environment-dependent. A machine without Playwright Chromium must report it as not verified until `npm run e2e:browser:install` is run.

## Remaining limitations

- Supabase migration and repository behavior still require live staging proof.
- Stripe checkout, portal, signature, and webhook transitions require Stripe test credentials and staging evidence.
- Supabase JWT validation and user isolation require a configured project.
- Real AI provider behavior requires backend-only credentials and deployment evidence.
- No public SaaS readiness claim is made.
