# Görev: Kelime tekrar sisteminde iki ayrı "sıradaki tekrar tarihi" kaynağını birleştir

## Bağlam (doğrulanmış bulgu)
Şu anda aynı kelime için iki bağımsız, birbirinden habersiz zamanlama sistemi
canlı durumda:

1. `src/features/vocabulary/spaced-repetition/vocabulary.spaced-repetition.ts`
   — gerçek bir **SM-2 algoritması** (`updateSm2ReviewState`, ease factor,
   büyüyen interval). Bu, `src/features/vocabulary/services/vocabulary.service.ts`
   içindeki `reviewStates` deposunu besliyor. `VocabularyService`, listening,
   reading, speaking, writing, analytics ve AI özelliklerinden çağrılıyor
   (`grep -rln "VocabularyService\b" src` ile doğrula).

2. `src/features/vocabulary/services/vocabulary.menu.ts` — SM-2 kullanmayan,
   sabit kurallı bir zamanlama:
   `nextReviewDate: addDays(now, isMastered ? 7 : correctReviews === 2 ? 3 : 1)`.
   Bu servis (`VocabularyMenuService`), kullanıcının gerçekten gördüğü
   **VocabularyPage**'i (`src/pages/VocabularyPage/hooks/useVocabularyPage.ts`)
   besliyor — "Due Today" rozeti, tekrar akışı, leech tespiti buradan geliyor.

Sonuç: SM-2 motoru arka planda çalışıyor ama kullanıcının ekranda gördüğü
"bugün tekrar et" listesi ondan beslenmiyor; iki ayrı depo aynı kelime için
farklı tarihler üretebiliyor.

## Yapılacaklar
1. Önce her iki servisin veri modelini karşılaştır:
   - `VocabularyReviewState` (`src/features/vocabulary/types/vocabulary.types.ts`)
     — SM-2 alanları: `interval`, `easeFactor`, `repetitions`, `nextReview`.
   - `VocabularyMenuProgress` (`vocabulary.menu.ts` içinde tanımlı) —
     `nextReviewDate`, `correctReviews`, `wrongReviews`, `isWeak` vb.
   Hangi alanların gerçekten farklı amaçlara hizmet ettiğini (örn. `isWeak`,
   leech tespiti SM-2'de yok) ve hangilerinin salt "ne zaman tekrar edilsin"
   sorusuna cevap verdiğini (yani birleştirilebilir olanları) ayır.
2. **Tek kaynak stratejisi**: `VocabularyMenuService`'in kendi
   `nextReviewDate` hesaplamasını (`addDays(...)` satırı) kaldır; bunun
   yerine `VocabularyService.reviewStates[wordId]`'den (yoksa
   `createInitialReviewState` ile oluşturup `updateSm2ReviewState` ile
   güncelleyerek) gelen `nextReview` değerini kullan. `isVocabularyProgressDue`
   fonksiyonunu bu tek kaynağa göre yeniden yaz.
3. `VocabularyMenuService.reviewWord(...)` ve `startLearning(...)`
   fonksiyonlarının artık SM-2 güncellemesini de tetiklediğinden emin ol
   (yani kullanıcı VocabularyPage'de bir kelimeyi cevapladığında hem
   `VocabularyMenuProgress` hem `reviewStates` senkron güncellensin — ya
   `VocabularyMenuService` içeriden `VocabularyService`'i çağırsın, ya da
   ortak bir alt fonksiyona taşınsın).
4. `isWeak`/leech gibi SM-2'de karşılığı olmayan alanları `VocabularyMenuProgress`
   üzerinde bırak, sadece "ne zaman tekrar edilsin" hesaplamasını tekilleştir.
5. Mevcut kullanıcı verisiyle geriye dönük uyumluluğu koru: `storage`'daki
   eski `nextReviewDate` alanlarını okurken kırılma olmasın (migration/guard
   ekle, gerekirse ilk okumada SM-2 state'i eski veriden türet).

## Kabul kriterleri
- [ ] `grep -rn "addDays(now, isMastered" src/features/vocabulary` artık
      boş dönüyor (o satır kaldırıldı veya SM-2'yi çağıracak şekilde
      değiştirildi).
- [ ] Bir kelime için `VocabularyPage`'de görünen "Due Today" durumu ile
      `VocabularyService.reviewStates`'teki `nextReview` her zaman aynı
      kaynaktan türetiliyor (iki farklı tarih üretme ihtimali kalmadı).
- [ ] `src/features/vocabulary/**/*.test.ts` içindeki mevcut testler
      güncellenmiş mantığa göre geçiyor; gerekirse yeni test ekle:
      "bir kelime cevaplandığında hem menu progress hem reviewStates
      tutarlı güncellenir".
- [ ] `npm run typecheck`, `npm run lint`, `npm test` temiz geçiyor.
