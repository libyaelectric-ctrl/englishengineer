# 🏢 EngineerOS (EngVox) — Ekip Yönetimi (Team Management) Dokümantasyonu

> **Sürüm:** 4.0.1  
> **Modül:** `src/features/team` & `src/pages/TeamPage.tsx`  
> **Erişim Yetkisi:** `projectWorkspace` (Project / Enterprise Plan)  

---

## 🎯 1. Ne Amaçla Eklendi? (Business & Product Objective)

**Team (Ekip Yönetimi) Modülü**, EngineerOS’in **B2B (Kurumsal)** ve **Ekip Tabanlı** satış stratejisinin temel taşıdır.

* **Kurumsal Müşteri Odağı:** Mühendislik firmaları, MEP (Mekanik-Elektrik-Tesisat) müteahhitleri, inşaat şirketleri, yazılım & mühendislik danışmanlık ofisleri için tasarlanmıştır.
* **Toplu Lisans Dağıtımı:** Proje müdürleri veya İK yöneticilerinin, ekiplerindeki mühendislere tek merkezden lisans atayıp onların Teknik İngilizce gelişimini takip etmesini sağlar.
* **Şirket İçi Yetkinlik Artırımı:** Uluslararası projelerde (FIDIC sözleşmeleri, uluslararası şartnameler, yabancı müşterilerle toplantılar) mühendislerin dil engellerini ortadan kaldırmayı hedefler.

---

## ⚡ 2. Mevcutta Ne Yapar? (Aktif Mimari ve Özellikler)

Modül uçtan uca mimarisi tamamlanmış ve çift katmanlı (Dual-Provider) olarak kodlanmıştır:

```
                  ┌──────────────────────────────────────────┐
                  │          useTeamStore (Zustand)          │
                  └────────────────────┬─────────────────────┘
                                       │
                             TeamService.getWorkspace()
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        isSupabaseConfigured() = True         isSupabaseConfigured() = False
       ┌───────────────────────────────┐     ┌───────────────────────────────┐
       │     SupabaseTeamProvider      │     │       DemoTeamProvider        │
       └───────────────┬───────────────┘     └───────────────┬───────────────┘
                       │                                     │
           Canlı DB Tabloları (RLS)                  Zengin Statik Demo
           - organization_members                     Mühendislik Verisi
           - organization_invitations
           - team_progress_summaries
```

### Aktif Özellik Listesi:
1. **Çift Katmanlı Veri Sağlayıcı (Dual-Provider Architecture):**
   * Canlı ortamda Supabase DB tabloları (`organization_members`, `organization_invitations`, `team_progress_summaries`) üzerinden RLS güvenliğiyle çalışır.
   * Supabase kapalı veya demo modunda ise zengin örnek mühendis verileriyle sorunsuz sunum sağlar.
2. **Toplu Davet & Lisans Yönetimi (`BulkLicenseAssign`):**
   * Çoklu e-posta girilerek mühendislere davet gönderimi (`bulkInviteMembers`).
   * Davet iptal etme (`cancelInvitation`) ve yeniden davet tetikleme (`resendInvitation`).
3. **Ekip Analitiği ve Metrikleri (`TeamStats`):**
   * Toplam üye sayısı, aktif lisanslar, ortalama CEFR seviyesi (A1, A2, B1, B2, C1, C2) dökümü.
4. **Mühendis Detay Kartları (`TeamMemberList`):**
   * Her bir mühendisin (QA/QC, MEP, Lead Engineer vb.) Okuma, Yazma, Dinleme, Konuşma, Kelime ve Dilbilgisi skorlarının tek ekranda izlenmesi.
   * Mühendislerin en çok hata yaptığı teknik kategorilerin tespiti.

---

## 🔒 3. Neden Kilitli ve Hangi Paket Amaçlıdır?

### Neden Kilitli?
Ekran `EntitlementGate` bileşeni ile sarmalanmıştır. Bireysel kullanıcıların şirket düzeyindeki yönetim özelliklerine erişip karmaşa yaşamaması için kilitli tutulmaktadır.

### Hangi Paket Amaçlıdır?
* **Paket Adı:** **"Project Plan"** veya **"Enterprise Corporate Tier"**
* **Fiyatlandırma Hedefi:** Kullanıcı/Mühendis başı **$5 / ay** veya kurumsal yıllık sözleşmeler.
* **Kilit Açılma Şartı:** Kullanıcı aboneliğinde `projectWorkspace` yetkisi tanımlandığında kilit otomatik olarak kalkar ve yönetim paneli açılır.

---

## 🚀 4. Neler Yapılması Planlanıyor? (Gelecek Yol Haritası)

1. **Proje & Şantiye Bazlı Gruplama:**
   * Mühendislerin projelere göre ayrılması (Örn: *"Katar Metro Projesi Ekibi"*, *"Almanya Veri Merkezi Ekibi"*).
2. **Otomatik PDF/CSV İK Raporlaması:**
   * İnsan Kaynakları ve Proje Müdürleri için tek tıkla aylık gelişim ve sertifikasyon raporu alma.
3. **Ekip İçi Canlı Pratik & Simülasyonlar:**
   * Aynı ekipten iki mühendisin sözleşme pazarlığı veya teknik kabul toplantısı simülasyonu yapabilmesi.
4. **Saha Özgü Özelleştirilmiş Müfredat Atama:**
   * Proje müdürünün belirli mühendislere doğrudan ilgili teknik paketleri (Örn: *"FIDIC Claim İngilizcesi"* veya *"MEP Commissioning Vocab"*) zorunlu görev olarak atayabilmesi.

---

## 🛠️ 5. Ne Eksik ve Canlı Kurumsal Dağıtım İçin Ne Gerekiyor?

Sayfanın arayüzü, frontend mağazası, veri modelleri ve Supabase SQL şemaları tamamen hazırdır. Canlı kurumsal satışa geçmek için aşağıdaki 3 harici entegrasyon gerekmektedir:

| Gereksinim | Durum | Açıklama |
| :--- | :--- | :--- |
| **SMTP / E-posta Servisi Entegrasyonu** | ⏳ Bekliyor | Davet e-postalarının mühendislere otomatik gitmesi için SendGrid / Resend veya Supabase Auth SMTP konfigürasyonu. |
| **Stripe Per-Seat (Koltuklu) Faturalandırma** | ⏳ Bekliyor | Yeni mühendis eklendikçe Stripe abonelik miktarının (`subscription.quantity`) otomatik güncellenmesi. |
| **Kurumsal SSO (Single Sign-On)** | 💡 Opsiyonel | Büyük kurumsal müşteriler için Google Workspace / Azure AD (SAML) giriş entegrasyonu. |

---

## 📌 Özet Tablosu

| Metrik / Soru | Cevap / Durum |
| :--- | :--- |
| **Sayfa Amacı:** | Kurumsal mühendislik ekipleri için lisans ve gelişim yönetim paneli |
| **Hangi Paket:** | **Project Plan ($5/ay)** & Kurumsal Paketler |
| **Mevcut Kod Durumu:** | %100 Hazır (Frontend + State + Supabase DB + Demo Fallback) |
| **Erişim Mantığı:** | `EntitlementGate` (`projectWorkspace` yetkisi) |
| **Canlıya Geçiş Şartı:** | Resend/SendGrid e-posta gönderici konfigürasyonu |
