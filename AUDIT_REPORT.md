# 🔍 EngineerOS (englishengineer) — Kapsamlı Denetim Raporu

> **Tarih:** 26 Temmuz 2026  
> **Sürüm:** 4.0.1  
> **Denetim Kapsamı:** Frontend (`src/`), Backend (`backend/`), Yapılandırma, Dokümantasyon (`docs/`), CI/CD, Güvenlik

---

## 📋 İçindekiler

1. [Ölü Kod Analizi](#1-ölü-kod-analizi)
2. [Kırık Bağlantılar ve Referanslar](#2-kırık-bağlantılar-ve-referanslar)
3. [Kod Kalitesi Puanı](#3-kod-kalitesi-puanı-1-10)
4. [Öneriler](#4-öneriler)

---

## 1. Ölü Kod Analizi

### 1.1 Kullanılmayan Backend Modülleri (Hiçbir yerden import edilmiyor)

Backend'de `monitoring/`, `resilience/`, `db/` alt dizinlerindeki **tüm dosyalar** hiçbir yerden import edilmemektedir. Bu dosyalar muhtemelen gelecekteki kullanım için yazılmış ancak hiç entegre edilmemiştir:

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `backend/src/monitoring/alerting.ts` | 207 | Uyarı sistemi — hiçbir yerden çağrılmıyor |
| `backend/src/monitoring/dashboard.ts` | 98 | Monitoring dashboard — yalnızca `jobs/job-processor`'ı import ediyor ama kendisi kullanılmıyor |
| `backend/src/monitoring/metrics.ts` | 183 | Metrik toplama — kullanılmıyor |
| `backend/src/resilience/circuit-breaker.ts` | 123 | Circuit breaker deseni — kullanılmıyor |
| `backend/src/resilience/retry.ts` | 75 | Retry mekanizması — kullanılmıyor |
| `backend/src/db/backup-automation.ts` | 188 | Otomatik yedekleme — kullanılmıyor |
| `backend/src/db/backup-verify.ts` | 89 | Yedek doğrulama — kullanılmıyor |
| `backend/src/db/connection-pool.ts` | 217 | Bağlantı havuzu — kullanılmıyor |
| `backend/src/db/migration-test.ts` | 139 | Migration testleri — kullanılmıyor |
| `backend/src/db/query-optimizer.ts` | 174 | Sorgu optimize edici — kullanılmıyor |
| `backend/src/session-security.ts` | 215 | Oturum güvenliği — kullanılmıyor |
| `backend/src/org-service.ts` | 279 | Organizasyon servisi — kullanılmıyor |
| `backend/src/team-service.ts` | 314 | Ekip servisi — kullanılmıyor |
| `backend/src/ai-analytics.ts` | 146 | AI analitik — kullanılmıyor |
| `backend/src/container/di-container.ts` | 143 | DI container — kullanılmıyor |
| `backend/src/api-types.ts` | ~50 | API yanıt tipleri — yalnızca `errors.ts` tarafından import ediliyor ama `ApiSuccessResponse` hiç kullanılmıyor |

**Toplam atık:** ~2,450 satır kullanılmayan backend kodu.

### 1.2 Kullanılmayan Frontend Core Modülleri

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `src/core/services/base-service.ts` | 89 | BaseService abstract sınıfı — hiçbir concrete sınıf bunu extend etmiyor |
| `src/core/services/service-registry.ts` | 50 | Servis kayıt defteri — hiç import edilmiyor |
| `src/core/services/service.types.ts` | 5 | Servis tip tanımları — hiç import edilmiyor |
| `src/core/repositories/base-repository.ts` | 125 | BaseRepository — hiç import edilmiyor |
| `src/core/repositories/repository.types.ts` | 11 | Repository tip tanımları — hiç import edilmiyor |
| `src/core/observability/sentry-lite.ts` | 15 | Sentry lite wrapper — hiç import edilmiyor (ana `ObservabilityService` ayrı dosyada) |
| `src/core/content-selection/personalized-content.service.ts` | 39 | Kişiselleştirilmiş içerik servisi — hiç import edilmiyor |
| `src/core/events/event-store.ts` | 34 | Event store — hiç import edilmiyor |
| `src/core/events/cross-feature-handlers.ts` | 50 | Cross-feature event handler'lar — hiç import edilmiyor |
| `src/shared/utils/csrf.ts` | 73 | CSRF token yardımcıları — `getCsrfToken`, `getCsrfHeaders`, `csrfFetchInit` hiç import edilmiyor |
| `src/shared/utils/storage.ts` | 53 | `EngVoxStorageManager` — hiç import edilmiyor |

**Toplam atık:** ~544 satır kullanılmayan frontend core kodu.

### 1.3 Kullanılmayan Lazy-Load Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `src/features/billing/lazy.ts` | `LazyBillingStatusPanel`, `LazyWorkspaceSelector`, `LazyWorkspaceMemoryPanel`, `LazyEntitlementGate` — hiçbir yerden import edilmiyor |
| `src/features/vocabulary/lazy.ts` | `LazyVocabularyPage`, `LazyVocabularyService`, `LazyVocabularyStore`, `LazyVocabularyData` — hiçbir yerden import edilmiyor |

### 1.4 Kullanılmayan Bileşenler (Component)

| Dosya | Açıklama |
|-------|----------|
| `src/features/progress/components/OverviewCards.tsx` | Hiçbir yerden import edilmiyor |
| `src/features/learning-intelligence/LearningMemorySummary.tsx` | Export ediliyor ama hiçbir yerde import edilmiyor |

### 1.5 Duplike Dosyalar

| Dosya Çifti | Açıklama |
|-------------|----------|
| `src/features/grammar/grammar.progress.ts` ↔ `src/features/grammar/services/grammar.progress.ts` | Aynı modülün iki farklı versiyonu. Ana versiyon (`grammar.progress.ts`) aktif kullanımda, `services/` altındaki farklı bir implementasyon içeriyor |
| `src/features/grammar/grammar.store.ts` ↔ `src/features/grammar/store/grammar.store.ts` | Aynı modülün iki farklı versiyonu. `store/grammar.store.ts` sayfalarda aktif kullanımda |

### 1.6 Commented-Out Kod Blokları

| Dosya | Satır | İçerik |
|-------|-------|--------|
| `src/features/vocabulary/index.ts` | 32 | `// export { loadVocabularyEntries, getVocabularyEntries, getVocabularyEntriesOrWait } from './data/vocabulary.data';` — intentional lazy-load notu ile |

**Not:** Genel olarak commented-out kod çok az. Bu iyi bir işaret.

### 1.7 Kullanılmayan Frontend Bağımlılıkları (package.json)

| Bağımlılık | Açıklama |
|------------|----------|
| `@types/fluent-ffmpeg` | Dev dependency — `fluent-ffmpeg` yalnızca script'lerde kullanılıyor, tipler gereksiz olabilir |
| `node-fetch` | Dev dependency — Node 22 native `fetch` destekler, bu bağımlılık gereksiz |

### 1.8 Kullanılmayan Backend Dosyaları — Ek Tespitler

| Dosya | Açıklama |
|-------|----------|
| `backend/src/api-types.ts` | `ApiSuccessResponse` tipi hiçbir zaman kullanılmıyor; yalnızca `ApiErrorResponse` `errors.ts` tarafından import ediliyor |
| `backend/scripts/ai-eval.js` | AI değerlendirme script'i — `package.json`'da script olarak tanımlı değil |

### 1.9 Console.log Kalıntıları

Frontend'de `console.log` kalıntısı **neredeyse yok** — bu iyi bir uygulama:

| Dosya | Satır | Kullanım |
|-------|-------|----------|
| `src/core/observability/sentry-lite.ts` | 14 | `console.error` — kasıtlı (error boundary) |
| `src/pages/AuthCallbackPage.tsx` | 26 | `console.error` — OAuth hata loglaması |
| `src/shared/components/PWAInstallPrompt.tsx` | 72 | `console.error` — install hatası |
| `src/shared/logger/index.ts` | 55-75 | Logger servisi — kasıtlı |

### 1.10 Gereksiz Dosyalar (Repo Root)

| Dosya | Açıklama |
|-------|----------|
| `clma.txt` | Düzeltme talimatları (Round 2) — repo'da olmaması gereken iç süreç dosyası |
| `clmem.txt` | Düzeltme talimatları (Round 4) — repo'da olmaması gereken iç süreç dosyası |
| `clyen.txt` | Düzeltme talimatları (Round 3) — repo'da olmaması gereken iç süreç dosyası |

---

## 2. Kırık Bağlantılar ve Referanslar

### 2.1 Dokümantasyon Kırık İç Referanslar

| Kaynak Dosya | Kırık Referans | Sorun |
|-------------|----------------|-------|
| `docs/README.md` | `RISK_REGISTER.md` | Dosya `docs/` altında yok, `docs/archive/RISK_REGISTER.md` altında |
| `docs/README.md` | `DATA_MODEL.md` | Dosya `docs/` altında yok, `docs/archive/DATA_MODEL.md` altında |
| `docs/README.md` | `TEST_COVERAGE_REPORT.md` | Dosya `docs/` altında yok, `docs/archive/TEST_COVERAGE_REPORT.md` altında |
| `docs/archive/BACKUP_POLICY.md:135` | `./DISASTER_RECOVERY.md` | Göreceli referans hatalı — dosya aynı dizinde (`archive/`) mevcut ama referans `./` ile aynı dizini işaret ediyor |
| `docs/archive/DATA_MODEL.md:194` | `./BACKUP_POLICY.md` | Aynı sorun — göreceli yol hatalı |

### 2.2 Dış URL Kontrolü

Kod dosyalarındaki tüm dış URL'ler kontrol edildi:

| URL | Dosya | Durum |
|-----|-------|-------|
| `https://englishengineer.vercel.app` | `src/pages/LandingPage/constants.ts:18`, `backend/src/app.ts:182` | ✅ Canlı deployment URL'si |
| `https://englishengineer-production.up.railway.app` | `backend/src/app.ts:62` | ✅ Backend production URL'si |
| `https://api.openai.com/v1/chat/completions` | `backend/src/ai-core/providers.ts:45` | ✅ OpenAI API |
| `https://api.anthropic.com/v1/messages` | `backend/src/ai-core/providers.ts:72` | ✅ Anthropic API |
| `https://generativelanguage.googleapis.com/v1beta/models/` | `backend/src/ai-core/providers.ts:101` | ✅ Google Gemini API |
| `https://api.dictionaryapi.dev/api/v2/entries/en/` | `backend/src/vocabulary-service.ts:7` | ✅ Ücretsiz sözlük API'si |
| `https://api.mymemory.translated.net/get` | `backend/src/vocabulary-service.ts:123` | ✅ MyMemory çeviri API'si |
| `https://sentry.io` | `backend/src/app.ts:176` | ✅ Sentry CSP |
| `https://unpkg.com/swagger-ui-dist@5/` | `backend/src/app.ts:388` | ✅ Swagger UI CDN |
| `https://fonts.gstatic.com` | `backend/src/app.ts:64` | ✅ Google Fonts |

**Sonuç:** Dış URL'lerin hepsi geçerli ve doğru. Kırık dış bağlantı bulunamadı.

### 2.3 Dahili Rota Referansları

Router (`src/routes/router.tsx`) içindeki tüm rotalar kontrol edildi:

| Rota | Bileşen | Durum |
|------|---------|-------|
| `/` | `LandingPage` | ✅ |
| `/pricing` | `PricingPage` | ✅ |
| `/business` | `BusinessPage` | ✅ |
| `/start` | `StartPage` | ✅ |
| `/legal/{terms,privacy,cookies,refund}` | `LegalPage` | ✅ |
| `/admin` | `AdminPage` | ✅ |
| `/dashboard` | `DashboardPage` | ✅ |
| `/onboarding` | `OnboardingPage` | ✅ |
| `/profile/:section` | `ProfilePage` | ✅ |
| `/billing` | `BillingPage` | ✅ |
| `/placement` | `PlacementPage` | ✅ |
| `/speaking` | `SpeakingPage` | ✅ |
| `/vocabulary` | `VocabularyPage` | ✅ |
| `/grammar` | `GrammarPage` | ✅ |
| `/reading` | `ReadingPage` | ✅ |
| `/writing` | `WritingPage` | ✅ |
| `/listening` | `ListeningPage` | ✅ |
| `/curriculum/:section` | `CurriculumPage` | ✅ |
| `/tools/:section` | `ToolsPage` | ✅ |
| `/progress/:section` | `ProgressPage` | ✅ |
| `/offline` | `OfflinePage` | ✅ |
| `/team` | `TeamPage` | ✅ |
| `/team/members/:memberId` | `TeamMemberPage` | ✅ |
| `/login` | `LoginPage` | ✅ |
| `/signup` | `LoginPage` | ✅ |
| `/auth/callback` | `AuthCallbackPage` | ✅ |
| `*` | `NotFoundPage` | ✅ |

**Eski rotalar (redirect'ler):**
- `/ai` → `/tools/ai` ✅
- `/analytics` → `/progress/overview` ✅
- `/gamification` → `/progress/next-steps` ✅
- `/curriculum` → `/curriculum/today` ✅
- `/learning-plan` → `/progress/next-steps` ✅
- `/beta-program` → `/dashboard` ✅

**Sonuç:** Tüm rotalar düzgün tanımlanmış. Kırık dahili rota bulunamadı.

### 2.4 Backend API Rota Analizi

Backend rotaları `backend/src/app.ts` ve ilgili route dosyalarında tanımlı:

| Endpoint | Durum |
|----------|-------|
| `GET /api/v1/health` | ✅ |
| `GET /api/health` | ✅ (legacy, deprecation header'lı) |
| `GET /api/metrics` | ✅ |
| `GET /api-docs.json` | ✅ |
| `GET /api-docs` | ✅ |
| `POST /api/csp-report` | ✅ |
| AI rotaları | ✅ `registerAIRoutes` |
| Billing rotaları | ✅ `registerBillingRoutes` |
| Admin rotaları | ✅ `registerAdminRoutes` |
| Progress rotaları | ✅ `registerProgressRoutes` |
| Reading rotaları | ✅ `registerReadingRoutes` |
| Writing rotaları | ✅ `registerWritingRoutes` |
| Listening rotaları | ✅ `registerListeningRoutes` |
| Speaking rotaları | ✅ `registerSpeakingRoutes` |
| Grammar rotaları | ✅ `registerGrammarRoutes` |
| Vocabulary rotaları | ✅ `registerVocabularyRoutes` |
| Workspace rotaları | ✅ `registerWorkspaceRoutes` |

### 2.5 Service Worker Referansı

`src/main.tsx:114` → `navigator.serviceWorker.register('/sw.js')` → `public/sw.js` ✅ Mevcut.

---

## 3. Kod Kalitesi Puanı (1-10)

### Detaylı Değerlendirme

| Kategori | Puan (1-10) | Açıklama |
|----------|-------------|----------|
| **Mimari** | 8/10 | Feature-based dizin yapısı, temiz separation of concerns. Core katmanı (events, errors, result, validation) iyi tasarlanmış. Ancak `core/services/` ve `core/repositories/` abstraction'ları hiç kullanılmıyor — over-engineering. |
| **Tip Güvenliği** | 8/10 | TypeScript strict mode aktif (`noUnusedLocals`, `noUnusedParameters`). Backend'de Zod validasyonu kullanılıyor. Tip tanımları kapsamlı. Ancak `any` kullanımı minimum düzeyde tespit edildi. |
| **Test Kapsamı** | 6/10 | 152 test dosyası / 626 kaynak dosya = ~%24 dosya bazlı coverage. Vitest coverage threshold'ları düşük: lines %65, branches %55. Kritik modüller (billing, auth, AI) için ayrı threshold'lar var (%35-45). Backend test dosyası sayısı yetersiz (18 test dosyası). |
| **Dokümantasyon** | 7/10 | 20+ doc dosyası, ADR'ler, mimari dokümanlar, compliance dokümanları mevcut. Ancak docs/README.md'de 3 kırık referans var ve arşiv dosyaları hâlâ "güncel" olarak listeleniyor. JSDoc kullanımı yaygın değil. |
| **Hata Yönetimi** | 7/10 | Merkezi `AppError` sınıfı, error codes, `Result<T,E>` pattern'i mevcut. Backend'de global error handler var. Ancak frontend'de birçok yerde basit try/catch kullanılıyor, structured error handling eksik. |
| **Bağımlılık Hijyeni** | 6/10 | ~2,450 satır kullanılmayan backend kodu, ~544 satır kullanılmayan frontend core kodu. `node-fetch` ve `@types/fluent-ffmpeg` gereksiz. Ancak Vite chunk splitting iyi yapılandırılmış. |
| **Yapılandırma** | 8/10 | Vite config iyi optimize edilmiş (vendor chunks, seed data splitting). Vitest config kapsamlı. Backend config builder pattern'i temiz. Husky, lint-staged, commitlint entegre. |
| **Güvenlik Uygulamaları** | 7/10 | Helmet, CORS, CSRF middleware, rate limiting, input sanitization (DOMPurify), CSP headers mevcut. Ancak frontend CSRF utility (`csrf.ts`) hiç kullanılmıyor — backend CSRF cookie'si ayarlıyor ama frontend bunu hiç okumuyor. `.env.staging` dosyası committed (şifre yok ama yapılandırma bilgisi var). |

### Genel Kod Kalitesi Puanı: **7.1 / 10**

**Gerekçe:** Proje iyi yapılandırılmış, modern teknolojiler kullanılıyor (React 19, Vite 6, TypeScript strict, Zustand, TanStack Query). Mimari temiz ve feature-based. Ancak significant dead code (backend'de ~2,450 satır), kullanılmayan abstraction'lar, düşük test coverage threshold'ları ve CSRF utility'nin kullanılmaması puanı düşürüyor.

---

## 4. Öneriler

### 🔴 Yüksek Etki — Acil

#### 4.1 Kullanılmayan Backend Modüllerini Temizle (Est: 2-3 saat)

Backend'de hiçbir yerden import edilmeyen **15 dosya** (~2,450 satır) kaldırılmalı:

```bash
# Kullanılmayan monitoring modülleri
rm backend/src/monitoring/alerting.ts
rm backend/src/monitoring/dashboard.ts
rm backend/src/monitoring/metrics.ts
rmdir backend/src/monitoring/

# Kullanılmayan resilience modülleri
rm backend/src/resilience/circuit-breaker.ts
rm backend/src/resilience/retry.ts
rmdir backend/src/resilience/

# Kullanılmayan db modülleri
rm backend/src/db/backup-automation.ts
rm backend/src/db/backup-verify.ts
rm backend/src/db/connection-pool.ts
rm backend/src/db/migration-test.ts
rm backend/src/db/query-optimizer.ts
rmdir backend/src/db/

# Kullanılmayan servisler
rm backend/src/session-security.ts
rm backend/src/org-service.ts
rm backend/src/team-service.ts
rm backend/src/ai-analytics.ts
rm backend/src/container/di-container.ts
rmdir backend/src/container/
```

#### 4.2 Kullanılmayan Frontend Core Modüllerini Temizle (Est: 1-2 saat)

```bash
# Kullanılmayan core abstraction'lar
rm src/core/services/base-service.ts
rm src/core/services/service-registry.ts
rm src/core/services/service.types.ts
rm src/core/repositories/base-repository.ts
rm src/core/repositories/repository.types.ts
rm src/core/observability/sentry-lite.ts
rm src/core/content-selection/personalized-content.service.ts
rm src/core/events/event-store.ts
rm src/core/events/cross-feature-handlers.ts

# Kullanılmayan utility'ler
rm src/shared/utils/csrf.ts
rm src/shared/utils/storage.ts

# Kullanılmayan lazy-load dosyaları
rm src/features/billing/lazy.ts
rm src/features/vocabulary/lazy.ts

# Kullanılmayan bileşen
rm src/features/progress/components/OverviewCards.tsx
```

#### 4.3 Duplike Dosyaları Birleştir (Est: 1 saat)

- `src/features/grammar/services/grammar.progress.ts` — farklı bir implementasyon içeriyor. Ya aktif kullanıma alınmalı ya da silinmeli.
- `src/features/grammar/store/grammar.store.ts` — aktif kullanımda. `src/features/grammar/grammar.store.ts` artık import edilmiyor, kaldırılmalı.

#### 4.4 Repo Root'taki Gereksiz Dosyaları Kaldır (Est: 5 dakika)

```bash
rm clma.txt clmem.txt clyen.txt
```

Bu dosyalar iç süreç talimatları ve `.gitignore`'da olmamasına rağmen committed.

### 🟡 Orta Etki — Kısa Vadeli

#### 4.5 Dokümantasyon Referanslarını Düzelt (Est: 30 dakika)

`docs/README.md` içindeki kırık referansları düzelt:

```diff
- | `RISK_REGISTER.md`        | Risk listesi ve mitigasyonlar              |
+ | `archive/RISK_REGISTER.md` | Risk listesi ve mitigasyonlar (arşiv)      |
- | `DATA_MODEL.md`           | Veritabanı şeması                          |
+ | `archive/DATA_MODEL.md`   | Veritabanı şeması (arşiv)                  |
- | `TEST_COVERAGE_REPORT.md` | Test coverage raporu                       |
+ | `archive/TEST_COVERAGE_REPORT.md` | Test coverage raporu (arşiv)       |
```

`docs/archive/BACKUP_POLICY.md` ve `docs/archive/DATA_MODEL.md` içindeki göreceli link'leri düzelt.

#### 4.6 CSRF Kullanımını Entegre Et (Est: 2 saat)

Backend CSRF cookie ayarlıyor (`eos_csrf`) ama frontend hiçbir yerde bunu okumuyor. İki seçenek:

1. **Frontend'i entegre et:** API isteklerinde `getCsrfHeaders()` kullan
2. **Backend CSRF'yi kaldır:** Eğer state-changing API'ler zaten auth token ile korunuyorsa, CSRF middleware gereksiz olabilir

#### 4.7 Test Coverage Threshold'larını Artır (Est: sürekli)

Mevcut threshold'lar çok düşük:

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| Lines | %65 | %75 |
| Branches | %55 | %65 |
| Functions | %60 | %70 |
| Billing | %45 | %60 |
| Auth | %45 | %60 |
| AI | %40 | %55 |

Backend test coverage threshold'ı yok — eklenmeli.

#### 4.8 `.env.staging` Dosyasını Değerlendir (Est: 15 dakika)

`.env.staging` committed ve yapılandırma bilgisi içeriyor (provider adları, sample rate). Şifre yok ama staging Supabase URL'leri gelecekte eklenebilir. `.gitignore`'a eklemeyi düşünün.

### 🟢 Düşük Etki — Uzun Vadeli

#### 4.9 Storybook Kullanımını Genişlet (Est: sürekli)

Yalnızca 9 Storybook dosyası var (626 kaynak dosya için). Kritik UI bileşenleri için Storybook hikayeleri eklenmeli.

#### 4.10 Backend Test Kapsamını Artır (Est: sürekli)

Backend'de yalnızca 18 test dosyası var. Kritik rotalar (billing webhooks, AI service, auth middleware) için daha fazla test yazılmalı.

#### 4.11 JSDoc/TSDoc Eklenmesi (Est: sürekli)

Public API'ler ve servis sınıfları için JSDoc açıklamaları eklenebilir. Özellikle `src/features/*/index.ts` barrel export'ları için.

#### 4.12 Dependency Cruiser Kurallarını Sıkılaştır (Est: 1 saat)

`.dependency-cruiser.mjs` dosyası mevcut ancak `core/` abstraction'larına erişim kısıtlamaları yok. Feature modüllerinin doğrudan `core/services/base-service` gibi kullanılmayan abstraction'lara import etmesini engelleyecek kurallar eklenebilir.

#### 4.13 Kullanılmayan Backend Tip Export'larını Temizle (Est: 30 dakika)

`backend/src/api-types.ts` — `ApiSuccessResponse` tipi hiçbir yerde kullanılmıyor. Ya `errors.ts`'deki import'u `types.d.ts`'den yapın ya da dosyayı birleştirin.

---

## Özet Tablo

| Alan | Değer |
|------|-------|
| **Toplam kaynak dosya** | 626 (frontend) + ~60 (backend) |
| **Toplam test dosyası** | 152 |
| **Ölü kod (satır)** | ~2,994 satır (backend: 2,450 + frontend: 544) |
| **Duplike dosya** | 2 çift (grammar modülü) |
| **Kullanılmayan modül** | 27 dosya |
| **Kırık doküman referansı** | 5 |
| **Kırık rota** | 0 |
| **Kırık dış URL** | 0 |
| **Kod kalitesi puanı** | **7.1/10** |

---

*Rapor otomatik denetim aracı tarafından oluşturulmuştur. 26 Temmuz 2026 tarihinde geçerlidir.*
