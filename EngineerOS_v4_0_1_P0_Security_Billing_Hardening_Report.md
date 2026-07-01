# EngineerOS v4.0.1 P0 Security, Billing and Backend Hardening Report

## Result

EngineerOS remains a strong closed beta / controlled paid beta candidate. It is **not claimed as public paid SaaS ready** because a persistent production billing repository and live staging evidence are still required.

## Files changed

Backend security work added `backend/src/auth.js`, `backend/src/rate-limit.js`, and `backend/src/subscription-repository.js`. Existing backend app, configuration, AI, billing, vocabulary, environment, package, and test files were updated. Frontend auth, AI proxy, billing provider, login trust messaging, AI response honesty, and tests were hardened. Security and integration documentation was synchronized.

## AI auth and contract

- Production AI routes reject missing authorization.
- Internal bearer and validated Supabase bearer identities are supported.
- AI operation is controlled by the requested route; mismatches are rejected.
- Prompt presence, size checks, and configurable rate limiting remain active.
- OpenAI Responses and Anthropic Messages parsing were verified with mocked provider tests.
- Mock output stays explicitly labeled.
- Unstructured backend output is labeled `Limited AI response` in the UI.

## Billing auth and ownership

Billing routes derive ownership from authenticated identity. Query/body user ids cannot override an authenticated production user. Frontend requests send a Supabase bearer token when available and no longer query subscription status by user id.

## Repository and Stripe idempotency

The repository boundary now owns subscriptions and processed Stripe events. Memory mode is allowed for development/tests and blocked by default in production. Processed webhook ids use TTL and maximum-size pruning. Raw Stripe webhook `Buffer`, invalid signatures, duplicates, cache expiry, and cache size are tested.

The final-gate patch adds the Supabase billing repository and durable Stripe event migration. Applying and proving them in staging remains required before public paid launch.

## Local authentication

Local auth is blocked in production unless explicitly overridden. Login identifies local mode as demo/local-only and not a secure account. Demo starts use a fresh identity and the existing learning reset remains intact.

## Security headers and rate limits

Helmet supplies standard response hardening headers and Express identification remains disabled. AI, billing, and vocabulary lookup limits are independently configurable. CSP is not forced by this API service because the frontend is deployed separately; deployment-level CSP remains recommended.

## Tests and evidence

Backend coverage includes production auth, route-controlled AI operations, prompt limits, rate limiting, billing ownership, checkout mismatch, repository production guard, Stripe raw body, bounded idempotency, security headers, Anthropic parsing, and model validation. Frontend tests cover the LocalAuth production guard and fresh demo identity.

Final command results and exact counts are recorded in the companion level-gap report. No test was removed and no forced `process.exit` workaround was introduced.

Commands passed: `npm ci`, `npm run typecheck`, `npm run format:check`, `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`, `npm run backend:install`, `npm run backend:test`, `npm run verify:release`, `npm run verify:rls`, `npm run quality:gate`, and `npm run e2e:browser`.

## Remaining limitations

- Supabase billing persistence is implemented but not yet proven against a live staging project.
- In-memory rate limiting is process-local.
- Supabase bearer validation and live AI/Stripe calls require deployment credentials and staging proof.
- No public SaaS readiness claim is made.
