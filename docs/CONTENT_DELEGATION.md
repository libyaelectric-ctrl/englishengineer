# EngVox Reading Content — Delegation Package (AI #2)

Bu paket **kelime çevirilerinden tamamen bağımsızdır** (onları AI #1 yapıyor).
Buradaki iş: disiplinlere özgü **okuma görevleri (reading missions)** üretmek.

## Neden

Uygulamada 10 mühendislik disiplini var ama okuma içeriği sadece
Electrical / MEP / QA-QC / Building Systems için mevcut (toplam 10 görev).
Her disiplin kendi mesleki okuma içeriğini almalı.

## Kapsam

Eksik 9 disiplin × 4 CEFR seviyesi = **36 okuma görevi**:

| Disiplin (app ID) | `discipline` alanı değeri  |
| ----------------- | -------------------------- |
| architecture      | `Architecture`             |
| chemical          | `Chemical Engineering`     |
| civil             | `Civil Engineering`        |
| electronics       | `Electronics Engineering`  |
| hse               | `HSE`                      |
| industrial        | `Industrial Engineering`   |
| mechanical        | `Mechanical Engineering`   |
| mechatronics      | `Mechatronics Engineering` |
| software          | `Software Engineering`     |

Her disiplin için 4 görev: **A2, B1, B2, C1** (birer adet).

## Teslim formatı

Disiplin başına tek JSON dosyası (JSON array):

```
data/content/reading/architecture.json
data/content/reading/chemical.json
...
```

## Şema (birebir uyulacak)

```json
[
  {
    "id": "architecture_a2_site_induction",
    "title": "Site Induction Notice — Drawing Register",
    "description": "Read a short site induction notice and find the key instructions.",
    "discipline": "Architecture",
    "cefrLevel": "A2",
    "difficulty": "Beginner",
    "estimatedMinutes": 6,
    "passageText": "... 80-120 kelimelik metin ...",
    "vocabulary": [
      {
        "term": "drawing register",
        "definition": "A controlled list of all project drawings and their revisions.",
        "context": "... metinde geçen cümle ..."
      }
    ],
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "questionText": "...",
        "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctAnswer": "B",
        "explanation": "..."
      },
      {
        "id": "q2",
        "type": "true_false",
        "questionText": "...",
        "correctAnswer": "true",
        "explanation": "..."
      },
      {
        "id": "q3",
        "type": "keyword_answer",
        "questionText": "...",
        "keywords": ["keyword1", "keyword2"],
        "correctAnswer": "beklenen kısa cevap",
        "explanation": "..."
      }
    ],
    "xpReward": 40,
    "coinReward": 15,
    "eloReward": 12,
    "sourceMetadata": {
      "origin": "EngVox original",
      "author": "AI Content Generation",
      "schemaVersion": 1
    }
  }
]
```

Kurallar:

- `id`: `<disiplin>_<seviye>_<konu>` küçük harf, alt çizgili, benzersiz
- `difficulty`: A2 → `Beginner`, B1 → `Intermediate`, B2 → `Upper Intermediate`, C1 → `Advanced`
- `estimatedMinutes`: A2 5-7, B1 8-10, B2 10-12, C1 12-15
- Ödüller: A2 → xp 40/coin 15/elo 12; B1 → 45/18/13; B2 → 50/20/14; C1 → 55/22/15

## İçerik kalite kuralları

1. Metinler **gerçek şantiye/ofis dokümanı türleri** olsun: method statement,
   RFI, inspection report, toolbox talk, snag list, commissioning checklist,
   change order, teknik e-posta, şartname bölümü.
2. CEFR seviyesine sadık kal: A2 kısa ve somut cümleler; C1 sözleşme dili,
   edilgen yapılar, koşul cümleleri içerebilir.
3. Her görevde **5 vocabulary** maddesi; `context` mutlaka metindeki gerçek cümle olsun.
4. Her görevde **3 soru**: 1 multiple_choice + 1 true_false + 1 keyword_answer.
5. Terimler uygulamanın kelime verisiyle uyumlu olsun (site, drawing, tolerance,
   inspection, handover gibi ortak mühendislik terimleri tercih edilir).

## Diğer AI'ye verilecek prompt (kopyala-yapıştır)

> You are writing reading-comprehension content for an engineering-English
> learning app. Produce ONE reading mission as a JSON array (single object)
> for discipline **{DİSİPLİN}**, CEFR level **{SEVİYE}**.
> Follow this exact schema: {şema yukarıdaki gibi}.
> The passage must be an authentic construction/engineering document type
> (e.g. RFI, method statement, inspection report) appropriate to the CEFR
> level. Output raw JSON only, no markdown fences.

Bir AI oturumuna **tek seferde 1 disiplin (4 görev)** verin; 9 disiplin =
9 bağımsız iş, istediğiniz kadar paralel dağıtın.

## Teslim sonrası (Qoder tarafı)

Gelen JSON'lar `data/content/reading/` altına konur; ben bunları
`src/features/reading/reading.<discipline>.data.ts` dosyalarına dönüştürüp
`reading.data.ts` agregatörüne bağlarım + şema doğrulaması eklerim.

## Faz 2 (bu paket bitince)

Aynı modele **listening** (şantiye diyalogları: handover, coordination meeting,
safety briefing) ve **speaking** (role-play senaryoları) içerikleri eklenecek —
şemaları o aşamada bu dokümana eklenecek.
