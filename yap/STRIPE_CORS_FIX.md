# Stripe Webhook userId Fix + CORS Esnekleştirme — Uygulama Talimatı

Bu talimat, hazır halde verilen 4 dosyayı (`stripe-billing-provider.ts`,
`billing-webhook-handlers.ts`, `config.ts`, `app.ts`) repoya uygulamak
içindir. Değişiklikler zaten test edilmiş ve doğrulanmıştır (backend
`npm run build` ✅, 289 testten aynı 23'ü zaten baseline'da da başarısız,
benim değişikliğim 0 yeni hata ekledi, frontend `tsc` ✅).

## 1. Dosyaları yerlerine kopyala

```
backend/src/stripe-billing-provider.ts     ← verilen dosyayla değiştir
backend/src/billing-webhook-handlers.ts    ← verilen dosyayla değiştir
backend/src/config.ts                      ← verilen dosyayla değiştir
backend/src/app.ts                         ← verilen dosyayla değiştir
```

## 2. Ne değişti, neden

### A) Stripe webhook userId sorunu (`stripe-billing-provider.ts`)
`checkout.sessions.create` çağrısına `subscription_data: { metadata: { userId, planId } }`
eklendi. Daha önce metadata sadece Checkout Session'a yazılıyordu; Stripe bunu
otomatik olarak oluşturduğu Subscription objesine kopyalamıyor. Bu yüzden
`customer.subscription.created/updated/deleted` webhook'ları geldiğinde
`object.metadata.userId` boş geliyor, hangi kullanıcıya ait olduğu
çözülemiyor ve event sessizce atlanıyordu (abonelik yenileme, iptal, plan
değişikliği uygulamaya hiç yansımıyordu).

### B) Ekstra güvenlik ağı (`billing-webhook-handlers.ts`)
`getUserId()` fonksiyonuna `object.subscription_details?.metadata?.userId`
fallback'i eklendi — bazı Stripe API versiyonlarında Invoice objesi,
bağlı olduğu Subscription'ın metadata'sını bu alanda taşıyor. Zararsız ek,
varsa kullanılır, yoksa etkisi yok.

### C) CORS artık hardcoded değil, tamamen env-tabanlı (`config.ts` + `app.ts`)
Daha önce `app.ts` içinde `'https://engvox.com'` ve `'https://www.engvox.com'`
kod içine gömülüydü — domain her değiştiğinde kod değişikliği + redeploy
gerekiyordu (tam da geçen hafta yaşadığımız CORS kesintisinin sebebi buydu).

Yeni davranış:
- `APP_ORIGIN` env değişkeni hâlâ ana origin'i belirler (değişmedi).
- Yeni `CORS_ALLOWED_ORIGINS` env değişkeni (virgülle ayrılmış liste) ile
  ekstra origin'ler eklenebilir — örn. staging, preview domain'leri.
- **Otomatik www/non-www eşleştirmesi**: `APP_ORIGIN=https://engvox.com`
  verilirse, `https://www.engvox.com` da otomatik izinli olur (ve tersi).
  Bu sayede ileride domain değişse bile, sadece `APP_ORIGIN`'i güncellemek
  yeterli olacak — kod değişikliğine gerek kalmayacak.

## 3. Render'da yapılması gereken (env değişkeni, opsiyonel)

Hiçbir şey yapmasan da mevcut `APP_ORIGIN=https://engvox.com` ayarı zaten
otomatik olarak `www.engvox.com`'u da kapsayacak. Ekstra bir domain
(staging vb.) eklemek istersen Render → Environment sekmesinde:

```
CORS_ALLOWED_ORIGINS=https://staging.engvox.com,https://preview.engvox.com
```

şeklinde ekleyebilirsin. Zorunlu değil, sadece opsiyonel genişletme.

## 4. Doğrulama

```bash
cd backend
npm run build          # hatasız olmalı
npx tsx --test test/*.test.ts   # 266/289 geçmeli (23 hata zaten pre-existing, dokunma)
```

## 5. Commit

```bash
git add backend/src/stripe-billing-provider.ts backend/src/billing-webhook-handlers.ts backend/src/config.ts backend/src/app.ts
git commit -m "fix: propagate userId to Stripe subscription webhooks + make CORS origins fully env-driven"
git push
```

Push sonrası Render otomatik deploy edecek — deploy'un "Live" bittiğini
kontrol et.
