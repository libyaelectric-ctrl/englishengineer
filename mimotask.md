# 🤖 Mimo Otonom Görev Listesi (Supabase RLS & Virtualized List)

Merhaba Mimo! Bu dosyadaki **2 kritik ve sıfır AI API kredisi tüketen** görevi sırasıyla yerine getireceksin. Her adımı tamamladıktan sonra test edip onay alarak ilerle.

---

## ⚡ Kritik Uygulama ve Deploy Kuralları (Otomasyon)

1.  **Sıralı İlerleme:** Görev 1 tamamen bitip test edilmeden Görev 2'ye başlama.
2.  **Otomatik Git & Deploy (Her Görev Sonunda):**
    - Her görevi başarıyla tamamladığında ve testlerden geçirdiğinde otomatik olarak şu komut zincirini çalıştır:
      ```powershell
      git add . ; git commit -m "feat(mimo): completed mimotask X" ; git push ; npx vercel --prod
      ```
3.  **Derleme Kontrolü:** Her görev sonunda mutlaka `npm run build` veya `npx tsc --noEmit` çalıştırarak yazdığın kodların TypeScript derlemesini bozmadığından emin ol.

---

## 📅 Görev Listesi

### 🔒 Görev 1: Supabase RLS (Row Level Security) Sıkılaştırma

- **Açıklama:** Veri tabanında yer alan tüm tablolar için (profiles, user_settings, subscription_status, assessment_snapshots, task_attempts, writing_attempts, listening_attempts, speaking_attempts, audit_logs) RLS politikalarını gözden geçir ve sıkılaştır.
- **Kapsam:**
  - `supabase/migrations/` altında yeni bir SQL migration dosyası oluştur.
  - Her kullanıcının yalnızca kendi `user_id` sine ait satırları INSERT, SELECT, UPDATE ve DELETE yapabilmesini sağla.
  - Admin rolüne sahip kullanıcıların (profiles tablosundaki `role === 'admin'`) audit_logs ve profilleri görebilmesine izin veren RLS politikaları ekle.
- **Canlı Sonuç:** SQL düzeyinde veri izolasyonu sağlanır; bir kullanıcının başkasının verilerine erişmesi imkansız hale gelir.

---

### ⚡ Görev 2: Virtualized List (Akıcı Kaydırma Entegrasyonu)

- **Açıklama:** Kullanıcının kelime listelerinde ve geçmiş aramalarında yüksek sayıda veri listelendiğinde tarayıcı donmalarını engellemek için listeleri sanallaştır.
- **Kapsam:**
  - `react-virtuoso` kütüphanesini projeye dahil et: `npm install react-virtuoso`.
  - `src/pages/VocabularyPage/MyVocabularySection.tsx` içindeki uzun kelime listesini `react-virtuoso`'nun `<FlatList>` veya `<Virtuoso>` bileşeni ile sarmalayarak sadece ekranda görünen öğelerin DOM'a basılmasını sağla.
  - Eski klasik `.map(...)` listeleme yapısını kaldırıp sanallaştırılmış yapıya geçir.
- **Canlı Sonuç:** Kelime listesinde 10.000 kelime dahi olsa, sayfa donmadan ve kasmadan 120 FPS akıcılıkta kaydırılabilir.
