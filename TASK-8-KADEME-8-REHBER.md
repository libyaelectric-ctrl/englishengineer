# TASK-8: Kademe 8 Canlı Servis Geçişi — Adım Adım Rehber

**Hedef:** 11 placeholder'ı gerçek değerlerle değiştir, `BLOCKED → COMPLETE` yap.

**Başlamadan önce:**
- `node scripts/prc-kademe-8-live-verify.mjs --env-check` çalıştır → "0 missing, 11 placeholder" görmelisin
- Hiçbir API key'i kopyala/yapıştır yaparken sohbete yapıştırma, sadece dosyaya yaz

---

## Adım 1: Supabase Projesi (3 değişken)

**Git:** https://supabase.com/dashboard → Projeni seç → Sol menüden **Project Settings** → **API**

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 1 | `SUPABASE_URL` | "Project URL" bölümünden kopyala. `https://xxx.supabase.co` şeklinde olmalı | `backend/.env` |
| 2 | `SUPABASE_ANON_KEY` | "anon public" satırındaki key'i kopyala | `backend/.env` |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | "service_role" satırındaki key'i kopyala ⚠️ **Bu key'i asla commit etme, asla frontend'e yazma** | `backend/.env` |

**Aynı key'ler frontend'de de gerekiyor:**
| # | Değişken | Dosya |
|---|----------|-------|
| 4 | `VITE_SUPABASE_URL` | `.env` (kök) — Supabase URL ile aynı |
| 5 | `VITE_SUPABASE_ANON_KEY` | `.env` (kök) — anon key ile aynı |

**Kontrol:** Supabase Dashboard → Authentication → Users'da test kullanıcıların görünmeli (eğer Clerk kullanıyorsan bu adımı atla, Supabase auth'u aktif etmen gerekebilir).

---

## Adım 2: Backend Deploy URL (2 değişken)

Backend'ini bir yere deploy etmiş olman gerekiyor (Render, Railway, Fly.io, Vercel Functions vb.). Deploy URL'ini bul.

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 6 | `VITE_BILLING_API_URL` | `https://SENIN-BACKEND-URLIN.com/api/billing` yaz | `.env` (kök) |
| 7 | `VITE_AI_PROXY_URL` | `https://SENIN-BACKEND-URLIN.com/api/v1/ai` yaz | `.env` (kök) |

**Örnek:** Eğer backend `https://engvox-api.onrender.com`'da çalışıyorsa:
```
VITE_BILLING_API_URL=https://engvox-api.onrender.com/api/billing
VITE_AI_PROXY_URL=https://engvox-api.onrender.com/api/v1/ai
```

**⚠️ localhost veya 127.0.0.1 kabul edilmiyor!** Gerçek bir URL olmalı.

---

## Adım 3: Stripe Hesabı (3 değişken)

**Git:** https://dashboard.stripe.com/test/apikeys

**Önce yapman gerekenler:**
1. Stripe hesabı oluştur (yoksa)
2. Test modunda kal (sol üstte "Test mode" açık olmalı)
3. **Product Catalog** → Products → New → Adına "EngineerOS Junior" yaz → Price ekle (aylık, USD)
4. Oluşturduğun price'ın ID'sini kopyala (`price_...` şeklinde olmalı)

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 8 | `STRIPE_SECRET_KEY` | API Keys sayfasından "Secret key" (test) kopyala. `sk_test_` ile başlamalı | `backend/.env` |
| 9 | `STRIPE_PRICE_JUNIOR_MONTHLY` | Step 2'de oluşturduğun price ID'sini yaz. `price_` ile başlamalı | `backend/.env` |

**Webhook ayarı (10. adım):**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://SENIN-BACKEND-URLIN.com/api/billing/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` ekle
4. Signing secret'i kopyala

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 10 | `STRIPE_WEBHOOK_SECRET` | Webhook signing secret'i yaz. `whsec_` ile başlamalı | `backend/.env` |

---

## Adım 4: AI Sağlayıcı (1 değişken)

Bir tane seç (maliyet/kalite tercihine göre):

| Sağlayıcı | Maliyet | Kalite | Ne yapacaksın |
|-----------|---------|--------|--------------|
| **Gemini** (önerilen) | Ücretsiz tier var | İyi | Google AI Studio'dan API key al |
| OpenAI | Uygun | Çok iyi | platform.openai.com → API Keys |
| Anthropic | Pahalı | En iyi | console.anthropic.com → API Keys |

**Gemini seçtiysen (önerilen):**
1. Git: https://aistudio.google.com/apikey
2. "Create API Key" butonuna bas
3. Key'i kopyala

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 11 | `GEMINI_API_KEY` | API key'i yaz. `YOUR_GEMINI_API_KEY` placeholder'ının yerine | `backend/.env` |

**Not:** `AI_PROVIDER=gemini` zaten ayarlı. Farklı sağlayıcı seçtiysen `AI_PROVIDER` değerini de değiştir.

---

## Adım 5: Upstash Redis (2 değişken)

**Git:** https://console.upstash.com

1. "Create Database" → Region seç (en yakın olan) → Free tier seç → Create
2. REST API section'ına git

| # | Değişken | Ne yapacaksın | Dosya |
|---|----------|--------------|-------|
| 12 | `UPSTASH_REDIS_REST_URL` | "UPSTASH_REDIS_REST_URL" kopyala. `https://xxx.upstash.io` şeklinde | `backend/.env` |
| 13 | `UPSTASH_REDIS_REST_TOKEN` | "UPSTASH_REDIS_REST_TOKEN" kopyala | `backend/.env` |

---

## Adım 6: Doğrulama

Tüm değişkenleri yazdıktan sonra:

```bash
# 1. Eksik kontrolü
node scripts/prc-kademe-8-live-verify.mjs --env-check

# Beklenen çıktı:
# [kademe8] BLOCKED: 0 required setting(s) missing, 0 placeholder setting(s)

# 2. Eğer PARTIAL veya COMPLETE çıkarsa, tam doğrulama
node scripts/prc-kademe-8-live-verify.mjs

# 3. Raporu kontrol et
cat PRC_Kademe_8_Live_Service_Evidence_Report.md | grep -A5 "Next Decision"
```

---

## Değişken Özet Tablosu (Hızlı Bakış)

| # | Değişken | Dosya | Durum |
|---|----------|-------|-------|
| 1 | `VITE_SUPABASE_URL` | `.env` | ❌ |
| 2 | `VITE_SUPABASE_ANON_KEY` | `.env` | ❌ |
| 3 | `VITE_BILLING_API_URL` | `.env` | ❌ |
| 4 | `VITE_AI_PROXY_URL` | `.env` | ❌ |
| 5 | `SUPABASE_URL` | `backend/.env` | ❌ |
| 6 | `SUPABASE_ANON_KEY` | `backend/.env` | ❌ |
| 7 | `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` | ❌ |
| 8 | `STRIPE_SECRET_KEY` | `backend/.env` | ❌ |
| 9 | `STRIPE_WEBHOOK_SECRET` | `backend/.env` | ❌ |
| 10 | `STRIPE_PRICE_JUNIOR_MONTHLY` | `backend/.env` | ❌ |
| 11 | `GEMINI_API_KEY` | `backend/.env` | ❌ |
| 12 | `UPSTASH_REDIS_REST_URL` | `backend/.env` | ❌ |
| 13 | `UPSTASH_REDIS_REST_TOKEN` | `backend/.env` | ❌ |

**Toplam:** 13 değişken, 2 dosya (`.env` + `backend/.env`)

---

## Sık Yapılan Hatalar

1. **localhost yazma** → `VITE_BILLING_API_URL` ve `VITE_AI_PROXY_URL` gerçek URL olmalı
2. **sk_live_ kullanma** → `STRIPE_SECRET_KEY` `sk_test_` ile başlamalı
3. **Key'i commit etme** → `.env` dosyaları .gitignore'da, ama yine de dikkatli ol
4. **Supabase service_role key'i frontend'e yazma** → Sadece backend'de kullanılmalı
5. **Stripe webhook URL'i backend deploy olmadan ayarlama** → Önce backend'i deploy et
