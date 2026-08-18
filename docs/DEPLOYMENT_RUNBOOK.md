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
curl https://englishengineer-backend.onrender.com/api/health
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

## Clerk Auth (Canlı Gözlem — 2026-08-18)

### Instance

- App: `app_3I251yNGqaZVZWzccI00jRzihhp` (EngVox)
- Dev instance: `ins_3I2521N8mUolXuAU0OuvDvkX3OR` (`environment_type: development`)
- Publishable key: `pk_test_...` (test modu)
- Backend: `GET /api/v1/reading/feed` + geçerli Clerk JWT → 200 (JWKS doğrulaması canlıda çalışıyor)

### Doğrulanan Akışlar (eng-vox.vercel.app)

- `/login` Clerk UI ile render ediliyor (Apple/Google/LinkedIn + email/password, "Development mode" rozeti)
- Email+password giriş akışı → "Check your email" yeni-cihaz doğrulama adımına ilerliyor
- `clerk impersonate <user_id>` ile oturum kuruluyor; `clerk users create --email --password ...` ile test kullanıcısı oluşturulabiliyor

### Bilinen Sorun: Dashboard "Opening EngVox" Takılması

**Belirti:** `/dashboard` yükleme ekranında kalıyor; Clerk `useAuth().isLoaded` hiç `true` olmuyor (console hatasız).

**Kök neden:** Instance'ın tüm redirect URL'leri (`home_url`, `after_sign_in_url`, `after_sign_up_url`, ...) Clerk'ın kendi `dominant-cricket-288.accounts.dev/default-redirect` portalına işaret ediyor. Uygulama origin'i (`eng-vox.vercel.app`) Clerk'e **Application URLs** üzerinden tanıtılmadığı için giriş sonrası oturum uygulamaya geri taşınamıyor.

**Düzeltme:** Clerk Dashboard → EngVox → **Application URLs** → `https://eng-vox.vercel.app` (sign-in/sign-up/home) olarak ekleyin. CLI'den yapılamıyor (`clerk config` yalnızca relative path'leri kapsar).

## Production Clerk Geçişi

**Blocker:** Production instance özel bir alan adı gerektirir (örn. `auth.eng-vox.com`); `eng-vox.vercel.app` gibi platform alt alan adı geçersiz. Alan adı alınınca:

1. `clerk deploy` (interaktif wizard, insan terminali gerekir) — domain + OAuth production kimlikleri sorar
2. `clerk deploy status --mode agent` ile doğrulama
3. Production instance'ın `CLERK_SECRET_KEY` / `VITE_CLERK_PUBLISHABLE_KEY`'ini env'e yazma (Render backend + Vercel frontend)
4. Render + Vercel redeploy
5. `clerk doctor --json` ile uçtan uca doğrulama

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
