# TASK-8 — Kademe 8 Canlı Servis Geçişi Rehberi (Güncel)

**Güncellenme:** 27 Ağustos 2026 — Clerk + DodoPayments mimarisine uyarlandı.

## Mevcut Durum

```
BLOCKED: 0 required setting(s) missing, 7 placeholder setting(s)
```

- ✅ Auth: Clerk (prod key mevcut)
- ✅ Billing: DodoPayments (test mode, tüm product ID'ler mevcut)
- ✅ AI: Gemini (API key mevcut)
- ⏳ Supabase: URL + key'ler hâlâ placeholder
- ⏳ Upstash: URL + token hâlâ placeholder
- ⏳ Backend deploy URL: placeholder

## 7 Kalan Placeholder

| # | Değişken | Dosya | Nereden Alınır |
|---|----------|-------|---------------|
| 1 | `VITE_BILLING_API_URL` | `.env` | Backend deploy URL + `/api/billing` |
| 2 | `VITE_AI_PROXY_URL` | `.env` | Backend deploy URL + `/api/v1/ai` |
| 3 | `SUPABASE_URL` | `backend/.env` | Supabase Dashboard → Settings → API |
| 4 | `SUPABASE_ANON_KEY` | `backend/.env` | Aynı sayfa |
| 5 | `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` | Aynı sayfa (⚠️ asla git'e girmemeli) |
| 6 | `UPSTASH_REDIS_REST_URL` | `backend/.env` | Upstash Console |
| 7 | `UPSTASH_REDIS_REST_TOKEN` | `backend/.env` | Aynı sayfa |

## Adım Adım

### Adım 1 — Supabase (3 değişken)
1. https://supabase.com/dashboard → Projeniz → Settings → API
2. `SUPABASE_URL` = "Project URL" satırından
3. `SUPABASE_ANON_KEY` = "anon public" key
4. `SUPABASE_SERVICE_ROLE_KEY` = "service_role" key (⚠️ bu anahtar tüm RLS kurallarını bypass eder)

**Not:** Clerk auth kullanıyorsunuz ama Supabase hâlâ veritabanı olarak kullanılıyor (profiles, user_settings, vb. tablolar).

### Adım 2 — Backend Deploy URL (2 değişken)
Backend'i deploy ettiğiniz URL'yi bilmeniz gerekiyor (Railway, Vercel, vb.):
- `VITE_BILLING_API_URL` = `https://your-backend.up.railway.app/api/billing`
- `VITE_AI_PROXY_URL` = `https://your-backend.up.railway.app/api/v1/ai`

**Not:** `localhost` veya `127.0.0.1` kabul edilmiyor.

### Adım 3 — Upstash Redis (2 değişken)
1. https://console.upstash.com → "Create Database"
2. Ücretsiz katman yeterli
3. `UPSTASH_REDIS_REST_URL` = "REST API" → "Endpoint"
4. `UPSTASH_REDIS_REST_TOKEN` = "REST API" → "Token"

### Adım 4 — Doğrulama
```bash
node scripts/prc-kademe-8-live-verify.mjs --env-check
```

BLOCKED → PARTIAL veya COMPLETE olursa, canlı test istekleri gönderilmeye başlanır.

## Zaten Yapılandırmış Olduğunuz Şeyler

| Servis | Durum |
|--------|-------|
| Clerk Auth | ✅ Prod key aktif |
| DodoPayments Billing | ✅ Test mode, 12 product ID tanımlı |
| Gemini AI | ✅ API key aktif |
| Supabase DB | ⏳ Placeholder (sadece DB, auth değil) |
| Upstash Redis | ⏳ Placeholder |
