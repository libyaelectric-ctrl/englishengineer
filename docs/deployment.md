# Deployment Guide

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Railway       │
│   (Frontend)    │────▶│   (Backend)     │
│   React + Vite  │     │   Express       │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
              │ Supabase  │ │ Stripe │ │ Upstash  │
              │ (Auth/DB) │ │(Billing)│ │ (Redis)  │
              └───────────┘ └────────┘ └──────────┘
```

## Environments

| Environment | Frontend | Backend | Branch |
|-------------|----------|---------|--------|
| Production | englishengineer.vercel.app | englishengineer-production.up.railway.app | `main` |
| Preview | *.vercel.app | *-staging.up.railway.app | PR branches |

## CI/CD Workflows

### 1. ci.yml — Continuous Integration
- **Trigger:** Push to `main`, PRs
- **Steps:** TypeScript check → Vitest → Backend tests
- **Gate:** All tests must pass before merge

### 2. deploy.yml — Production Deploy
- **Trigger:** Push to `main`
- **Steps:** Build → Deploy to Vercel (frontend)
- **Backend:** Railway auto-deploys from `main`

### 3. staging.yml — Preview Deploy
- **Trigger:** PR opened/updated
- **Steps:** Deploy preview to Vercel
- **URL:** Commented on PR

### 4. quality-gate.yml — Code Quality
- **Trigger:** PR opened/updated
- **Steps:** ESLint → Prettier check → Coverage threshold

## Deploy Process

### Frontend (Vercel)
```bash
# Local deploy (emergency)
npx vercel --prod

# Automatic via git push to main
git push origin main
```

### Backend (Railway)
```bash
# Automatic via git push to main
git push origin main

# Manual trigger via Railway dashboard
```

## Health Checks

### Backend Health
```bash
curl https://englishengineer-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "4.0.1",
  "timestamp": "2026-07-10T00:00:00.000Z"
}
```

### Frontend Health
```bash
curl -I https://englishengineer.vercel.app
```

Expected: HTTP 200

## Environment Variables

### Backend (Railway)
| Variable | Description | Source |
|----------|-------------|--------|
| `NODE_ENV` | `production` | Railway |
| `PORT` | `8080` | Railway |
| `APP_ORIGIN` | Frontend URL | Manual |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (NEVER expose to frontend) | Supabase Dashboard |
| `STRIPE_SECRET_KEY` | Stripe API key | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret | Stripe Dashboard |
| `ANTHROPIC_API_KEY` | AI provider key | Anthropic Dashboard |
| `UPSTASH_REDIS_REST_URL` | Rate limit store | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limit token | Upstash Console |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_AUTH_PROVIDER` | `supabase` |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key |
| `VITE_BILLING_API_URL` | Backend URL |
| `VITE_AI_PROVIDER` | `backend` |
| `VITE_AI_PROXY_URL` | Backend AI endpoint |

## Rollback Procedure

### Frontend (Vercel)
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"

### Backend (Railway)
1. Go to Railway dashboard → Deployments
2. Find last working deployment
3. Click "Redeploy"

## Monitoring

### Sentry
- **Frontend:** Browser errors and performance
- **Backend:** Server errors and APM
- **DSN:** Configure in Vercel/Railway dashboards

### Logs
- **Vercel:** Dashboard → Logs tab
- **Railway:** Dashboard → Logs tab
- **Supabase:** Dashboard → Logs

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` — NEVER add to Vercel frontend
- `STRIPE_SECRET_KEY` — NEVER add to frontend
- `backend/.env` — MUST be in `.gitignore`
- Use Railway's environment variables for all secrets
