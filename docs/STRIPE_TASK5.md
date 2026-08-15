# Task 5 — Stripe Canlı Aktivasyon Runbook'u

Kod tarafı tamamlandı ve test edildi. Bu doküman sadece **harici panel adımları**nı içerir
(Stripe Dashboard + Render + Vercel). Tüm adımlar hesap sahibi erişimi gerektirir.

Arka plan / referans:

- Backend: `https://englishengineer-backend.onrender.com`
- Webhook: `POST https://englishengineer-backend.onrender.com/api/webhooks/stripe` (raw body — `backend/src/app.ts:215`)
- Billing REST (frontend tarafından kullanılır): `/api/v1/billing/*` (v1 router altında mount edilir)
- Health check: `GET /api/health` → `"stripe": { "configured": true }` göstermeli

---

## 1. Backend (Render) — ortam değişkenleri

Render Dashboard → servis → **Environment**.

Zorunlu (olmadan billing `configured: false` kalır — `backend/src/config-builders.ts:102`):

| Değişken | Değer |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (canlı) veya `sk_test_...` (test) |
| `STRIPE_PRICE_JUNIOR_MONTHLY` | `price_...` — **junior aylık fiyat boşsa Stripe hiç yapılandırılmaz** |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (webhook endpoint'inin signing secret'ı) |
| `BILLING_REPOSITORY` | `supabase` (üretim önerilir) |
| `SUPABASE_URL` | `https://<ref>.supabase.co` — **zorunlu**: `BILLING_REPOSITORY=supabase` iken eksikse container deploy aşamasında `nonZeroExit:1` ile çöker (bkz. §5) |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` (zaten ortamda) |

İsteğe bağlı (tanımlanmazsa backend fiyatları **otomatik oluşturur**):

`STRIPE_PRICE_SENIOR_MONTHLY`, `STRIPE_PRICE_SPECIALIST_MONTHLY`,
`STRIPE_PRICE_MASTER_MONTHLY`, `STRIPE_PRICE_TEAM_MONTHLY` ve aynılarının
`_ANNUAL` varyantları. Boş bırakılınca `resolveOrProvisionPriceId`
(`backend/src/billing-service.ts:78`) ürün/fiyatı ilk checkout'ta oluşturur:
- Ürün adları: `EngVox Junior/Senior/Specialist/Master/Team`
- Fiyatlar: aylık $29/$59/$79/$99/$999; yıllık %20 indirimli
- Top-up: `AI Coach Top-up 50 Credits` → $5.00 one-time

Değişkenleri kaydet → **Redeploy**.

## 2. Stripe Dashboard

1. **Webhooks → Add endpoint**
   - URL: `https://englishengineer-backend.onrender.com/api/webhooks/stripe`
   - Olaylar (backend `dispatchWebhookEvent`'in dinlediği set, `billing-service.ts:17`):
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Kaydet → **Signing secret**'ı kopyala → Render'da `STRIPE_WEBHOOK_SECRET` olarak gir.
2. **Products** — istenirse fiyatları elle oluşturup Render env'sine `STRIPE_PRICE_*_MONTHLY` olarak
   yaz (adımlar yukarıda); yoksa sistem otomatik oluşturur.
3. **Test modu** ile doğrula → onaylanınca **Canlı moda geç** (Canlı mod, gerçek ödeme almak için
   `sk_live_` + canlı webhook secret gerektirir).

## 3. Frontend (Vercel)

Vercel Project → Settings → Environment Variables:

| Değişken | Değer |
|---|---|
| `VITE_BILLING_API_URL` | `https://englishengineer-backend.onrender.com` |

Kaydet → yeniden deploy (`build`'e `import.meta.env` ile gömülür).

## 4. Uçtan uca test

1. Uygulamada **demo olmayan** normal bir kullanıcıyla giriş yap
   (demo profiller `demo_engineer_*` billing'den engellidir — `billing-service.ts:308`).
2. `/checkout?plan=junior` → ödeme sayfasına yönlenmeli.
3. Test kartı: `4242 4242 4242 4242`, ileri tarih, herhangi CVC → başarılı ödeme.
4. `/billing?billing=success` sayfasına dönülmeli.
5. Webhook işlendiğini doğrula:
   ```
   GET https://englishengineer-backend.onrender.com/api/v1/billing/subscription-status
   ```
   beklenen: `planId: "junior"`, `status: "active"`, `stripeCustomerId: cus_...`,
   `source: "stripe_webhook"`. UI'da `BillingStatusPanel` "Active / Verified" göstermeli.
6. Müşteri portalından iptal et → `customer.subscription.deleted` → `status: "canceled"`.
7. (Opsiyonel) Top-up: AI Coach kredi satın alma akışı → 50 kredi.

## 5. Sorun giderme

- `/api/health` hâlâ `stripe: { configured: false }` → `STRIPE_SECRET_KEY` ve/veya
  `STRIPE_PRICE_JUNIOR_MONTHLY` eksik/yazım hatası; env kaydedilip redeploy edilmemiş.
- Render deploy `update_failed` / event'larda `nonZeroExit:1` (build `succeeded` ama container start'ta
  exit 1) → startup `uncaught-exception` vardır. Logları oku:
  ```
  GET /v1/logs?ownerId=<tea-…>&resource=<srv-…>&startTime=…&endTime=…&direction=forward
  ```
  (render.dev özel deploy logları `/services/{id}/logs` artık 404 verir; bu genel `/logs` uç noktasını kullan,
  `message` alanını oku). Bilinen neden: `SUPABASE_URL` ortamda yokken
  `createSubscriptionRepository` → `createSupabaseBillingRepository` → `assertConfigured` throw eder
  (`Supabase billing repository requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`).
  Fix: Render Environment'a `SUPABASE_URL` ekle → yeni deploy tetikle (`POST /services/{id}/deploys`).
- Webhook 400 `invalid_webhook_signature` → `STRIPE_WEBHOOK_SECRET` güncel değil veya ilk/boşluk
  karakteri var (backend `stripWhitespace` uygular, manuel sekme bozar). Yeniden kopyala.
- Webhook imzalı test 200 `received:true` alır ama log'daki `step:"dispatch"` supabase 400 verirse →
  `subscription_status.user_id` UUID tipindedir; sahte (UUID olmayan) userId gönderiliyordur.
  PostgREST 400 `invalid input syntax for type uuid`. Gerçek `auth.users` UUID'siyle tekrar dene.
  (İmza → dedup → dispatch → supabase yazma zincirinin tamamı çalışıyor demektir.)
- Webhook'a **HTTPS üzerinden giden canlı Stripe event'i 307/403 dönüyorsa** → canlı container eski
  koddur. İki düzeltme koda bağlıydı (ikisi de deploy'da olmalı):
  1. `csrf.middleware.ts` — `/api/webhooks/stripe` CSRF'den muaftır (POST).
  2. `app.ts` legacy `/api → /api/v1` redirect middleware'i webhook yolunu **307 ile kaçırmamalı**
     (production'da Stripe event'leri `/api/v1/webhooks/stripe`'a yönlenir ve orada route yoktur).
     `req.path !== '/api/webhooks/stripe'` muafiyeti `app.ts:419-422`'e eklendi + regresyon testi
     (`stripe-webhook-security.test.ts`: "webhook is not redirected... in production").
- `FORBIDDEN_DEMO_ACTION` → demo hesap; gerçek kullanıcı kullan.
- `STRIPE_NOT_CONFIGURED` (503) → backend env'de billing kapalı.
- Fiyat oluşturulamıyor → Stripe hesabının API izinleri (default `Standard` rol yeterli).

## Güvenlik notları

- Anahtarlar asla repo'ya/commit'e yazılmaz; sadece panel env'lerinde saklanır.
- `STRIPE_WEBHOOK_SECRET` webhook imza doğrulaması için zorunludur; sansürsüz (raw) body
  `express.raw` ile `app.ts:215`'te sağlanır — bu route body-parser/CSRF'den zaten muaftır.