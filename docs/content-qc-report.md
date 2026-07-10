# İçerik QC Raporu — 2026-07-10

## Özet

- Taranan toplam kayıt: ~3.200+ (210 vocabulary + 420 expansion + ~2.500 seed data + reading/listening/writing/speaking content)
- Örneklem stratejisi: vocabulary.data.json (tümü — 210 kayıt), vocabulary.data.ts expansion (tümü — 420+ terim), grammar seed (B1 — 50 kural), reading/listening/writing (ilk 3'er görev)
- Şüpheli/sorunlu bulunan kayıt: ~630+ (%20+)

---

## Kategori Bazlı Bulgular

### 1. Anlamsal Bozukluk / Dilsel Tutarlılık Hatası (200 kayıt — KRİTİK)

`vocabulary.data.json` dosyasında `meaning` alanı ilk 10 kayıtta Türkçe, geri kalan 200 kayıtta İngilizce. Bu, çift dilli bir öğrenme aracı için en ciddi sorundur.

| # | Kelime | Sorunlu meaning | Öneri |
|---|--------|----------------|-------|
| 1 | transformer | electrical device that changes voltage | transformatör |
| 2 | switchgear | equipment for switching and protecting circuits | şalt cihazı |
| 3 | busbar | metal conductor inside a panel | bara / buskolt |
| 4 | circuit breaker | protective switching device | devre kesici |
| 5 | relay | automatic protection or control device | röle |
| 6 | cable tray | metal or plastic support for routing cables | kablo tavası |
| 7 | commissioning | process of testing before handover | devreye alma |
| 8 | substation | facility that transforms voltage | trafo merkezi |
| 9 | earthing | connecting to ground for safety | topraklama |
| 10 | insulation | material that prevents current flow | yalıtım |

> **Etki**: 200 girişin `meaning` alanı öğrenme aracı için işlevsiz. Tümüne Türkçe çeviri eklenmeli.

---

### 2. Şablon Tekrarı — Otomatik Üretim Kalıpları (420+ terim — YÜKSEK)

`vocabulary.data.ts` dosyasındaki `buildExpansionRows()` fonksiyonu (satır 694-703) tüm 420+ terimi aynı şablonla üretir:

```
meaning:   "${term} related to ${category.context}"
definition: "${term} is a professional engineering term used when discussing ${category.context}."
example:   "The engineer referenced ${term} during the review of ${category.context}."
collocations: ["review ${term}", "${term} status", "${term} requirement"]
```

**En sık tekrarlanan 10 cümle kalıbı:**

| Kalıp | Tekrar sayısı |
|-------|--------------|
| `${term} is a professional engineering term used when discussing ${context}.` | 420+ (tüm expansion terimleri) |
| `The engineer referenced ${term} during the review of ${context}.` | 420+ |
| `${term} related to ${context}` (meaning) | 420+ |
| `The X was rejected because the Y did not Z` | 13+ |
| `The X was revised to Y after/before Z` | 12+ |
| `The consultant requested/rejected/approved the X` | 12+ |
| `The X was completed before/after Y` | 9+ |
| `The X must be Y before Z` | 7+ |
| `Please submit/check the X for Y` | 3 |
| `The X shows Y that Z` | 3 |

**Sorun**: 420+ girişin definition'u dairesel ve bilgi vermiyor. "surge protection is a professional engineering term used when discussing electrical installation" — bu bir tanım değil, bir şablon.

---

### 3. Yanlış Eşleşme / Anlamsal Uyumsuzluk (5 kayıt — ORTA)

| ID | Kelime | Sorunlu Alan | Sorun | Öneri |
|---|--------|-------------|-------|-------|
| vocab_017 | calibrated instrument | example | "QA rejected the reading because the pressure gauge was not a calibrated instrument" — pressured gauge bir instrument'tır; "not a calibrated instrument" demek yerine "had no valid calibration certificate" denmeli | "QA rejected the reading because the pressure gauge calibration certificate had expired." |
| vocab_001 | switch | example | "The main switch is off before the visual inspection starts" — kalıcı durum + temporal clause karışımı | "The main switch should be off before the visual inspection starts." |
| vocab_042 | corrective action | synonyms | "fixing action" standart bir terim değil | "corrective measure" olmalı |
| vocab_015 | snagging | synonyms | "punching" yanlış anlaşılabilir | "punch list work" veya "defect rectification" olmalı |
| vocab_038 | defect liability period | definition | Tautolojik: "defect liability period is the contract period after completion when the contractor remains responsible for defects" | "The defect liability period is the post-completion contract period during which the contractor must repair defects at their own cost." |

---

### 4. Tekrarlayan Cümle İskeletleri (Sistemik — ORTA)

Vocabulary example cümlelerinin %85+'ı aynı iskeletleri kullanıyor. Sorun değil, ama pedagojik çeşitlilik eksik.

**Mevcut cümle türleri:**
- Edilgen geçmiş zaman: %90+ ("The X was Y'd")
- İstek/imperatif: %1 ("Please submit...")
- Soru: %0
- Koşullu: %0
- Birinci tekil şahıs: %0

**Önerilen çeşitlilik:**
- "Always torque the busbar bolts to specification." (imperatif)
- "Did the inspection request include the cable tray scope?" (soru)
- "If the insulation resistance had been measured earlier, the fault could have been prevented." (koşullu)
- "Make sure you verify the cable route before installation." (doğrudan hitap)

---

### 5. Dilbilgisi Hataları (2 kayıt — DÜŞÜK)

| ID | Kelime | Alan | Hata | Düzeltme |
|---|--------|------|------|----------|
| vocab_001 | switch | example | "The main switch is off before the visual inspection starts" — tense uyumsuzluğu | "The main switch should be off before the visual inspection starts." |
| expansion-generated |Various | definition | "${term} is a professional engineering term used when discussing..." — dairesel tanım | Gerçek tanımlar yazılmalı |

---

### 6. Grammar Seed Verileri (B1 — 50 kural incelendi)

Grammar verileri genel olarak iyi kalitede. Ciddi hata bulunmadı. Ancak:
- Bazı kurallar çok benzer (örn. "present perfect" ve "present perfect continuous" kuralları birbirine çok yakın)
- Örnek cümleler genellikle iyi, ancak beberapa mühendislik dışı günlük hayat örnekleri var

---

### 7. Reading/Listening/Writing İçerikleri

Bu içerikler profesyonel ve iyi kalitede. Ciddi sorun bulunmadı.
- Reading pasajları gerçekçi mühendislik senaryoları içeriyor
- Listening transkriptleri doğal mühendislik konuşmasıymış gibi yazılı
- Writing görevleri detaylı ve iyi yapılandırılmış

---

## Öncelik Sıralaması

| Öncelik | Sorun | Etki | Öneri |
|---------|-------|------|-------|
| P0 | meaning alanı Türkçe→İngilizce tutarsızlığı | 200 giriş işlevsiz | Tümüne Türkçe çeviri ekle |
| P1 | Expansion template dairesel tanım | 420+ giriş düşük kalite | `buildExpansionRows()` şablonunu geliştir |
| P2 | Duplicate entries (2 kelime) | Öğrenme kafa karışıklığı | Tek girişte birleştir |
| P3 | Anlamsal uyumsuzluk (5 giriş) | Yanlış bilgi | Tek tek düzelt |
| P4 | Cümle çeşitliliği eksikliği | Pedagojik kalite | Farklı cümle türleri ekle |

---

## Sonuç

En kritik sorun **meaning alanının tutarsızlığıdır** — 210 girişin 200'ü çift dilli öğrenme aracı için işlevsiz. İkinci en büyük sorun ise `buildExpansionRows()` şablonunun 420+ giriş için dairesel ve bilgi vermemiş tanım üretmesidir. Bu iki sorun giderildiğinde içerik kalitesi önemli ölçüde yükselecektir.

> **Not**: Bu rapor yalnızca okuma/tarama göreviyle hazırlanmıştır. Hiçbir kod veya veri dosyası değiştirilmemiştir.
