# EngVox Master Architecture Plan: Universal Cyber Energy Pipeline Integration

Bu plan, **Konsept C (Cyber Energy Pipeline & Metro Stepper)** tasarım sisteminin ve UI/UX altyapısının **EngVox platformundaki tüm temel modüllere (Vocabulary, Grammar, Reading, Writing, Listening, Speaking, Curriculum ve Placement Test)** aşamalı ve modüler olarak uygulanmasını hedefler.

---

## 🎯 Temel Mimari Vizyon: "Reaktif Enerji Hattı Bileşeni" (`CyberPipelineEngine`)

Şu anda `ConceptCPipelineView` sadece genel öğrenme yoluna bağlıdır. Bunu platform genelinde yeniden kullanılabilir bir **Universal Pipeline Engine (`CyberPipelineEngine<T>`)** haline getirerek tüm modüllerde ortak veri yapısı ve temayla çalıştıracağız:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 CyberPipelineEngine                    │
                  │  (Telemetry Grid + Plasma Conduit + HUD Focus Mission)  │
                  └─────────────────────────┬──────────────────────────────┘
                                            │
         ┌──────────────────┬───────────────┴──────────────┬──────────────────┐
         ▼                  ▼                              ▼                  ▼
   [Vocabulary]        [Grammar]                       [4 Skills]        [Curriculum]
  (Term Sets A1-C2)  (Rules & FIDIC)              (Read/Write/Listen)    (Daily Orbit)
```

---

## 🗺️ Pipeline Nerelerde ve Nasıl Uygulanabilir? (Modül Önerileri)

### 1. 📘 Vocabulary Sayfası (`/vocabulary`) — _Terminoloji Enerji Hattı_

- **Boru Hattı:** Seçili mühendislik branşına özel 6-8 ana terim istasyonu (örn: _Safety SOPs → Field Tools → Systems & Hydraulics → QA Diagnostics → Technical Leadership_).
- **HUD Odak Kartı:** Aktif terim seti (örn: `A1.2: Technical Tools`), Usta Terim Sayısı (`14/25 Mastered`), Flashcard / Akıllı Egzersiz Başlat butonu.
- **Alt Panel:** Mevcut terim arama, filtreleme, kategori listesi ve Mastered Heatmap korunan düzenle alt kısımda akar.

### 2. 📐 Grammar Sayfası (`/grammar`) — _Mühendislik Dilbilgisi & Şartname Hattı_

- **Boru Hattı:** Kategori bazlı gramer kural istasyonları (örn: _Imperatives in Field Safety → Passive Voice in Failure Reports → Conditional Logic in SOPs → FIDIC Specification Standards_).
- **HUD Odak Kartı:** Seçili gramer kuralı, teknik formül şablonu, doğruluk oranı ve doğrudan interaktif egzersiz/quiz butonu.
- **Alt Kademeler:** _Foundational (A1-A2)_ | _Operational (B1-B2)_ | _Executive / Contractual (C1-C2)_.

### 3. 📄 Reading & Comprehension Sayfası (`/reading`) — _Teknik Dokümantasyon Hattı_

- **Boru Hattı:** Mühendislik belge tipleri hattı (örn: _Safety Data Sheets (SDS) → Technical Datasheets → User Manuals → ISO Standards → FIDIC Red Book Contracts_).
- **HUD Odak Kartı:** Aktif vaka dokümanı, teknik zorluk seviyesi, sektör, doğrudan "Okumaya Başla / Vaka Çöz" butonu.

### 4. ✍️ Writing & RFI Studio Sayfası (`/writing`) — _Raporlama & Yazışma Hattı_

- **Boru Hattı:** Mühendislik yazışma hiyerarşisi (örn: _Daily Site Log → Request for Information (RFI) → Non-Conformance Report (NCR) → Change Order → Tender Proposal_).
- **HUD Odak Kartı:** Seçilen yazışma şablonu, AI değerlendirme skoru, "Taslak Oluştur / AI ile İncele" butonu.

### 5. 🎧 Listening & Site Radio Sayfası (`/listening`) — _Telsiz & Saha İletişimi Hattı_

- **Boru Hattı:** Akustik ortam seviyeleri (örn: _Clear Workshop Briefing → High-Noise Machinery Room → Emergency Radio Transmission → Multilingual Client Meeting_).
- **HUD Odak Kartı:** Aktif ses kaydı, ortam gürültü filtresi (SNR), simülasyonu başlat butonu.

### 6. 🎙️ Speaking & Site Briefing Sayfası (`/speaking`) — _Sözlü Sunum & Brifing Hattı_

- **Boru Hattı:** Sözlü yeterlilik adımları (örn: _Toolbox Talk (TBT) → Handover Briefing → Root Cause Presentation → Boardroom Technical Defense_).
- **HUD Odak Kartı:** Telaffuz & Akıcılık skoru, yapay zeka dinleme simülatörü.

### 7. 🗓️ Daily Curriculum & Missions (`/curriculum/today`) — _Günlük Görev Yörüngesi_

- **Boru Hattı:** Günlük 3-4 adımlık enerji hattı (_Term Drill → Grammar Polish → AI Scenario Practice → Daily Review_).
- **HUD Odak Kartı:** Günlük görev tamamlama rozeti ve XP ödülü.

### 8. 🎯 Seviye Tespit Sınavı (`/placement`) — _Dinamik CEFR Teşhis Hattı_

- **Boru Hattı:** Test ilerleme hattı (_A1 Diagnostic → A2 Calibration → B1 Core → B2 Engineering → C1 Advanced_).

---

## 🛠️ Uygulama Aşamaları (Faz Planı)

| Faz       | Kapsam                                  | Açıklama                                                                    |
| --------- | --------------------------------------- | --------------------------------------------------------------------------- |
| **Faz 1** | `UniversalPipelineEngine` Bileşeni      | Ortak, modüler, generic ve özelleştirilebilir pipeline şablonu oluşturma    |
| **Faz 2** | `VocabularyPage` Entegrasyonu           | Terim setlerini ve branş terminolojisini pipeline'a bağlama                 |
| **Faz 3** | `GrammarPage` Entegrasyonu              | Mühendislik gramer kurallarını ve raporlama şablonlarını pipeline'a bağlama |
| **Faz 4** | `Reading` & `Writing` Entegrasyonu      | Saha dökümanları ve RFI/NCR raporlama akışlarını bağlama                    |
| **Faz 5** | `Listening` & `Speaking` Entegrasyonu   | Telsiz konuşmaları ve sözlü simülatörü bağlama                              |
| **Faz 6** | `Curriculum` & `Placement` Entegrasyonu | Günlük görev rotası ve seviye tespit sınavını bağlama                       |

---

## 🔍 Kalite & Doğrulama Kriterleri

1. **Sıfır Yatay Kayma:** Tüm sayfalarda mouse tekerleği ve taşma koruması korunacak.
2. **In-Card Aksiyonlar:** Egzersiz veya simülatör ekranlarında butonlar kart içine gömülecek (alt bant korunacak).
3. **i18n Desteği:** Tüm yeni başlık ve etiketler 15 dilli sistemle tam uyumlu olacak.
4. **Automated Tests:** Vitest ve TypeCheck %100 başarıyla geçecek.
