# 🚀 EngineerOS SaaS Master Yol Haritası ve Durum Takip Dosyası

Bu dosya, projenin SaaS dönüşüm sürecindeki tüm görevlerin güncel durumunu takip etmek ve seanslar arası kesintisiz geçiş (handover) sağlamak amacıyla oluşturulmuştur. Yeni bir yapay zeka geliştirici oturum açtığında doğrudan bu dosyayı okuyarak kaldığı yerden devam edebilir.

---

## 📍 Güncel Durum ve Sonraki Adım
*   **Aktif Görev:** `Görev 27: AI Kredi Paketleri Satışı (Top-up - Stripe)`
*   **İlerleme:** `Başlanıyor... (Plan onaylandı, Supabase veritabanı migration adımı yazılacak)`
*   **Genel Durum:** 24 Görev Tamamlandı | 11 Görev Kalan | %68.5 Tamamlanma Oranı 🚀

---

## 🏁 Yarıda Kalma Durumunda Kurtarma Adımları (Resuming Handover)
Eğer bu seans/görev esnasında bağlantı kopar veya yeni bir ajana geçilirse, aşağıdaki adımları sırasıyla takip ederek devam edin:
1.  **SQL Migration:** `supabase/migrations/202607100001_add_topup_credits.sql` dosyasını oluşturup `subscription_status` tablosuna `topup_credits` (INTEGER, Default 0) kolonu ekleyin.
2.  **Stripe Top-up Session API:** `backend/src/billing.js` içinde tek seferlik ödeme tetikleyen `/api/billing/create-topup-session` rotasını ekleyin.
3.  **Webhook Kredisi Ekleme:** `backend/src/billing.js` dosyasında `checkout.session.completed` kancasına, session metadata `type === 'topup'` ise veritabanındaki `topup_credits` değerini 50 artırma lojiğini ekleyin.
4.  **AI Ledger Kredisi Düşürme:** `backend/src/ai-ledger.js` dosyasında, kota aşımında `topup_credits > 0` ise izin verip, krediyi 1 azaltın.
5.  **Arayüz Butonları:** `src/pages/AIPage.tsx` ekranına "Kredi Satın Al" butonu ekleyerek Stripe Checkout linkine yönlendirme sağlayın.

---

## 🟢 Tamamlanan Görevler (24/35)
1.  `[x]` Görev 1: Backend JS -> TS Dönüşümü (Modeller ve tipler çıkarıldı)
2.  `[x]` Görev 2: Zod ile API İstek Doğrulama (Express middleware entegrasyonu)
3.  `[x]` Görev 4: "any" Tiplerinin Sıfırlanması (ESLint any kuralları kaldırıldı)
4.  `[x]` Görev 5: Dependency Rule Checker (Mimari katman kuralları eklendi)
5.  `[x]` Görev 6: Supabase Resmi SDK'sına Geçiş (Sorgular modernize edildi)
6.  `[x]` Görev 9: Database Connection Pooling (Soket limit aşımı engellendi)
7.  `[x]` Görev 10: Merkezi AI Klasör Yapısı (AI sağlayıcı lojikleri ayrıldı)
8.  `[x]` Görev 11: Prompt Engine (Promptlar markdown dosyalarına taşındı)
9.  `[x]` Görev 12: AI Memory Engine (RAG/Hata hafızası enjeksiyonu)
10. `[x]` Görev 13: AI Değerlendirme JSON Modu (AICoachResult otomatik parser)
11. `[x]` Görev 16: Local JWT Verification (Web Crypto Subtle ile <2ms token kontrolü)
12. `[x]` Görev 17: Redis Caching (Upstash Redis ile kelime sorgusu önbellekleme)
13. `[x]` Görev 19: Route Prefetch & Splitting (Sayfa geçiş hızı optimize edildi)
14. `[x]` Görev 22: Audit Log Altyapısı (Denetim günlükleri veri tabanına yazılıyor)
15. `[x]` Görev 23: Feature Flags (React hook ile özellik yönetimi)
16. `[x]` Görev 25: Stripe Rebranding Doğrulaması (İsim ve marka güncellemeleri)
17. `[x]` Görev 26: Çoklu Para Birimi (IP tabanlı yerel Stripe fiyatlandırma)
18. `[x]` Görev 28: OpenTelemetry & Sentry (Hata ve crash izleme)
19. `[x]` Görev 29: Health Dashboard & Monitoring (Servis kesintisi SMS/E-posta)
20. `[x]` Görev 30: E2E Playwright Test Yazımı (Kritik kullanıcı akış testleri)
21. `[x]` Görev 34: Tasarım Token Sistemi (Tailwind v4 standardizasyonu)
22. `[x]` Görev 35: i18n Backend Desteği (Accept-Language header çevirileri)
23. `[x]` Arayüz Refaktörü (Sol kilitli admin paneli butonu, 3 kolonlu düzen)
24. `[x]` Kalite Zinciri ve Prettier/Lokal Testler (%100 yeşil birim testler)

---

## 🟡 Kalan Görevler (11/35)
1.  `[ ]` Görev 3: Katman Ayrımı (App-Domain - Sıkılaştırma)
2.  `[ ]` Görev 7: Supabase RLS Sıkılaştırma (SQL düzeyinde izolasyon)
3.  `[ ]` Görev 8: Repository Pattern ile Soyutlama
4.  `[ ]` Görev 14: Cross-Skill Knowledge Graph (Akıllı Eğitim Grafı)
5.  `[ ]` Görev 15: Virtualized List (Akıcı listeleme)
6.  `[ ]` Görev 18: Offline Sync + Queue (Çevrimdışı çalışma)
7.  `[ ]` Görev 20: Multi-Tenancy Altyapısı (B2B şirket izolasyonu)
8.  `[ ]` Görev 21: Enterprise SSO Entegrasyonu (Okta/SAML)
9.  `[ ]` Görev 24: Company Dashboard (İK Ekranı)
10. `[ ]` Görev 27: AI Kredi Paketleri Satışı (Top-up - **Şu anki görev**)
11. `[ ]` Görev 31, 32, 33: Plugin SDK, Mühendislik Şablon Pazarı, No-Code AI Workflow Builder.
