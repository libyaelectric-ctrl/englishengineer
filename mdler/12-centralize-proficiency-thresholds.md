# Görev: Seviye/zorluk eşiklerini merkezi bir "yeterlilik" (proficiency) modülünde topla

## Bağlam (doğrulanmış bulgu)
Kullanıcının "ne kadar iyi/ileri seviyede olduğu" sorusuna kod tabanında
birden fazla yerde, birbirinden habersiz, farklı sayısal mantıklarla cevap
veriliyor:

- `src/features/level-system/level-system.helpers.ts` →
  `getLevelIndex()`: `completedTasks < 10 || averageScore < 65` ise
  seviye 0 (A1); yoksa `Math.floor(completedTasks / 10)`.
- `src/features/grammar/grammar.adaptive-difficulty.ts` →
  `assessDifficulty()`: `strength * 0.4 + accuracy * 0.4 + exposure * 0.2`
  bileşik skoru, `0.8 / 0.6 / 0.4` eşikleriyle 4 kademeli zorluk
  (beginner/intermediate/advanced/challenge) belirliyor.

Bu iki sistemin birbirine bağlı olması şart değil (biri CEFR seviyesi,
diğeri ders-içi soru zorluğu) ama her ikisi de aslında aynı temel soruyu
soruyor: "bu kullanıcı bu konuda ne kadar yetkin?". Şu anda bu mantık
kod tabanına serpiştirilmiş sabit sayılar olarak gömülü; biri değişirse
diğerinin fark edilmeden tutarsız kalma riski var, ve yeni bir beceri/motor
eklendiğinde muhtemelen üçüncü bir versiyonu yeniden yazılacak.

## Yapılacaklar
1. `src/core/learning/` altına yeni bir dosya oluştur:
   `src/core/learning/proficiency.ts`. Burada ortak, yeniden kullanılabilir
   birincil öğeleri tanımla:
   - Genel bir `ProficiencyScore` tipi (0-1 arası normalize skor).
   - Skor → CEFR seviyesi eşleme fonksiyonu (level-system'deki mantığı
     buraya taşı, parametrik eşiklerle: `averageScoreThreshold`,
     `tasksPerLevel`).
   - Skor → 4 kademeli zorluk (beginner/intermediate/advanced/challenge)
     eşleme fonksiyonu (grammar'daki mantığı buraya taşı, parametrik
     ağırlıklarla: `strengthWeight`, `accuracyWeight`, `exposureWeight`
     ve eşik değerleri).
2. Eşik/ağırlık sabitlerini bu dosyanın başında, isimlendirilmiş
   `const`'lar olarak tanımla (magic number kalmasın), her birine kısa bir
   yorum ekleyerek neden o değerin seçildiğini açıkla (varsa
   `docs/`'daki ilgili tasarım kararına referans ver, yoksa
   `docs/adr/`'a küçük bir ADR ekle: "Proficiency scoring approach").
3. `level-system.helpers.ts` içindeki `getLevelIndex()`'i bu yeni modülü
   çağıracak şekilde yeniden yaz (davranış aynı kalmalı, mevcut testler
   kırılmamalı).
4. `grammar.adaptive-difficulty.ts` içindeki `assessDifficulty()`'yi aynı
   şekilde yeni modülü kullanacak şekilde yeniden yaz.
5. Her iki eski dosyadaki testlerin (`level-system.helpers.test.ts`,
   `grammar.adaptive-difficulty.test.ts` — varsa) hâlâ geçtiğini doğrula;
   yeni modül için de kendi birim testlerini ekle
   (`src/core/learning/proficiency.test.ts`).

## Kabul kriterleri
- [ ] `src/core/learning/proficiency.ts` oluşturuldu, eşik/ağırlık
      sabitleri tek yerde, isimlendirilmiş ve yorumlu.
- [ ] `level-system.helpers.ts` ve `grammar.adaptive-difficulty.ts` artık
      kendi eşik mantıklarını tekrar yazmıyor, ortak modülü kullanıyor.
- [ ] Davranış değişmedi: mevcut testler (varsa) hâlâ geçiyor; yoksa
      önce mevcut davranışı kilitleyen bir "characterization test" yaz,
      sonra refactor et.
- [ ] Yeni `proficiency.test.ts` eklendi ve geçiyor.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` temiz geçiyor.
