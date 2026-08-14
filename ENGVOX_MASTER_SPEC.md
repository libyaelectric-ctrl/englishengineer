# ENGVOX: MASTER ARCHITECTURAL & IMPLEMENTATION SPECIFICATION
> **Doküman Tipi:** Mimari Şartname & Uygulama Kılavuzu (Master Specification)
> **Hedef:** Uygulayıcı Yapay Zeka / Geliştirici (Worker AI)
> **Versiyon:** 1.0
> **Tarih:** 14 Ağustos 2026

---

## 1. PROJE VİZYONU VE MİMARİ İLKELER

**EngVox (EnglishEngineer)**, 10 mühendislik disiplini ve 15 iletişim dili destekleyen bir "Mühendislik İngilizcesi Kariyer Simülatörü"dür. Öğrenci; şantiye, proje yönetimi ve mühendislik iletişim senaryolarında kelime dağarcığını, dinleme becerisini ve teknik üslubunu geliştirir.

### ⚠️ UYGULAYICI AI İÇİN KATI MİMARİ KURALLAR:
1. **İzole Ada Yaratma Yasaktır:** Yeni özellikler yazılırken mevcut sistemler (`learning.store.ts`, `LearningProfileRepository`, `useLocalizationStore`, `VocabularyRepository`) doğrudan kullanılacaktır. Paralel ikinci bir state (örn. ayrı `gameStore.ts`) yaratmak YASAKTIR.
2. **Hardcoded Metin Yasaktır:** Ekrana basılan her UI string'i `useLocalizationStore` ve `translate()` fonksiyonu üzerinden 15 dilde çalışacak şekilde yazılmalıdır. Kod içine Türkçe/İngilizce sabit metin gömmek YASAKTIR.
3. **Sahte / Dummy Veri Yasaktır:** Sorular ve seviye kelimeleri `vocabulary.normalized.json` içinde bulunan gerçek terimlerden dinamik türetilecektir. Sabit 5-10 kelimelik diziler KESİNLİKLE kullanılmayacaktır.
4. **Medya Dosyaları LFS'e ALINMAYACAKTIR:** `public/**` altındaki görsel, ses ve font dosyaları doğrudan git'e eklenir. Production build (Vercel) LFS pointer'larını smudge etmediği için, LFS'e alınan dosyalar production'da 130 baytlık boş pointer olarak yayınlanır ve görüntü/ses kırılır (bu hata daha önce logoda yaşanmıştır).
5. **Telif Koruması:** Duolingo'nun yeşil kıvrımlı yolu, yuvarlak butonları, kalp ikonu ve kuş maskotu KESİNLİKLE kullanılmayacaktır. Proje özgün "Hexagon CAD Checkpoint" yol haritası kullanır.

---

## 2. GERÇEK VERİ MODELİ (MEVCUT KODLA BİREBİR EŞLEŞEN)

> Aşağıdaki alanlar `src/core/learning/learning.store.ts` içinde tanımlıdır. Spec'e yeni kavram eklenmeden ÖNCE bu liste güncellenmeli ve kodda gerçekten var olmalıdır — aksi halde "kavram-kod uyumsuzluğu" oluşur.

| Alan | Anlam | Default |
| :--- | :--- | :--- |
| `xp` | Kullanıcının toplam deneyim puanı | `0` |
| `streak` | Art arda pratik günü sayısı | `0` |
| `hearts` | Can (maks: `MAX_HEARTS`) | `MAX_HEARTS` |
| `vocabularyPool` | Kullanıcının öğrendiği terim ID'leri (`masteredTermIds` kaynağı) | `[]` |
| `missions` | Görev listesi (`DEFAULT_MISSIONS`) | — |
| `achievements` | Başarımlar (`DEFAULT_ACHIEVEMENTS`) | — |

### Aksiyonlar (`LearningStoreActions`)
`startMission`, `submitMissionResult`, `completeGenericPractice`, `loseHeart`, `checkHeartsRefill`, `resetAll`.

---

## 3. VERİTABANI VE İÇERİK MİMARİSİ

### 3.1. Yol Haritası Oluşturma (`curriculum.service.ts`)
`buildLearningPath(discipline, options)` fonksiyonu, `VocabularyRepository.getVocabularyByDomains(['general', 'engineering', discipline])` ile gerçek terim havuzundan beslenir ve terimleri CEFR seviyelerine (A1-C2) göre gruplayıp bir `ProjectRoadmap` döndürür. Kullanıcının `vocabularyPool`'undaki `masteredTermIds` tamamlanma yüzdesini belirler.

### 3.2. Mühendislik Disiplinleri
10 disiplin `src/shared/constants/engineering-disciplines.ts` içinde `ENGINEERING_DISCIPLINES` olarak tanımlıdır (architecture, chemical, civil, software, electrical, electronics, hse, industrial, mechanical, mechatronics). Her disiplin `DISCIPLINE_META` içinde renk paleti ve i18n etiketiyle eşleşir.

### 3.3. İletişim Dilleri
15 dil `src/features/localization/` altında `INTERFACE_LANGUAGES` ve `translations/` klasöründeki dil dosyalarıyla desteklenir.

### 3.4. Kullanıcı Profili (`LearningProfileRepository`)
- `getProfile(userId)` / `saveProfile(...)` / `updatePreferences(...)` ile localStorage'da tutulur.
- `discipline`, `interfaceLanguage`, `onboardingCompleted`, `skills.*` alanları.
- **Önemli:** OnboardingGate, profili her render'da taze okur (`useMemo` ile cache'leme YASAKTIR — stale profil, onboarding sonrası `/onboarding` döngüsüne yol açar).

---

## 4. ROUTER VE GATE YAPISI

```
createBrowserRouter
└── AuthGuard
    └── OnboardingGate (tüm uygulamayı sarar)
        └── AppShell (Layout)
            ├── /dashboard
            ├── /vocabulary
            ├── /grammar
            ├── /listening
            ├── /learning-path
            ├── /profile/*
            └── ...
```

- `OnboardingGate`: `discipline` + `interfaceLanguage` seçilmemişse `/onboarding`'e yönlendirir. `/welcome`, `/onboarding`, `/onboarding/*` istisnadır.
- `AuthGuard`: kimlik doğrulaması yapar, giriş yapılmamışsa `/login`'e yönlendirir.

---

## 5. UYGULAMA FAZLARI (WORKER AI İÇİN ADIM ADIM GÖREV LİSTESİ)

### 🔹 FAZ 1: Yeni Özellik Eklerken Yol Haritası
1. Sorun veya isteği belirleyin, mevcut bileşen/store'larla çakışmasın.
2. Gereken yeni state varsa **mevcut `learning.store.ts`'e** aksiyon/alan ekleyin (yeni store YOK).
3. UI string'lerini `translations/` dosyalarına ekleyip `translate()` ile çağırın.
4. Birim testlerini güncelleyin/yazın.

### 🔹 FAZ 2: Ders / Pratik Akışı
1. Pratik akışı, mevcut `completeGenericPractice` / `submitMissionResult` aksiyonları üzerinden kurun.
2. Kelimeleri `VocabularyRepository`'den çekin, `vocabularyPool`'a öğrenilen terimleri ekleyin.
3. Yanlış cevapta `loseHeart()` çağırın.

### 🔹 FAZ 3: Çoklu Dil (i18n) ve Test Doğrulama
1. Ekrana eklenen tüm metinleri `src/features/localization/translations/` klasöründeki dil dosyalarına ekleyin.
2. `npx vitest` ile birim testlerin geçtiğinden emin olun.
3. `npx tsc --noEmit` ve `npm run build` komutunun hatasız tamamlandığını doğrulayın.

---

## 6. DENETÇİ (KONTROLÖR) KABUL KRİTERLERİ (ACCEPTANCE CRITERIA)

1. 🟢 **Veri Kontrolü:** Kelimeler `VocabularyRepository`'den dinamik geliyor mu? (Sabit dummy kelime yok mu?)
2. 🟢 **i18n Kontrolü:** Sayfada hardcoded kullanıcı-ekranı metni kalmış mı? (Tüm metinler `translate()` ile mi?)
3. 🟢 **Derleme Kontrolü:** `npx tsc --noEmit` ve `npm run build` sıfır hata veriyor mu?
4. 🟢 **Test Kontrolü:** `npx vitest run` tüm suite geçiyor mu?
5. 🟢 **State Kontrolü:** Yeni state `learning.store.ts` dışında başka bir store'a mı konmuş? (YASAK)
6. 🟢 **Medya Kontrolü:** `public/**` altına eklenen yeni dosya LFS'e alınmamış mı? (Production kırılmasını önler)

---

*Bu mimari şartname, EngVox projesinin mevcut kod yapısına %100 sadık kalacak şekilde hazırlanmıştır. Spec'te önerilen her kavram kodda gerçekten var olmalıdır.*
