# EngVox Learning Path v2 — Master Plan
_(Duolingo'dan ilham alan ama hukuki ve mimari olarak bağımsız, mevcut 14.199 terimlik
çok-mühendislik / çok-dil veritabanını gerçekten kullanan bir yeniden inşa)_

**Hazırlayan:** Claude (bu konuşmadaki kod incelemesine dayanarak)
**Temel:** GitHub `libyaelectric-ctrl/englishengineer`, commit `a2221ade`
**Statü:** Onay bekliyor — onaylanınca ben uygulayıcı olarak Faz 1'den başlarım.

---

## 1. TEŞHİS — Şu an neden "basit kaldı" (kanıtlı)

`src/pages/LearningPathPage/index.tsx` ve `duolingo-curriculum.generator.ts` dosyalarını
satır satır inceledim. Sorunlar iddia değil, kod içinde birebir doğrulandı:

| # | Sorun | Kanıt |
|---|---|---|
| 1 | **Telif riski gerçek** | `UNIT_COLORS` dizisinde yorum satırı harfiyen `// Duolingo green/blue/yellow`. Yılan gibi kıvrılan yol, yuvarlak seviye düğümü, kalp/gem/streak HUD'u — Duolingo'nun "trade dress"ine (görsel kimliğine) neredeyse birebir kopya. |
| 2 | **Kelime havuzu sahte** | `SAMPLE_TERMS_BY_DISCIPLINE` — her dal için elle yazılmış **6 terim**, `% terms.length` ile 12 seviyeye tekrar tekrar döndürülüyor. Bugün tamamlanan **14.199 terimlik gerçek veritabanına** (`vocabulary.normalized.json`, artık 7.725'i gerçek AI tanımıyla dolu) **hiç dokunmuyor.** |
| 3 | **i18n yok** | Her string (`"Seri Gün"`, `"ÜNİTE"`, `"Canınız tükendi!"`...) kod içine gömülü Türkçe. Uygulamanın geri kalanının kullandığı, 15 dilde çalışan `useLocalizationStore`/`translate()` sistemi hiç import edilmemiş. |
| 4 | **Meslek seçimi kalıcı değil** | Seçim `useState` component state'inde — sayfa yenilenince kayboluyor. Uygulamanın gerçek disiplin-kilitleme sistemi olan `LearningProfileRepository` (onboarding'de kilitlenen, her yerde kullanılan) hiç çağrılmamış. |
| 5 | **İkinci, çakışan bir oyunlaştırma sistemi** | Bu özellik kendi `gameStore.ts`'ini (hearts/XP/streak/gems) yaratmış — az önce `learning.store.ts`'e eklediğim Hearts sistemiyle **hiç senkron olmayan, paralel ikinci bir kaynak.** |

**Kök neden hepsinde aynı:** Bu özellik, uygulamanın geri kalanından **izole**, kendi
mini-adasında inşa edilmiş. Mevcut olgun sistemlere (disiplin profili, i18n, gerçek
kelime DB'si, XP/hearts store) bağlanmak yerine hepsini yeniden, daha kötü şekilde
icat etmiş.

---

## 2. TASARIM PRENSİPLERİ — v2 için

### 2.1. Mimari prensip: "İzole ada değil, entegre katman"
Yeni Learning Path, sıfırdan yazılmış bir oyun değil, **mevcut sistemlerin üstüne
oturan bir görselleştirme/gezinme katmanı** olacak:
- Disiplin → `LearningProfileRepository` (zaten var, onboarding'de kilitleniyor)
- Dil → `useLocalizationStore` (zaten var, 15 dil)
- XP/Streak/Hearts → `learning.store.ts` (bugün Hearts eklendi, tek kaynak)
- Kelime/soru içeriği → `vocabulary.normalized.json` + backend AI (bugün tamamlanan
  7.725+ gerçek tanım, ve gerideki ~2.400 terim de aynı worker deseniyle tamamlanmalı)
- Writing/Speaking/Reading değerlendirmesi → zaten kurulu backend AI köprüleri
  (bu konuşmada daha önce inşa edilen `/api/writing/submit`, `/api/speaking/submit`,
  `/api/reading/generate`)

Yani bu plan **yeni bir "EngDua" adası kurmuyor** — mevcut, test edilmiş, çalışan
6+ sistemi tek bir gezinme deneyiminde birleştiriyor.

### 2.2. Hukuki/görsel farklılaşma — Duolingo'dan gerçekten ayrışmak
"Duolingo'ya benzer ama tamamen başka" isteğini karşılamak için:

| Duolingo öğesi | v2'de ne olacak |
|---|---|
| Yeşil/mavi/sarı marka renkleri | **Mühendislik dalına göre değişen** kendi palet: örn. İnşaat=turuncu/beton grisi, Elektrik=sarı/siyah (elektrik uyarı rengi), Yazılım=terminal yeşili/lacivert — her dal kendi "endüstriyel" renk kimliğine sahip, tek bir sabit marka rengi yok |
| Yılan gibi kıvrılan tekli yol + yuvarlak düğümler | **"Şantiye/proje planı" metaforu**: yol, bir inşaat projesinin faz şeması gibi görünür — düğümler daire değil, **altıgen (mühendislik çizim sembolü)** veya **checkpoint bayrağı** şeklinde; yol dikey değil, bir **Gantt/roadmap çizgisi** gibi yatay-aşamalı |
| Kuş maskotu | Maskot yok — bunun yerine her dala özel **ikon seti** (zaten `lucide-react`'te var: Building2, Zap, Cpu, vb.) |
| Kalp = can | Aynı kavram kalabilir (evrensel bir oyunlaştırma öğesi, tek başına telif konusu değil) ama **görsel olarak farklı ikon/renk** (örn. "sinyal/güç" ikonu, kalp yerine) — bu opsiyonel, risk düşük |
| "Streak" alev ikonu | Kalabilir — bu genel bir kavram, Duolingo'ya özgü değil |

**Önemli:** Duolingo'nun kullandığı temel *mekanik* kavramlar (seviye kilitleme, XP,
streak, can) **telif konusu değil** — bunlar tüm dil öğrenme endüstrisinde ortak
kalıplar (Duolingo da bunları Rosetta Stone'dan, o da başkasından almıştı). Asıl risk
**görsel kimlik** (renk paleti, layout, maskot, marka hissi) kopyalanmasında. Plan bunu
hedefliyor.

### 2.3. İçerik prensibi: "Gerçek veri, şablon değil"
Her seviye, `vocabulary.normalized.json`'dan **gerçek zamanlı** çekilen terimlerle
kurulacak — sabit 6 terimlik dizi değil. Zaten var olan `discipline` + `cefrLevel` +
`category` alanları filtre olarak kullanılacak. Bir kullanıcı aynı seviyeyi ikinci kez
açtığında **farklı terimler** görecek (havuzdan rastgele/rotasyonlu seçim).

### 2.4. Dil prensibi: "Gerçek i18n, kopyala-yapıştır Türkçe değil"
Tüm UI string'leri `useLocalizationStore`'a taşınacak. Soru metinleri
(`"X teriminin Türkçe karşılığı nedir?"` gibi) da **hedef dile göre** üretilecek
— zaten backend'de `translate` operasyonu var (bu konuşmada daha önce incelenen
`generateContent`/`translate` AI motoru), o kullanılacak.

---

## 3. UYGULAMA SIRASI — Çoklu Ajan Modeli

Bugün Worker A/B/C'nin `patches/worker-X-patch.json` deseniyle **çakışmasız paralel
çalışması** çok iyi işledi. Aynı deseni burada da kullanacağız: **her ajan farklı,
birbirine dokunmayan dosyalarda çalışsın, kimse `vocabulary.normalized.json` gibi
paylaşılan dosyaları doğrudan değiştirmesin.**

### FAZ 0 — Temizlik (BEN yapacağım, ajanlardan önce, tek başına)
Paralel ajanlar başlamadan önce çakışma kaynaklarını temizlemem lazım:
1. `gameStore.ts`'i **sil** — `learning.store.ts`'teki Hearts/XP/streak tek kaynak olsun.
2. `LearningPathPage`'in `hearts/xp/streak/gems` okumalarını `useLearningStore`'a bağla.
3. Kalan ~2.400 kelimeyi de (Worker A/B/C'nin dışında kalan) aynı patch deseniyle
   tamamlat (Worker D, E gibi — veya ben tamamlarım).
4. Bu temizlik bitmeden Faz 1 ajanları başlamasın — yoksa üstüne inşa edecekleri
   temel kayar.

### FAZ 1 — Paralel ajanlar (çakışmasız dosya sahipliği)

| Ajan | Görev | Dokunacağı dosyalar (SADECE bunlar) |
|---|---|---|
| **Agent-Content** | `vocabulary.normalized.json`'dan gerçek zamanlı seviye/soru üreten yeni bir `curriculum.service.ts` yaz (mevcut sahte generator'ın yerine) | `src/features/learning-path/curriculum.service.ts` (yeni), testleri |
| **Agent-i18n** | Learning Path'in tüm UI string'lerini `useLocalizationStore` anahtarlarına taşı, 15 dilde çeviri ekle | `src/features/localization/translations/*.json`'a yeni anahtarlar, `LearningPathPage`'de sadece string kullanımını değiştir |
| **Agent-Visual** | Duolingo'dan ayrışan yeni tasarım sistemini kur: dal-bazlı renk paleti, yeni düğüm/yol bileşenleri | `src/features/learning-path/components/*` (yeni klasör) |
| **Agent-Integration** | `LearningProfileRepository` + `learning.store.ts` ile gerçek bağlantıyı kur, `LessonRunnerPage`'i gerçek Writing/Speaking/Reading backend köprülerine bağla | `LearningPathPage/index.tsx`, `LessonRunnerPage/index.tsx` (bunlar tek sahip, başka ajan dokunmasın) |

**Çakışma önleme kuralı (worker-X-patch.json deseninin aynısı):**
- Her ajan **kendi yeni dosyalarını** oluştursun, mevcut paylaşılan dosyaları
  (`LearningPathPage/index.tsx`, `vocabulary.normalized.json`) mümkün olduğunca
  değiştirmesin.
- Sadece **Agent-Integration**, en son, hepsi bittikten sonra bu parçaları
  `LearningPathPage/index.tsx`'te birleştirsin — o yüzden bu ajan **en son** çalışmalı,
  diğer 3'ü paralel bitirdikten sonra.

### FAZ 2 — Birleştirme ve doğrulama (BEN yapacağım)
- Her ajanın çıktısını tek tek gözden geçireceğim (bugün yaptığım gibi: `tsc`, `eslint`,
  `vitest`, gerçek dosya diff'i okuma — "güvendim" değil "doğruladım")
- Duplicate/çakışan state var mı kontrol
- Gerçek kelime havuzundan üretilen seviyelerin mantıklı olduğunu manuel örnekleyerek
  kontrol
- 15 dilde en az 3 dilde (TR, EN, ES gibi) görsel kontrol

### FAZ 3 — Yayına alma
- Vercel'e deploy
- Rollback planı: bu iş de bir git commit/push zinciri olacağı için, sorun çıkarsa
  bugün öğrendiğimiz `git reset --hard` + force-push yöntemiyle geri alınabilir.

---

## 4. NELERİ KORUYORUZ (bilerek dokunmuyoruz)

- Vocabulary/Grammar/Reading/Writing/Speaking/Listening sayfaları — bunlar zaten
  çalışıyor, gerçek AI'ya bağlı, bugün test edildi. Learning Path bunları **değiştirmez,
  bunlara giden bir harita/gezinme katmanı olur.**
- Backend AI mimarisi (rate limit, plan kotaları, circuit breaker) — aynen kullanılacak,
  yeniden icat edilmeyecek.
- 14.199 terimlik kelime veritabanı ve devam eden AI-tanım tamamlama işi.

---

## 5. AÇIK KARARLAR — senin onayın gerekiyor

Uygulamaya başlamadan önce üç şeyi netleştirmemiz lazım:

1. **Hearts/can mekaniği kalsın mı, yoksa tamamen kaldırılsın mı?** (Telif riski
   düşük ama "Duolingo'ya çok benziyor" hissi hearts'tan da geliyor olabilir)
2. **Mevcut EngDua Lig/Mağaza (Leagues/Shop) sekmeleri** — tamamen silinsin mi,
   yoksa daha sonra ayrı, daha özgün bir tasarımla mı ele alınsın?
3. **Kaç ajanla paralel çalışmak istiyorsun?** Yukarıda 4 ajan önerdim (Content, i18n,
   Visual, Integration) — bunu 2'ye düşürüp daha basit de tutabiliriz, ya da daha
   ayrıntılı bölebiliriz.

Onaylarsan Faz 0'dan (temizlik) başlıyorum.
