# Billing — Açık Ürün Kararları

> **Bu belge nedir:** Ödeme/abonelik iş kolunda uygulamada **kodu yazılmış ama kararı verilmemiş**
> maddelerin tek listesi. Her maddede ölçülmüş mevcut durum, seçenekler ve her seçeneğin
> ölçülmüş/çıkarımsal etkisi, ve maddenin bugün alınıp alınamayacağı etiketi var.
>
> **Bu belge ne değildir:** Bir uygulama planı ya da onaylanmış bir yol haritası değil.
> Kararları bu belge **vermez**; kod da bu belge için değiştirilmedi. Seçenek işaretlendiğinde
> yapılacak iş bu dosyanın altına not düşülür, kalıcı bir karar için `docs/adr/` altına ADR eklenir.
>
> **Aynı kaynak, aynı ölçüm:** Aşağıdaki her sayı, aşağıdaki komutlarla bu ağaçta yeniden
> üretilebilir. Sohbetten devralınan hiçbir cümle doğrulanmadan yazılmadı; doğrulanamayanlar
> "Doğrulanamayanlar" bölümünde açıkça işaretli.
>
> |              |                                                                             |
> | ------------ | --------------------------------------------------------------------------- |
> | Ölçüm tarihi | 2026-09-18                                                                  |
> | Ölçülen ağaç | yerel `main` @ `bfad4779` (başka thread'lerin commit'leri; bu işle ilgisiz) |
> | Ağaç durumu  | temiz — bu belge yazılırken hiçbir ürün dosyası değişmedi                   |

---

## Etiketler

| Etiket               | Anlamı                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| **ŞİMDİ ALINABİLİR** | Karar bugün verilebilir; hiçbir dış engel yok.                                                       |
| **BLOKE — Vercel**   | Kararın müşteriye yansıması üretime çıkamaz: Vercel bu hesapta build konteyneri ayırmıyor (bkz. K2). |
| **BLOKE — erişim**   | Karar için gereken bilgi repodan okunamaz (canlı hesap/ödeme sağlayıcısı erişimi gerekir).           |

---

## Tek bakışta

| #   | Konu                                                 | Bugün                                           | En küçük yapılabilir iş                              |
| --- | ---------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| K1  | `team` abonesine ne söyleniyor, ne sunuluyor         | Ödeme yapan müşteri "Free" okuyor, düzeltemiyor | Kataloğa `team` girmesi ya da belgeleme              |
| K2  | Lapsed müşterinin **gerçek** sağlayıcıdaki davranışı | Ölçülemedi (üretim 13 Eylül'de donmuş)          | Vercel engelinin kalkması ya da bağımsız bir kurulum |
| K3  | "Upgrade" hangi planı satın alıyor                   | Lapsed `specialist`/`master` → **`senior`**     | Sabitin kararının testle sabitlenmesi                |
| K4  | 24 hata kodunun cümlesi müşteriye ham gidiyor        | Kabul edilmiş ama kapsamı yazılı değil          | Kapsamın bu belgeyle sınırlanması                    |
| K5  | Plan sözlüğünün tek sahibi yok (9 yer)               | Anlaşmazlığı `resolvePlan` sessizce kapatıyor   | Tek sahipli (type-only) sözleşme                     |
| K6  | `getDowngradeImpact` ölü ve `team` ile çöküyor       | Yalnız kendi testi kullanıyor                   | Silmek ya da bir akışa bağlamak                      |
| K7  | İki modül dörder iş yapıyor                          | 354 + 238 satır                                 | Sorumluluk ayrımı                                    |

---

## K1 — `team` abonesine ne söylenecek, ne sunulacak

**Etiket: ŞİMDİ ALINABİLİR** (kod değişikliği için; müşteriye yansıması **BLOKE — Vercel**)

### Ölçülen mevcut durum

Backend `team`'i birinci sınıf ve **satılabilir** bir plan olarak taşıyor:

| Kanıt                               | Konum                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Kanonik plan kümesinde              | `backend/types.d.ts:249` (`'free' \| … \| 'master' \| 'team'`)          |
| Göç/yetkilendirme listesinde        | `backend/src/billing-plan-migration.ts:16`, `:25`                       |
| **Tüm planların en yüksek kredisi** | `backend/src/plan-limits.ts:9` → aylık **1500** (master 600)            |
| Workspace limiti                    | `backend/src/workspace.ts:33`                                           |
| Dodo ürün anahtarları               | `backend/src/dodo-billing-provider.ts:42` (`productTeamMonthly/Annual`) |
| Stripe fiyat anahtarı               | `backend/src/stripe-billing-provider.ts:74` (`priceTeamMonthly`)        |
| **Gerçek env şablonunda**           | `backend/.env.example:33-34` (`DODO_PRODUCT_TEAM_MONTHLY/ANNUAL`)       |

Frontend kataloğunda ise **kaydı yok**: `BillingPlanId` beş kimlik taşıyor
(`src/features/billing/billing.types.ts:5`), `BILLING_PLANS` beş kayıt
(`billing.helpers.ts:73,86,100,113,126`), `PLAN_HIERARCHY` beş kimlik
(`billing.entitlements.ts:14`). Bilinmeyen kimlik `resolvePlan` ile **sessizce `free`'ye**
düşüyor (`billing.helpers.ts:165`).

**Gerçek yüzeylerde ölçüm** (aktif, `planId: 'team'`; üç yüzey birlikte render edildi):

```
panel    : "Current plan Free" / "Free entitlements active" / yalnız "Manage Subscription"
/profil  : aynı — plan satırı "Free", "Team" kelimesi sayfada hiç geçmiyor
/billing : aynı
kontrol  : üç yüzeyin hiçbirinde yükseltme kontrolü yok (0 adet)
```

Yani ödeme yapan `team` müşterisi **"Free" okuyor**, ücretsiz entitlement'larla çalışıyor ve
kendi planını düzeltmesini sağlayacak bir kontrol görmüyor.(`hasActivePaidAccess` — `billing.entitlements.ts:101` — team için doğru döndüğü için panel kendi
CTA'sını; `BillingUpgradeCTA.tsx:38` de `planId !== 'team'` kuralıyla CTA'yı gizliyor.)

Repoda **kayıtlı ürün niyeti** bunun tersini söylüyor: `docs/SUBSCRIPTION_ACCESS_MATRIX.md:32`
→ _"**Not purchasable yet** — 'coming soon'; menu item is always locked"_, `:75` → _"always
locked (coming soon)"_. Yani niyet "henüz satılmıyor", gerçek ise "backend'de satılabilir
tanımlı ve altyapı üretimde mevcut".

### Seçenekler

| #   | Seçenek                                                                                                              | Etki (ölçülmüş / çıkarımsal)                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Kataloğa `team` ekle (ad "Team"), hiyerarşide `master`'ın üstüne                                                     | Bugün yanlış olan **iki** şey birlikte düzelir: cümle ("Free" → "Team") ve entitlement (ücretsiz → backend'in verdiği). Bilinmeyen-kimlik testleri güncellenmeli; `/pricing`'de Team'in self-serve mi sales-led mi olacağı ayrıca karar ister. |
| A2  | Yalnız sunumu düzelt: "Team" göster, entitlement'a dokunma                                                           | Yanlış cümle ölür; ödeme yapan müşteri **hâlâ ücretsiz tier'da** kalır → ücretli özellikleri kullanan bir müşteri için iade/güven riski sürer.                                                                                                 |
| A3  | Enterprise muamelesi: entitlement'ları `master`'a eşle, CTA yerine "bize ulaşın"                                     | Müşteri doğru seviyede çalışır; bugün var olmayan bir iletişim yolu (yeni metin + yeni yüzey) gerektirir, yani kapsam bu maddenin dışına taşar.                                                                                                |
| A4  | Hiçbir şey yapma; durumu belgeleyip `SUBSCRIPTION_ACCESS_MATRIX.md`'e "backend'de satılabilir tanımlı" notunu ekleme | Kod değişmez. Ödeme yapan müşteri "Free" okumaya devam eder; bir sonraki okuyucu da bu tuzağa düşer.                                                                                                                                           |

**Doğrulanamayan:** bu hesapta **gerçek bir `team` abonesi olup olmadığı** — repodan
sayılamıyor (Supabase/ödeme sağlayıcısı verisi gerekir). Ayrıca `DODO_PRODUCT_TEAM_*`
değerlerinin dağıtılmış ortamda dolu olup olmadığı.

---

## K2 — Lapsed müşterinin gerçek sağlayıcıdaki davranışı

**Etiket: BLOKE — Vercel** (+ **BLOKE — erişim**: karşılaştırılacak gerçek bir lapsed hesap yok)

### Ölçülen mevcut durum

Üretim backend'i **ayakta ve güncel**:

| Ölçüm                                     | Sonuç                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `GET /api/health`                         | `ok: true`, `version 4.0.22`, `billing.configured: true`, **`billingProvider: "dodo"`** |
| `GET /api/v1/billing/subscription-status` | **HTTP 200**                                                                            |

Ama **frontend üretime çıkamıyor**:

| Ölçüm                       | Sonuç                                                          |
| --------------------------- | -------------------------------------------------------------- |
| `engvox.com` başlıkları     | `HTTP 200`, **`Last-Modified: Sun, 13 Sep 2026 10:04:02 GMT`** |
| Servis edilen bundle        | `index-CAb1_5rR.js`                                            |
| `vercel-deploy.yml`, `main` | **Tüm koşular `failure`**; en son **2026-09-18T08:32Z**        |

Yani bugün üretimde bir lapsed müşterinin gördüğü şey **13 Eylül build'i**. Bu belgedeki K1,
K3, K4 kararlarının hiçbiri canlıya çıkamaz.

Vercel tarafındaki kök neden **önceki turda** Vercel REST API'sinden CI üzerinden ölçüldü:
`errorCode BUILD_FAILED`, mesaj _"Resource provisioning failed"_, build `buildingAt → error`
0,5 saniyede tamamlanıyor, `?builds=1` event sayısı **0** (build log'u hiç oluşmuyor), son 100
deployment'ın tamamı `ERROR`, son `READY` 2026-09-13T07:48Z. Bu turda **yalnız** iş akışı
sonuçları ve üretim HTTP başlıkları yeniden ölçüldü; API ölçümü tekrar edilmedi.

### Seçenekler

| #   | Seçenek                                                                                                                                                      | Etki                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Vercel support'a ticket (proje `eng-vox`, deployment `dpl_AuvRNPS7jGkvavSSzYbeS4byUVmX`, "stuck provisioning / plan-incompatible settings" temizliği istemi) | Vercel'in kendi katmanında onarım gerektirir; kod bu aşamaya etki edemez (build konteyneri hiç ayrılmıyor). En yüksek etkili adım.             |
| B2  | Aynı ağacı **başka bir hedefe** elle yayınla (çalışan bir Vercel hesabı ya da başka bir statik host)                                                         | Üretim frontend'i ilerletir ve K1/K3/K4 kararlarını görünür kılar; Vercel onarımını beklemez. Maliyeti: deploy yolunun ikinci bir sahibi olur. |
| B3  | Şimdilik park et; yalnız lapsed akışını **yerelde** ölçmeye devam et                                                                                         | K2 ölçülemez kalır; K1/K3/K4 kararları yine alınabilir (üçü de Vercel'den bağımsız kararlar).                                                  |

**Doğrulanamayan:** gerçek bir lapsed (`canceled` / `past_due` / `unpaid` / `incomplete`)
müşterinin Dodo tarafındaki davranışı — bu ortamdan uçtan uca sürülemedi (dağıtılmış backend
`localhost` origin'ini reddediyor, POST oturum yolları CSRF + kimlik istiyor, test hesabı yok).
Bu turda ölçülen lapsed davranışı **store + gerçek sayfa** üzerinden alındı, ödeme sağlayıcısı
üzerinden değil.

---

## K3 — "Upgrade" düğmesi hangi planı satın alıyor

**Etiket: ŞİMDİ ALINABİLİR**

### Ölçülen mevcut durum

Hedef plan tek bir global sabitten geliyor ve **müşterinin kendi planına bakmıyor**:

| Kanıt       | Konum                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Sabit       | `src/features/billing/billing.entitlements.ts:120` → `DEFAULT_UPGRADE_PLAN_ID = 'senior'` |
| Tüketiciler | `src/pages/BillingPage/index.tsx:65`, `src/pages/ProfilePage/useProfilePage.ts:123,127`   |

**Bu turda ölçülen matris** (gerçek sayfalar, gerçek store; 2 plan × 4 lapsed durum × 2 yüzey):

```
specialist  canceled     profile=senior   panel=senior
specialist  past_due     profile=senior   panel=senior
specialist  unpaid       profile=senior   panel=senior
specialist  incomplete   profile=senior   panel=senior
master      canceled     profile=senior   panel=senior
master      past_due     profile=senior   panel=senior
master      unpaid       profile=senior   panel=senior
master      incomplete   profile=senior   panel=senior
anlaşmazlık: 0
```

Yani **8 vakanın tamamında** (her vaka iki yüzeyi de sürüyor: toplam **16 kontrol
tetiklemesi**) daha yüksek bir plandan düşmüş müşteri, "Upgrade Plan"a bastığında **`senior`**
satın alıyor — kendi planından **daha düşük** bir kademe.

İkinci ölçüm: sabitin **değerini hiçbir test sabitlemiyor**. `DEFAULT_UPGRADE_PLAN_ID` yalnızca
`billing.failure-surfaces.test.tsx:546-547`'de geçiyor ve orada **kendisiyle** karşılaştırılıyor
(`toBe(DEFAULT_UPGRADE_PLAN_ID)`), yani sabit `junior` yapılsa hiçbir test kırmızıya dönmez.

### Seçenekler

| #   | Seçenek                                                                                                                    | Etki (ölçülmüş / çıkarımsal)                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Bugünkü davranışı **karar olarak** sabitle: sabitin değerini literal bir testle pinle + neden `senior` olduğunu yoruma yaz | Kod davranışı değişmez; "sessiz alt plan satışı" belgelenmiş bir karar olur. En küçük iş, ama müşteriyi düşük kademeye satmaya devam eder.                                                |
| C2  | Yükseltme kontrolünü `/pricing`'e yönlendir (müşteri planı kendisi seçsin)                                                 | Sessiz yanlış satış biter; iki yüzeydeki düğmenin hedefi değişir, `/pricing` akışı zaten var. Maliyet: iki kontrolün "aynı planı başlatır" pinleri yeniden yazılmalı.                     |
| C3  | Plan-farkında hedef: lapsed için **kendi planı**, yükseltme için **bir üst kademe**                                        | En doğru davranış; `IncomingPlanId` sınırı ve katalog sahibi zaten bunu mümkün kılıyor. Maliyet: `team` gibi katalog dışı kimliklerde (K1) hedef seçilemez — K1 ile birlikte karar ister. |
| C4  | Hiçbiri (dokunma)                                                                                                          | Ölçülen durum: lapsed `master` müşterisi `senior` aboneliğine geçer, daha az öder ve master özelliklerini sessizce kaybeder. Bugün hiçbir test bunu yakalamaz.                            |

---

## K4 — Müşteriye ham backend cümlesi giden hata kodları

**Etiket: ŞİMDİ ALINABİLİR**

`src/features/billing/billing.failure-copy.ts` kodu→cümle çevirisinin **tek sahibi**. 28
billing-surface kodundan **4'ü** yeniden yazılıyor, **24'ü backend'in cümlesini aynen**
geçiriyor. 24'ün **10'u** gerekçe olarak `names-provider-or-component` taşıyor — yani cümle
sağlayıcı/bileşen adı içeriyor **ama müşteriye yine gidiyor**. Gerekçe "kimin yazdığını"
açıklıyor, "müşteriye uygun olduğunu" değil.

Aşağıdaki tablo bu turda **gerçek çözücüden** ölçüldü (`billingFailureCopy(code, backendSentence)`
gerçek modül üzerinden çağrıldı) ve her satırda müşterinin **okuduğu** cümle yazılı.

### Yeniden yazılan kodlar (müşteri ham cümleyi görmez)

| Kod                             | HTTP | Backend cümlesi                                             | Müşteri ne okuyor                                      | Kaynak                                                 |
| ------------------------------- | ---- | ----------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `audit_log_unavailable`         | 503  | "Required audit logging is unavailable."                    | genel billing kopyası                                  | `backend/src/audit-log.ts:267,290`                     |
| `idempotency_store_unavailable` | 503  | "Idempotent request processing is temporarily unavailable." | "A previous billing attempt is still being processed…" | `backend/src/middleware/idempotency.middleware.ts:167` |
| `origin_not_allowed`            | 403  | "Origin not allowed by CORS."                               | "Billing could not be started from this address…"      | `backend/src/app.ts:273`                               |
| `route_not_found`               | 404  | "Route not found."                                          | "This billing action is not available right now…"      | `backend/src/app.ts:768`                               |

### Ham cümle müşteriye giden kodlar — gerekçe: `customer-facing-sentence` (14)

| Kod                            | HTTP | Müşteriye giden cümle (backend'in kendi metni)                                 | Kaynak                                                   |
| ------------------------------ | ---- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `BILLING_STATUS_UNAVAILABLE`   | 503  | "Billing status is temporarily unavailable."                                   | `backend/src/billing-service.ts:188`                     |
| `FORBIDDEN_DEMO_ACTION`        | 403  | "Demo profiles do not have billing privileges."                                | `backend/src/billing-service.ts:134`                     |
| `INVALID_PLAN`                 | 400  | "A paid plan is required for checkout." _(Dodo yolunda: `Unknown plan: "x".`)_ | `billing-service.ts:147`, `dodo-billing-provider.ts:319` |
| `billing_customer_not_found`   | 404  | "No Stripe customer is linked to this user."                                   | `backend/src/billing-service.ts:173`                     |
| `billing_user_mismatch`        | 403  | "Billing requests cannot target another user."                                 | `backend/src/billing-helpers.ts:63`                      |
| `idempotency_key_reused`       | 409  | "The idempotency key was already used with a different request."               | `backend/src/middleware/idempotency.middleware.ts:55`    |
| `internal_error`               | 500  | "The backend could not complete the request."                                  | `backend/src/errors.ts:72`                               |
| `invalid_idempotency_key`      | 400  | "Idempotency key must be a string between 16 and 256 characters."              | `backend/src/middleware/idempotency.middleware.ts:75`    |
| `invalid_pagination`           | 400  | "limit must be a non-negative integer."                                        | `backend/src/validation.ts:163`                          |
| `invalid_request`              | 400  | "email is required."                                                           | `backend/src/billing-helpers.ts:22`                      |
| `invalid_return_url`           | 400  | "successUrl must be a valid absolute URL."                                     | `backend/src/billing-return-url.ts:25`                   |
| `rate_limit_exceeded`          | 429  | "Too many requests. Please try again later."                                   | `backend/src/rate-limit.ts:159`                          |
| `rate_limit_store_unavailable` | 503  | "Request protection is temporarily unavailable. Please try again later."       | `backend/src/rate-limit.ts:169`                          |
| `validation_error`             | 400  | "Invalid request body."                                                        | `backend/src/validation.ts:191`                          |

### Ham cümle müşteriye giden kodlar — gerekçe: `names-provider-or-component` (10)

| Kod                                     | HTTP | Müşteriye giden cümle                                                            | Kaynak                                                   |
| --------------------------------------- | ---- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `STRIPE_NOT_CONFIGURED`                 | 503  | "Billing backend is unavailable because the payment provider is not configured." | `billing-service.ts:125`, `dodo-billing-provider.ts:309` |
| `auth_provider_unavailable`             | 503  | "Firebase JWKS could not be fetched."                                            | `backend/src/auth.ts:160`                                |
| `authentication_required`               | 401  | "A valid backend authorization token is required."                               | `backend/src/auth.ts:422`                                |
| `csrf_token_invalid`                    | 403  | "CSRF token is invalid."                                                         | `backend/src/middleware/csrf.middleware.ts:131`          |
| `csrf_token_missing`                    | 403  | "CSRF token is required for this request."                                       | `backend/src/middleware/csrf.middleware.ts:117`          |
| `dodo_api_error`                        | 502  | "Dodo Payments request failed (502)."                                            | `backend/src/dodo-billing-provider.ts:288`               |
| `dodo_invalid_response`                 | 502  | "Dodo did not return a checkout URL."                                            | `backend/src/dodo-billing-provider.ts:353`               |
| `dodo_not_configured`                   | 503  | "No Dodo product is configured for plan \"specialist\" (month)."                 | `backend/src/dodo-billing-provider.ts:326`               |
| `internal_service_identity_unavailable` | 503  | "Internal authentication is not bound to a valid service identity."              | `backend/src/auth.ts:341`                                |
| `stripe_invalid_response`               | 502  | "Stripe did not return a checkout URL."                                          | `backend/src/stripe-billing-provider.ts:279`             |

### İstemcinin kendi yazdığı kodlar (4, backend sözleşmesinde yok)

| Kod                              | Müşteriye giden cümle                                                                         | Kaynak                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `billing_backend_timeout`        | "Billing backend timed out after 30 seconds. The server may be waking up — please try again." | `src/features/billing/stripe.provider.ts:32-34` |
| `billing_backend_unreachable`    | "Billing service is currently unreachable. Please check your connection or try again later."  | `src/features/billing/stripe.provider.ts:41-43` |
| `billing_backend_request_failed` | "Billing backend request failed."                                                             | `src/features/billing/stripe.provider.ts:51`    |
| `billing_client_sentence`        | mağazanın kendi yazdığı önkoşul cümlesi (ör. önce giriş yapın)                                | `src/features/billing/billing.store.ts`         |

### Kodsuz gelen şekiller (bu turda ölçüldü)

Kod taşımadan gelen bir hata **her durumda** genel billing kopyasına çözülüyor — bu, bir önceki
geçişte kapatılan sızıntının pinli davranışı:

```
code=null raw="Backend response does not match the versioned success envelope."  -> genel kopya
code=null raw="Unexpected token '<'"                                           -> genel kopya
code=null raw="API 502: "                                                       -> genel kopya
code=null raw="Audit store offline."                                            -> genel kopya
code=null raw="The backend could not complete the request."                      -> genel kopya
code=null raw=''                                                                -> genel kopya
```

### Seçenekler

| #   | Seçenek                                                                      | Etki                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Bugünkü kapsamı **karar olarak** yaz (bu bölüm), kodu değiştirme             | Sınır dürüst olur: `names-provider-or-component` gerekçesinin "müşteriye uygun" anlamına gelmediği açıkça yazılmış olur. Müşteri 24 cümleden 10'unda sağlayıcı adı okumaya devam eder.        |
| D2  | Yalnız `names-provider-or-component` sınıfını (10 kod) yeniden yaz           | En görünür sızıntı sınıfı kapanır; `billing.failure-copy.ts` içinde 10 yeni cümle gerekir — **yeni müşteri metni** demektir, yani bu madde metin kararına bağlı.                              |
| D3  | 24 kodun tamamını yeniden yaz                                                | Sızıntı tümden biter; 24 cümle metin kararı ister ve `customer-facing-sentence` gerekçesinin (`BILLING_STATUS_UNAVAILABLE` gibi gerçekten müşteri için yazılmış olanlar) ayıklanması gerekir. |
| D4  | Kodsuz yolda geliştirme uyarısının üretimde de sinyal olması (ör. telemetri) | Sözleşme dışı bir kodun müşteriye ulaştığı **bugün** yalnız geliştirmede görünüyor; üretimde sessiz. Sözleşmenin büyümesi için tek sinyal bu.                                                 |

---

## K5 — Plan kimliğinin tek sahibi yok

**Etiket: ŞİMDİ ALINABİLİR**

"Var olan planlar nelerdir" sorusu **dokuz yerde** kodlanmış ve iki taraf birbirini tutmuyor:

| Taraf    | Konum                                            | Küme                                     |
| -------- | ------------------------------------------------ | ---------------------------------------- |
| Frontend | `billing.types.ts:5`                             | free, junior, senior, specialist, master |
| Frontend | `billing.helpers.ts:73,86,100,113,126` (katalog) | aynı 5                                   |
| Frontend | `billing.entitlements.ts:14` (`PLAN_HIERARCHY`)  | aynı 5                                   |
| Backend  | `backend/types.d.ts:249`                         | + **team**                               |
| Backend  | `backend/src/billing-plan-migration.ts:16,25`    | + team                                   |
| Backend  | `backend/src/plan-limits.ts:9`                   | + team (aylık 1500 kredi)                |
| Backend  | `backend/src/workspace.ts:33`                    | + team                                   |
| Backend  | `backend/src/dodo-billing-provider.ts:42`        | + team                                   |
| Backend  | `backend/src/stripe-billing-provider.ts:74`      | + team                                   |

Uyuşmazlığı **hiçbir yerde isimlendirilmeyen** sessiz bir düşüş kapatıyor:
`resolvePlan` (`billing.helpers.ts:165`) katalogda olmayan kimliği `free` sayıyor. K1'in
kökü tam olarak burada; `team` bugün yalnızca bu sessizlik sayesinde "çalışıyor" (çökmüyor ama
yanlış şey söylüyor).

| #   | Seçenek                                                                                                                                                                        | Etki                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Backend'in kanonik kümesini frontend'in okuduğu **tek bir type-only sözleşmeye** indir (hata kodları için zaten var olan desen: `src/features/billing/billing.error-codes.ts`) | Bir kod eklendiğinde frontend derlemede uyarılır; `resolvePlan`'ın fallback'i gerçekten "son çare" olur. Maliyet: katalog/metin içeriği yine frontend'de kalır, yani çoğu yerde "tanım" hâlâ elle. |
| E2  | Tek bir **runtime** sözleşme (ortak JSON/paket) — hem plan kümesi hem limitler                                                                                                 | Dokuz yer bire iner; iki dağıtım arasında yeni bir ortak bağımlılık doğar (bugün frontend'in backend'e tek teması type-only ve bu bilinçli bir sınır).                                             |
| E3  | Dokunma; yalnız dokümanı (`docs/SUBSCRIPTION_ACCESS_MATRIX.md`) backend kümesiyle hizala ve sessiz düşüşü yorumda açıkça yaz                                                   | Bugünkü davranış aynı kalır (çökme yok, cümle yanlış); sonraki okuyucu tuzağı görür. En küçük iş.                                                                                                  |

---

## K6 — Ölü `getDowngradeImpact`

**Etiket: ŞİMDİ ALINABİLİR**

`src/features/billing/billing.entitlements.ts:180`'de **52 satır** duruyor ve **ürün kodunda hiç
çağrılmıyor**; tek referansı kendi testi (`billing.entitlements.test.ts:246-260`). Üstelik
katalog dışı bir kimlikle (`team`) çağrılırsa `BILLING_PLANS['team']` `undefined` olduğu için
**çöker** — yani çalışsaydı K1'in yanlış davranışını bir başka yüzeyde tekrarlardı.

| #   | Seçenek                                                                                | Etki                                                                                                                    |
| --- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| F1  | Sil (fonksiyon + kendi 3 test vakası)                                                  | 52 satır ürün dışı kod ve ona bağlı test yükü gider; ölçülebilir davranış değişmez. Bugün çökebilen bir yol da kapanır. |
| F2  | Bir akışa bağla: düşürme/iptal onayında "neleri kaybedeceksiniz" bilgisi olarak kullan | Gerçek müşteri faydası olur (`team` için K1 çözülmeden güvenli değil); yeni bir yüzey + metin kararı gerektirir.        |
| F3  | Olduğu gibi bırak                                                                      | Bugünkü durum: kullanılmayan, `team` ile çöken bir fonksiyon ve onun testi repoda kalır.                                |

---

## K7 — İki modül dörder iş yapıyor

**Etiket: ŞİMDİ ALINABİLİR** (yapısal borç; karar "şimdi mi sonra mı")

| Dosya                                          | Satır | Taşıdığı işler                                                                                                           |
| ---------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/features/billing/billing.helpers.ts`      | 354   | plan kataloğu + API URL çözümü + sağlayıcı durumu + durum sunumu                                                         |
| `src/features/billing/billing.entitlements.ts` | 238   | 16 dışa aktarımla: aktivite yüklemleri + hiyerarşi + ücretsiz önizleme limitleri + düşürme matematiği + limit etiketleri |

| #   | Seçenek                                                                | Etki                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Şimdi böl (katalog / API / sunum; yüklemler / hiyerarşi / düşürme)     | K5 ve K6 gibi maddeler doğal evine kavuşur; her davranış değişikliği tek yere düşer. Maliyet: bu geçişte ~600 satır dosya yer değiştirir, saf taşıma olsa bile import yüzeyi geniş. |
| G2  | Yalnız bir sonraki gerçek değişiklikte böl (K1/K5 uygulanırken)        | Aynı kazanç, ayrı bir "sadece taşıma" PR'ı olmadan; karar şimdi verilir, iş o maddeye iliştirilir.                                                                                  |
| G3  | Bırak; `docs/COMPLEXITY_GUIDELINES.md` sınırına sığdığı sürece dokunma | Bugünkü yapı kalır; K5'in "tek sahip" ihtiyacı E1 ile de karşılanabilir.                                                                                                            |

---

## Doğrulanamayanlar (açık liste)

| İddia                                                                                               | Neden doğrulanamadı                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gerçek bir `team` abonesinin var olup olmadığı ve kaç tane olduğu                                   | Repodan sayılamaz; Supabase/ödeme sağlayıcısı verisi gerekir. Yol ölçüldü, **sıklık** ölçülemedi.                                                                                                                                                        |
| Lapsed bir müşterinin **Dodo** tarafındaki gerçek davranışı (oturum açılıyor mu, ne mesajı görüyor) | Uçtan uca sürülemedi: dağıtılmış backend `localhost` origin'ini reddediyor, POST oturum yolları CSRF + kimlik istiyor, test hesabı yok. Lapsed davranışı **store + gerçek sayfa** üzerinden ölçüldü.                                                     |
| Vercel'in bugünkü API durumu (deployment `ERROR`, build log yok)                                    | Bu turda **yeniden ölçülmedi** — Vercel token'ı repoda/yerelde yok, ölçüm önceki turda CI üzerinden alındı. Bu turda yalnız iş akışı sonuçları (`vercel-deploy.yml` tümü `failure`, en son 2026-09-18T08:32Z) ve üretim HTTP başlıkları yeniden ölçüldü. |
| `DODO_PRODUCT_TEAM_*` değerlerinin dağıtılmış ortamda dolu olması                                   | Env şablonunda anahtarlar var; dağıtılmış değerler okunamıyor (paylaşılan env yalnız süreç içinde).                                                                                                                                                      |
| Üretim bundle'ının bu ağaçtan farkı                                                                 | Bu turda **yerel build ile karşılaştırılmadı**; ölçülen tek şey üretimin 13 Eylül'de donmuş olduğu (`Last-Modified` + `index-CAb1_5rR.js`).                                                                                                              |

---

## Ölçümü yeniden üretmek

Bu belgedeki üç davranışsal ölçüm (K1 üç-yüzey tablosu, K3 8 satırlık matris = 16 kontrol
tetiklemesi, K4 kod→cümle
tablosu) geçici bir vitest dosyasıyla alındı ve **ölçümden sonra silindi** — repoda iz bırakmadı.
Yeniden üretmek için `src/features/billing/` altına geçici bir `*.probe.test.tsx` koyup:

- K4: `billingFailureCopy(code, backendSentence)` fonksiyonunu gerçek modülden içe aktarıp 28
  billing-surface kodu için çıktıyı yazdır (`BillingSurfaceErrorCode` `billing.error-codes.ts`
  üzerinden geliyor; backend cümleleri bu belgedeki tabloda kayıtlı).
- K3: `ProfilePage` ve `BillingPage`'i gerçek wrapper ile render et, store'a lapsed bir durum
  yaz, yükseltme düğmesine bas, `BillingService.startCheckout` casusunun **üçüncü argümanını**
  oku.
- K1: aynı üç yüzeyi `planId: 'team'`, `status: 'active'` ile render edip sayfadaki plan
  etiketlerini ve yükseltme kontrollerini say.

Ayrı test dosyalarının kendi pini olan yerler: `billing.failure-surfaces.test.tsx` (K1'in
"katalog dışı kimlikte çökme yok, tek plan adı" davranışı, K3'ün "iki yüzey aynı planı başlatır"
pini, portal koşulunun tekliği). Bu pinler K3'ün **sabit değerini** sabitlemez — yukarıda
ölçüldü.
