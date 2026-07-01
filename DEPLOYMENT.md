# EngineerOS Deployment Readiness

EngineerOS is code-ready for controlled staging. This document is not evidence
that a production deployment, domain, SSL certificate or vendor integration is
live.

## Local Development

1. Install frontend and backend dependencies with `npm ci` and
   `npm run backend:install`.
2. Keep frontend providers in local/mock mode using `.env.local`.
3. Run `npm run dev` for the frontend and `npm --prefix backend start` for the
   optional backend.
4. Run `npm run content:validate` and `npm run quality:gate` before packaging.

Local mode requires no production credentials. It must label AI, billing,
cloud sync and team data honestly.

## Staging Deployment

1. Create a separate Supabase project and apply every file under
   `supabase/migrations/` in order.
2. Deploy the Express backend with staging-only Supabase, Stripe test-mode, AI
   provider and Upstash credentials.
3. Set `APP_ORIGIN` to the exact frontend staging origin.
4. Deploy the Vite `dist/` artifact with the frontend environment variables
   documented in `ENVIRONMENT.md`.
5. Confirm `/api/health` reports configured dependencies without exposing
   secret values.
6. Run `npm run kademe8:verify` from a protected staging operator environment.

Kademe 8 is `BLOCKED` when any required credential is absent. `PARTIAL` means
at least one real check failed or remained unverified. Only `COMPLETE` permits
the release process to consider live billing or production launch.

## Production Deployment

Production deployment is not allowed while Kademe 8 remains blocked. After
staging evidence exists:

1. Complete legal review for Terms, Privacy, Cookies and Refund templates.
2. Create production vendor projects separately from staging.
3. Store secrets only in the hosting platform secret manager.
4. Apply and verify Supabase migrations and RLS with two real test users.
5. Configure a Stripe production webhook endpoint and verify signed delivery.
6. Configure the external Upstash rate-limit store.
7. Configure optional error monitoring and privacy controls.
8. Run the full quality and Kademe 8 gates before promoting the artifact.

## Domain And SSL Checklist

- DNS records point only to the intended frontend and backend hosts.
- HTTPS is enforced and certificates renew automatically.
- Backend CORS allows the exact frontend origin.
- Secure headers and request-size limits remain enabled.
- Stripe webhook URL uses HTTPS and receives the raw request body.
- Supabase redirect URLs contain only approved application origins.

No SSL or domain check has been performed by this source-only sprint.

## Rollback Checklist

1. Retain the previous immutable frontend and backend artifacts.
2. Record migration versions before release.
3. Prefer forward database corrections; never destroy user progress to roll
   back application code.
4. Disable new billing entry points before rolling back webhook consumers.
5. Restore the previous artifact and run `/api/health` plus a smoke test.
6. Document affected sessions, queued cloud writes and webhook events.

## Observability

The frontend exposes optional Sentry-compatible configuration through
`VITE_ERROR_MONITORING_PROVIDER`, `VITE_SENTRY_DSN` and a bounded sample rate.
Missing monitoring does not break local development. No monitoring provider is
live verified by this document.
