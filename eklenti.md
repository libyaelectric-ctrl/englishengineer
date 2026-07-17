KADEME 3-B: Acil Düzeltmeler (Bağımsız denetim raporuna göre)

Bağımsız bir kod denetimi, Usta.md'de "[x] YAPILDI" işaretli iki kademenin
gerçekte hedeflerine ulaşmadığını ve bir kademenin CI'yi kırdığını tespit etti.
Bunları sırayla, her birini gerçekten doğrulayarak düzelt.

---

## 1) ACİL — CI Kırığı: tests/e2e/ vitest ile çakışıyor

Sorun: `npm run test` şu an 3 dosyada fail ediyor:

- tests/e2e/navigation.spec.ts
- tests/e2e/user-journey.spec.ts
- tests/e2e/vocabulary.spec.ts

Sebep: Bu dosyalar Playwright testi (playwright.config.ts'de
testMatch: ['e2e/**/*.spec.ts'] olarak tanımlı) ama vitest.config.ts'in
exclude listesi bunları hariç tutmuyor.

Yapılacak:
vitest.config.ts içindeki exclude dizisine 'tests/e2e/**' ekle:
exclude: ['node_modules/**', 'dist/**', 'tests/browser/**', 'tests/e2e/**', 'backend/**']

Doğrulama: `npm run test` çalıştır, terminal çıktısında
"Test Files XX passed (XX)" görülmeli, 0 fail. Çıktının tamamını buraya yapıştır.

---

## 2) ACİL — Kademe 3 gerçekte tamamlanmamış (bundle hiç küçülmedi)

Sorun: src/data/vocabulary/by-level/b1.seed.ts ve b2.seed.ts hâlâ şunu yapıyor:

import data from './b1.seed.json';
export const B1_VOCABULARY_TERMS = data as VocabularyTerm[];

Bu STATİK import olduğu için Vite/Rollup, JSON içeriğini build sırasında
JS bundle'ına gömüyor — sonuç eskisiyle birebir aynı (b2.seed chunk hâlâ
~3 MB). Ayrıca artık hem .ts hem .json versiyonu diskte duruyor (+11 MB
gereksiz tekrar).

Yapılacak (her seviye/level için — a1,a2,b1,b2,c1,c2, hem vocabulary hem grammar):
a) src/data/vocabulary/by-level/_.seed.json dosyalarını public/data/vocabulary/
klasörüne taşı (aynısını grammar için de yap: public/data/grammar/)
b) by-level/_.seed.ts dosyalarındaki statik `import data from './x.json'`
satırını kaldır, yerine runtime fetch koy:

     export const loadB1Vocabulary = async (): Promise<VocabularyTerm[]> => {
       const res = await fetch('/data/vocabulary/b1.seed.json');
       return res.json();
     };

c) src/data/vocabulary/index.ts ve src/data/grammar/index.ts içindeki
`await import('./by-level/x.seed')).X_VOCABULARY_TERMS` çağrılarını
yeni fetch tabanlı fonksiyona göre güncelle.
d) Artık kullanılmayan eski .json kopyalarını src/data/\*/by-level/
içinden sil (public/ altındakiler kalsın).

Doğrulama (ZORUNLU — sadece "yaptım" deme, kanıtla):
`npm run build` çalıştır, dist/assets/ çıktısında b1.seed-_.js ve
b2.seed-_.js chunk boyutlarının ÖNCEKİ 2.7MB / 3MB'tan gerçekten
düşüp düşmediğini (hedef: birkaç KB'a inmesi, veri artık public/ altında
ayrı JSON asset olarak duracak) build çıktısını buraya yapıştırarak göster.
Ayrıca uygulamayı browser'da açıp Vocabulary sayfasının hâlâ doğru
kelimeleri yüklediğini (network sekmesinde /data/vocabulary/b1.seed.json
isteğinin gittiğini) doğrula.

---

## 3) ORTA — Kademe 9 eksik kalan kısmı: uuid/Storybook güvenlik açığı

`npm audit` hâlâ Storybook'un eski uuid bağımlılığından 5 açık gösteriyor
(3 orta, 2 yüksek). Storybook'u @storybook/addon-essentials@7.0.6+ 'a
güncelle veya uuid'i override ile zorla güncelle. Sonrasında `npm audit`
çıktısını buraya yapıştır, bu açıkların gittiğini kanıtla.

---

## 4) ORTA — Backend'de yeni 19 orta seviye açık (Sentry/OpenTelemetry)

backend/ içinde `npm audit` çalıştır, @sentry/opentelemetry ve
@opentelemetry/instrumentation-mysql2 zincirinden gelen 19 açığın
listesini çıkar. Bunlar Sentry entegrasyonundan geliyor — versiyonu
sabitleyerek (pin) ya da güncelleyerek azalt, tamamen gitmiyorsa
hangilerinin "kabul edilebilir risk" olduğunu bir not olarak yaz.

---

## 5) DÜŞÜK — Lint uyarı sayısı 93'ten 228'e çıkmış

Kademe 10-14'te eklenen yeni SaaS özellikleri (Cmd+K, PR Coach, Interview
Simulator, GitHub Bot, B2B Portal) çok sayıda yeni complexity uyarısı
getirmiş. Şimdilik dokunma — bunu ayrı bir "Kademe 27: Lint Borcu Temizliği"
olarak listenin sonuna ekle, öncelik bu değil.

---

KURAL: Yukarıdaki 1 ve 2 numaralı maddeler bitmeden ve doğrulama çıktıları
bana gösterilmeden hiçbir yeni kademeye (19, 21, 24, 25, 26...) geçme.
Her madde için "yaptım" demek yetmez — istenen terminal/build çıktısını
göstermen gerekiyor.
