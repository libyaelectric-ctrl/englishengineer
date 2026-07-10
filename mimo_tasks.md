# 🤖 Mimo Otomasyon Master Görev Listesi (14 Görev)

Merhaba Mimo! Bu dosya, senin bu oturumda **Antigravity**'den bağımsız olarak sırasıyla gerçekleştireceğin kendi başına (self-contained) **14 görevi** ve otomasyon talimatlarını içerir.

---

## ⚡ Kritik Uygulama ve Deploy Kuralları (Otomasyon)

1.  **Sıralı İlerleme:** Görevleri kesinlikle sırayla yap. Bir görevi tamamen bitirmeden, test etmeden ve doğrulamadan bir sonrakine geçme.
2.  **Otomatik Git & Deploy (Her 3 Görevde Bir):**
    - Tamamladığın **her 3 görevde bir** kullanıcıya sormadan otomatik olarak şu komut zincirini çalıştır:
      ```powershell
      git add . ; git commit -m "feat(mimo): completed tasks X, Y, Z" ; git push ; npx vercel --prod
      ```
    - Bu komut hem frontend'i Vercel'e deploy edecek hem de `git push` ile Railway backend deploy pipeline'ını tetikleyecektir.
3.  **Derleme Kontrolü:** Her görev sonunda mutlaka `npm run build` veya `npx tsc --noEmit` çalıştırarak yazdığın kodların TypeScript derlemesini bozmadığından emin ol.

---

## 📅 Görev Listesi

### 🛠️ Faz 1: Tip Güvenliği ve Doğrulama (Görev 1 - 5)

#### **Görev 1: API Request Validation (Zod Şemaları)**

- **Açıklama:** Backend API katmanına (`backend/src/`) gelen tüm parametreleri doğrulamak için Zod şemaları yaz ve middleware olarak entegre et.
- **Kapsam:** `/api/ai/` prompt limitleri, `/api/vocabulary` arama/ekleme parametreleri ve `/api/workspace` parametreleri.
- **Canlı Sonuç:** Geçersiz veya zararlı formatta gelen istekler doğrudan sunucu girişinde 400 Bad Request ile engellenir.

#### **Görev 2: Birim ve Entegrasyon Testleri Yazımı**

- **Açıklama:** Görev 1'de yazdığın Zod doğrulama şemalarını ve hata durumlarını sınayan Express backend testleri yaz.
- **Kapsam:** `backend/test/` klasörü altına validation test senaryolarını ekle ve `npm run backend:test` ile doğrula.
- **Canlı Sonuç:** Hatalı veya kötü niyetli girdilerin API'yi çökertmediği test düzeyinde garanti edilir.

#### **Görev 3: Kalan "any" Tiplerinin Sıfırlanması**

- **Açıklama:** Kod genelinde (özellikle test dosyalarında ve eski sayfalarda) susturulmuş olan `@typescript-eslint/no-explicit-any` kurallarını temizle.
- **Kapsam:** Tip eşleşmelerini generic yapılar veya doğru arayüzlerle (interface) değiştir.
- **Canlı Sonuç:** Gelecekte yapılacak kod değişikliklerinde beklenmeyen veri tipi patlamaları (null/undefined hataları) engellenir.

---

> 🚀 _Burada 1. Otomatik Git & Deploy tetiklenecektir! (Görev 1, 2, 3 bittiği için)_

---

#### **Görev 4: Dependency Rule Checker Entegrasyonu**

- **Açıklama:** Mimarinin katman kurallarını (örn: veri tabanı lojiğinin UI'a gömülmesini) engelleyecek lint kuralı ekle.
- **Kapsam:** Projeye `dependency-cruiser` kur kural tanımlarını yap.
- **Canlı Sonuç:** Başka araçlar veya geliştiriciler kod yazarken katman bağımlılık ihlalleri CI/CD aşamasında yakalanır.

#### **Görev 5: Backend JS -> TS Dönüşüm Hazırlığı**

- **Açıklama:** Backend dosyalarındaki veri modelleri için TypeScript interface tanımlarını yap.
- **Kapsam:** `backend/src/` içindeki veri yapılarının tiplerini çıkar.
- **Canlı Sonuç:** Arka planın TS refaktörü için zemin hazırlanır.

---

### 🧠 Faz 2: AI Prompt & Performans Optimizasyonu (Görev 6 - 9)

#### **Görev 6: Prompt Centralization (Prompt Engine)**

- **Açıklama:** Backend kodunun içine gömülü olan AI Prompt şablonlarını dışarıya taşı.
- **Kapsam:** `backend/src/prompts/` klasörü oluşturarak promptları JSON veya Markdown dosyası olarak ayır ve kodda dinamik oku.
- **Canlı Sonuç:** Kod deploy etmeden sadece prompt dosyalarını güncelleyerek AI yanıt kalitesi iyileştirilebilir.

#### **Görev 7: Route Prefetching & Code Splitting**

- **Açıklama:** Frontend rotalarındaki (`src/routes/router.tsx`) sayfa geçiş performansını optimize et.
- **Kapsam:** Kullanıcı menü öğelerinin üzerine geldiğinde (hover) ilgili rotayı prefetch eden tetikleyiciler ekle.
- **Canlı Sonuç:** Sayfa geçiş gecikmeleri en aza iner, geçişler hissettirilmeden gerçekleşir.

---

> 🚀 _Burada 2. Otomatik Git & Deploy tetiklenecektir! (Görev 4, 5, 6 bittiği için)_

---

#### **Görev 8: i18n Backend Dil Desteği**

- **Açıklama:** Backend hata sınıflarının (`backend/src/errors.js`) kullanıcının `Accept-Language` header isteğine göre Türkçe/İngilizce mesajlar dönmesini sağla.
- **Kapsam:** Basit bir hata çeviri sözlüğü oluştur ve middleware üzerinden dile göre hata mesajlarını map'le.
- **Canlı Sonuç:** Kullanıcı arayüz dilini Türkçe yaptığında backend'den dönen validasyon hataları da Türkçe gösterilir.

#### **Görev 9: Merkezi Design Token Sistemi**

- **Açıklama:** Tailwind v4 yapılandırmasında ve renk değişkenlerinde anlık kullanılan CSS sınıflarını standardize et.
- **Kapsam:** `src/index.css` içindeki renk ve yarıçap (radius) CSS değişkenlerini temiz bir düzene oturt.
- **Canlı Sonuç:** Arayüzün tüm alanlarında tasarım dili ve renk tutarlılığı korunur, Whitelabel desteği kolaylaşır.

---

### 🛡️ Faz 3: Enterprise & İzleme Altyapısı (Görev 10 - 14)

#### **Görev 10: Audit Log Altyapısı**

- **Açıklama:** Kritik admin veya kullanıcı işlemlerini izleyen bir loglama yapısı kur.
- **Kapsam:** Rol değişiklikleri, ödeme webhook kayıtları ve admin paneli işlemlerini `audit_logs` tablosuna yazacak backend lojiği ekle.
- **Canlı Sonuç:** Kurumsal müşteriler için kritik işlemler geriye dönük izlenebilir hale gelir (SOC2 uyumluluğu).

---

> 🚀 _Burada 3. Otomatik Git & Deploy tetiklenecektir! (Görev 7, 8, 9 bittiği için)_

---

#### **Görev 11: Feature Flags (Özellik Bayrakları)**

- **Açıklama:** Yeni geliştirilen özellikleri dinamik olarak açıp kapatabileceğimiz altyapıyı kur.
- **Kapsam:** Veritabanı flag tablosu veya local config üzerinden özellikleri dinamik yöneten bir React hook'u yaz.
- **Canlı Sonuç:** Yeni bir AI modülü tüm kullanıcılara açılmadan önce pilot beta grubu için tek tıkla açılıp kapatılabilir.

#### **Görev 12: Çoklu Para Birimi (Yerel Fiyatlandırma)**

- **Açıklama:** Kullanıcının IP adresine göre Stripe üzerinden uygun yerel fiyat kartlarının gösterilmesini sağla.
- **Kapsam:** Coğrafi IP'ye göre para birimini (TRY/EUR/USD) seçen frontend lojiği ekle.
- **Canlı Sonuç:** Bölgesel fiyatlandırma sayesinde satış dönüşüm oranları (Conversion) artar.

#### **Görev 13: OpenTelemetry & Sentry (Telemetry)**

- **Açıklama:** Kullanıcıların yaşadığı crash'leri ve API gecikmelerini izleyen yapı kur.
- **Kapsam:** Sentry veya LogRocket entegrasyonu ile hata loglarının toplanmasını sağla.
- **Canlı Sonuç:** Canlıda hata yaşayan bir kullanıcının hangi satırda hata aldığı anlık rapor olarak admin paneline düşer.

---

> 🚀 _Burada 4. Otomatik Git & Deploy tetiklenecektir! (Görev 10, 11, 12 bittiği için)_

---

#### **Görev 14: E2E Playwright Kullanıcı Akış Testleri**

- **Açıklama:** `src/e2e/` altına kritik kullanıcı akışlarını (Login, Dashboard ders başlangıcı ve Kelime ekleme/arama) simüle eden Playwright testleri yaz.
- **Canlı Sonuç:** Kritik müşteri senaryolarının her build'da sorunsuz çalıştığı tarayıcı düzeyinde garanti edilir.

---

> 🚀 _Burada 5. Otomatik Git & Deploy tetiklenecektir! (Görev 13 ve 14 bittiği için)_

---
