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

**Environment variables:** Set via Render dashboard, not hardcoded in `render.yaml`.

**Health check:** `GET /api/health`

## Docker (Full Stack)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000 (nginx)
- Backend: http://localhost:8080 (Node.js)

## Environment Variables

Required for production:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `ANTHROPIC_API_KEY` - Anthropic API key (if using AI)

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
- Backend: `GET /api/health` returns JSON status
