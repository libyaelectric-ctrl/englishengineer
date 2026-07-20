# Görev: Kalan console.log çağrılarını proje logger'ına taşı

## Bağlam
Proje zaten kendi logger modülüne sahip: `src/shared/logger`. Buna rağmen
`src/` ve `backend/` içinde (test dosyaları hariç) hâlâ ham `console.log`
çağrıları var. Production kodunda ham console çağrıları log seviyesi
kontrolü, yapılandırılmış log formatı ve Sentry gibi izleme entegrasyonlarını
atlar.

## Yapılacaklar
1. Şu komutla kalan çağrıları bul:
   ```bash
   grep -rn "console\.log" src backend --include="*.ts" --include="*.tsx" | grep -v test
   ```
2. Her bulunan yer için:
   - Eğer gerçekten bir debug/geliştirme kalıntısıysa, satırı tamamen kaldır.
   - Eğer production'da gerçekten loglanması gereken bir bilgiyse,
     `src/shared/logger`'daki uygun fonksiyonla (örn. `logger.info(...)`,
     `logger.debug(...)`) değiştir; backend tarafında ise
     `backend/src/logger.ts` içindeki eşdeğerini kullan.
3. Bunun bir daha sızmasını önlemek için `eslint.config.js`'e
   `no-console` kuralını ekle (test dosyaları ve script'ler için istisna
   tanımlayabilirsin, örn. `overrides` ile `scripts/**` ve `*.test.ts` hariç
   tutulsun).

## Kabul kriterleri
- [ ] `grep -rn "console\.log" src backend --include="*.ts" --include="*.tsx" | grep -v test`
      boş dönüyor (ya da yalnızca bilinçli olarak izin verilen dosyalarda).
- [ ] `eslint.config.js`'e `no-console` kuralı eklendi.
- [ ] `npm run lint` yeni kuralla birlikte hâlâ temiz geçiyor.
- [ ] `npm run typecheck` ve `npm test` temiz geçiyor.
