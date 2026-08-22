# ENGVOX — 25 Gerçek Hayata Dokunan Geliştirme Önerisi

## FRONTEND (1–15)

1. **Offline Mode / PWA Cache** — Çeviri corpus'unu (`vocabulary-translations.json`) Service Worker ile cache'leyip uçakta/metroda çalıştır.
2. **Keyboard-Only Navigation** — Tüm ders akışını (cevap seçimi, sonraki soru) `Tab` + `Enter` ile kullanılabilir hale getir (erişilebilirlik).
3. **Dark/Light/Auto Theme Toggle** — `localStorage` + `system preference` ile otomatik geçiş; `index.css`'de `prefers-color-scheme` desteği.
4. **Voice Input (Speech-to-Text)** — `Web Speech API` (`SpeechRecognition`) ile Speaking/Listening alıştırmalarında mikrofonla cevap alma.
5. **Progress Bar & Streak Visualizer** — `learning.store`'taki `streak` ve `xp`'yi animasyonlu (`framer-motion`) grafikle göster.
6. **Micro-Animation Feedback** — Doğru/yanlış cevapta `lucide-react` ikonları ile kısa `scale` + `color` animasyonu.
7. **Mobile-First Responsive** — Mevcut sidebar'ı alt menü (`bottom-nav`) olarak yeniden tasarla; dokunmatik hedef boyutlarını (`min 48px`) artır.
8. **Copy-to-Clipboard** — Çeviri sonuçlarını, cümle örneklerini tek tıkla panoya kopyalama (`navigator.clipboard`).
9. **Export PDF / Print Mode** — `window.print()` veya `@media print` CSS ile ders sonuçlarını, kelime listesini PDF çıktısı alabilme.
10. **Search & Filter Vocabulary** — `vocabulary` havuzunda gerçek zamanlı filtreleme (`fuse.js` gibi) seviye, kategori, başarı durumuna göre.
11. **Notification / Reminder System** — `Notification API` ile günlük ders hatırlatıcısı; `zustand`'ta `reminderTime` sakla.
12. **Social Sharing (Open Graph)** — Başarı ekranını (`LessonCompleteScreen`) Twitter/X ve LinkedIn paylaşım kartı (`meta` etiketleri) ile sun.
13. **Accessibility Audit (axe-core)** — `playwright` + `@axe-core/playwright` ile her build'de otomatik erişilebilirlik kontrolü.
14. **Real-Time Collaboration (Peer Review)** — Writing/Grammar alıştırmalarında aynı sınıftan kullanıcıların cevaplarını anonim olarak karşılaştırma.
15. **Gamified Badge System** — `learning.achievements.data.ts`'yi genişlet; belirli kombinasyonlarda (`streak > 7`, `accuracy > 90%`) özel rozet aç.

## BACKEND (16–25)

16. **Rate Limiting & Abuse Protection** — AI (`/api/ai`) ve Stripe webhook endpoint'lerine IP bazlı `express-rate-limit` ekle.
17. **Web Analytics / Event Logging** — Supabase'de `analytics` tablosu oluştur; kullanıcı davranışlarını (`lesson_start`, `vocab_search`, `checkout`) JSON olarak kaydet.
18. **Email Notification Service** — `nodemailer` veya `SendGrid` ile haftalık ilerleme raporu (`weekly_digest`) ve streak kırılma uyarısı gönder.
19. **A/B Testing Framework** — `feature-flags.config.ts`'yi backend'de de destekle; yeni ders sırasını veya fiyatlandırmayı kullanıcı segmentine göre test et.
20. **Data Export API** (`/api/export/user-data`) — GDPR uyumlu `JSON` / `CSV` indirme; kullanıcı profil, öğrenme geçmişi, abonelik bilgisi.
21. **Health Check Endpoint** — `/health` → DB bağlantısı (`Supabase`), Stripe API, AI proxy durumu (`ok` / `degraded`) döndür.
22. **Backup & Disaster Recovery Script** — `supabase` veritabanı günlük `pg_dump` ile yedekle; `backblaze` veya `AWS S3`'e otomatik yükle.
23. **API Versioning** (`/api/v2/`) — Mevcut endpoint'leri bozmadan yeni özellikleri (`v2`) altına taşı; `deprecation` header'ları ekle.
24. **Security Headers Middleware** — `helmet` ile `CSP`, `HSTS`, `X-Frame-Options`, `Referrer-Policy` ekle.
25. **Performance Monitoring** (`/metrics`) — `prometheus` formatında bellek, istek süresi, DB sorgu süresi metriklerini sun; Vercel + Railway entegrasyonuyla alarm kur.
