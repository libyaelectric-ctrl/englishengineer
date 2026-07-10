---
name: engineeros-deploy
description: >
  EngineerOS (englishengineer) projesinin deployment, scoring ve production
  ortam yönetimi için tam bağlam skill'i. Vercel + Railway + Supabase +
  Stripe + Anthropic + Upstash entegrasyonunu kapsar. Bu proje için
  çalışırken her oturumda bu skill'i yükle.
---

# EngineerOS Deploy & Operations Skill

## Proje Kimliği

| Parametre         | Değer                                               |
| ----------------- | --------------------------------------------------- |
| Proje adı         | `englishengineer`                                   |
| Vercel org        | `engineer-os`                                       |
| Vercel project ID | `prj_U2EwRKAY51wr59EHtQnzkCm69ahN`                  |
| Frontend URL      | https://englishengineer.vercel.app                  |
| Backend URL       | https://englishengineer-production.up.railway.app   |
| Supabase URL      | https://wxabrwzitwsjtpmlvvqe.supabase.co            |
| Upstash URL       | https://maximum-raven-40360.upstash.io              |
| Repo kök          | `c:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0` |

## Stack

- **Frontend:** React 19 + TypeScript + Vite (kök dizin)
- **Backend:** Node.js + Express (./backend/)
- **Auth/DB:** Supabase
- **Billing:** Stripe
- **AI:** Anthropic Claude (haiku-4-5 modeli)
- **Rate Limit:** Upstash Redis
- **Deploy:** Vercel (frontend) + Railway (backend)

## Kritik Dosyalar

| Dosya                                     | Amaç                                  |
| ----------------------------------------- | ------------------------------------- |
| `backend/.env`                            | Backend production secrets            |
| `.env .vercel`                            | Vercel env önizleme                   |
| `.env.vercel.production`                  | Vercel production env tam liste       |
| `vercel.json`                             | Vercel SPA routing + backend rewrites |
| `PRC_Kademe_8_Live_Operator_Checklist.md` | Deploy adımları tam kılavuzu          |
| `DEPLOY_READINESS.md`                     | Deploy hazırlık raporu                |
| `scripts/prc-kademe-8-live-verify.mjs`    | Otomatik doğrulama scripti            |
| `src/tools/generate-missing-audio.ts`     | Eksik audio üretim scripti            |

## Backend ENV Değişkenleri (Railway'de Ayarlanacak)

```ini
# Zorunlu - tamamı Railway dashboard'a girilmeli
PORT=8080
NODE_ENV=production
APP_ORIGIN=https://englishengineer.vercel.app
APP_VERSION=4.0.1

AI_PROVIDER=anthropic
AI_MODEL=claude-haiku-4-5
ANTHROPIC_API_KEY=<Anthropic dashboard>

SUPABASE_URL=https://wxabrwzitwsjtpmlvvqe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_00dqafXox-03M5wM_9elEg_vYnMZhKq
SUPABASE_SERVICE_ROLE_KEY=<Supabase dashboard → Settings → API>
BILLING_REPOSITORY=supabase

STRIPE_SECRET_KEY=<Stripe dashboard → API keys>
STRIPE_WEBHOOK_SECRET=<Stripe Webhook Secret>
STRIPE_PRICE_PRO_MONTHLY=<Stripe → Products → Pro plan price_xxx>
STRIPE_PRICE_TEAM_MONTHLY=<Stripe → Products → Team plan price_xxx>

RATE_LIMIT_STORE=upstash
UPSTASH_REDIS_REST_URL=https://maximum-raven-40360.upstash.io
UPSTASH_REDIS_REST_TOKEN=<Upstash console>
```

## Frontend ENV (Vercel'de Ayarlı - Değiştirme)

```ini
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://wxabrwzitwsjtpmlvvqe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_00dqafXox-03M5wM_9elEg_vYnMZhKq
VITE_BILLING_API_URL=https://englishengineer-production.up.railway.app
VITE_AI_PROVIDER=backend
VITE_AI_PROXY_URL=https://englishengineer-production.up.railway.app/api/ai
VITE_VOCABULARY_API_URL=https://englishengineer-production.up.railway.app/api/vocabulary
VITE_ENVIRONMENT_MODE=production
VITE_ENABLE_MOCK_BILLING=false
VITE_ALLOW_LOCAL_AUTH=false
```

## AI Limitleri (Kod'da Tanımlı)

- Free plan: 3 AI istek/gün/kullanıcı
- Pro plan ($19): 300 AI istek/ay/kullanıcı
- 5 kullanıcı max kullanım: ~$3.50/ay (claude-haiku-4-5)

## Deploy Komutları

```bash
# Frontend Vercel'e deploy
npx vercel --prod

# Backend env doğrulama
npm run kademe8:check

# Tam canlı doğrulama (tüm servisler hazır olunca)
npm run kademe8:verify

# Audio asset üretimi (eksik WAV dosyaları için)
npm run gen-audio

# Production build testi
npm run build
```

## Sağlık Kontrolleri

```bash
# Railway backend sağlık
Invoke-WebRequest -Uri "https://englishengineer-production.up.railway.app/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Vercel frontend
Invoke-WebRequest -Uri "https://englishengineer.vercel.app" -UseBasicParsing | Select-Object StatusCode

# Supabase auth
Invoke-WebRequest -Uri "https://wxabrwzitwsjtpmlvvqe.supabase.co/auth/v1/health" -Headers @{"apikey"="sb_publishable_00dqafXox-03M5wM_9elEg_vYnMZhKq"; "Authorization"="Bearer sb_publishable_00dqafXox-03M5wM_9elEg_vYnMZhKq"} -UseBasicParsing | Select-Object StatusCode, Content
```

## Mevcut Puan Durumu (2026-07-05)

| Alan             | Puan                   |
| ---------------- | ---------------------- |
| Mimari & Kod     | 88/100                 |
| UI/UX            | 82/100                 |
| İçerik Kalitesi  | 78/100                 |
| Listening Engine | 75/100 ✅ düzeltildi   |
| Auth/Supabase    | 70/100 ✅ canlı        |
| Test Coverage    | 60/100                 |
| Billing/Stripe   | 40/100 ⚠️ key eksik    |
| AI Copilot       | 35/100 ⚠️ bakiye yükle |
| Deployment       | 70/100 ✅ Vercel canlı |
| **TOPLAM**       | **~72/100**            |

## Kalan Görevler

1. **Anthropic bakiyesi yükle** → console.anthropic.com/billing → $5
2. **Stripe secret key** → dashboard.stripe.com/apikeys → `sk_live_` veya `sk_test_`
3. **Stripe Pro fiyat ID** → dashboard.stripe.com/products → $19/ay plan oluştur → `price_xxx`
4. Bu 3 bilgiyi `backend/.env`'e ekle
5. `npm run kademe8:verify` → exit 0
6. Railway'de aynı env değişkenlerini gir (dashboard.railway.app)

## Önemli Notlar

- `SUPABASE_SERVICE_ROLE_KEY` asla Vercel'e ekleme — sadece Railway'de
- `STRIPE_SECRET_KEY` asla frontend'e ekleme
- `backend/.env` dosyası `.gitignore`'da olmalı (secret'lar)
- Vercel deploy: `npx vercel --prod` — Vercel CLI zaten login durumda
- Railway deploy: git push tetikliyor (Railway GitHub entegrasyonu aktif)
