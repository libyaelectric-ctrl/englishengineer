# 🚀 EngineerOS → Duolingo-Style Dönüşüm Planı
**Platform:** 10 Mühendislik Dalından **1 Tanesi (Kalıcı Seçim)** × 15 Dil × Modül-Bazlı Paket Sistemi  
**Tarih:** 2026-08-05 | **Yazar:** Özcan ERENSAYIN

---

## 🧠 Büyük Resim — Ne İnşa Ediyoruz?

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENGINEEROS PLATFORM                         │
│                                                                 │
│  Kullanıcı Giriş → Dil Seç → Mühendislik Dalı Seç (KALICI,    │
│  2-3 kez onay uyarısıyla) → Paket Seç (Junior→Master/Team)       │
│                                                                 │
│  Kelime Havuzu (herkeste sabit formül, paketten bağımsız):     │
│  GENERAL + ENGINEERING + [SEÇİLEN TEK DAL]                     │
│  ─────────────────────────────────────────────────────         │
│  General      → Herkeste → A1-C2 genel İngilizce               │
│  Engineering  → Herkeste → Ortak mühendislik dili               │
│  [Tek Dal]    → Onboarding'de seçilen dal (bir daha            │
│                 değiştirilemez) → Architecture / Chemical /     │
│                 Civil / Electrical / Electronics / HSE /        │
│                 Industrial / Mechanical / Mechatronics /        │
│                 Software'den SADECE BİRİ                        │
│                                                                 │
│  Paket (Junior/Senior/Specialist/Master/Team) dalı DEĞİL, hangi     │
│  MODÜLLERİN açık olduğunu belirler (Grammar, Reading, Writing, │
│  Speaking, Listening, Tool, AI Copilot...). Her modül, yukarıdaki│
│  sabit kelime havuzu üzerinden çalışır.                        │
│                                                                 │
│  15 UI Dili: EN TR AR DE ES PT FR RU ZH JA IT VI PL ID NL     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Mevcut Altyapı — Ne Hazır?

| Bileşen | Durum | Dosya |
|---|---|---|
| **12 Domain Taksonomi** | ✅ Tam | `data/canonical/vocabulary/vocabulary-taxonomy.json` |
| **Vocabulary DB (~27MB)** | ✅ Tam | `data/canonical/vocabulary/vocabulary.normalized.json` |
| **Çeviri Paketi (~56MB)** | ✅ P1 tam / P2 devam | `data/translations/vocabulary-translations.json` |
| **15 Dil Altyapısı** | ✅ Tam | `src/features/localization/localization.types.ts` |
| **Billing/Stripe** | ✅ Tam | `src/features/billing/` |
| **Auth/Supabase** | ✅ Tam | `src/features/auth/` |
| **10 Branch JSON** | ✅ 7/10 | `data/{civil,electronics,hse,industrial,mechanical,mechatronics,software}.json` |
| **Onboarding Altyapısı** | ✅ Var | `src/pages/OnboardingPage/` |
| **Placement/CEFR Test** | ✅ Var | `src/features/placement/` |

### ⚠️ Eksik Olan (3 Branch JSON)
`data/architecture.json`, `data/chemical.json`, `data/electrical.json` — oluşturulmalı.

---

## 🗂️ 10 Mühendislik Dalı & Paket Yapısı

| # | Dal | Domain Key | Mevcut Veri |
|---|---|---|---|
| 1 | 🏛️ Mimarlık | `architecture` | ❌ Oluşturulacak |
| 2 | ⚗️ Kimya Mühendisliği | `chemical` | ❌ Oluşturulacak |
| 3 | 🏗️ İnşaat Mühendisliği | `civil` | ✅ `civil.json` |
| 4 | ⚡ Elektrik Mühendisliği | `electrical` | ❌ Oluşturulacak |
| 5 | 🔌 Elektronik Mühendisliği | `electronics` | ✅ `electronics.json` |
| 6 | 🦺 HSE (İş Güvenliği) | `hse` | ✅ `hse.json` |
| 7 | 🏭 Endüstri Mühendisliği | `industrial` | ✅ `industrial.json` |
| 8 | ⚙️ Makine Mühendisliği | `mechanical` | ✅ `mechanical.json` |
| 9 | 🤖 Mekatronik | `mechatronics` | ✅ `mechatronics.json` |
| 10 | 💻 Yazılım Mühendisliği | `software` | ✅ `software.json` |

**Temel Paketler (Herkeste, dal ne olursa olsun)**:
- `general` → Genel İngilizce (A1–C2)
- `engineering` → Ortak mühendislik dili
- `[seçilen tek dal]` → Onboarding'de seçilip **kilitlenen** tek mühendislik dalı

> [!NOTE]
> Kullanıcı yukarıdaki 10 daldan **sadece birini** seçer. Bu seçim **kalıcıdır** — geçiş yok. Detay için aşağıdaki "Ödeme & Üyelik Modeli" ve Faz 1 bölümlerine bakın.

---

## 💰 Ödeme & Üyelik Modeli

> [!NOTE]
> **Güncellendi:** Aşağıdaki yapı, yüklenen `Paketler.xlsx` dosyasındaki gerçek paket/fiyat/modül matrisine göre yeniden yazıldı. Bu artık varsayım değil, onaylı kaynak veri.

### Gerçek Paket Yapısı (Kaynak: `Paketler.xlsx`)

Sistem, **modül/özellik bazlı kademeli erişim** modeline dayanıyor — her üst paket, alt paketin tüm modüllerini içerir + yeni modüller ekler (kümülatif).

| Paket | Fiyat (USD/ay) | Placement Test | Learning Hub | Progress | Vocabulary | Grammar | Translator | Reading | Writing | Speaking | Listening | Tool | AI Copilot |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Junior** | $29 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Senior** | $59 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Specialist** | $79 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Master** | $99 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Team** | $999 | 🕒 Yakında (Coming Soon) | | | | | | | | | | | |

**Kademe mantığı:**
- **Junior ($29)** — Temel öğrenme çekirdeği: Placement Test, Learning Hub, Progress, Vocabulary, Grammar
- **Senior ($59)** — Junior + Translator, Reading, Writing
- **Specialist ($79)** — Senior + Speaking, Listening
- **Master ($99)** — Specialist + Tool, AI Copilot (tam erişim, tüm modüller)
- **Team ($999)** — Kurumsal/takım paketi, henüz aktif değil ("Coming Soon")

> [!NOTE]
> **Netleşti — dal/paket ilişkisi:**
> - Kullanıcı onboarding'de **10 daldan sadece 1 tanesini** seçer (ör. İnşaat Mühendisliği). Diğer 9 dal o an kapanır.
> - Bu seçim **kalıcıdır ve bir daha değiştirilemez.** Kullanıcı seçim ekranında bunu **2-3 kez uyarı ile onaylamak zorunda** (bkz. Faz 1.1).
> - Dal seçimi **paketten tamamen bağımsızdır** — Junior de alsa Master de alsa, kullanıcının kelime havuzu her zaman `general + engineering + [seçtiği tek dal]` formülüyle sabittir. Ek dal satın alma / dal değiştirme **yoktur**.
> - Paket (Junior/Senior/Specialist/Master/Team) dalı değil, **hangi modüllerin** (Grammar, Reading, Writing, Speaking, Listening, Tool, AI Copilot) açık olduğunu belirler — xlsx'teki matrise göre.
> - Açık olan her modül, bu sabit kelime havuzunu kullanır: Grammar, Vocabulary'deki kelime havuzuna göre şekillenir; kullanıcı Senior'a yükselip Reading/Writing aldığında bu modüller **aynı havuzun** üzerine kurulur; Specialist'te Speaking/Listening, Master'te Tool/AI Copilot da yine **aynı havuzdan** beslenir. Yani paket yükseldikçe kelime havuzu değişmez, sadece o havuzu işleyen modül sayısı artar.

> [!CAUTION]
> **Mevcut billing.catalog.ts** (Free/Pro/Project/Exec/Private) yapısı, yukarıdaki **Junior/Senior/Specialist/Master/Team** paket setine göre yeniden yazılacak. Stripe'ta 5 yeni ürün + fiyat ID'si oluşturulacak (Team için "coming soon" — checkout'a kapalı, bekleme listesi/CTA gösterilecek).

---

## 🗓️ Dönüşüm Planı — 5 Faz

---

### 🔵 FAZ 0 — Veri & Domain Hazırlığı (Hafta 1)
> **Hedef:** Tüm 10 branş verisini hazırla, domain routing altyapısını kur.

#### 0.1 Eksik Branch JSON'larını Oluştur
```
data/architecture.json  ← vocabulary-taxonomy.json'daki "architecture" tag'larından
data/chemical.json      ← "chemical" tag'larından
data/electrical.json    ← "electrical" tag'larından
```

**Kaynak:** `data/canonical/vocabulary/vocabulary.normalized.json` → domain='architecture/chemical/electrical' filtresi

#### 0.2 Domain-to-Package Mapping Servisi
```typescript
// src/features/vocabulary/domain-package.config.ts
export const DOMAIN_PACKAGE_MAP = {
  base: ['general', 'engineering'],       // Her pakette
  branches: {
    architecture:  { label: 'Architecture',    emoji: '🏛️' },
    chemical:      { label: 'Chemical Eng.',   emoji: '⚗️' },
    civil:         { label: 'Civil Eng.',      emoji: '🏗️' },
    electrical:    { label: 'Electrical Eng.', emoji: '⚡' },
    electronics:   { label: 'Electronics Eng.',emoji: '🔌' },
    hse:           { label: 'HSE',             emoji: '🦺' },
    industrial:    { label: 'Industrial Eng.', emoji: '🏭' },
    mechanical:    { label: 'Mechanical Eng.', emoji: '⚙️' },
    mechatronics:  { label: 'Mechatronics',    emoji: '🤖' },
    software:      { label: 'Software Eng.',   emoji: '💻' },
  }
}
```

#### 0.3 User Profile'a Branch Alanı Ekle
```typescript
// src/features/profile/profile.types.ts
interface UserProfile {
  // mevcut alanlar +
  primaryBranch: DomainKey | null;    // Seçilen TEK dal — onboarding sonrası null olamaz
  branchLocked: boolean;              // true olduktan sonra UI'da değiştirme seçeneği gösterilmez
  branchLockedAt: string | null;      // ISO timestamp — kilitlenme anı, destek/analytics için
  branchLockConfirmations: number;    // Onboarding'de kaç kez "bu kalıcıdır" uyarısı onaylandı (2-3 beklenir)
  nativeLanguage: SupportedInterfaceLanguage;
}
```

> [!NOTE]
> `selectedBranches: DomainKey[]` (çoklu dal) alanı **kaldırıldı** — kullanıcı başına tek ve kalıcı `primaryBranch` var. Backend'de dal değişikliği talep eden bir kullanıcı olursa bu, uygulama içi bir self-servis akış değil, **manuel destek/admin işlemi** olarak ele alınmalı (ör. Supabase'de admin panelden `branchLocked=false` yapılıp yeniden seçtirme) — bu akış planın kapsamı dışında, ihtiyaç olursa ayrıca tasarlanmalı.

---

### 🟢 FAZ 1 — Onboarding Akışı Yeniden Tasarımı (Hafta 1-2)
> **Hedef:** Duolingo tarzı "dal seç → dil seç → CEFR test → paket al" akışı

#### 1.1 Yeni Onboarding Adımları

```
Adım 1: Anadili Seç (15 bayraklı UI)
    ↓
Adım 2: Mühendislik Dalını Seç (10 kartlı grid, emoji + açıklama)
    ↓  
    ⚠️ Kilit Onay Akışı (2-3 adımlı uyarı):
      1) "İnşaat Mühendisliği'ni seçtiniz. Emin misiniz?" → Evet/Vazgeç
      2) "Bu seçim KALICIDIR, ileride değiştiremezsiniz. Devam edilsin mi?" → Evet/Vazgeç
      3) (opsiyonel 3. onay) "Son kez soruyoruz: İnşaat Mühendisliği kesin mi?" → Onayla ve Kilitle
      → Onaylanınca: primaryBranch set edilir, branchLocked=true, branchLockedAt kaydedilir
    ↓
Adım 3: Seviye Testi (CEFR Placement — mevcut feature kullan, seçilen dalın kelimeleriyle)
    ↓
Adım 4: Hedef Belirle (Günlük hedef: 5/10/20 kelime/gün)
    ↓
Adım 5: Paket Seç (Junior/Senior/Specialist/Master/Team — kişiselleştirilmiş öneri + ödeme)
    ↓
Dashboard'a Git
```

> [!IMPORTANT]
> Adım 2'deki kilit onayı **UI seviyesinde atlanamaz** olmalı — kullanıcı "Vazgeç" derse dal seçim ekranına geri döner, ileri gidemez. Onboarding tamamlanmadan (paket seçilmeden) kullanıcı `branchLocked=true` olsa bile dashboard'a giremez.

#### 1.2 Değiştirilecek Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/pages/OnboardingPage/` | Yeni 5-adım wizard |
| `src/features/localization/localization.store.ts` | Native language seçimi kaydet |
| `src/features/placement/` | CEFR testini onboarding'e entegre et |
| `src/features/profile/` | Branch seçimini profile'a kaydet |

---

### 🟡 FAZ 2 — Paket & Pricing Sistemi (Hafta 2-3)
> **Hedef:** Junior/Senior/Specialist/Master/Team modül-bazlı paket sistemi + Stripe entegrasyonu. Dal (branch) tamamen ayrı bir kilit mekanizması — pakete bağlı değil.

> [!NOTE]
> ✅ **Netleşti — Faz 2 artık başlayabilir.** Fiyatlandırma `Paketler.xlsx` ile onaylı, dal/paket ilişkisi de yukarıda açıklandı: dal onboarding'de kilitlenir, paket sadece modül açar.

#### 2.1 Billing Catalog Yeniden Yazımı
- `src/features/billing/billing.catalog.ts` → Junior ($29) / Senior ($59) / Specialist ($79) / Master ($99) / Team ($999, coming soon) paketleri + her paketin modül matrisi (Placement Test, Learning Hub, Progress, Vocabulary, Grammar, Translator, Reading, Writing, Speaking, Listening, Tool, AI Copilot)
- `src/features/billing/billing.types.ts` → `moduleEntitlements: ModuleKey[]` (paketin açtığı modül listesi). **`selectedBranches` kaldırıldı** — dal, billing'den bağımsız `profile.primaryBranch` üzerinden yönetiliyor.
- `backend/src/billing-service.ts` → Stripe'ta 5 ürün (Team dahil, `active: false` / "coming soon" flag'iyle) ve fiyat ID'lerini oluştur/güncelle

#### 2.2 Yeni PricingPage
- `src/pages/PricingPage/` → Duolingo tarzı, 5 paketli (Junior→Team) karşılaştırma tablosu, modül bazlı ✅/❌ gösterimi
- **Dal seçici YOK** — pricing sayfası sadece modül/fiyat karşılaştırması yapar, dal onboarding'e ait
- Yıllık/aylık toggle
- Team paketi için "Coming Soon" rozeti + bekleme listesi CTA'sı
- 15 dilde fiyat gösterimi (currency.config.ts kullan)

#### 2.3 EntitlementGate Güncellemesi
- `src/features/billing/EntitlementGate.tsx` → **sadece modül bazlı** kontrol (Speaking/AI Copilot/Tool vb. paket seviyesine göre)
- Dal kontrolü ayrı ve basit: `profile.branchLocked === true` mü diye bakılır (yoksa onboarding'e yönlendirilir) — dalın *hangisi* olduğu erişimi etkilemez, herkes kendi kilitli dalına her paket seviyesinde erişir
- Kullanıcı paketinde olmayan bir modüle (ör. Junior paketiyle Speaking) erişmeye çalışırsa → "Bu özellik için paketini yükselt" modal

#### 2.4 Modül ↔ Kelime Havuzu İlişkisi (yeni)
Her modül, kullanıcının sabit kelime havuzunu (`general + engineering + primaryBranch`) farklı bir açıdan işler; paket yükseldikçe havuz değişmez, sadece hangi işleme katmanlarının (modüllerin) açık olduğu değişir:

| Modül | Kaynağı | Açıldığı Paket |
|---|---|---|
| Vocabulary | Sabit havuz (general+engineering+branch) | Junior+ |
| Grammar | Vocabulary havuzundaki kelimelere göre şekillenir | Junior+ |
| Translator | Sabit havuz | Senior+ |
| Reading | Sabit havuz üzerine kurulu okuma metinleri | Senior+ |
| Writing | Sabit havuz üzerine kurulu yazma egzersizleri | Senior+ |
| Speaking | Reading/Writing'in oluşturduğu havuzdan beslenir | Specialist+ |
| Listening | Aynı havuzdan beslenir | Specialist+ |
| Tool | Tüm havuz + tüm modül verisi | Master+ |
| AI Copilot | Tüm havuz + tüm modül verisi | Master+ |

- `src/features/vocabulary/module-source.service.ts` (yeni) → her modülün hangi kaynak veri katmanını kullandığını merkezi olarak tanımlar, böylece Reading/Writing'e yeni kelime eklendiğinde Speaking/Listening otomatik günceller.

---

### 🔴 FAZ 3 — Frontend Duolingo-Style Dönüşümü (Hafta 3-5)
> **Hedef:** Ana sayfa, dashboard ve öğrenme akışının yeniden tasarımı.

#### 3.1 Landing Page (Ana Sayfa)
```
Hero: "Mühendislik İngilizcenizi Geliştirin — 15 Dilde, 10 Dalda"
↓
Nasıl Çalışır (3 adım animasyonlu)
↓  
10 Mühendislik Dalı Grid (interaktif)
↓
Testimonials (mühendislerden referanslar)
↓
Pricing Preview
↓
CTA: "Dalını Seç ve Başla"
```

**Değiştirilecek:** `src/pages/LandingPage/`

#### 3.2 Dashboard Yeniden Tasarımı
```
┌──────────────────────────────────────────────┐
│  Günlük Hedef Streak (Duolingo tarzı)        │
│  ████████░░  8/10 kelime — Harika!           │
├──────────────────────────────────────────────┤
│  Mesleğim: ⚡ Elektrik Mühendisliği (kilitli) │
│  Kelime Havuzu: General + Engineering +      │
│                Electrical (3,240 kelime)     │
├──────────────────────────────────────────────┤
│  Hızlı Başla:                                │
│  [📚 Yeni Kelimeler] [🔁 Tekrar] [🎯 Test]  │
├──────────────────────────────────────────────┤
│  Haftalık İlerleme Grafiği                   │
└──────────────────────────────────────────────┘
```

> [!NOTE]
> "Dal Değiştir" butonu **kaldırıldı** — dal kalıcı olduğu için dashboard'da sadece bilgi amaçlı gösterilir, aksiyon almaz.

**Değiştirilecek:** `src/pages/DashboardPage/`

#### 3.3 Vocabulary Engine Branch-Aware Hale Getirilmesi
```typescript
// Mevcut: tüm kelimeler
// Yeni: kullanıcının kilitli TEK dalına göre filtreli (paketten bağımsız, her zaman sabit)
VocabularyEngine.getWords({
  domains: ['general', 'engineering', user.primaryBranch],
  language: user.nativeLanguage,
  cefrLevel: user.cefrLevel,
})
```

**Değiştirilecek:**
- `src/features/vocabulary/engine/` → domain filter ekle (3 sabit domain: general/engineering/primaryBranch)
- `src/features/vocabulary/services/` → branch-aware servis
- `src/features/vocabulary/store/` → `primaryBranch` state (tekil, çoğul değil)

#### 3.4 "Mesleğim" Profil Sayfası
- Kullanıcının kilitli tek dalını gösterir (değiştirme/ekleme seçeneği **yok**)
- Kelime sayısı, CEFR dağılımı, ilerleme istatistikleri gösterilir
- Dal değişikliği talebi için destek/iletişim linki (self-servis değil, bkz. Faz 0.3 notu)

---

### 🟣 FAZ 4 — Canlıya Alım (Hafta 5-6)
> **Hedef:** Eş zamanlı 15 dil + 10 dal lansmanı

#### 4.1 Verifikasyon Checklist
- [ ] Tüm 10 branch JSON var ve vocabulary-translations.json'a link edilmiş
- [ ] 15 dilde UI testleri (RTL: AR için)
- [ ] Stripe webhook'lar Junior/Senior/Specialist/Master paketlerini işliyor (Team hariç, henüz satışta değil)
- [ ] Onboarding akışı 5 adımın hepsinde çalışıyor, dal kilit onayı (2-3 uyarı) atlanamıyor
- [ ] Dal seçimi kilitlendikten sonra hiçbir ekrandan değiştirilemiyor
- [ ] EntitlementGate modül bazlı kısıtları doğru uyguluyor (paket ↔ modül matrisi xlsx ile birebir)
- [ ] CEFR placement testi kullanıcının kilitli dal kelimeleriyle çalışıyor
- [ ] Landing page 15 dilde render oluyor
- [ ] Mobile responsive (tüm sayfalar)

#### 4.2 Eş Zamanlı Lansman Stratejisi
```
Gün 1: Soft launch (davetiye ile)
  → 15 dil × 10 dal AÇIK
  → Yeni onboarding AÇIK
  → Yeni pricing AÇIK

Gün 2-7: Beta feedback toplama
  → Analytics izle (hangi dal en çok seçiliyor?)
  → Ödeme akışı doğrula

Hafta 2: Genel yayın
```

---

## 🔧 Teknik Mimari — Branch-Aware Vocabulary Flow

```
Kullanıcı Oturumu Açar
        ↓
Profile Store: { primaryBranch: 'electrical', branchLocked: true }
        ↓
VocabularyEngine.buildWordPool({
  domains: ['general', 'engineering', 'electrical'],   // sabit 3 domain, paketten bağımsız
  nativeLanguage: 'tr',
  cefrLevel: 'B1'
})
        ↓
vocabulary.normalized.json → domain filtresi → translation lookup
        ↓
Modül Katmanı (paket seviyesine göre açık/kapalı):
  Vocabulary/Grammar (Junior+) → Reading/Writing/Translator (Senior+)
  → Speaking/Listening (Specialist+) → Tool/AI Copilot (Master+)
  (her katman aynı sabit havuzu işler)
        ↓
SRS Engine → kişiselleştirilmiş tekrar planı
        ↓
UI: Kelime kartları (ana dilde çeviri + EN tanım + örnek)
```

---

## 📁 Değiştirilecek / Yeni Oluşturulacak Dosyalar

### Yeni Dosyalar
| Dosya | Amaç |
|---|---|
| `data/architecture.json` | Mimarlık branch kelime seti |
| `data/chemical.json` | Kimya branch kelime seti |
| `data/electrical.json` | Elektrik branch kelime seti |
| `src/features/vocabulary/domain-package.config.ts` | 10 dal → domain mapping |
| `src/features/billing/module-entitlement.service.ts` | Paket → modül yetki kontrolü (dal değil) |
| `src/features/vocabulary/module-source.service.ts` | Modül → kelime havuzu kaynak eşlemesi (Faz 2.4) |
| `src/features/onboarding/branch-lock-confirm.tsx` | Dal seçimi 2-3 adımlı kalıcı onay bileşeni |

### Güncellenen Dosyalar
| Dosya | Değişiklik |
|---|---|
| `src/features/billing/billing.catalog.ts` | Modül-bazlı paket kataloğu (Junior→Team) |
| `src/features/billing/billing.types.ts` | `moduleEntitlements` tipi (branch alanı kaldırıldı) |
| `src/features/billing/EntitlementGate.tsx` | Sadece modül bazlı kontrol |
| `src/features/profile/profile.types.ts` | `primaryBranch`, `branchLocked`, `branchLockedAt` alanları |
| `src/pages/OnboardingPage/` | 5-adım wizard + dal kilit onay akışı |
| `src/pages/LandingPage/` | Yeni hero + dal grid |
| `src/pages/PricingPage/` | Modül-bazlı pricing (dal seçici yok) |
| `src/pages/DashboardPage/` | Kilitli dal gösterimi (değiştirme yok) |
| `src/features/vocabulary/engine/` | Sabit 3-domain filter (general+engineering+primaryBranch) |
| `backend/src/billing-service.ts` | Paket Stripe ID'leri (5 ürün) |
| `backend/src/billing-routes.ts` | Modül-bazlı checkout |

---

## ❓ Kullanıcıdan Beklenen Kararlar

> [!IMPORTANT]
> Aşağıdaki kararlar olmadan Faz 2'ye geçilemez:

1. **Ücretlendirme Modeli:** ✅ Tamamen çözüldü
   - 5 plan: **Junior ($29) / Senior ($59) / Specialist ($79) / Master ($99) / Team ($999, Coming Soon)**
   - Paketler modül bazlı kümülatif (Vocabulary/Grammar → +Translator/Reading/Writing → +Speaking/Listening → +Tool/AI Copilot)
   - ✅ Dal/paket ilişkisi netleşti: kullanıcı **1 dal seçer, kalıcı olarak kilitlenir** (2-3 uyarı ile onaylanır), paket sadece modülleri açar — dal sayısını sınırlamaz
   - ✅ Ek dal satın alma **yok** — dal geçişi/ekleme özelliği plandan tamamen çıkarıldı
   - ⚠️ **Hâlâ açık:** Yıllık ödeme seçeneği / indirimi var mı? (xlsx'te sadece aylık USD fiyatlar var)

2. **10 Mühendislik Dalının Kesin Listesi:**
   Taxonomy'de görülen 10: Architecture, Chemical, Civil, Electrical, Electronics, HSE, Industrial, Mechanical, Mechatronics, Software — **onaylıyor musunuz?**

3. **Lansman Önceliği:**
   - Tüm 10 dal aynı anda mı açılacak?
   - Yoksa ilk aşamada belirli dallar mı?

4. **UI Dil Önceliği:**
   - İlk lansmanda tüm 15 dil mi?
   - Yoksa önce TR + EN + AR mı?

---

## 📊 Tahmini Zaman Çizelgesi

| Faz | İçerik | Süre |
|---|---|---|
| Faz 0 | Veri hazırlığı (3 JSON + mapping) | 3-4 gün |
| Faz 1 | Onboarding yeniden tasarımı | 4-5 gün |
| Faz 2 | Paket & pricing sistemi | 3-5 gün (ücretlendirme belgesi sonrası) |
| Faz 3 | Frontend dönüşümü (Landing+Dashboard+Vocabulary) | 7-10 gün |
| Faz 4 | Test + lansman | 3-5 gün |
| **Toplam** | | **~4-5 Hafta** |

---

*Son Güncelleme: 2026-08-05 | Pricing `Paketler.xlsx` ile güncellendi | Faz 2 tamamen netleşti: tek-kalıcı-dal + modül-bazlı paket modeli onaylandı | Kalan tek açık soru: yıllık ödeme opsiyonu*
