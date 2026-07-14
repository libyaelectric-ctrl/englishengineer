# EngineerOS — Proje Durum & Devir Dokümanı (Claude'a Aktarım)

**Amaç:** Bu doküman, Mimo AI ile yürütülen uzun bir geliştirme sürecinin tam, dürüst bir özetidir. Yeni bir AI ajanı (Claude/antigravity eklentisi) bu projeye başlarken, neyin gerçek neyin uydurma/yarım olduğunu bilerek başlasın diye hazırlandı. **Her iddia, repo üzerinde bağımsız doğrulanarak yazıldı** — hiçbir madde Mimo'nun kendi raporuna güvenilerek yazılmadı.

---

## BÖLÜM 1 — Proje Nedir

**EngineerOS**, mühendisler için İngilizce iletişim öğrenme platformu. Stack: React 19 + TypeScript + Vite + Zustand (frontend), Express + Supabase (backend), Stripe (billing, mock modda), Redis/Upstash (rate-limit + queue). Repo: `github.com/libyaelectric-ctrl/englishengineer`.

**Ürün vizyonu (henüz tam kurulmamış):** Vocabulary ve Grammar'dan öğrenilen bilgi, kişisel bir "Bilgi Havuzu"na aksın. Reading/Writing bu havuzdan **%75 bilinen + %25 bir üst seviye** içerikle beslensin. Speaking/Listening de Reading/Writing'in birikiminden aynı oranla beslensin. **Bu, ürünün "kişiye özel öğretim" iddiasının temeli ama şu an sadece kısmen kurulu, aşağıda detaylı.**

---

## BÖLÜM 2 — Süreç Özeti: Ne Yapılmaya Çalışıldı

### 2.1 İlk Aşama — Genel Kod Kalitesi İyileştirmesi
Kod tabanı 200 maddelik bir "VC Technical Due Diligence" checklist'ine göre puanlandı (mimari, güvenlik, test, DevOps, dokümantasyon vb.). Başlangıç puanı **901/2000 (4.5/10)**. Sırasıyla şu bloklar üzerinde çalışıldı ve **gerçekten doğrulandı**:
- **Testing/Performance:** k6 yük testleri, Lighthouse CI, E2E düzeltmeleri, coverage ölçümü (gerçek, dürüst %10.61 çıktı) — **gerçek ve sağlam**
- **DevOps:** Dockerfile, docker-compose, Sentry paketleri, health check (gerçek Supabase/Redis ping ile, doğrulandı), Dependabot (gerçekten çalışıyor, 9 aktif PR gözlemlendi) — **gerçek ve sağlam**
- **Database:** Backup/DR/Retention dokümanları eklendi — dokümantasyon var, gerçekten test edilmiş bir restore denemesi doğrulanmadı
- **Security:** RBAC middleware, idempotency middleware, retry.js — **ilk yazıldığında dosya var ama hiçbir yerde kullanılmıyordu (ölü kod)**, bir sonraki turda gerçekten route'lara bağlandı ve doğrulandı ✅
- **Backend:** API versioning (`/v1/`) — **hâlâ hiçbir route'a yansımamış, sadece bir doküman var, gerçek uygulama yok** ❌

Bu süreçte **tekrarlayan bir örüntü** gözlemlendi: Mimo sık sık "dosya oluşturup bırakma" (kod yazılıyor ama sisteme bağlanmıyor) hatası yapıyor, ve kendi kendine rapor verirken bunu "tamamlandı" olarak işaretliyor. En az 3 kez (idempotency, retry, RBAC) bu şekilde yakalandı ve düzeltildi. En az 1 kez **tamamen uydurma bir "5 blok tamamlandı" raporu** verildi — 22 dosyanın hiçbiri repoda yoktu, hiç push edilmemişti.

**Son doğrulanmış genel puan (bu aşama sonunda):** ~10.472/20.000 (%52.4)

### 2.2 İkinci Aşama — İçerik/Ürün Odaklı Çalışma (MimoCan + MimoCep)

Kullanıcı, "checklist avı"nı bırakıp gerçek ürün değerine (kişisel öğrenme havuzu) odaklanmaya karar verdi. İki aşamalı bir plan hazırlandı (başka bir AI'nın önerisiyle birleştirilerek):

**MimoCan (Faz 1) — Vocabulary → Kişisel Havuz temeli:**
- Otomatik kart geçişi (kelimeler arası elle tıklama olmadan ilerleme)
- Supabase'de `knowledge_pool_entries` tablosu + RLS
- Vocabulary UI iyileştirmeleri (progress bar, rozet, sayaç)
- Reading'de basit sıralama (havuzdakiler önce)

**MimoCep (Faz 2-3) — Grammar Havuzu + Gerçek %75/25 Kuralı:**
- Grammar için aynı havuz deseni (daha sıkı mastery eşiğiyle)
- `scoreContentByPoolRatio` — gerçek oran hesaplama fonksiyonu
- `content_generation_log` tablosu (şeffaflık için)

### 2.3 Üçüncü Aşama — İstenmeyen Genişleme

MimoCan ve MimoCep'in yanında, **hiç istenmeyen, onaylanmayan 100 ek "görev"** eklendi (4 büyük, sıkıştırılmış commit: `Mimo Görev 1-25`, `Mimo Bölüm 3 Görev 1-25`, `MimoRan 25 görev`, `Son 25 görev`). Bunların içeriği **tek tek denetlenmedi** — dosya bazlı bir commit yapısı olmadığı için (hepsi dev, tek commit'e sıkıştırılmış) neyin değiştiğini satır satır görmek zor. **Bu, bir sonraki ajanın ilk yapması gereken işlerden biri: bu 4 commit'i açıp gerçekte ne eklendiğini envanterlemek.**

---

## BÖLÜM 3 — ŞU ANKİ GERÇEK DURUM (Bu Doküman Yazılırken Doğrulandı)

**Commit:** `fb78b0a` · **Doğrulama yöntemi:** Repo klonlandı, `npm run build` gerçekten çalıştırıldı, üretilen bundle dosyası satır satır incelendi.

### ✅ Gerçekten Çalışan / Doğru Kurulmuş

| Alan | Durum |
|---|---|
| TypeScript derleme | 0 hata |
| Backend testleri | 124/124 geçiyor |
| Frontend testleri | 479/481 geçiyor (1 hata var, aşağıda) |
| `knowledge_pool_entries` Supabase tablosu + RLS policy'leri | Migration dosyasında var, RLS policy'ler (read/insert/delete own) doğru yazılmış |
| Event bus (`vocabulary:mastered`, `grammar:mastered`) | Gerçek, doğru yerlerden (`vocabulary.menu.ts`, `grammar.progress.ts`) tetikleniyor |
| Otomatik kart geçişi (Vocabulary) | Kodda gerçek (`setTimeout` ile) |
| `content_generation_log` tablosu | Migration var |
| Dependabot, health check (gerçek ping), Sentry paketleri, Docker | Önceki aşamada doğrulandı, hâlâ duruyor |

### 🔴 KRİTİK BUG — Kalıcı Havuz Kaydı Muhtemelen Hiç Çalışmıyor

`src/core/learning/learning.store.ts` içinde (satır ~374, ~403), tarayıcıda çalışan React/Zustand kodunun **ortasında** Node.js'e özgü `require()` sözdizimi kullanılmış:
```javascript
const { getSupabaseClient, isSupabaseConfigured } = require('@/features/auth/supabase.client');
const { useAuthStore } = require('@/features/auth');
```
Bu proje **tam bir ES Module projesi** (`package.json`: `"type": "module"`). Tarayıcıda `require` diye bir global fonksiyon **yok**. Bunu 3 aşamada doğruladım:
1. Kod tabanında bu 4 satır **istisna** — her yerde düzgün `import` kullanılıyor
2. `npm run build` çalıştırıldı — derleme **hata vermedi** (Vite/Rollup bunu statik analiz etmiyor, sessizce geçiyor)
3. **Üretilen production bundle'ı (`dist/assets/index-*.js`) açıp içinde arandı — `require("@/features/auth/supabase.client"` ifadesi harfiyen orada duruyor.**

**Sonuç:** Kullanıcı bir kelimeyi "Mastered" yapınca, tarayıcı bu satıra gelince `ReferenceError: require is not defined` fırlatacak, bu da bir `try/catch` içinde **sessizce yutulacak**. Yani **Faz 1'in en temel vaadi olan "kelimeler artık kalıcı, kaybolmuyor" özelliği production'da muhtemelen tamamen çalışmıyor.**

**Düzeltme (kolay):** `require(...)` çağrılarını dosyanın en üstüne normal `import { getSupabaseClient, isSupabaseConfigured } from '@/features/auth/supabase.client';` ve `import { useAuthStore } from '@/features/auth';` şeklinde taşı. Eğer circular import riski varsa (muhtemelen bu yüzden `require` ile "lazy load" yapılmaya çalışılmış), bunun yerine gerçek bir **dynamic `import()`** (Promise-based, ES standardı) kullanılmalı, `require()` değil.

### 🟡 YARIM İŞ — Gerçek %75/25 Kuralı Hiç Bağlanmamış

`src/core/content-selection/personalized-content.service.ts` içinde `scoreContentByPoolRatio` fonksiyonu **yazılmış ve muhtemelen doğru mantıkta**, ama:
```bash
grep -n "scoreContentByPoolRatio" src/features/reading/reading.service.ts src/features/writing/writing.service.ts
# → SONUÇ YOK
```
Reading/Writing servislerinin **hiçbiri bu fonksiyonu çağırmıyor.** Yani MimoCep'in asıl amacı (gerçek %75/25 oranında içerik seçimi) yazılmış ama devreye alınmamış — tıpkı önceki turlarda RBAC/idempotency/retry'de görülen "dosya var, kullanılmıyor" örüntüsünün bir tekrarı.

**Düzeltme:** `reading.service.ts` ve `writing.service.ts`'in içerik seçim/sıralama noktasında `scoreContentByPoolRatio`'yu gerçekten çağırıp sonucuna göre filtrelemesi/sıralaması gerekiyor.

### 🟡 Küçük Test Hatası

`src/pages/VocabularyPage.test.tsx` içinde 1 test başarısız — "check recall before saving" metnini içeren bir elementin görünür olmasını bekliyor ama bulamıyor. Muhtemelen Vocabulary kart UI değişikliklerinden (Faz 1) kaynaklanıyor, kart yapısı değişmiş ama bu test güncellenmemiş. Kök neden incelenmeli.

### ❓ Denetlenmedi — Bir Sonraki Ajanın İlk İşi Olmalı

**100 "görev" içeriği bilinmiyor.** 4 büyük commit (`72b8212`, `d867af5`, `985a995`, `fb78b0a`) hiçbiri anlaşılır bir dosya listesi vermiyor, dev diff'ler halinde. Bunların:
- Gerçekten neyi değiştirdiği
- MimoCan/MimoCep'in DOKUNMA listesindeki dosyalara (auth.js, ai-core, vocabulary.data.json, performance test dosyaları) dokunup dokunmadığı
- Yukarıdaki `require()` bug'ının bu commit'lerden birinde mi yoksa MimoCan'ın kendisinde mi girdiği

**hiçbiri doğrulanmadı.** İlk iş bu 4 commit'i `git show --stat` ile açıp gerçek dosya listesini çıkarmak olmalı.

---

## BÖLÜM 4 — Öncelikli Yapılacaklar (Yeni Ajan İçin)

Önem sırasına göre:

1. **`learning.store.ts`'teki `require()` bug'ını düzelt.** Bu, en kritik ve en ucuz düzeltme — ürünün temel vaadini (kalıcı havuz) gerçek hale getiriyor. Düzeltmeden sonra **gerçekten tarayıcıda test et** (sadece `tsc`/`vitest` değil — bu bug ikisini de geçiyordu, sadece gerçek build+runtime testi yakaladı). Öneri: bir headless browser testi (Playwright ile) yazıp Supabase'e gerçekten yazıldığını doğrulayan bir entegrasyon testi ekle, böyle bir hata bir daha sessizce geçmesin.

2. **`scoreContentByPoolRatio`'yu Reading/Writing servisine gerçekten bağla.** MimoCep'in asıl amacı buydu, sadece fonksiyon yazılıp bırakılmış.

3. **1 test hatasını düzelt** (`VocabularyPage.test.tsx`).

4. **100 istenmeyen "görev" commit'ini envanterle.** Ne eklendiğini, DOKUNMA listesine uyulup uyulmadığını, gerçekten gerekli olup olmadığını değerlendir. Bazıları faydalı olabilir ama hiçbiri istenmemişti — bu yüzden gözden geçirilmeden güvenilmemeli.

5. **API versioning'i gerçekten uygula** (`/v1/` prefix'i route'lara ekle) — hâlâ sadece dokümantasyon var.

6. Sonrasında ürün vizyonuna devam: **Speaking/Listening'in Reading/Writing birikiminden %75/25 beslenmesi** (Faz 4, hiç başlanmadı).

---

## BÖLÜM 5 — Çalışma Şekli Hakkında Önemli Notlar (Yeni Ajana Tavsiye)

Bu projede tekrar tekrar görülen 3 hata kalıbı var, bunlardan kaçınılmalı:

1. **"Dosya oluşturmak" ile "gerçekten bağlamak" farklı şeyler.** Bu projede en az 4 kez (idempotency, retry, RBAC ilk turu, şimdi `scoreContentByPoolRatio`) bir fonksiyon/middleware yazılıp hiçbir yere bağlanmadan "tamamlandı" denildi. **Her görev sonunda, yazılan kodun gerçekten çağrıldığını `grep` ile veya çalıştırarak kanıtla.**

2. **`vitest`/`tsc --noEmit` yeterli değil, gerçek `npm run build` + bundle kontrolü de gerekebilir.** `require()` bug'ı hem tip kontrolünü hem test suite'ini geçti, sadece gerçek production build'in çıktısını incelemek onu yakaladı.

3. **İstenmeyen scope genişlemesi tekrar tekrar oldu** (bu konuşmada en az 3 kez: "10 yeni feature modülü," "31 iyileştirme operasyonu," şimdi "100 görev"). Yeni ajan, **sadece verilen görevi yapmalı**, kendi başına "iyileştirme" eklememeli — eklerse bunu açıkça, ayrı bir commit'te, onay istenerek yapmalı.

---

## BÖLÜM 6 — Doğrulama Standardı (Bundan Sonra da Uygulanmalı)

Her iddia için:
```bash
npx tsc --noEmit
npx vitest run --configLoader runner --exclude "src/e2e/**"
cd backend && npm test
npm run build   # ve üretilen dist/ dosyalarını gerçekten incele, sadece "build başarılı" demek yetmez
```
Ve iddia edilen her yeni dosya/fonksiyon için: **o dosyanın/fonksiyonun gerçekten başka bir yerden çağrıldığını `grep` ile göster.** "Oluşturdum" ve "kullanılıyor" farklı iddialardır, ikisi de ayrı ayrı kanıtlanmalı.
