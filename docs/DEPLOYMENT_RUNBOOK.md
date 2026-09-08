# Deployment Runbook

## Pré-requis

- Node.js 22+
- Vercel CLI (`npm i -g vercel`)
- Supabase project access
- Render project access

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

- `VITE_AUTH_PROVIDER=firebase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL`
- `VITE_BILLING_API_URL`

## Backend Deploy (Render)

### Otomatik Deploy

Push to `main` triggers automatic deployment via GitHub integration.

### Health Check

```bash
curl https://englishengineer-backend.onrender.com/api/health
# Expected public response: {"status":"ok"}

curl -H "Authorization: Bearer $METRICS_TOKEN" \
  https://englishengineer-backend.onrender.com/api/diagnostics
curl -H "Authorization: Bearer $METRICS_TOKEN" \
  https://englishengineer-backend.onrender.com/api/metrics
```

### Environment Variables

Render dashboard → Environment:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; tenant authorization, audit, export and audio storage)
- `SUPABASE_JWT_SECRET`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE` (set all three when local Supabase JWT verification is enabled)
- `METRICS_TOKEN` (required; protects both metrics and private diagnostics with Bearer auth)
- `ENGINEEROS_INTERNAL_API_SECRET` + `ENGINEEROS_INTERNAL_SERVICE_ID` (set together for fixed internal service identity)
- `ENGINEEROS_INTERNAL_SERVICE_EMAIL` and `ENGINEEROS_INTERNAL_SERVICE_ROLE` (optional service metadata)
- `SPEAKING_AUDIO_BUCKET` (private Supabase Storage bucket; defaults to `speaking-audio`)
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_SECRET`
- `RATE_LIMIT_STORE=upstash`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AI_LEDGER_FILE` (optional) — AI kullanım ledger'ının NDJSON dosya yolu; ayarlanmazsa ve Supabase yapılandırılmamışsa in-memory ledger kullanılır (kalıcılık yok)

## Post-Deploy Checklist

- [ ] Frontend loads (https://eng-vox.vercel.app)
- [ ] Public backend liveness returns only `status: ok`
- [ ] Authenticated diagnostics returns 200 and reports audit status `ready`
- [ ] Metrics rejects missing/query tokens and accepts the Bearer token
- [ ] Production speaking upload rejects local storage fallback
- [ ] Login page loads
- [ ] Google OAuth redirects correctly
- [ ] API endpoints respond
- [ ] Sentry captures errors (if configured)

## Firebase Auth

### Production configuration

- Frontend requires `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_AUTH_DOMAIN` and optionally `VITE_FIREBASE_APP_ID`.
- Backend requires `FIREBASE_PROJECT_ID`; bearer tokens are verified against
  Firebase public keys and the configured project audience.
- Email/Password must be enabled in Firebase Authentication. Google sign-in
  additionally requires the deployed domains in Authorized domains and the
  Android SHA-1/SHA-256 fingerprints documented in `MOBILE.md`.
- Never place Firebase Admin private keys in `VITE_*` variables. Browser API
  keys are public identifiers; project restrictions and Security Rules enforce
  access.

### Post-deploy auth verification

1. Open `/login` and verify Email/Password and Google entry points render.
2. Sign in with a dedicated production-smoke account and confirm `/dashboard`
   survives a reload.
3. Call one protected backend endpoint with the Firebase ID token and verify
   the backend rejects expired, wrong-project and malformed tokens.
4. Sign out and confirm protected routes redirect back to `/login` and stale
   backend token getters are cleared.

### Playwright test-project configuration

Authenticated E2E suites require a dedicated Firebase test project and the
following CI secrets: `VITE_FIREBASE_API_KEY`, `FIREBASE_E2E_TEST_EMAIL` and
`FIREBASE_E2E_TEST_PASSWORD`. The setup creates/reuses only that test account,
signs in through the real app UI and stores Firebase IndexedDB state. Forks or
local runs without these values skip only authenticated suites; the public
smoke suite remains mandatory.

## AI Analytics & Prompt Telemetry

### Endpoints (auth + rate-limit korumalı)

- `GET /api/v1/ai/analytics` (legacy: `/api/ai/analytics`) — oturum açan kullanıcının AI tüketim özeti + kota durumu (`planId`, `limits.used/remaining/daily/monthly`, `byOperation`, `byDay`, `estimatedCostUsd`).
- `GET /api/v1/ai/analytics/admin` — yalnızca `admin` rolü. Tüm kullanıcıların toplam istek/token/tahmini maliyeti, `topUsers` ve `promptVersionUsage` telemetrisi (bundled dosya vs DB kaynağı, drift/uyumsuzluk sayacı).

### Kota

Plan bazlı günlük (free: 3/gün) veya aylık (ücretli) AI limitleri `backend/src/ai.ts` `PLAN_AI_LIMITS` üzerinden zorlanır. Limit dolunca `429` döner; UI'da kotanın kalan kısmı Kişisel AI panelindeki "AI Kullanım Analitiği" kartında gösterilir.

### Ledger kalıcılığı

- Supabase yapılandırılmışsa `ai_sessions` tablosu kullanılır.
- Değilse: `AI_LEDGER_FILE` set edildiyse NDJSON dosya ledger'ı (restart'a dayanır), yoksa in-memory ledger.
- `prompt-version.json` manifesti, structured operasyonların (`json-structure`, `content-generation`) servis ettiği prompt sürümünü izler; uyumsuzluk (`@db` kaynak veya farklı sürüm) telemetride sayılır.

## Incident Response

### Frontend Down

1. Check Vercel status: https://vercelstatus.com
2. Check build logs in Vercel dashboard
3. Rollback if needed: `npx vercel rollback`

### Backend Down

1. Check Render status: https://status.render.com
2. Check health endpoint
3. Check logs in Render dashboard
4. Restart service if needed

### Auth Issues

1. Verify Supabase project status
2. Check env vars are set correctly
3. Verify redirect URLs in Supabase dashboard
