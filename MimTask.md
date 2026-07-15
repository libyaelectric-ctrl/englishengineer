# EngineerOS — Kod İnceleme Bulguları ve Görev Listesi (Mimo için)

**Hazırlanma tarihi:** 15 Temmuz 2026
**Kapsam:** `englishengineer-main` repo tam taraması (frontend `src/`, `backend/`, `supabase/`, `yenisrc/`, tooling)
**Amaç:** Bu dosya, yapılan kod incelemesinde tespit edilen tüm eksiklik/aksaklık/öneriyi, Mimo'nun (veya başka bir ajanın) sırayla uygulayabileceği somut görevlere çevirir. Her görev; **neden**, **nerede**, **ne yapılacak** ve **kabul kriteri** ile tanımlanmıştır.

Genel puan (mevcut durum): **8/10** — mimari, güvenlik ve kod hijyeni açısından olgun bir proje. Aşağıdaki maddeler "kritik hata" değil, **bakım/ölçek/okunabilirlik borcu**dur. Yine de öncelik sırasına göre ilerlenmesi önerilir.

---

## 📌 Önceliklendirme Anahtarı

| Etiket | Anlamı                                                    |
| ------ | --------------------------------------------------------- |
| 🔴 P0  | Güvenlik/production riski taşıyabilir — önce bu yapılmalı |
| 🟠 P1  | Bakım borcu, orta vadede büyüyecek sorun                  |
| 🟡 P2  | Okunabilirlik / geliştirici deneyimi iyileştirmesi        |
| 🟢 P3  | Nice-to-have, düşük öncelik                               |

---

## 🔴 P0 — Güvenlik / Production Riski

### Görev 1: `allowInsecureDevAuth` için derleme-zamanı koruma ekle

- **Dosya:** `backend/src/config.js`, `backend/src/auth.js`
- **Sorun:** `ALLOW_INSECURE_DEV_AUTH=true` production'da `console.warn` ile uyarılıyor ama process durdurulmuyor ve dev-bypass path'i (`request.body.userId` kabulü) yine de derlenmiş kodda mevcut kalıyor. Yanlışlıkla staging/production env değişkeni hatası olursa kimlik doğrulama tamamen atlanabilir.
- **Yapılacak:**
  1. `createBackendConfig` içinde, `runtimeEnvironment === 'production' && ALLOW_INSECURE_DEV_AUTH === 'true'` durumunda `console.warn` yerine **`throw new Error(...)`** ile boot'u durdur (fail-fast).
  2. `createBackendAuth` içindeki dev-bypass bloğuna ek bir guard koy: `if (config.allowInsecureDevAuth && environment !== 'production')`.
  3. Bu senaryoyu kapsayan bir `backend/test/` birim testi ekle: production + `ALLOW_INSECURE_DEV_AUTH=true` kombinasyonunda uygulamanın başlamadığını doğrula.
- **Kabul kriteri:** `NODE_ENV=production ALLOW_INSECURE_DEV_AUTH=true npm start` komutu hata ile çıkış yapar (exit code ≠ 0), testler yeşil.

### Görev 2: Auth karar zincirini dokümante et ve daraltıcı test ekle

- **Dosya:** `backend/src/auth.js` (`authenticate` fonksiyonu)
- **Sorun:** 4 farklı kimlik doğrulama yolu (internal-secret → local-JWT → Supabase remote → dev-bypass) sırayla deneniyor; hangi koşulda hangi path'in tetiklendiği kod okunmadan anlaşılmıyor.
- **Yapılacak:**
  1. Fonksiyonun üstüne, her path'in hangi koşulda çalıştığını ve önceliğini özetleyen bir JSDoc/ASCII karar tablosu ekle.
  2. `backend/test/` altına, 4 path'in her biri için ayrı ayrı "sadece bu path tetiklenmeli" testleri ekle (zaten kısmen olabilir, coverage'ı doğrula).
- **Kabul kriteri:** Yeni geliştirici, kod içindeki yorumu okuyarak hangi header/env kombinasyonunun hangi auth yolunu tetiklediğini anlayabilir.

---

## 🟠 P1 — Bakım Borcu

### Görev 3: `yenisrc/` klasörünü temizle (ölü/yetim kod)

- **Dosyalar:** `yenisrc/features/grammar/grammar.engine.ts`, `yenisrc/features/grammar/index.ts`, `yenisrc/core/learning/learning.store.ts`, `yenisrc/pages/GrammarPage.tsx`
- **Sorun:** `tsconfig.json` içinde açıkça `"exclude": ["yenisrc"]` var — bu klasör build'e dahil değil, muhtemelen yarım kalmış bir grammar-engine yeniden yazımı. Repo'da öylece duruyor, kafa karıştırıyor, `git blame`/PR geçmişi kirleniyor.
- **Yapılacak (iki seçenekten biri, karar Mimo'ya bırakılmamalı — önce insan onayı alınmalı):**
  - **Seçenek A (öneri):** İçeriği incele, `src/features/grammar/` ile karşılaştır. Eğer `yenisrc` daha iyi/güncel bir tasarım içeriyorsa, migrasyonu tamamla ve `src/`'e taşı; eski `src/features/grammar/` implementasyonunu kaldır.
  - **Seçenek B:** `yenisrc` kullanılmayacaksa klasörü tamamen sil, `tsconfig.json`'daki exclude satırını da kaldır.
- **Kabul kriteri:** Repo kökünde `yenisrc/` klasörü kalmamış olmalı (ya `src/`'e entegre edilmiş ya da silinmiş); `tsconfig.json`'da artık gereksiz exclude yok; `npm run typecheck` ve `npm run test` yeşil.

### Görev 4: Büyük "God component/data" dosyalarını böl

- **Dosyalar (öncelik sırasıyla, satır sayısı büyükten küçüğe):**
  1. `src/features/vocabulary/vocabulary.data.ts` (1187 satır)
  2. `src/pages/VocabularyPage.tsx` (1146 satır)
  3. `src/pages/GrammarPage.tsx` (965 satır)
  4. `src/pages/AnalyticsPage.tsx` (951 satır)
  5. `src/features/content-library/content-library.data.ts` (949 satır)
  6. `src/features/work-tools/work-tools.expanded.data.ts` (901 satır)
  7. `src/pages/AIPage.tsx` (895 satır)
  8. `src/pages/WritingPage.tsx` (880 satır)
  9. `src/features/writing/writing.data.ts` (807 satır)
  10. `src/shared/layout/RightSidebar.tsx` (797 satır)
  11. `src/pages/ReadingPage.tsx` (775 satır)
  12. `src/features/reading/reading.data.ts` (765 satır)
  13. `src/pages/SpeakingPage.tsx` (753 satır)
- **Sorun:** Bu dosyalar hem veri hem UI/iş mantığını tek dosyada taşıyor; test edilebilirliği ve code-review kalitesini düşürüyor, merge conflict riskini artırıyor.
- **Yapılacak (her dosya için):**
  1. **`*.data.ts` dosyaları:** İçeriği mantıksal alt kümelere böl (örn. `vocabulary.data.core.ts`, `vocabulary.data.business.ts`, `vocabulary.data.technical.ts` gibi kategori bazlı) ve bir `index.ts` barrel ile birleştir. Statik veri dosyaları 300-400 satırı geçmemeli; geçiyorsa JSON/ayrı modüllere taşınmalı.
  2. **`*Page.tsx` dosyaları:** Sayfa bileşenini "orchestration" (routing, layout, state bağlama) katmanında bırak; iş mantığını custom hook'lara (`use<Feature>Page.ts`), sunum bileşenlerini alt komponentlere (`src/features/<feature>/components/`) çıkar. Hedef: sayfa dosyası ~150-250 satırı geçmesin.
  3. Her bölme sonrası ilgili testleri (`*.test.tsx`) da yeni dosya yapısına göre güncelle/böl.
- **Kabul kriteri:** Listedeki 13 dosyanın hiçbiri 400 satırı geçmiyor (data dosyaları için) veya 300 satırı geçmiyor (page bileşenleri için); `npm run test` ve `npm run lint` yeşil; davranışta regresyon yok (mevcut testler kırılmadan geçmeli).

### Görev 5: Test coverage raporunu ölçülebilir/görünür hale getir

- **Dosya:** `vitest.config.ts`, CI workflow (`.github/`)
- **Sorun:** 389 kaynak dosyasına karşı 82 test dosyası (~%21) var; `npm run test:coverage` script'i mevcut ama coverage eşiği/raporu CI'da zorunlu/görünür değil (doğrulanmalı).
- **Yapılacak:**
  1. `vitest.config.ts` içine `coverage.thresholds` (statements/branches/functions/lines için makul bir taban, örn. %60-70 başlangıç) ekle.
  2. CI workflow'una `npm run test:coverage` adımını ekle (yoksa) ve eşik altına düşünce pipeline'ı kırmasını sağla.
  3. README veya CONTRIBUTING'e güncel coverage yüzdesini/badge'ini ekle.
- **Kabul kriteri:** CI'da coverage adımı çalışıyor, eşik altına düşen bir PR pipeline'ı kırıyor; coverage raporu artefakt olarak indirilebiliyor.

### Görev 6: Kullanılmayan/az kullanılan dev bağımlılıklarını denetle

- **Dosya:** `package.json` (devDependencies: Storybook, Playwright, Stryker, k6, Lighthouse, dependency-cruiser, jscpd)
- **Sorun:** Çok geniş bir tooling seti var; hepsinin aktif ve güncel kullanıldığından emin olunmalı, aksi halde CI süresi ve bağımlılık güncelleme yükü gereksiz büyür.
- **Yapılacak:**
  1. Her tool için son 90 gün içinde CI'da/README'de referans var mı kontrol et (`npx depcheck` çalıştırılabilir).
  2. Aktif kullanılmayanları (ör. Storybook hikayeleri hiç yoksa) ya devreye al ya da kaldır.
  3. Kalanlar için `package.json`'a kısa bir yorum/README bölümü ekleyerek her tool'un CI'daki rolünü (ör. "Stryker: haftalık mutation-test job'unda çalışır") netleştir.
- **Kabul kriteri:** `npx depcheck` çıktısında "unused" olarak işaretlenen hiçbir prod-kritik paket kalmıyor; README'de tooling haritası var.

---

## 🟡 P2 — Okunabilirlik / Geliştirici Deneyimi

### Görev 7: Dokümantasyon senkronizasyonunu doğrula

- **Dosyalar:** `docs/` (57 dosya), `README.md`, `CHANGELOG.md`, `.agents/AGENTS.md`
- **Sorun:** Dokümantasyon hacmi çok yüksek; AI-agent tabanlı geliştirme sürecinde (kademe8, quality:gate) dokümanların koddan geride kalma riski var.
- **Yapılacak:**
  1. `docs/` altındaki her dosyanın en son güncellenme tarihini kod değişiklikleriyle karşılaştır; 90+ gün güncellenmemiş ama ilgili kodu değişmiş dosyaları işaretle.
  2. Güncelliğini yitirmiş dosyaları güncelle veya `docs/archive/` altına taşı.
  3. `.agents/AGENTS.md`'deki "Son Kod Analizi & Puanlama" bölümünü bu inceleme sonrası güncelle.
- **Kabul kriteri:** `docs/` içinde çelişen/eski bilgi veren dosya kalmıyor; AGENTS.md güncel tarih ve puanla işaretli.

### Görev 8: `any` kullanımlarının kalan 3 örneğini temizle

- **Dosya:** `grep -rn ": any\b" src` ile bulunan 3 konum (tam yol için tekrar tarama gerekir)
- **Sorun:** Proje genelinde `any` neredeyse hiç yok (iyi bir disiplin), kalan 3 örnek tutarlılığı bozuyor.
- **Yapılacak:** Her `any` kullanımını somut tip, `unknown` + type-guard veya generic ile değiştir.
- **Kabul kriteri:** `grep -rn ": any\b" src | wc -l` → `0`; `npm run lint` yeşil.

### Görev 9: Barrel dosya (`index.ts`) tutarlılığını gözden geçir

- **Dosyalar:** `src/features/**/index.ts` (47 adet)
- **Sorun:** Çok sayıda barrel dosyası var; bazıları circular import riskine yol açabilir (dependency-cruiser raporunda kontrol edilmeli).
- **Yapılacak:** `npm run depcruise` çalıştır, circular dependency uyarısı varsa çöz.
- **Kabul kriteri:** `npm run depcruise` çıktısında circular dependency hatası yok.

---

## 🟢 P3 — Nice-to-have

### Görev 10: `RightSidebar.tsx` gibi layout bileşenlerini feature'lardan ayır

- **Dosya:** `src/shared/layout/RightSidebar.tsx` (797 satır)
- **Yapılacak:** İçindeki feature-spesifik widget'ları (varsa) ilgili `src/features/<feature>/components/` altına taşı, `RightSidebar` sadece layout/slot mantığını taşısın.

### Görev 11: Stripe webhook loglama gürültüsünü azalt

- **Dosya:** `backend/src/billing-routes.js`
- **Sorun:** Her webhook isteğinde hem `auditLog` hem `console.log` ile aynı bilgi iki kez yazılıyor.
- **Yapılacak:** Tek bir yapılandırılabilir logger'a (Sentry/structured logger) yönlendir, `console.log`'u kaldır veya sadece `NODE_ENV !== 'production'` iken bırak.

---

## ✅ Uygulama Sırası Önerisi

1. Görev 1, 2 (P0 — güvenlik)
2. Görev 3 (P1 — ölü kod, düşük efor/yüksek netlik kazancı)
3. Görev 5, 6 (P1 — ölçülebilirlik altyapısı)
4. Görev 4 (P1 — en efor isteyen, dosya dosya ilerlenmeli, her dosya ayrı PR)
5. Görev 7, 8, 9 (P2)
6. Görev 10, 11 (P3)

## 📎 Notlar

- Her görev ayrı PR/commit olarak ele alınmalı; özellikle Görev 3 ve 4 davranış değişikliği riski taşıdığından mevcut test paketinin (`npm run test`, `npm run e2e`, `npm run backend:test`) her adımdan sonra yeşil kalması zorunlu.
- Görev 3 (yenisrc kararı) için insan onayı gerekli — Mimo tek başına "sil" kararı vermemeli, önce içerik karşılaştırma raporu sunmalı.
- Bu liste, 15 Temmuz 2026 tarihli tam repo taramasına dayanır; yeni commit'ler sonrası satır numaraları/dosya boyutları değişmiş olabilir, görevlere başlamadan önce ilgili dosya tekrar kontrol edilmeli.
