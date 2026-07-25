# Deployment Runbook

## Overview

EngineerOS uses a blue/green deployment strategy with Vercel (frontend) and Railway (backend).

## Prerequisites

- Access to Vercel dashboard
- Access to Railway dashboard
- GitHub repository access
- `.env` variables configured in both platforms

## Deployment Process

### 1. Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Lint clean (`npm run lint`)
- [ ] Type check clean (`npm run typecheck`)
- [ ] Build successful (`npm run build`)
- [ ] Bundle size within budget (< 2MB JS)
- [ ] No critical vulnerabilities (`npm audit`)

### 2. Create Release Tag

```bash
git tag -a v4.0.2 -m "Release v4.0.2"
git push origin v4.0.2
```

This triggers the `deploy-production.yml` workflow automatically.

### 3. Monitor Deployment

1. Check GitHub Actions for workflow status
2. Monitor Vercel deployment URL
3. Verify health check endpoint: `GET /api/health`
4. Check error rates in Sentry

### 4. Post-deployment Verification

```bash
# Check frontend
curl -s https://englishengineer.vercel.app | head -5

# Check backend
curl -s https://englishengineer-production.up.railway.app/api/health

# Check API docs
curl -s https://englishengineer-production.up.railway.app/api-docs
```

## Rollback Procedure

### Option 1: Vercel Rollback (Fastest)

1. Go to Vercel Dashboard
2. Select the project
3. Go to "Deployments" tab
4. Find the last working deployment
5. Click "..." → "Promote to Production"

### Option 2: GitHub Actions Rollback

1. Go to GitHub Actions
2. Select "Rollback" workflow
3. Click "Run workflow"
4. Enter version to rollback to (e.g., `v4.0.1`)
5. Select environment (`production`)
6. Click "Run workflow"

### Option 3: Railway Rollback

1. Go to Railway Dashboard
2. Select the backend service
3. Go to "Deployments" tab
4. Find the last working deployment
5. Click "Redeploy"

## Environment Variables

### Frontend (Vercel)

| Variable                 | Description                      |
| ------------------------ | -------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL             |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key           |
| `VITE_AI_PROVIDER`       | AI provider (gemini/openai/mock) |

### Backend (Railway)

| Variable                    | Description               |
| --------------------------- | ------------------------- |
| `SUPABASE_URL`              | Supabase project URL      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY`         | Stripe secret key         |
| `UPSTASH_REDIS_REST_URL`    | Upstash Redis URL         |
| `UPSTASH_REDIS_REST_TOKEN`  | Upstash Redis token       |

## Monitoring

### Health Check Endpoints

- Frontend: `https://englishengineer.vercel.app`
- Backend: `https://englishengineer-production.up.railway.app/api/health`
- API Docs: `https://englishengineer-production.up.railway.app/api-docs`

### Automated Monitoring

- Health check workflow runs every 30 minutes
- Dependency audit runs every Monday
- Load test runs weekly

### Manual Monitoring

```bash
# Check response times
time curl -s https://englishengineer-production.up.railway.app/api/health

# Check bundle size
npm run build && du -sh dist/assets/*.js
```

## Troubleshooting

### Issue: Deployment fails at build step

1. Check GitHub Actions logs
2. Run locally: `npm run build`
3. Fix any TypeScript or lint errors
4. Push fix and retry

### Issue: Health check fails after deployment

1. Check Railway logs for backend errors
2. Verify environment variables are set
3. Check Supabase connectivity
4. Rollback if needed

### Issue: High error rates

1. Check Sentry dashboard
2. Review recent deployments
3. Consider rollback if critical
4. Create incident report
