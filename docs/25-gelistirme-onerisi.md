# EngVox Gerçek Hayat Geliştirme Önerileri

> 50 somut, uygulanabilir geliştirme — her biri üretilebilirrosis, user value ve ROI odaklı.

---

## 🔵 FRONTEND — 25 Öneri

### Kullanıcı Deneyimi (UX)

| #    | Öneri                            | Açıklama                                                                                                                                                                                   | Etki            | Süre    |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ------- |
| F-01 | **Skeleton Loading乐观主义**     | Her sayfa için真实 content yapısına uygun skeleton shimmer ekle (şu an sadece Dashboard ve Grammar'da var). Vocabulary, Reading, Writing sayfaları yükleme sırasında boş beyaz gösteriyor. | ounce rate ↓20% | 2 gün   |
| F-02 | **Toast Bildirim Sistemi**       | Başarılı kayıt, görev tamamlama, hata durumları için TOAST bildirimleri. Şu an sadece hata var ama başarı bildirimi yok. "Vocabulary set mastered!" gibi gamification feedback'i eksik.    | Engagement ↑    | 1.5 gün |
| F-03 | **Skeleton → Content Animasyon** | Veri yüklendiğinde skeleton'dan real content'e fade-in + slide animasyonu. motion/zaten var, sadece apply edilmemiş.                                                                       | Premium his     | 1 gün   |
| F-04 | **Empty State Illüstrasyonları** | Boş sayfalar için actionable empty states: "No missions yet — start your first reading!" + CTA butonu. Şu an sadece text var.                                                              | Conversion ↑    | 1.5 gün |
| F-05 | **Keyboard Shortcut Panel**      | Ctrl+K ile command palette var ama kullanıcıya gösterilmiyor. İlk girişte "Pro tip: Ctrl+K ile hızlıca navigate edin" toast'ı ekle.                                                        | Adoption ↑      | 0.5 gün |

### Learnability & Onboarding

| #    | Öneri                              | Açıklama                                                                                                                           | Etki            | Süre  |
| ---- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----- |
| F-06 | **İlk Kullanıcı Walkthrough**      | StartPage'de 3 adımlık interaktif tour: "Pick discipline → Try a lesson → See your progress". Tours.js veya custom implementation. | Activation ↑40% | 3 gün |
| F-07 | **Interactive Demo Without Login** | Landing page'de "Try a sample lesson" butonu — kayıt olmadan 3 soruluk mini vocabulary quiz. Guest mode ile demo.                  | Signup ↑        | 4 gün |
| F-08 | **Progress Nudge System**          | Dashboard'da "You haven't practiced today — 10 min grammar keeps your streak alive!" gibi personalized reminders.                  | Retention ↑     | 2 gün |

### Gamification & Engagement

| #    | Öneri                          | Açıklama                                                                                                                                                        | Etki              | Süre    |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| F-09 | **Daily Streak Calendar**      | Profile/Progress sayfasında GitHub tarzı heat map calendar — her gün pratik yapılan günleri göster. Heatmap component'i zaten var, sadece profile'a eklenmemiş. | Streak ↑          | 1.5 gün |
| F-10 | **Achievement Badges Gallery** | Profilde unlock edilen rozetleri galeri formatında göster. Achievement tipi zaten learning.types'ta var ama UI'da gösterilmiyor.                                | Motivation ↑      | 2 gün   |
| F-11 | **XP Progress Bar animasyonu** | XP kazanıldığında bar'ın animation ile dolması. useAnimatedNumber zaten var, Progress sayfasında kullanılabilir.                                                | Delight ↑         | 1 gün   |
| F-12 | **Leaderboard (Team)**         | Team sayfasında üyeleri XP/streak'e göre sıralayan leaderboard tablosu. Team feature'ı zaten var ama competitive element eksik.                                 | Team engagement ↑ | 3 gün   |

### Performance & PWA

| #    | Öneri                        | Açıklama                                                                                                                                               | Etki              | Süre    |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------- |
| F-13 | **Route Prefetching**        | Sidebar'daki menü items'a hover'da prefetch. prefetchRoute zaten Navigation.tsx'te var ama sadececrawlable link'lerde çalışıyor. Hover tetikleme ekle. | Nav speed ↑       | 1 gün   |
| F-14 | **Image Optimization**       | Landing page'deki görseller için lazy loading + WebP format + srcset. Şu an tüm görseller eager load.                                                  | LCP ↓30%          | 1.5 gün |
| F-15 | **Offline Vocabulary Drill** | Service worker zaten var (sw.js). IndexedDB'de vocabulary data ile tamamen offline vocabulary quiz modu ekle.                                          | Offline UX ↑      | 4 gün   |
| F-16 | **Bundle Analysis CI**       | Her PR'de bundle size diff'i gösteren GitHub Action.体积 regression'ı erken yakalar.                                                                   | Performance guard | 1 gün   |

### Accessibility & Internationalization

| #    | Öneri                       | Açıklama                                                                                | Etki       | Süre  |
| ---- | --------------------------- | --------------------------------------------------------------------------------------- | ---------- | ----- |
| F-17 | **ARIA Labels Audit**       | Tüm interactive元素lere aria-label ekle. Button, input, select'lerin çoğu eksik.        | WCAG AA    | 2 gün |
| F-18 | **RTL Support**             | Localization zaten var ama Arabic RTL layout desteği yok. direction:rtl CSS + flex反转. | i18n ready | 3 gün |
| F-19 | **Error Page Improvements** | NotFoundPage'i marka tasarımına uyarla + "Did you mean..." önerileri + arama kutusu.    | UX ↑       | 1 gün |

### Monetization & Conversion

| #    | Öneri                          | Açıklama                                                                                                       | Etki         | Süre    |
| ---- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| F-20 | **Feature Gating Visual Cues** | Locked feature'larda kilit ikonu + "Upgrade to unlock" overlay. Şu an sadece redirect var ama visual hint yok. | Upgrade ↑    | 2 gün   |
| F-21 | **Pricing Comparison Table**   | PricingPage'de feature-by-feature karşılaştırma tablosu. Şu an sadece card'lar var, karşılaştırma yapmak zor.  | Conversion ↑ | 2 gün   |
| F-22 | **Exit Intent Modal**          | Pricing sayfasından ayrılırken "Wait! Get 20% off your first month" popup.                                     | Conversion ↑ | 1.5 gün |

### Code Quality

| #    | Öneri                          | Açıklama                                                                                               | Etki                | Süre  |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------- | ----- |
| F-23 | **E2E Store Reset Helper**     | TD-018'deki store leak sorunu için shared resetStores.ts helper. Tüm Zustand store'ları reset eder.    | CI reliability ↑    | 1 gün |
| F-24 | **Visual Regression Tests**    | Percy veya Chromatic ile her PR'de screenshot diff. Landing page, Dashboard, Pricing kritik sayfalar.  | Regression guard    | 2 gün |
| F-25 | **Storybookinteraction Tests** | Tüm shared component'ler için Storybook interaction test. Button click, form submit, modal open/close. | Component quality ↑ | 3 gün |

---

## 🟢 BACKEND — 25 Öneri

### API & Reliability

| #    | Öneri                       | Açıklama                                                                                                                   | Etki                    | Süre  |
| ---- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----- |
| B-01 | **API Response Caching**    | Redis veya in-memory cache for vocabulary, grammar, reading data. Her istekte Supabase'e gitmek yerine cache'den serve et. | Latency ↓60%, Cost ↓40% | 3 gün |
| B-02 | **Request Idempotency**     | Stripe webhook'ları ve AI requests için idempotency key. Aynı istek tekrar geldiğinde duplicate işlem yapma.               | Data integrity ↑        | 2 gün |
| B-03 | **Circuit Breaker Pattern** | AI provider (OpenAI/Gemini) down olduğunda fallback mekanizması. 5 hata → 30s bekle → retry.                               | Availability ↑          | 2 gün |
| B-04 | **Health Check Endpoint**   | `/api/health` endpoint'i — dependency status (Supabase, AI, Stripe), uptime, version bilgisi.                              | Ops visibility ↑        | 1 gün |
| B-05 | **Request Queue for AI**    | AI istekleri için job queue (Bull/BullMQ). Rate limit aşıldığında queue'ya al, sırayla işle.                               | UX ↑, Cost control      | 3 gün |

### Security

| #    | Öneri                      | Açıklama                                                                                                                        | Etki           | Süre    |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- |
| B-06 | **Rate Limiting Per User** | Her user için AI request limiti — free: 5/gün, junior: 20/gün, master: unlimited. Şu an global rate limit var ama per-user yok. | Cost control ↑ | 2 gün   |
| B-07 | **Input Sanitization**     | AI coaching input'ları için XSS/ injection koruması. DOMPurify frontend'te var ama backend'te de validate edilmeli.             | Security ↑     | 1.5 gün |
| B-08 | **API Key Rotation**       | Supabase, AI provider key'leri için otomatik rotation. Environment variable versioning.                                         | Security ↑     | 2 gün   |
| B-09 | **Audit Log Enhancement**  | Her data mutation'ı için audit log: user_id, action, before/after, IP. Şu an sadece admin audit var.                            | Compliance ↑   | 2 gün   |
| B-10 | **CORS Tightening**        | production'da sadece eng-vox.vercel.app'a izin ver. Şu an wildcard varyasyonları var.                                           | Security ↑     | 0.5 gün |

### Business Logic

| #    | Öneri                         | Açıklama                                                                                                              | Etki                  | Süre    |
| ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------- | ------- |
| B-11 | **Webhook Retry Logic**       | Stripe webhook'lar için exponential backoff retry. 5xx hatalarda 3 retry, 1s/5s/25s intervals.                        | Payment reliability ↑ | 2 gün   |
| B-12 | **Subscription Grace Period** | Payment failed'da 3 gün grace period — hemen block yerine uyarı ver.                                                  | Churn ↓               | 1.5 gün |
| B-13 | **Usage Metering API**        | AI usage, vocabulary reviews, module attempts'i track eden metering endpoint. Billing page'de real-time usage göster. | Transparency ↑        | 2.5 gün |
| B-14 | **Email Notifications**       | Welcome email, streak reminder, weekly progress report. SendGrid veya Resend integration.                             | Retention ↑           | 3 gün   |
| B-15 | **Team Analytics Dashboard**  | Team plan için manager dashboard: member progress, engagement metrics, team average.                                  | Enterprise value ↑    | 4 gün   |

### Performance & Monitoring

| #    | Öneri                           | Açıklama                                                                                          | Etki              | Süre    |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| B-16 | **Structured Logging**          | JSON format logging with correlation IDs. Her request'e unique ID, user_id, duration.             | Debugging ↑       | 1.5 gün |
| B-17 | **AI Cost Tracking**            | Her AI isteği için token count, model, cost kaydı. Günlük/aylık AI spend dashboard.               | Cost visibility ↑ | 2 gün   |
| B-18 | **Database Connection Pooling** | Supabase connection pool optimizasyonu. Max connections, idle timeout ayarları.                   | Reliability ↑     | 1 gün   |
| B-19 | **API Response Compression**    | gzip/brotli compression for API responses. Vocabulary data 100KB+, compression ile 20KB'ya düşer. | Bandwidth ↓70%    | 1 gün   |
| B-20 | **Performance Monitoring**      | Response time histogram, error rate alerts, throughput metrics. Prometheus + Grafana.             | Ops visibility ↑  | 2 gün   |

### Data & Analytics

| #    | Öneri                          | Açıklama                                                                                             | Etki                   | Süre    |
| ---- | ------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------- | ------- |
| B-21 | **Learning Analytics API**     | User'ın hangi konularda zayıf olduğunu analiz eden endpoint. AI coach'a context olarak kullanılır.   | AI quality ↑           | 3 gün   |
| B-22 | **Content Freshness Tracking** | Vocabulary/grammar content'lerin son güncellenme tarihini track et. Stale content alert.             | Content quality ↑      | 1.5 gün |
| B-23 | **A/B Test Backend**           | Frontend feature flags için backend API: variant assignment, event tracking, conversion metrics.     | Product optimization ↑ | 3 gün   |
| B-24 | **Export/Backup API**          | User'ın tüm verisini (progress, vocabulary, writing) JSON/PDF olarak export etmesi. GDPR compliance. | Compliance ↑           | 2.5 gün |
| B-25 | **Multi-tenant Isolation**     | Team plan için tenant-level data isolation. Her şirketin verisi birbirinden izole.                   | Enterprise ready ↑     | 4 gün   |

---

## 📊 Öncelik Sıralaması (ROI bazlı)

### Hemen Yapılabilir (1-2 gün, yüksek etki)

1. **F-01** Skeleton Loading — UX anında düzelir
2. **F-05** Keyboard Shortcut Toast — Adoption artar
3. **B-04** Health Check — Ops visibility anında
4. **B-10** CORS Tightening — Security quick win
5. **B-19** Response Compression — Performance anında

### Kısa Vadeli (2-4 gün, yüksek ROI)

6. **F-06** Onboarding Walkthrough — Activation ↑40%
7. **F-07** Demo Without Login — Signup ↑
8. **F-20** Feature Gating Visual — Upgrade ↑
9. **B-06** Per-User Rate Limit — Cost control
10. **B-11** Webhook Retry — Payment reliability

### Orta Vadeli (3-5 gün, stratejik)

11. **F-15** Offline Vocabulary — PWA value
12. **F-12** Team Leaderboard — Enterprise feature
13. **B-14** Email Notifications — Retention ↑
14. **B-15** Team Analytics — Enterprise value
15. **B-21** Learning Analytics — AI quality

---

_Son güncelleme: Ağustos 2026_
