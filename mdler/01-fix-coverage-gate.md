# Görev: Test coverage iddiası ile gerçek CI davranışı arasındaki tutarsızlığı gider

## Bağlam
`docs/TEST_COVERAGE_REPORT.md` şunu iddia ediyor: "CI pipeline enforces a
minimum coverage threshold of 60% globally and 75% for critical modules" ve
"the CI pipeline will break if the project falls below the 60% threshold".

Ancak `.github/workflows/ci.yml` içindeki "Test Coverage" adımı
`continue-on-error: true` ile işaretli — yani coverage düşük olsa da CI
kırılmıyor. Doküman ile gerçek davranış birbirini tutmuyor. Bu iki durumdan
birini seç ve uygula (kod tabanını incele, hangisi daha uygun karar ver ve
gerekçesini PR açıklamasında/commit mesajında belirt):

## Seçenek A — Gate'i gerçekten zorunlu yap
- `.github/workflows/ci.yml` içindeki coverage adımından `continue-on-error: true`
  satırını kaldır.
- `vitest.config.ts` içinde coverage threshold ayarlarını kontrol et; yoksa
  `test:coverage` script'ine (`vitest run --coverage`) uygun eşik ayarları ekle
  (global %60, kritik modüller için ayrı ayarlanabilir eşik).
- Mevcut coverage gerçekten %60'ın altındaysa, eşiği önce gerçekçi bir
  başlangıç değerine (mevcut ölçülen değere yakın, örn. mevcut değerin
  birkaç puan altı) çek ve `docs/TECH_DEBT.md`'ye coverage'ı kademeli
  yükseltme planı için bir madde ekle.

## Seçenek B — Dokümanı gerçeğe uydur
- `docs/TEST_COVERAGE_REPORT.md`'yi güncelle: "advisory / non-blocking"
  olduğunu açıkça belirt, "will break" ifadesini kaldır.
- Dosyanın başına `_Son güncelleme: <tarih>, gerçek CI coverage adımı
  continue-on-error ile çalışıyor, bu rapor bilgilendirme amaçlıdır._ gibi
  bir not ekle.

## Tercih
Varsayılan olarak **Seçenek A**'yı tercih et (gerçek bir kalite kapısı daha
değerlidir), ancak mevcut coverage çok düşükse (örn. <%20) ve kısa vadede
%60'a çıkarmak gerçekçi değilse, Seçenek B'yi uygula ve `docs/TECH_DEBT.md`'ye
"coverage gate'i aktifleştir" maddesini yüksek öncelikli olarak ekle.

## Kabul kriterleri
- [ ] `docs/TEST_COVERAGE_REPORT.md` ile `.github/workflows/ci.yml` artık
      tutarlı bir hikaye anlatıyor.
- [ ] `npm run test:coverage` komutu hatasız/beklenen şekilde çalışıyor.
- [ ] Değişiklik sonrası `npm run typecheck`, `npm run lint`, `npm test`
      temiz geçiyor.
