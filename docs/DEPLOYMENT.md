# Deployment Guide

## Quick Reference

| Target | Purpose        | Command                 |
| ------ | -------------- | ----------------------- |
| Vercel | Frontend (SPA) | `npx vercel --prod`     |
| Render | Backend API    | Auto-deploy from GitHub |
| Docker | Full stack     | `docker compose up`     |

## Vercel (Frontend)

The frontend is deployed to Vercel via GitHub integration.

**Auto-deploy:** Pushing to `main` triggers automatic deployment.

**Manual deploy:**

```bash
cd 8.0
npx vercel --prod
```

**Production URL:** https://eng-vox.vercel.app

**Configuration:** `vercel.json` handles SPA routing (`/* -> /index.html`) and asset caching.

## Render (Backend)

The backend is deployed to Render via GitHub integration.

**Auto-deploy:** Pushing to `main` triggers automatic deployment.

**Environment variables:** Declared in `render.yaml` — the names, and the values that are not
secrets. Every secret and account id is `sync: false`, so its value comes from the Render
dashboard and never from git. `npm run verify:render-env` fails the build when that file and
the variables `backend/src` reads disagree; the annotated list is in
`docs/DEPLOYMENT_RUNBOOK.md`.

**Health check:** `GET /api/health`

## Docker (Full Stack)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000 (nginx)
- Backend: http://localhost:8080 (Node.js)

## Environment Variables

Required for production:

- `SUPABASE_URL` - Supabase project URL used by persistent repositories.
- `SUPABASE_ANON_KEY` - Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only key used for tenant membership, audit, export and private audio storage. Never expose it to Vite/browser variables.
- `SUPABASE_JWT_SECRET`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE` - Required together when local Supabase JWT verification is enabled. Issuer and audience are exact-match checks.
- `METRICS_TOKEN` - Required in production. Send only as `Authorization: Bearer <token>` to `/api/metrics` and `/api/diagnostics`; query-string tokens are rejected.
- `ENGINEEROS_INTERNAL_API_SECRET` and `ENGINEEROS_INTERNAL_SERVICE_ID` - Required together when internal service authentication is enabled. Optional `ENGINEEROS_INTERNAL_SERVICE_EMAIL` and `ENGINEEROS_INTERNAL_SERVICE_ROLE` describe the fixed service identity; caller identity headers are ignored.
- `SPEAKING_AUDIO_BUCKET` - Private Supabase Storage bucket for production speaking uploads (defaults to `speaking-audio`). Local-disk fallback is disabled in production.
- `BILLING_PROVIDER` (`dodo` in production; the code default is `stripe`) and that provider's credentials (`DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, one `DODO_PRODUCT_*` id per plan and interval).
- `RATE_LIMIT_STORE=upstash` with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — required in production, where the store defaults to `upstash` and the backend refuses to start without it.
- AI provider key such as `ANTHROPIC_API_KEY` when AI is enabled.

Frontend-only (VITE\_ prefix):

- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_SUPABASE_URL` - Supabase URL (can be hardcoded for SPA)
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (can be hardcoded for SPA)

## Build

```bash
npm run build      # Production build
npm run preview    # Preview build locally
npm run dev        # Development server on port 3000
```

## Health Checks

- Frontend: `GET /` returns HTML
- Backend liveness: `GET /api/health` returns only `{ "status": "ok" }`.
- Private readiness/diagnostics: `GET /api/diagnostics` with the operations Bearer token. A required audit repository that is not ready returns an unhealthy `503`.
- Metrics: `GET /api/metrics` with the same Bearer token. Missing production operations configuration returns `503`, not public metrics.
