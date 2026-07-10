# EngineerOS — Kod Kalite ve Mimari İnceleme Raporu

**Tarih:** 10 Temmuz 2026
**Kapsam:** `src/`, `backend/src/`, `supabase/migrations/`, `tests/`
**Inceleyen:** MiMo Code — Senior Software Architect & Security/Performance Reviewer

---

## 1. Yönetici Özeti (Executive Summary)

EngineerOS projesi, feature-based mimari ile düzenlenmiş, çoğunlukla tutarlı ve iyi yapılandırılmış bir React/Express fullstack uygulamasıdır. Frontend'de Zustand state yönetimi, backend'de Zod validasyonu, veritabanında Row Level Security (RLS) gibi kurumsal düzeyde araçlar doğru yerlerde kullanılmış. Ancak beberapa kritik alanlarda technical debt birikmiştir: `listening.store.ts` gibi aşırı şişkin store'lar, `CurriculumPage.tsx` gibi 1000+ satırlık devasa bileşenler, backend'de `billing.js` gibi tek dosyada multi-concern barındıran modüller, ve process-level hata yönetiminin eksikliği (unhandledRejection handler yok). Güvenlik açısından genel olarak sağlam bir durum varken, `workspaces` tablosunun migration geçmişinde RLS tanımının bulunmaması ve backend'de serviceRole key kullanımı dikkat gerektirir. Genel olarak **orta-iyi** bir kalite seviyesinde olup, aşağıda listelenen öncelikli iyileştirmelerle production-grade bir seviyeye çıkarılabilir.

---

## 2. Puanlama (10 Üzerinden)

| Kategori | Puan | Gerekçe |
|----------|:----:|---------|
| **Mimari ve Dizin Yapısı** | **8/10** | Feature-based yapı tutarlı, core/features/pages/shared ayrımı temiz. Backend'de katmanlama eksik (route+service+repo tek dosyada). |
| **Kod Kalitesi** | **7/10** | Naming conventions tutarlı, DRY genel olarak korunmuş. Ancak bazı bileşenler aşırı şişkin (1124 satır, 24 useState). |
| **Tip Güvenliği** | **9/10** | Sıfır `@ts-ignore`, sadece 5 adet `any` kullanımı (4'ü tek dosyada). TypeScript katı modda. |
| **Frontend Pratikleri** | **7/10** | Zustand store'ları iyi yapılandırılmış, ancak `listening.store.ts` (22 alan) ve `learning.store.ts` (sınırsız büyüyen arrayler) re-render riski taşıyor. |
| **Backend ve API** | **7/10** | Zod validasyonu mevcut ama eksik (billing route'larda yok). Error handling iyi ama `unhandledRejection` handler eksik. |
| **Güvenlik** | **8/10** | RLS 18 tabloda aktif, webhook imza doğrulaması doğru. `workspaces` tablosu RLS gap'i ve `allowInsecureDevAuth` riski var. |
| **Performans** | **7/10** | Frontend chunk splitting iyi, ama `listening.store.ts` her saniye re-render tetikliyor. Backend memory store'ları sınırsız büyüme riski taşıyor. |
| **Dokümantasyon ve Test** | **6/10** | Test coverage eksik — kritik feature'ların çoğu testsiz. JSDoc kullanımı yaygın değil. |

**Genel Ortalama: 7.4/10**

---

## 3. Kritik BulGular (Acil Çözüm Gerekenler)

### KRİTİK-1: Process Seviyesinde Hata Yönetimi Eksik
- **Dosya:** `backend/src/server.js`
- **Sorun:** `process.on('unhandledRejection')` ve `process.on('uncaughtException')` handler'ları tanımlı değil. Node.js 15+ sürümünde işlenmemiş promise rejection'lar process'i sessizce çökertir.
- **Risk:** Production'da beklenmeyen bir hata tüm servisi öldürebilir, logsuz.
- **Çözüm:** `server.js`'e eklenecek:
```js
process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandled-rejection]', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[uncaught-exception]', error);
  process.exit(1);
});
```

### KRİTİK-2: `workspaces` Tablosu RLS Tanımı Eksik
- **Dosya:** `supabase/migrations/`
- **Sorun:** `workspaces` tablosu backend kodunda (`workspace.js`) aktif olarak kullanılıyor, ancak migration dosyalarında `CREATE TABLE workspaces` ve ilgili RLS politikası tanımlı değil. Tablo muhtemelen manuel olarak oluşturulmuş.
- **Risk:** Tablonun RLS durumu belirsiz — veri sızıntısı riski.
- **Çözüm:** Migration dosyasında `workspaces` tablosu için açıkça RLS politikası tanımlanmalı.

### KRİTİK-3: `listening.store.ts` Aşırı Re-Render Riski
- **Dosya:** `src/features/listening/listening.store.ts` (389 satır, 22 state alanı)
- **Sorun:** Her ses ilerleme ticks'inde (`updateAudioProgress`, her saniye) store güncelleniyor. Selector kullanmayan bileşenler her saniye re-render olur.
- **Risk:** Dinleme modülünde performans düşüklüğü, mobil cihazlarda batarya tüketimi.
- **Çözüm:** Store'u parçala: `listening-missions.store.ts` (veri) ve `listening-playback.store.ts` (audio state).

---

## 4. Gelişim Alanları ve Refactor Önerileri (Öncelik Sırasına Göre)

### ÖNCELİK 1 — Yüksek

| # | Bulgu | Dosya | Öneri |
|---|-------|-------|-------|
| 1 | `billing.js` 630 satır — route, service, helper tek dosyada | `backend/src/billing.js` | 3'e böl: `billing-routes.js`, `billing-service.js`, `billing-helpers.js` |
| 2 | Billing route'larında Zod validasyonu eksik, manual `requireText()` kullanılıyor | `backend/src/billing.js:507-561` | Zod şemaları oluştur, `validateBody()` middleware'ini ekle |
| 3 | `CurriculumPage.tsx` 1124 satır, 7 useState, 4 useEffect | `src/pages/CurriculumPage.tsx` | Alt bileşenlere böl: `CurriculumSkillPanel`, `CurriculumProgress`, `CurriculumHeader` |
| 4 | `VocabularyPage.tsx` 24 useState çağrısı | `src/pages/VocabularyPage.tsx` | State'leri Zustand store'a taşı veya useReducer kullan |
| 5 | `ProfilePage.tsx` 23 useState çağrısı | `src/pages/ProfilePage.tsx` | Mevcut alt bileşenlere (`BillingSection` vb.) daha fazla state taşı |

### ÖNCELİK 2 — Orta

| # | Bulgu | Dosya | Öneri |
|---|-------|-------|-------|
| 6 | `workspace.js` 417 satır — repository + route tek dosyada | `backend/src/workspace.js` | `workspace-repository.js` ve `workspace-routes.js` olarak böl |
| 7 | `learning.store.ts` array'ler sınırsız büyüyor (`studySessions`, `scoreHistory` vb.) | `src/core/learning/learning.store.ts` | Max 500 kayıt ile sınırla veya lazy-load pattern'i uygula |
| 8 | `ai.store.ts` her tuş vuruşunda localStorage'a yazıyor (`setInput`) | `src/features/ai/ai.store.ts` | Debounced persistence: 500ms gecikme ile yaz |
| 9 | `workspace.store.ts` → `ai.store` arası cross-store bağımlılığı | `src/features/billing/workspace.store.ts` | Event bus veya callback pattern ile gevşet |
| 10 | 11 adet boş catch bloğu (en kritik: `audit-log.js:17` — remote logging'i sessizce devre dışı bırakıyor) | Çoklu dosya | Her catch'e minimum `console.warn` ekle |

### ÖNCELİK 3 — Düşük

| # | Bulgu | Dosya | Öneri |
|---|-------|-------|-------|
| 11 | `team.service.ts` 4 adet `any` kullanımı (Supabase sonuçları) | `src/features/team/team.service.ts:85,125,136,162` | Supabase generated types kullan |
| 12 | `DeveloperHubPage.tsx:245` — `as any` tip zorlaması | `src/pages/DeveloperHubPage.tsx:245` | Proper union type tanımla |
| 13 | `workspace.js` ve `ai-ledger.js` raw REST ile Supabase çağrısı (SDK yerine) | `backend/src/workspace.js`, `backend/src/ai-ledger.js` | `@supabase/supabase-js` client kullan, pattern'i tutarlı kıl |
| 14 | `subscription-repository.js` memory map'i sınırsız büyüyor | `backend/src/subscription-repository.js:17` | LRU cache pattern'i veya TTL-based eviction ekle |
| 15 | Admin audit-logs endpoint'inde query param validasyonu yok | `backend/src/app.js:156-187` | Zod şema ile query params doğrula |

---

## 5. En İyi Pratikler (Takdir Edilesi)

### 1. Temiz Feature-Based Mimari
`src/features/` altındaki 23 modülün her biri aynı iç yapıyı takip ediyor: `<feature>.store.ts`, `<feature>.service.ts`, `<feature>.types.ts`, `<feature>.helpers.ts`, `index.ts` barrel export. Bu tutarlılık, yeni geliştiricilerin projeye hızlı adapte olmasını sağlıyor.

### 2. Core Domain Soyutlama
`src/core/` altındaki `Result<T,E>` monad, event bus, repository base class'ları ve learning domain modülleri solid bir DDD (Domain-Driven Design) temeli oluşturuyor. Bu, tip安全性 ve test edilebilirliği artırıyor.

### 3. Sıfır `@ts-ignore` Kullanımı
Tüm frontend kod tabanında `@ts-ignore` veya `@ts-expect-error` bulunmuyor. Bu, TypeScript'in disiplinli kullanıldığının güçlü bir göstergesi.

### 4. Güçlü RLS Politikaları
18 tablonun tamamında RLS aktif. Tightening migration'ı `FOR ALL` politikalarını ayrı SELECT/INSERT/UPDATE/DELETE olarak parçalamış — bu, UPDATE ile `created_at` gibi değişmemesi gereken alanların korunmasını sağlıyor.

### 5. Stripe Webhook Güvenliği
Raw body korunması, `constructEvent` ile imza doğrulaması, webhook secret'inin startup'ta validasyonu — tüm güvenlik adımları doğru uygulanmış.

### 6. Zod Middleware Pattern
Backend'de `validateBody(schema)` ve `validateQuery(schema)` fabrika fonksiyonları ile tutarlı bir validasyon katmanı kurulmuş. Bu, yeni route eklerken validasyonu kolaylaştırıyor.

### 7. Audit Log Altyapısı
Batch flushing, 10K kayıt sınırı, security-definer fonksiyonlar (`is_admin()`, `is_service_role()`) ile korunan RLS politikaları — kurumsal düzeyde bir audit trail mekanizması.

### 8. Graceful Shutdown
`server.js`'de `SIGTERM` ve `SIGINT` sinyalleri için 10 saniye timeout ile zorunlu çıkış mekanizması mevcut. Bu, container ortamlarında (Railway, Docker) kritik bir özellik.

### 9. Rate Limiting
AI endpoint'leri için özel rate limiter, global rate limiting, ve IP-based bucket management — DDoS ve abuse'e karşı katmanlı koruma.

### 10. Config Validasyonu
`config.js` startup'ta tüm zorunlu environment variable'ları validate ediyor. Eksik config ile uygulama başlatılamıyor — fail-fast pattern'i doğru uygulanmış.

---

## Ek: Detaylı Bulgu Tabloları

### Frontend `any` Kullanımı (Toplam: 5)

| Dosya | Satır | Kod | Öneri |
|-------|------:|-----|-------|
| `DeveloperHubPage.tsx` | 245 | `tab.id as any` | Union type tanımla |
| `team.service.ts` | 85 | `(membership as any).organizations` | Supabase type üret |
| `team.service.ts` | 125 | `.map((m: any) => ({` | Supabase type üret |
| `team.service.ts` | 136 | `(s: any) => {` | Supabase type üret |
| `team.service.ts` | 162 | `(inv: any) => ({` | Supabase type üret |

### Backend Boş Catch Blokları (Toplam: 11)

| Dosya | Satır | Risk | Açıklama |
|-------|------:|------|----------|
| `auth.js` | 45 | Düşük | JWT local verification — null dönüyor, doğru |
| `auth.js` | 85 | Orta | Supabase token validation — 503'e dönüşüyor |
| `auth.js` | 163 | Düşük | Optional auth — kasıtlı |
| `billing.js` | 575 | Düşük | Optional auth wrapper |
| `billing.js` | 604 | Düşük | Pre-log only |
| `supabase-billing-repository.js` | 78 | Düşük | Error body fallback |
| `audit-log.js` | 17 | **Yüksek** | Remote audit logging'i sessizce devre dışı bırakıyor |
| `workspace.js` | 35 | Düşük | Error body fallback |
| `vocabulary.js` | 128 | Düşük | Cache miss fallback |
| `vocabulary.js` | 154 | Düşük | Cache write failure |
| `vocabulary.js` | 207 | Düşük | Translation degradation |

### 300+ Satırlık Frontend Dosyaları (Toplam: 25)

| Satır | Dosya |
|------:|-------|
| 1,124 | `CurriculumPage.tsx` |
| 974 | `WritingPage.tsx` |
| 911 | `VocabularyPage.tsx` |
| 906 | `ReadingPage.tsx` |
| 905 | `AnalyticsPage.tsx` |
| 895 | `AIPage.tsx` |
| 800 | `LandingPage.tsx` |
| 695 | `SpeakingPage.tsx` |
| 653 | `RightSidebar.tsx` |
| 631 | `DeveloperHubPage.tsx` |
| 544 | `OnboardingPage.tsx` |
| 532 | `ProfilePage.tsx` |
| 525 | `backend-contract.helpers.ts` |
| 505 | `LoginPage.tsx` |
| 499 | `QuickToolsPage.tsx` |
| 458 | `work-tools.data.ts` |
| 451 | `learning.missions.data.ts` |
| 443 | `GrammarPage.tsx` |
| 403 | `LearningIntelligencePage.tsx` |
| 398 | `speaking.data.ts` |
| 388 | `billing.helpers.ts` |
| 388 | `cloud-sync.service.ts` |
| 375 | `ai.helpers.ts` |
| 366 | `vocabulary.menu.ts` |
| 349 | `learning.store.ts` |

### 3+ useState İçeren Bileşenler

| useState Sayısı | Dosya |
|:---------------:|-------|
| 24 | `VocabularyPage.tsx` |
| 23 | `ProfilePage.tsx` |
| 18 | `QuickToolsPage.tsx` |
| 14 | `OnboardingPage.tsx` |
| 9 | `LoginPage.tsx`, `SpeakingPage.tsx` |
| 8 | `DeveloperHubPage.tsx` |
| 7 | `CurriculumPage.tsx`, `WorkspaceMemoryPanel.tsx`, `LearningPreferencesForm.tsx` |

---

## Sonuç

EngineerOS, iyi mimari temeller üzerine kurulmuş, güvenlik bilincine sahip bir projedir. Öncelikli olarak:

1. **Process hata yönetimi** eklenmeli (15 dakikalık iş)
2. **workspaces tablosu RLS** tanımlanmalı (30 dakika)
3. **listening.store.ts** parçalanmalı (2-3 saat)
4. **billing.js** modüllere bölünmeli (3-4 saat)
5. **Büyük bileşenler** parçalanmalı (2-3 gün, kademeli)

Bu iyileştirmeler yapıldığında proje **8.5/10** seviyesine rahatlıkla çıkacaktır.
