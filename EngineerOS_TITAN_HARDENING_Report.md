# EngineerOS Titan Hardening Report

## Decision

HOLD

Reason: EngineerOS v2.5.6 is ready for closed beta and staging backend integration, but public production launch still requires deployed backend credentials and external service proof.

Deployment credentials required.

Recommended Next Step: PROJECT OLYMPUS

## Modified Files

- `package.json`
- `package-lock.json`
- `.env.example`
- `metadata.json`
- `README.md`
- `BACKEND_AI.md`
- `STRIPE.md`
- `SUPABASE.md`
- `DEPLOYMENT_GUIDE.md`
- `PRODUCTION_READINESS_REPORT.md`
- `RELEASE_CHECKLIST.md`
- `CHANGELOG.md`
- `ENGINEEROS_ROADMAP.md`
- `src/config/environment.config.ts`
- `src/config/environment.config.test.ts`
- `src/contracts/backend/backend-contract.types.ts`
- `src/contracts/backend/backend-contract.helpers.ts`
- `src/contracts/backend/backend-contract.test.ts`
- `src/core/observability/observability.service.test.ts`
- `src/features/billing/stripe.provider.ts`

## Backend Proof

AI backend contracts:

- `POST /api/ai/coach`
- `POST /api/ai/writing-review`
- `POST /api/ai/assessment-feedback`
- `POST /api/ai/roleplay`

Billing backend contracts:

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-customer-portal-session`
- `GET /api/billing/subscription-status`
- `POST /api/webhooks/stripe`

Health backend contract:

- `GET /api/health`

Evidence:

- request validation exists
- response validation exists
- timeout values are specified per endpoint
- unavailable backend state exists
- mock mode remains explicit
- production mode is environment-driven
- frontend secrets are not used

## Stripe Proof

Implemented as backend contract proof:

- webhook signature verification required before processing
- stable idempotency key helper: `event.type:event.id`
- checkout completed mapping
- payment failed mapping
- subscription active mapping
- subscription cancelled mapping
- grace period / trial ending mapping
- customer portal endpoint aligned to production contract

The frontend still does not verify payment state or store Stripe secrets.

## Supabase Proof

The migration includes:

- `profiles`
- `user_settings`
- `user_progress_snapshots`
- `assessment_snapshots`
- `task_attempts`
- `writing_attempts`
- `listening_attempts`
- `speaking_attempts`
- `vocabulary_reviews`
- `ai_sessions`
- `billing_customers`
- `subscription_status`

RLS is enabled on all listed tables. User-owned policies use `auth.uid()` so User A cannot read or write User B rows through normal authenticated client access.

Production proof still requires applying the migration to a staging Supabase project.

## Environment Requirements

Local:

- `VITE_APP_VERSION=2.5.6`
- `VITE_ENVIRONMENT_MODE=local`
- `VITE_AI_PROVIDER=mock`
- `VITE_AUTH_PROVIDER=local`
- `VITE_ENABLE_MOCK_BILLING=true`

Production:

- `VITE_APP_VERSION=2.5.6`
- `VITE_ENVIRONMENT_MODE=production`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL`
- `VITE_AUTH_PROVIDER=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BILLING_API_URL`
- optional `VITE_ERROR_MONITORING_PROVIDER`
- optional `VITE_SENTRY_DSN`
- optional `VITE_ERROR_MONITORING_SAMPLE_RATE`

Backend-only secrets:

- AI provider keys
- Stripe secret key
- Stripe webhook secret
- Supabase service-role key

## Exact Command Outputs

### `npm ci`

```text
added 305 packages, and audited 306 packages in 8s
74 packages are looking for funding
found 0 vulnerabilities
```

Note: the managed Windows sandbox produced an EPERM cache error on the first run. The same command passed with approved filesystem permissions.

### `npm run typecheck`

```text
> engineeros-frontend@2.5.6 typecheck
> tsc --noEmit

pass
```

### `npm run format:check`

```text
> engineeros-frontend@2.5.6 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `npm run lint`

```text
> engineeros-frontend@2.5.6 lint
> eslint .

pass
```

### `npm run test`

```text
> engineeros-frontend@2.5.6 test
> vitest run --configLoader runner

Test Files 16 passed (16)
Tests 104 passed (104)
```

### `npm run build`

```text
> engineeros-frontend@2.5.6 build
> tsc --noEmit && vite build --configLoader runner

2267 modules transformed.
dist/index.html 0.61 kB gzip 0.38 kB
dist/assets/index-Mkaoi2-B.css 90.93 kB gzip 13.85 kB
dist/assets/index-DYfr5R3c.js 574.74 kB gzip 170.26 kB
built in 6.08s
```

Build status: pass.

Bundle note: Vite reports one non-blocking chunk-size warning for the main bundle.

### `npm run e2e`

```text
> engineeros-frontend@2.5.6 e2e
> vitest run src/e2e --configLoader runner

Test Files 1 passed (1)
Tests 20 passed (20)
```

Browser E2E: no `e2e:browser` script exists in this source package.

## Test Count

- Full test command: 16 files, 104 tests.
- E2E smoke fallback: 1 file, 20 tests.

## Coverage Summary

```text
Statements   : 40.24% (1530/3802)
Branches     : 26.16% (618/2362)
Functions    : 34.35% (358/1042)
Lines        : 40.34% (1440/3569)
```

Coverage status: sufficient for release-candidate business logic proof, not yet sufficient for public production confidence.

## Build Status

Build passes. Audio assets are copied by Vite into `dist/audio`. The main chunk remains larger than 500 kB and should be optimized later.

## Known Limitations

- Deployment credentials are not included.
- Real AI requires backend deployment.
- Stripe requires backend deployment and webhook verification in a real Stripe environment.
- Supabase RLS should be verified against a staging project.
- Browser-level Playwright/Cypress E2E is not installed; existing E2E is a jsdom smoke fallback.
- Main bundle chunk warning remains.

## Artifact List

- `EngineerOS_TITAN_HARDENING_Report.md`
- `engineeros-v2.5.6-titan-hardening-clean-source.zip`

## Final Release Decision

HOLD for public production launch.

GO for controlled closed beta and staging backend integration.

Rationale: all local/source quality gates pass, but external deployment credentials and service-side proof are still required.
