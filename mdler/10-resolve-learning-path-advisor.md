# Görev: Kullanılmayan `LearningPathAdvisor` özelliği için karar ver — bağla veya kaldır

## Bağlam (doğrulanmış bulgu)
`src/features/learning-orchestrator/learning-path-advisor.ts` içindeki
`LearningPathAdvisor.generatePlan()`, hedef CEFR seviyesine göre beceri
boşluklarını analiz eden, haftalık gün-gün plan üreten tam işlevsel ve
testli (`learning-path-advisor.test.ts`) bir motor. `index.ts`'den export
ediliyor.

Ancak doğrulandı: `grep -rn "LearningPathAdvisor" src` ve
`grep -rn "learning-path-advisor" src` sonuçlarına göre bu motor
**hiçbir sayfa/bileşen tarafından import edilmiyor**. Kullanıcının gerçekten
gördüğü ders akışı, tamamen farklı ve statik bir motor olan
`LessonPathEngine` (`lesson-path.engine.ts`) tarafından besleniyor
(Dashboard ve Curriculum sayfalarında kullanılıyor).

Ayrıca bu iki motor, aynı CEFR kavramı için iki farklı type kullanıyor:
`LearningPathAdvisor` → `CefrBand` (`@/features/profile/profile.types`),
`LessonPathEngine`/level-system → `CefrLevel`
(`@/features/level-system/level-system.types`). İkisi de aynı
`['A1','A2','B1','B2','C1','C2']` değerlerini taşıyor ama iki ayrı tip
tanımı olarak duruyor (bkz. prompt 11).

## Karar ver (kod tabanını incele, aşağıdaki iki seçenekten birini seç)

### Seçenek A — Özelliği gerçekten bağla
Eğer "hedef seviyeye göre haftalık kişisel plan" ürün açısından değerli
görünüyorsa (bkz. `docs/ROADMAP.md`, `docs/PRODUCT.md` — bu özellik orada
planlanmış mı kontrol et):
- `LearningPathAdvisor.generatePlan()`'ı `DashboardPage` veya `ProfilePage`
  içinde, kullanıcının mevcut beceri seviyelerini (`profile.skills`) ve
  hedef seviyesini (varsa onboarding'de seçilmiş bir hedef) kullanarak
  çağıran bir UI bölümü ekle (örn. "Bu haftaki planın" kartı).
- `LessonPathEngine` ile çakışmayacak şekilde konumlandır: `LessonPathEngine`
  "sıradaki ders" mikro-akışı, `LearningPathAdvisor` "haftalık büyük resim"
  planlaması olarak ayrı, tamamlayıcı rollerde sunulsun; ikisinin birbiriyle
  çelişen tavsiye vermediğini test et (örn. LessonPathEngine'in önerdiği
  beceri ile LearningPathAdvisor'ın o günkü `focusSkill`'i aynı yönde
  olmalı, zıt olmamalı).

### Seçenek B — Kaldır
Eğer özellik ürün planında yoksa veya `LessonPathEngine` ile yeterince
örtüşüyorsa:
- `learning-path-advisor.ts` ve `learning-path-advisor.test.ts` dosyalarını
  kaldır.
- `index.ts`'deki export'u temizle.
- `docs/TECH_DEBT.md`'ye kısa bir not düş: "LearningPathAdvisor kaldırıldı,
  hiçbir zaman UI'a bağlanmamıştı, LessonPathEngine ile işlevsel çakışması
  vardı" (tarih ve gerekçeyle).

## Varsayılan tercih
Kod tabanında bu düzeyde bir özelliği sıfırdan yazıp test etmiş olmak,
büyük ihtimalle bir ürün niyeti olduğunu gösteriyor — önce **Seçenek A**'yı
değerlendir. Sadece `docs/ROADMAP.md`/`docs/PRODUCT.md` bu özellikle
açıkça çelişiyorsa veya `LessonPathEngine` zaten aynı ihtiyacı
karşılıyorsa Seçenek B'ye geç.

## Kabul kriterleri
- [ ] Karar (bağlama ya da kaldırma) net bir commit mesajı/PR açıklamasıyla
      gerekçelendirildi.
- [ ] Seçenek A ise: özellik en az bir sayfada gerçekten render ediliyor,
      `LessonPathEngine` ile çelişen tavsiye üretmediğini doğrulayan bir
      test eklendi.
- [ ] Seçenek B ise: ölü kod tamamen kaldırıldı, `docs/TECH_DEBT.md`
      güncellendi.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` temiz geçiyor.
