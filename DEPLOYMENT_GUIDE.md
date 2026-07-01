# EngineerOS Deployment Guide

## Sprint 6 verification commands

Run `npm run verify:release` before packaging. Run `npm run verify:rls` to statically confirm that migrations enable RLS, create policies and use `auth.uid()`. This static check is not live user-isolation evidence.

For browser evidence, install Chromium with `npx playwright install --with-deps chromium`, then run `npm run e2e:browser`.

Production evidence additionally requires deployed frontend/backend URLs, a successful `/api/health` response, Stripe test-mode event records and a configured Supabase project. These cannot be inferred from source code.

Current source contract: **v4.0.1**. Production credentials and deployment
evidence are not included.

EngineerOS v4.0.1 prepares the closed-beta frontend and optional backend package for staging integration. It does not include production credentials or deployment evidence.

## Frontend Build

1. Install dependencies with `npm ci`.
2. Run `npm run quality:gate`.
3. Run `npm run typecheck`.
4. Build with `npm run build`.
5. Deploy the generated `dist/` folder to the chosen static host.

## Railway Backend Staging

The current environment does not contain an authenticated Railway CLI session,
so deployment must be completed from the Railway dashboard or an authenticated
operator shell.

1. Create a staging service from this source package.
2. Set the service root directory to `backend`.
3. Use `npm ci` as the install/build command and `npm start` as the start
   command.
4. Set the health check path to `/api/health`.
5. Add the backend-only variables documented in `backend/.env.example`.
6. Set `APP_ORIGIN` to the eventual Vercel preview origin and keep Stripe in
   test mode.
7. Confirm `GET https://<railway-host>/api/health` reports safe configuration
   booleans only.

## Stripe Test Webhook

After Railway assigns a stable HTTPS origin, create one Stripe test-mode
webhook endpoint at:

```text
https://<railway-host>/api/webhooks/stripe
```

Store the generated `STRIPE_WEBHOOK_SECRET` in Railway only. Verify signature
handling, duplicate-event idempotency, Checkout completion and entitlement
updates before enabling any paid UI.

## Vercel Frontend Staging

1. Import the repository root into Vercel.
2. Use `npm run build` and output directory `dist`.
3. Add only `VITE_` variables from `.env.example`.
4. Point billing and AI proxy URLs to the verified Railway origin.
5. Redeploy after environment changes and confirm the preview URL before
   changing backend `APP_ORIGIN`.

## Supabase Migration Order

Apply only to staging, in this exact order:

1. `202606260001_engineeros_production_foundation.sql`
2. `202606270001_stripe_processed_events.sql`
3. `202606300001_team_readiness.sql`

Then verify User 1/User 2 private-record isolation and manager summary-only
access. Static `npm run verify:rls` output is not a substitute for this live
test.

## Required Production Services

- Backend API for AI and billing contracts
- Supabase project with Sprint C migration applied
- Stripe account and webhook endpoint
- HTTPS static hosting

## Environment

Production should configure:

- `VITE_APP_VERSION=4.0.1`
- `VITE_ENVIRONMENT_MODE=production`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL=https://your-backend.example.com/api/ai/coach`
- `VITE_AUTH_PROVIDER=supabase`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
- `VITE_BILLING_API_URL=https://your-backend.example.com/api/billing`

Do not configure frontend secret keys.

Optional observability:

- `VITE_ERROR_MONITORING_PROVIDER=sentry`
- `VITE_SENTRY_DSN=...`
- `VITE_ERROR_MONITORING_SAMPLE_RATE=0.1`

The DSN is a public routing identifier, not a vendor secret, but it should still be managed through deployment environment configuration.

## Backend Contracts

Install and verify the separate backend package with
`npm --prefix backend ci` and `npm --prefix backend test`. Configure it from
`backend/.env.example`; server secrets must never use a `VITE_` prefix.

AI endpoints:

- `POST /api/ai/coach`
- `POST /api/ai/writing-review`
- `POST /api/ai/assessment-feedback`
- `POST /api/ai/roleplay`

Billing endpoints:

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-customer-portal-session`
- `GET /api/billing/subscription-status`
- `POST /api/webhooks/stripe`
- `GET /api/health`

## Rollback

Keep the previous static build available. If deployment fails, restore the previous build artifact and keep backend contracts backward-compatible.

## Known Limitations

- Real AI, Stripe and production Supabase operation require backend deployment.
- The backend uses process-local subscription and idempotency adapters until a durable Supabase repository is connected.
- Browser E2E requires a local Chromium binary. Install it with `npx playwright install --with-deps chromium` in CI environments that do not provide one.
