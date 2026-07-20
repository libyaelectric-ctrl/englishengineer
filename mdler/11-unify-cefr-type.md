# Görev: `CefrBand` ve `CefrLevel` çift tip tanımını tek tipe indir

## Bağlam (doğrulanmış bulgu)
Aynı CEFR kavramı (`A1, A2, B1, B2, C1, C2`) kod tabanında iki ayrı yerde,
iki ayrı isimle tanımlanmış:

- `src/features/level-system/level-system.types.ts`:
  `export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;`
  ve türetilen `CefrLevel` tipi.
- `src/features/profile/profile.types.ts`:
  `export type CefrBand = ...` (aynı 6 değer, ayrı bir tanım olarak).

`src/features/learning-orchestrator/learning-path-advisor.ts` kendi
`CEFR_ORDER` sabitini üçüncü kez tanımlıyor
(`const CEFR_ORDER: CefrBand[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];`).
Bu, aynı domain sabitinin üç farklı yerde elle kopyalanması demek — biri
güncellenip diğerleri unutulursa (örn. CEFR bandına yeni bir ara seviye
eklenirse) sessizce tutarsızlık oluşur.

## Yapılacaklar
1. Hangi tipin "kanonik" (asıl) kaynak olacağına karar ver. Önerilen:
   `src/features/level-system/level-system.types.ts` içindeki
   `CEFR_LEVELS`/`CefrLevel` kanonik kalsın (çünkü seviye sisteminin
   kendi domain'i, en mantıklı sahibi).
2. `src/features/profile/profile.types.ts` içindeki `CefrBand` tanımını
   kaldır; yerine level-system'den re-export et:
   ```ts
   export type { CefrLevel as CefrBand } from '@/features/level-system/level-system.types';
   ```
   (Geriye dönük uyumluluk için `CefrBand` adını bir süre alias olarak
   koru; kod tabanındaki tüm kullanımları tek tip isme —tercihen
   `CefrLevel`— geçirmeyi de değerlendir, bkz. adım 4.)
3. `learning-path-advisor.ts` içindeki yerel `CEFR_ORDER` sabitini kaldır,
   `@/features/level-system/level-system.types`'tan `CEFR_LEVELS`'ı import
   edip kullan.
4. Kod tabanında başka kopyalanmış CEFR sabiti kalıp kalmadığını tara:
   ```bash
   grep -rn "'A1', 'A2', 'B1', 'B2', 'C1', 'C2'" src --include="*.ts" --include="*.tsx"
   ```
   Bulunan her tekrarı kanonik `CEFR_LEVELS`'a yönlendir.
5. Uzun vadede `CefrBand` adını tamamen kaldırıp her yerde `CefrLevel`
   kullanmak istersen (isteğe bağlı, ayrı bir commit'te yap — daha büyük
   bir refactor, riskli): `profile.types.ts`, `learning-path-advisor.ts`
   ve bunları kullanan tüm dosyalarda import'ları güncelle.

## Kabul kriterleri
- [ ] CEFR seviyeleri artık tek bir yerde (`level-system.types.ts`) tanımlı;
      diğer tüm kullanımlar oradan re-export/import ediyor.
- [ ] `grep -rn "'A1', 'A2', 'B1', 'B2', 'C1', 'C2'"` sonucu sadece
      kanonik dosyada çıkıyor.
- [ ] `npm run typecheck` temiz geçiyor (tip değişikliği kırılma
      yaratmadı).
- [ ] `npm run lint` ve `npm test` temiz geçiyor.
