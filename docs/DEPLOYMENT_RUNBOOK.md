# Deployment Runbook

## Pré-requis

- Node.js 22+
- Vercel CLI (`npm i -g vercel`)
- Supabase project access
- Railway project access

## Frontend Deploy (Vercel)

### Otomatik Deploy

Push to `main` branch triggers automatic deployment.

### Manuel Deploy

```bash
npx vercel --prod
```

### Rollback

```bash
npx vercel rollback
```

### Environment Variables

Vercel dashboard → Settings → Environment Variables
Required:

- `VITE_AUTH_PROVIDER=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL`
- `VITE_BILLING_API_URL`

## Backend Deploy (Railway)

### Otomatik Deploy

Push to `main` triggers automatic deployment via GitHub integration.

### Health Check

```bash
curl https://englishengineer-production.up.railway.app/api/health
```

### Environment Variables

Railway dashboard → Variables:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RATE_LIMIT_STORE=upstash`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Post-Deploy Checklist

- [ ] Frontend loads (https://englishengineer.vercel.app)
- [ ] Backend health check returns 200
- [ ] Login page loads
- [ ] Google OAuth redirects correctly
- [ ] API endpoints respond
- [ ] Sentry captures errors (if configured)

## Incident Response

### Frontend Down

1. Check Vercel status: https://vercel.com/status
2. Check build logs in Vercel dashboard
3. Rollback if needed: `npx vercel rollback`

### Backend Down

1. Check Railway status: https://railway.app/status
2. Check health endpoint
3. Check logs in Railway dashboard
4. Restart service if needed

### Auth Issues

1. Verify Supabase project status
2. Check env vars are set correctly
3. Verify redirect URLs in Supabase dashboard
