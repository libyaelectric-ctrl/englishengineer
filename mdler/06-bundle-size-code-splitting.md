# Görev: Bundle boyutunu ölç, code-splitting/lazy-loading uygula

## Bağlam
`docs/TECH_DEBT.md` (TD-004) bundle boyutunun 200KB'ı geçtiğini not ediyor
ve "code splitting, lazy loading" öneriyor ama bu henüz uygulanmamış
görünüyor. Proje zaten `npm run analyze` (`ANALYZE=true npm run build`,
`rollup-plugin-visualizer` ile) script'ine sahip — bu script'i kullan.

## Yapılacaklar
1. Mevcut durumu ölç:
   ```bash
   npm run analyze
   ```
   Çıkan bundle analiz raporunu incele, en büyük 5-10 chunk/modülü not al.
2. `src/routes/router.tsx` içindeki route tanımlarını incele. Sayfa
   bileşenlerinin (`src/pages/*`) `React.lazy()` + `Suspense` ile lazy-load
   edilip edilmediğini kontrol et. Edilmiyorsa, en azından şu sayfalar için
   lazy-load ekle (büyük/az sıklıkla ziyaret edilen sayfalar öncelikli):
   - `AdminPage`, `BillingPage`, `TeamPage`/`TeamMemberPage`,
     `BusinessPage`, `LegalPage`, `BetaProgramPage` gibi ana akışta
     olmayan sayfalar.
3. Router seviyesinde uygun bir `<Suspense fallback={...}>` ve mevcut
   varsa proje içindeki loading/skeleton bileşenini kullan (yoksa basit
   bir spinner ekle, `src/shared/components` altına).
4. `vite.config.ts` içinde manuel chunk splitting (`build.rollupOptions.output.manualChunks`)
   gerekip gerekmediğini değerlendir — özellikle büyük üçüncü parti
   kütüphaneler (örn. `motion`, `react-virtuoso`, grafik/chart
   kütüphaneleri varsa) ayrı chunk'a alınabilir.
5. Değişiklikten sonra tekrar `npm run analyze` çalıştır, öncesi/sonrası
   ana bundle boyutunu karşılaştır.
6. `docs/TECH_DEBT.md`'deki TD-004 maddesini güncelle: ölçülen öncesi/sonrası
   sayılarla, "Resolved" veya "In Progress + hedef sayı" olarak işaretle.

## Kabul kriterleri
- [ ] Ana (initial) JS bundle boyutu ölçülüp önceki duruma göre
      küçültüldüğü (veya zaten kabul edilebilir olduğu) belgelendi.
- [ ] En az 3-5 az-sık-kullanılan sayfa lazy-load ediliyor.
- [ ] Lazy-load edilen sayfalara giden route'larda gezinme, sayfa
      yüklenirken görünür bir yükleme durumu gösteriyor (beyaz ekran yok).
- [ ] `npm run build` ve `npm run e2e` (Vitest e2e smoke testleri) temiz
      geçiyor — lazy-loading route testlerini bozmamalı.
- [ ] `.lighthouserc.js` ile ilişkili performans metrikleri gerilemedi
      (mümkünse `npm run test:lighthouse` ile kontrol et, deploy edilmiş
      bir ortam gerektirebilir, gerekmiyorsa atla ve not düş).
