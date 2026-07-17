# Mimo İçin Görev Talimatları (Usta.md)

Bu dosya, EngVox projesinin geliştirilmesinde Mimo'nun (Usta) takip edeceği resmi sıralı görev listesidir. 

---

## 🛠️ Mimo (Usta) İçin Çalışma Kuralları

1.  **Sıralı İlerleme:** Görevleri kesinlikle **Kademe 1**'den başlayarak sırayla yapmalısın. Bir kademe tamamen bitmeden diğerine geçilmemelidir.
2.  **Otomatik Doğrulama & Canlıya Alma:** Her kademedeki kod değişikliklerini tamamladıktan sonra sırasıyla:
    *   `npm run typecheck` (Tip kontrolü)
    *   `npm run lint` (ESLint kontrolü)
    *   `npm run test` ve `npm run backend:test` (Birim testleri)
    komutlarını çalıştırarak doğrulamalısın.
3.  **Onaysız Push & Deploy:** Eğer tüm testler başarıyla geçerse, **kullanıcıdan onay beklemeden** değişiklikleri GitHub'a push etmeli, ardından Vercel (`npx vercel --prod --yes`) ve Railway deploy süreçlerinin tetiklendiğinden emin olmalısın.
4.  **Durum Güncelleme:** Canlıya alma başarılı olduktan sonra, bu dosyada (`Usta.md`) ilgili kademenin yanındaki `[ ]` kutucuğunu `[x] YAPILDI` olarak güncellemeli ve localde kaydetmelisin.
5.  **Kredi Tasarrufu:** Bu iş akışı sayesinde Antigravity (Mimar) gereksiz kredi tüketmeyecek, ağır kodlama ve operasyon işçiliğini sen üstleneceksin.

---

## 📋 Geliştirme Kademeleri

### [ ] Kademe 1: WorkspaceTab Split
*   **Açıklama:** Çok büyük ve karmaşık olan `src/pages/WritingPage/components/WorkspaceTab.tsx` (ESLint complexity: 21) bileşenini alt bileşenlere bölerek karmaşıklığını 10'un altına düşür.
*   **İşlem:** UI parçalarını (düzeltme listeleri, editör kontrolleri vb.) temiz alt dosyalara çıkart.
*   **Durum:** Beklemede (Yapıldığında buraya `[x] YAPILDI` yazılacak).

### [ ] Kademe 2: Vocabulary Modül Alt Alan Bölümü (Sub-domain Split)
*   **Açıklama:** `src/features/vocabulary/` altındaki 25 dosyayı sub-domain sınırlarına göre temiz klasör yapılarına böl ve import yollarını güncelle.
*   **Durum:** Beklemede.

### [ ] Kademe 3: Seed Dosyalarını TS'den JSON'a Geçirmek & Lazy Load Entegrasyonu
*   **Açıklama:** `b1.seed.ts` ve `b2.seed.ts` gibi 3 MB'lık devasa kelime seed dosyalarını statik JSON formatına dönüştür. Uygulama yüklenirken bunları lazy-load (CDN veya dinamik import) ile getirerek bundle boyutunu küçült.
*   **Durum:** Beklemede.

### [ ] Kademe 4: En Yüksek Karmaşıklıklı UI Bileşenlerinin Bölünmesi
*   **Açıklama:** `BillingSection.tsx` (complexity: 37) ve `WordCard.tsx` (complexity: 37) bileşenlerini ufak fonksiyonel bileşenlere bölerek karmaşıklıklarını 10'un altına indir.
*   **Durum:** Beklemede.

### [ ] Kademe 5: Barrel Deep Import Temizliği
*   **Açıklama:** `VocabularyMenuService`, `GrammarProgressService` gibi servislerin dosyalar içinde barrel (`index.ts`) üzerinden çağrılmasını engelleyerek doğrudan dosya yollarıyla import edilmesini sağla.
*   **Durum:** Beklemede.

### [ ] Kademe 6: GrammarPage Header Sadeleştirme (Aşama 2)
*   **Açıklama:** `GrammarPage.tsx` dosyasındaki aşırı kalabalık üst bilgiyi (tabs, navigation vb.) sadeleştir. Ünite ağacını ana içerik alanına taşıyarak temiz bir düzen elde et.
*   **Durum:** Beklemede.

### [ ] Kademe 7: Sayfa Konsolidasyonu & Progress Hub (Adım 3)
*   **Açıklama:** Progress Hub (2 sekme) navigasyon ayarlarını, prefetch yapılarını ve deep-link yönlendirmelerini tamamlayarak sayfaları birleştir.
*   **Durum:** Beklemede.

### [ ] Kademe 8: learning.store Sınır Güvenliği ve ai.store Debouncing
*   **Açıklama:** `learning.store` içindeki `getInitialState` dizilerine sınır kontrolü (array bounds guards) ekle. `ai.store` altındaki `setInput` fonksiyonuna debounce entegre et.
*   **Durum:** Beklemede.

### [ ] Kademe 9: Backend Test Coverage & Storybook Bağımlılık Güncellemesi
*   **Açıklama:** Auth, billing ve AI backend modüllerine birim testler ekleyerek test kapsamını artır. Storybook'un eskiyen `uuid` paket bağımlılığını güncelle.
*   **Durum:** Beklemede.

### [ ] Kademe 10: SaaS Özellikleri — Cmd + K Arama Paneli
*   **Açıklama:** Site genelinde her sayfadan klavye kısayoluyla tetiklenen, hızlı arama ve navigasyon sağlayan Cmd+K arayüzünü tasarla ve entegre et.
*   **Durum:** Beklemede.

### [ ] Kademe 11: SaaS Özellikleri — PR Review Polite Coach
*   **Açıklama:** Yazılımcının kaba/eksik kod inceleme yorumlarını alıp profesyonel ve kibar İngilizceye dönüştüren hızlı optimizasyon aracını ekle.
*   **Durum:** Beklemede.

### [ ] Kademe 12: SaaS Özellikleri — AI Teknik Mülakat Simülatörü
*   **Açıklama:** System Design ve Coding mülakatlarını sesli olarak yöneten, kullanıcının telaffuz ve teknik doğruluğunu puanlayan yapay zeka simülatörünü geliştir.
*   **Durum:** Beklemede.

### [ ] Kademe 13: SaaS Özellikleri — EngVox GitHub Action Bot
*   **Açıklama:** PR ve commit mesajlarındaki gramer hatalarını inceleyip düzeltme önerilerini PR altına sitemizin linkiyle birlikte bırakan GitHub Action botunu yaz.
*   **Durum:** Beklemede.

### [ ] Kademe 14: SaaS Özellikleri — B2B Takım Yönetim Portalı
*   **Açıklama:** Yazılım firmalarının ekiplerine toplu eğitim lisansı ataması yapabileceği, ekip ilerleme ve kelime başarı grafiklerini izleyebileceği yönetici panelini kur.
*   **Durum:** Beklemede.

### [ ] Kademe 15: Backend TypeScript Migrasyonu & README Düzenlemesi
*   **Açıklama:** Backend klasöründeki 45 adet JavaScript dosyasını TypeScript'e dönüştür. README dosyasındaki AI sağlayıcı çelişkilerini (Gemini/OpenAI) gider.
*   **Durum:** Beklemede.
