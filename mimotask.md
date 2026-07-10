# 🤖 Mimo Otonom Görev Listesi (Offline Sync & Repository Pattern)

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
4.  **Tip Güvenliği:** Kod yazarken asla `any` kullanma. TypeScript interface/tip tanımlamalarını eksiksiz yap ve ESLint kurallarına birebir uy.

---

## 📅 Görev Listesi

### 📶 Görev 1: Offline Sync & Queue (Çevrimdışı Çalışma Altyapısı)

- **Açıklama:** Tarayıcı çevrimdışı olduğunda giden istekleri kuyruğa alıp, cihaz tekrar çevrimiçi olduğunda bunları otomatik olarak backend'e gönderip eşitleyen bir mekanizma kur.
- **Kapsam:**
  - `src/shared/offline/sync-queue.ts` adında bir servis oluştur. Bu servis giden API isteklerini `LocalStorage` veya `IndexedDB` kullanarak saklayacak bir kuyruk (`SyncQueue`) barındırsın.
  - Kuyruktaki her iş şu bilgileri taşımalıdır: `id`, `url`, `method`, `body`, `headers`, `timestamp`, `retries`.
  - Ağ bağlantısını dinleyen bir mekanizma kur (`window.addEventListener('online', ...)`). İnternet bağlantısı sağlandığında kuyruktaki işler sırayla işlensin.
  - Bu kuyruk yapısını frontend servislerinde (`ReadingService.submitMission`, `WritingService.submitMission`, `VocabularyService.submitReview`) entegre et. Eğer ağ hatası alınırsa veya cihaz offline ise, işlem kuyruğa atılmalı ve kullanıcıya "Çevrimdışı kaydedildi" gibi bir hata/durum dönülmelidir.
  - Vitest testleri yaz: `src/shared/offline/sync-queue.test.ts` altında tüm kuyruğa alma, offline-online geçişi ve eşitleme senaryolarını test et.
  - `npm run quality:gate` veya `npm run test` ile tüm testlerin yeşil olduğunu doğrula.

---

### 🏛️ Görev 2: Repository Pattern ile Veri Soyutlama (Frontend & Backend)

- **Açıklama:** Veri erişim işlemlerini doğrudan Supabase SDK'sı veya API endpoint çağrıları yapmak yerine Repository Pattern arkasında soyutlayarak kod kalitesini artır.
- **Backend Kapsamı:**
  - `backend/src/repositories/` klasörü altına `workspace.repository.js` ve `user.repository.js` ekle ve Supabase veritabanı sorgularını bu sınıflara taşı.
  - Backend rotalarındaki (`backend/src/routes/workspaces.js` vb.) doğrudan Supabase sorgularını bu yeni repository metotları ile değiştir.
- **Frontend Kapsamı:**
  - `src/features/vocabulary/` altında `vocabulary.repository.ts` ve `src/features/workspace/` altında `workspace.repository.ts` oluşturularak sunucu API isteklerini buralarda soyutla.
  - İlgili servisler doğrudan axios/fetch yapmak yerine bu repository'leri kullansın.
- **Doğrulama:**
  - `npx tsc --noEmit` ve `npm run test` / `npm run backend:test` çalıştırarak tüm backend ve frontend birim testlerinin çalıştığını doğrula.
