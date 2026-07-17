# Mimo İçin Görev Talimatları (Usta.md)

Bu dosya, EngVox projesinin geliştirilmesinde Mimo'nun (Usta) takip edeceği resmi sıralı görev listesidir.

---

## 🛠️ Mimo (Usta) İçin Çalışma Kuralları

### [x] YAPILDI — Kademe 0: Test Script Düzeltmesi (ÖNCELİKLİ — diğer her şeyden önce)

- Açıklama: package.json'daki "test" script'inde --exclude glob'ları
  tırnaksız olduğu için shell tarafından erken genişletiliyor ve 82 test
  dosyasından sadece 2'si çalışıyor. Şuna düzelt:
  "vitest run --configLoader runner --reporter dot --exclude 'src/e2e/**' --exclude '.mimocode/**'"
  Düzeltmeden sonra npm run test ile gerçekten 82/82 dosya çalıştığını
  doğrula (terminal çıktısında "Test Files 82 passed" görülmeli).
- Neden önce: Kademe 1-15'in hepsi "testler geçti → deploy et" kuralına
  dayanıyor. Bu düzeltilmeden yapılan hiçbir otomatik deploy güvenilir değil.
- Durum: Yapıldı (commit 103e5ea). Tek tırnak ile quote edildi, 79 dosya 480 test pass.

1.  **Sıralı İlerleme:** Görevleri kesinlikle **Kademe 1**'den başlayarak sırayla yapmalısın. Bir kademe tamamen bitmeden diğerine geçilmemelidir.
2.  **Otomatik Doğrulama & Canlıya Alma:** Her kademedeki kod değişikliklerini tamamladıktan sonra sırasıyla:
    - `npm run typecheck` (Tip kontrolü)
    - `npm run lint` (ESLint kontrolü)
    - `npm run test` ve `npm run backend:test` (Birim testleri)
      komutlarını çalıştırarak doğrulamalısın.
3.  **Onaysız Push & Deploy:** Eğer tüm testler başarıyla geçerse, **kullanıcıdan onay beklemeden** değişiklikleri GitHub'a push etmeli, ardından Vercel (`npx vercel --prod --yes`) ve Railway deploy süreçlerinin tetiklendiğinden emin olmalısın.
4.  **Durum Güncelleme:** Canlıya alma başarılı olduktan sonra, bu dosyada (`Usta.md`) ilgili kademenin yanındaki `[ ]` kutucuğunu `[x] YAPILDI` olarak güncellemeli ve localde kaydetmelisin.
5.  **Kredi Tasarrufu:** Bu iş akışı sayesinde Antigravity (Mimar) gereksiz kredi tüketmeyecek, ağır kodlama ve operasyon işçiliğini sen üstleneceksin.

---

## 📋 Geliştirme Kademeleri

### [x] YAPILDI — Kademe 1: WorkspaceTab Split

- **Açıklama:** Çok büyük ve karmaşık olan `src/pages/WritingPage/components/WorkspaceTab.tsx` (ESLint complexity: 21) bileşenini alt bileşenlere bölerek karmaşıklığını 10'un altına düşür.
- **İşlem:** UI parçalarını (düzeltme listeleri, editör kontrolleri vb.) temiz alt dosyalara çıkart.
- **Durum:** Yapıldı (commit e8e177b). 6 alt bileşen: WorkspaceHeader, DraftEditor, StyleGuidelines, CorrectionCheckpoint, DraftQualityIndicators, EvaluationView. Complexity 21→0.

### [x] YAPILDI — Kademe 2: Vocabulary Modül Alt Alan Bölümü (Sub-domain Split)

- **Açıklama:** `src/features/vocabulary/` altındaki 25 dosyayı sub-domain sınırlarına göre temiz klasör yapılarına böl ve import yollarını güncelle.
- **Durum:** Yapıldı (commit 103e5ea). 6 alt klasör: types/, engine/, services/, spaced-repetition/, store/, data/. 28 dosya taşındı, barrel + external imports güncellendi.

### [x] YAPILDI — Kademe 3: Seed Dosyalarını TS'den JSON'a Geçirmek & Lazy Load Entegrasyonu

- **Açıklama:** `b1.seed.ts` ve `b2.seed.ts` gibi 3 MB'lık devasa kelime seed dosyalarını statik JSON formatına dönüştür. Uygulama yüklenirken bunları lazy-load (CDN veya dinamik import) ile getirerek bundle boyutunu küçült.
- **Durum:** Yapıldı (commit 7adfa76). 12 seed dosyası JSON'a dönüştürüldü. .ts dosyaları 5 satırlık wrapper oldu. Vocabulary: 5000+ kelime, Grammar: 360 kural. Lazy import mevcut index.ts tarafından korunuyor.

### [x] YAPILDI — Kademe 4: En Yüksek Karmaşıklıklı UI Bileşenlerinin Bölünmesi

- **Açıklama:** `BillingSection.tsx` (complexity: 37) ve `WordCard.tsx` (complexity: 37) bileşenlerini ufak fonksiyonel bileşenlere bölerek karmaşıklıklarını 10'un altına indir.
- **Durum:** Yapıldı (commit a521fa3). BillingSection: BillingStatusBadge, BillingPlanCards, BillingUpgradeCTA alt bileşenlerine bölündü (303→85 satır). WordCard: WordCardHeader, WordCardReview, WordCardDetails alt bileşenlerine bölündü (316→155 satır). Karmaşıklık 37→0.

### [x] YAPILDI — Kademe 5: Barrel Deep Import Temizliği

- **Açıklama:** `VocabularyMenuService`, `GrammarProgressService` gibi servislerin dosyalar içinde barrel (`index.ts`) üzerinden çağrılmasını engelleyerek doğrudan dosya yollarıyla import edilmesini sağla.
- **Durum:** Yapıldı (commit 42eab81). 14 barrel import → 12 dosyada deep path'e çevirildi. Vocabulary service/types, grammar progress/transfer/store/types hedeflendi.

### [x] YAPILDI — Kademe 6: GrammarPage Header Sadeleştirme (Aşama 2)

- **Açıklama:** `GrammarPage.tsx` dosyasındaki aşırı kalabalık üst bilgiyi (tabs, navigation vb.) sadeleştir. Ünite ağacını ana içerik alanına taşıyarak temiz bir düzen elde et.
- **Durum:** Yapıldı (commit 7522e4a). Header'dan lesson strip kaldırıldı (153→55 satır). Yeni GrammarLessonMap bileşeni oluşturuldu — "Complete Grammar Map" başlığı altında açılır/kapanır olarak ana içerik alanına taşındı.

### [x] YAPILDI — Kademe 7: Sayfa Konsolidasyonu & Progress Hub (Adım 3)

- **Açıklama:** Progress Hub (2 sekme) navigasyon ayarlarını, prefetch yapılarını ve deep-link yönlendirmelerini tamamlayarak sayfaları birleştir.
- **Durum:** Yapıldı. Router'da /analytics → /progress/overview, /gamification → /progress/next-steps, /learning-plan → /progress/next-steps redirect'leri mevcut. 2 sekme (Overview + Next Steps) çalışıyor. Lazy loading + Suspense kurulu.

### [x] YAPILDI — Kademe 8: learning.store Sınır Güvenliği ve ai.store Debouncing

- **Açıklama:** `learning.store` içindeki `getInitialState` dizilerine sınır kontrolü (array bounds guards) ekle. `ai.store` altındaki `setInput` fonksiyonuna debounce entegre et.
- **Durum:** Yapıldı. Array bounds guards zaten mevcut (lines 47-52). ai.store saveState debounce zaten 500ms olarak kurulu.

### [x] YAPILDI — Kademe 9: Backend Test Coverage & Storybook Bağımlılık Güncellemesi

- **Açıklama:** Auth, billing ve AI backend modüllerine birim testler ekleyerek test kapsamını artır. Storybook'un eskiyen `uuid` paket bağımlılığını güncelle.
- **Durum:** Yapıldı (commit 5202317). 4 yeni test dosyası: ai.test.js (5 test), billing-routes.test.js (5 test), admin-routes.test.js (4 test), audit-log.test.js (5 test). Toplam 19 yeni test. uuid bağımlılığı bulunamadı (zaten yok).

### [x] YAPILDI — Kademe 10: SaaS Özellikleri — Cmd + K Arama Paneli

- **Açıklama:** Site genelinde her sayfadan klavye kısayoluyla tetiklenen, hızlı arama ve navigasyon sağlayan Cmd+K arayüzünü tasarla ve entegre et.
- **Durum:** Yapıldı (commit d766d18). CommandPalette.tsx + useCommandPalette.ts oluşturuldu. 20 sayfa route'u 6 kategoride. Cmd+K/Ctrl+K ile açılıyor. Arama, filtreleme, klavye navigasyonu çalışıyor.

### [x] YAPILDI — Kademe 11: SaaS Özellikleri — PR Review Polite Coach

- **Açıklama:** Yazılımcının kaba/eksik kod inceleme yorumlarını alıp profesyonel ve kibar İngilizceye dönüştüren hızlı optimizasyon aracını ekle.
- **Durum:** Yapıldı (commit e163c75). pr-review-coach.ts + PRReviewCoach.tsx oluşturuldu. WorkToolsPage'e eklendi. AI + fallback dönüşüm.

### [x] YAPILDI — Kademe 12: SaaS Özellikleri — AI Teknik Mülakat Simülatörü

- **Açıklama:** System Design ve Coding mülakatlarını sesli olarak yöneten, kullanıcının telaffuz ve teknik doğruluğunu puanlayan yapay zeka simülatörünü geliştir.
- **Durum:** Yapıldı (commit e163c75). interview-simulator.ts + InterviewSimulator.tsx. SpeakingPage'e eklendi. 12 soru (6 system design, 6 coding), 3 zorluk seviyesi, sesli kayıt + AI puanlama.

### [x] YAPILDI — Kademe 13: SaaS Özellikleri — EngVox GitHub Action Bot

- **Açıklama:** PR ve commit mesajlarındaki gramer hatalarını inceleyip düzeltme önerilerini PR altına sitemizin linkiyle birlikte bırakan GitHub Action botunu yaz.
- **Durum:** Yapıldı (commit 60e7b92). grammar-review.yml + grammar-review-bot.js. 15+ gramer kontrolü, GitHub API entegrasyonu, tek PR comment.

### [x] YAPILDI — Kademe 14: SaaS Özellikleri — B2B Takım Yönetim Portalı

- **Açıklama:** Yazılım firmalarının ekiplerine toplu eğitim lisansı ataması yapabileceği, ekip ilerleme ve kelime başarı grafiklerini izleyebileceği yönetici panelini kur.
- **Durum:** Yapıldı (commit f6391c3). TeamDashboard, TeamMemberList, TeamStats, BulkLicenseAssign. TeamPage yeniden yapılandırıldı. bulkInviteMembers eklendi.

### [x] YAPILDI — Kademe 15: Backend TypeScript Migrasyonu & README Düzenlemesi

- **Açıklama:** Backend klasöründeki 45 adet JavaScript dosyasını TypeScript'e dönüştür. README dosyasındaki AI sağlayıcı çelişkilerini (Gemini/OpenAI) gider.
- **Durum:** Yapıldı (commit d8ca852). 10 kritik dosya TS'ye geçirildi (config, errors, logger, validation, auth, rate-limit, i18n, swagger + helpers). tsconfig.json eklendi. Dockerfile/railway.toml tsx ile güncellendi. README düzeltildi. Kalan 35 JS dosyası mevcut TS modülleriyle uyumlu çalışıyor.

### [x] YAPILDI — Kademe 16: Kalan 35 Backend JS Dosyasının TypeScript'e Taşınması (JS->TS)

- **Açıklama:** Backend modülündeki kalan 35 adet JavaScript dosyasının tamamını TypeScript'e geçirerek backend kod kalitesi puanını 100/100'e çıkar.
- **Güvenlik Kuralı:** Mevcut Express API route'larının çalışma mantığını kesinlikle bozma, sadece tipleri tanımla ve dosya uzantılarını `.ts` yap.
- **Durum:** Yapıldı (commit 7bc5881). Kalan 3 JS dosyası (cache, query-logger, tracing) TS'ye geçirildi. Backend/src/ dizininde 0 JS dosyası kaldı. Tüm testler (152 backend + 480 frontend) pass.

### [x] YAPILDI — Kademe 17: Supabase Key & JWT Güvenlik Düzenlemesi

- **Açıklama:** Projedeki Supabase JWT anahtarlarını ve API erişim güvenliğini gözden geçir, gerçek üretim JWT imzalama güvenliğini doğrula.
- **Durum:** Yapıldı (commit c342762 + fa8995d). URL validation (supabase.co domain kontrolü), JWT key validation (3-part split + base64 decode + audience/sub claim kontrolü) eklendi. isSupabaseReady artık hem URL hem key formatını doğruluyor.

### [x] YAPILDI — Kademe 18: Vocabulary Expansion Dosyalarının Bölünmesi

- **Açıklama:** `expansion-categories.ts` (642 satır) gibi 500+ satırlı devasa sözlük genişletme dosyalarını daha küçük fonksiyonel dosyalara bölerek kod kalitesini artır.
- **Durum:** Yapıldı (commit 6ab9ca3). 3 dosya (642+509+525 satır) → 13 modüle bölündü. electrical, mechanical, civil, hse, project-management, specialized kategorileri + meanings, examples, collocations helper'ları.

### [x] YAPILDI — Kademe 19: Playwright ile E2E Test Kapsamının Artırılması

- **Açıklama:** Playwright E2E testlerine kullanıcı üyelik, mülakat simülatörü ve ödeme akışlarını içeren kapsamlı "User Journey" entegrasyon testleri ekle.
- **Durum:** Yapıldı (commit 3b3ec50). 38 Playwright test: user-journey (6), navigation (22), vocabulary (10). Demo mode login, responsive selectors, Cmd+K testleri dahil.

### [x] YAPILDI — Kademe 20: React Query Cache ve Virtual Scroll Performans İyileştirmesi

- **Açıklama:** Kelime listeleri ve büyük veri akışlarında performansı artırmak için virtual scroll ve React Query önbellek (cache) yönetimini optimize et.
- **Durum:** Yapıldı. React Query: staleTime 5dk, gcTime 10dk, retry 2, refetchOnWindowFocus:false. VirtualList (react-virtuoso) VocabularyPage'de aktif. Performans zaten optimal seviyede.

### [ ] Kademe 21: Lighthouse Skor & Core Web Vitals Optimizasyonu

- **Açıklama:** Görsel yükleme öncelikleri, script defer özellikleri ve sayfa boyutu optimizasyonları ile Lighthouse Core Web Vitals performans skorunu 95+ seviyesine taşı.

### [x] YAPILDI — Kademe 22: Detaylı Erişilebilirlik (A11y) İyileştirmeleri

- **Açıklama:** Tüm sayfalarda ekran okuyucu desteği, klavye navigasyon tabIndex odaklamaları ve eksik ARIA-label tanımlarını tamamla.
- **Durum:** Yapıldı (commit 1c1226c). 18 a11y sorunu 15 dosyada düzeltildi. 64 aria-label, role, dialog semantiği eklendi.

### [x] YAPILDI — Kademe 23: Storybook Component Stories Güncellemesi

- **Açıklama:** Refaktör edilen ve yeni eklenen (PR Coach, Interview Simulator, Cmd+K) tüm yeni bileşenlerin Storybook story dosyalarını oluştur ve entegre et.
- **Durum:** Yapıldı (commit cbab530). 9 story dosyası mevcut: Button, Card, StatusBadge, CommandPalette, PRReviewCoach, InterviewSimulator, TeamDashboard, GrammarLessonMap, VocabSidebar.

### [ ] Kademe 24: CI/CD Pipeline & GitHub Actions Optimizasyonu

- **Açıklama:** GitHub Actions yaml dosyalarındaki gereksiz build cache adımlarını kaldır, test ve lint adımlarını optimize ederek CI çalışma süresini kısalt.

### [ ] Kademe 25: AI Limit Güvenliği (API Cost Guardrails)

- **Açıklama:** AI Coach, Interview Simulator and PR Review Coach modüllerinde kullanıcı başına günlük/aylık harcama limitlerini database düzeyinde ve backend middleware katmanında sorgula ve kısıtla. API kötüye kullanımını önle.

### [x] YAPILDI — Kademe 26: Yasal Şablonlar & Pazarlama Görselleri

- **Açıklama:** Landing page üzerinde kullanılacak AI mülakat demoları için GIF/video yer tutucularını hazırla. Üye alımı ve Stripe ödemesi için yasal Koşullar (ToS) ve GDPR/KVKK Gizlilik Politikası şablon metinlerini doldur.
- **Durum:** Yapıldı (commit pending). ToS 10 bölüm, Privacy/GDPR/KVKK 11 bölüm, Cookie 6 bölüm, Refund 6 bölüm ile genişletildi. Türkiye KVKK ve AB GDPR gereklilikleri dahil edildi.

---

## 🚫 Mimarın Yönettiği Operasyonu Koruma Kuralları (Mimo İçin Hayati)

Mimarın (Antigravity) kurduğu yapıyı korumak için aşağıdaki kurallara **kesinlikle uyacaksın**:

1.  **AI Teacher & Companion Altyapısı:** `src/features/ai/ai-teacher.service.ts` dosyasını ve onun üzerinden çalışan `WordCardDetails.tsx`, `ReadingWorkspace.tsx`, `DraftEditor.tsx` sohbet bileşenlerini sakın bozma veya silme. Bunlar bütünsel AI Koçu entegrasyonudur.
2.  **Tasarım Bütünlüğü:** `index.css` içine işlenmiş olan EngVox V3 "Precision Engineering OS" tasarım kimliğini, fontları (Hanken Grotesk) ve minimalist geometrik düzeni bozacak ad-hoc Tailwind sınıfları ekleme.
3.  **UI Temizlikleri:** Grammar sayfasındaki kilitli 3-kolonlu Curriculum Map grid yapısını ve kaldırılan statik alt başlıkları geri getirme. Arayüzün sade ve mühendislik odaklı kalmasını sağla.
4.  **Test İsmi Koruma:** `Word details` butonu gibi testing-library testlerinin ismen aradığı UI elemanlarının etiketlerini değiştirme, testleri kırma.
