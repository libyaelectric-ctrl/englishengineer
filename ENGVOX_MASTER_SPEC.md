# 📐 ENGVOX: MASTER ARCHITECTURAL & IMPLEMENTATION SPECIFICATION
> **Doküman Tipi:** Mimari Şartname & Uygulama Kılavuzu (Master Specification)  
> **Hedef:** Uygulayıcı Yapay Zeka / Geliştirici (Worker AI)  
> **Baş Denetçi / Kontrolör:** Antigravity AI (Google DeepMind Agent)  
> **Versiyon:** 2.0 (Copyright-Safe Engineering Project Simulator)  
> **Tarih:** 14 Ağustos 2026  

---

## 1. PROJE VİZYONU VE MİMARİ İLKELER

Mevcut **EngVox (EnglishEngineer)** projesi; Duolingo'nun ticari marka (trade dress) ve görsel telif haklarına takılmadan, **10+ Mühendislik Disiplini** ve **15 İletişim Dili** destekleyen, **CAD Blueprint / Şantiye Proje Kontrol Merkezi** konseptine sahip özgün bir "Mühendislik İletişim & Kariyer Simülatörü"ne dönüştürülecektir.

### ⚠️ UYGULAYICI AI İÇİN KATI MİMARİ KURALLAR:
1. **İzole Ada Yaratma Yasaktır:** Yeni özellikler yazılırken mevcut sistemler (`learning.store.ts`, `LearningProfileRepository`, `useLocalizationStore`, `VocabularyRepository`) doğrudan kullanılacaktır. Paralel ikinci bir state (örn. ayrı `gameStore.ts`) yaratmak YASAKTIR.
2. **Hardcoded Metin Yasaktır:** Ekrana basılan her UI string'i `useLocalizationStore` ve `translate()` fonksiyonu üzerinden 15 dilde çalışacak şekilde yazılmalıdır. Kod içine Türkçe/İngilizce sabit metin gömmek YASAKTIR.
3. **Sahte / Dummy Veri Yasaktır:** Sorular ve seviye kelimeleri `vocabulary.normalized.json` içinde bulunan 14.199 gerçek terimden dinamik türetilecektir. Sabit 5-10 kelimelik diziler KESİNLİKLE kullanılmayacaktır.
4. **Telif Koruması (Trade Dress Isolation):** Duolingo'nun yeşil kıvrımlı yolu, yuvarlak butonları, kalp ikonu ve kuş maskotu KESİNLİKLE kullanılmayacaktır.

---

## 2. TELİF & REBRANDING DÖNÜŞÜM MATRİSİ

Uygulayıcı AI, arayüzü ve veri modelini aşağıdaki dönüşüm tablosuna %100 sadık kalarak inşa edecektir:

| Eski / Riskli Konsept | Yeni EngVox Özgün Yapısı | Kod İçi Değişken Adı / Enum |
| :--- | :--- | :--- |
| **Marka Teması** | Industrial Blueprint / CAD Project Control Center | `Theme: 'industrial-blueprint'` |
| **Yol Haritası (Layout)** | Altıgen (Hexagon) CAD Checkpoint Düğümleri + Akış Çizgileri | `PathNodeShape: 'hexagon'` |
| **Seviye İsimleri** | Şantiye / Proje Fazları (Phase 1 - 5) | `ProjectPhase` |
| **Can (Heart)** | System Integrity % / Power Output ⚡ | `systemIntegrity` (0-100 veya 0-5 şarj) |
| **Seri Gün (Streak)** | Operational Shift Days ⚙️ (Kesintisiz Vardiya) | `fieldShiftDays` |
| **XP Puanı** | Career Merit Points (CP) | `careerPoints` |
| **Ders Ekranı** | Project Task Simulator (RFI, Audit, Inspection) | `LessonRunnerPage` |

---

## 3. VERİTABANI VE İÇERİK MİMARİSİ

### 3.1. Mühendislik Fazları Matrisi (Curriculum Phases)
CEFR seviyeleri (A1-C2) mühendislik şantiye ve proje yönetimi aşamalarıyla eşleştirilmiştir:

*   **Phase 1 (A1 - Site Mobilization):** Temel Şantiye Sahası, Ekipman ve Güvenlik Terimleri.
*   **Phase 2 (A2 - Materials & Specifications):** Malzeme Standartları, Şartnameler ve Ölçüm Birimleri.
*   **Phase 3 (B1 - Submittals & Site Meetings):** Technical Submittals, RFI (Request for Information) & Şantiye Toplantıları.
*   **Phase 4 (B2 - QA/QC & Risk Audit):** Kalite Kontrol, Şantiye Denetimi, Risk Analizi ve Hakediş.
*   **Phase 5 (C1/C2 - Commissioning & Executive Leadership):** Test-Devreye Alma (Commissioning), Sözleşme Yönetimi ve Üst Düzey Müzakere.

### 3.2. Dinamik Terim Çekimi (`curriculum.service.ts`)
```typescript
// Seçilen disiplin (örn: 'civil', 'electrical') ve anadile göre terimleri filtreler
export async function buildEngineeringRoadmap(
  discipline: EngineeringDiscipline,
  options: BuildPathOptions
): Promise<ProjectRoadmap> {
  const domains = ['general', 'engineering', discipline];
  const allTerms = await VocabularyRepository.getVocabularyByDomains(domains);
  // Terimleri CEFR ve Mühendislik Fazlarına göre gruplayıp seviye düğümlerine (levels) atar
}
```

---

## 4. UYGULAMA FAZLARI (WORKER AI İÇİN ADIM ADIM GÖREV LİSTESİ)

### 🔹 FAZ 1: Temizlik ve Global State Senkronizasyonu
1. `src/store/gameStore.ts` dosyasını inceleyin ve bağımlılıklarını temizleyerek kaldırın.
2. Tüm oyun istatistiklerini (`careerPoints`, `fieldShiftDays`, `systemIntegrity`) `src/core/learning/learning.store.ts` altında tek bir kaynakta birleştirin.
3. `LearningProfileRepository` ile kullanıcının onboarding'de seçtiği mesleğin kaybolmamasını sağlayın.

### 🔹 FAZ 2: Hexagonal CAD Blueprint RoadMap Ekranı (`LearningPathPage`)
1. [`src/pages/LearningPathPage/index.tsx`](file:///c:/Users/User/Desktop/EngineerOS_DENEME_CODEX/8.0/src/pages/LearningPathPage/index.tsx) bileşenini yenileyin.
2. Daire düğümler yerine `HexagonNode.tsx` bileşenini yazın:
   * **Locked:** Kilitli mühendislik kumpası / şema ikonu.
   * **Active:** Yanıp sönen CAD sarısı / mavi neon hat.
   * **Completed:** Onaylı şantiye mührü (Verified Badge).
3. Düğümler arası bağlantıları mühendislik akış şeması (Flowline) çizgileriyle çizin.
4. Üst paneli (HUD) güncelleyin: `CareerPoints (CP)`, `Shift Days (⚙️)`, `System Integrity (⚡)`.

### 🔹 FAZ 3: İnteraktif Ders Oynatıcı (`LessonRunnerPage`)
1. `src/pages/LessonRunnerPage/index.tsx` sayfasını sıfırdan kurun.
2. Ders başladığında `curriculum.service.ts` üzerinden seçilen seviyenin 10-12 terimini çekin.
3. Aşağıdaki 4 interaktif soru kartı bileşenini `src/features/lesson-runner/components/` altında yazın:
   * **`MultipleChoiceCard.tsx`:** Teknik İngilizce terim / tanım çoktan seçmeli eşleme.
   * **`RfiFillBlankCard.tsx`:** Eksik RFI (Request for Information) dilekçe cümlesini doğru teknik terimle tamamlama.
   * **`AudioInstructionCard.tsx`:** Şantiye telsiz efektiyle dinleme ve doğru şıkkı seçme.
   * **`DiagramMatchingCard.tsx`:** Ekipman / şema parçalarını doğru terimle eşleştirme.
4. Alt kısıma cevabı kontrol eden, doğru/yanlış durumunda mühendislik geri bildirimi veren `FeedbackDrawer.tsx` ekleyin.
5. Yanlış cevapta `systemIntegrity` değerini %20 düşürün; %0 olunca dersi sonlandırıp "Sistem Şarj Et" ekranı çıkarın.

### 🔹 FAZ 4: AI Şantiye Şefi & Ses Entegrasyonu (Writing/Speaking)
1. İleri seviyelerde serbest metin veya sesli cevap soruları için mevcut backend köprülerini bağlayın:
   * Metin düzeltme için: `/api/writing/submit`
   * Ses telaffuz değerlendirmesi için: `/api/speaking/submit`
2. AI prompt'una şu rolü verin: *"Sen kıdemli bir Baş Mühendissin. Kullanıcının şantiye raporunu dilbilgisi ve teknik üslup açısından değerlendir."*

### 🔹 FAZ 5: Çoklu Dil (i18n) ve Test Doğrulama
1. Ekrana eklenen tüm metinleri `src/features/localization/translations/` klasöründeki dil dosyalarına ekleyin.
2. `npm run test` veya `npx vitest` çalıştırarak birim testlerin geçtiğinden emin olun.
3. `npm run build` komutunun hatasız tamamlandığını doğrulayın.

---

## 5. DENETÇİ (KONTROLÖR) KABUL KRİTERLERİ (ACCEPTANCE CRITERIA)

Uygulayıcı AI işini tamamladığında, Antigravity AI şu kontrolleri yapacaktır:

1. 🟢 **Telif Kontrolü:** Tasarımda Duolingo'nun trade-dress ögeleri var mı? (Hedef: %0 benzerlik, %100 CAD Blueprint görünümü).
2. 🟢 **Veri Kontrolü:** Kelimeler `VocabularyRepository`'den dinamik geliyor mu? (Hedef: 14.199 terimlik havuza bağlılık).
3. 🟢 **i18n Kontrolü:** Sayfada Türkçe/İngilizce hardcoded metin kalmış mı? (Hedef: Tüm metinlerin `translate()` ile çağrılması).
4. 🟢 **Derleme Kontrolü:** `tsc` ve `vite build` sıfır hata veriyor mu?
5. 🟢 **Ders Motoru Kontrolü:** Ders tamamlandığında `learning.store.ts` içindeki `careerPoints` artıp kaydediliyor mu?

---

*Bu mimari şartname, EngVox projesinin özgün ve telifsiz gelişimi için Antigravity AI tarafından hazırlanmıştır.*
