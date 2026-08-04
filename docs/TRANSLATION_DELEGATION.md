# EngVox Vocabulary Translation — Delegation Package

Bu doküman, kelime çevirilerinin **başka bir AI'ye devredilmesi** veya
**DeepL ile otomatik** yapılması için gerekli her şeyi içerir.

## Hedef

14.199 kelimelik mühendislik İngilizcesi korpusunu 14 hedef dile çevirmek:
`tr ar de es pt fr ru zh ja it vi pl id nl`

Her kelime için 3 alan çevrilir:

| Alan         | Kaynak dil                  | Açıklama                          |
| ------------ | --------------------------- | --------------------------------- |
| `meaning`    | Türkçe (`meaning_tr`)       | Kısa anlam karşılığı (1-4 kelime) |
| `definition` | İngilizce (`definition_en`) | Tam tanım cümlesi                 |
| `example`    | İngilizce (`example_en`)    | Örnek cümle                       |

## Fazlar

| Faz    | Kapsam             | Kelime  | Chunk                |
| ------ | ------------------ | ------- | -------------------- |
| **P1** | A1 + A2 seviyeleri | 3.003   | 11 chunk × 300       |
| P2     | B1–C2 seviyeleri   | ~11.196 | extract ile üretilir |

P1 bittikten sonra `extract --priority p2` ile ikinci faza geçilir.

---

## SEÇENEK A — Başka bir AI'ye devretme (önerilen başlangıç)

### İş akışı

```bash
# 1. Chunk'ları üret (bir kez yapıldı: data/translations/chunks/chunk-001..011.json)
python scripts/translate-vocabulary-chunks.py extract --priority p1 --chunk-size 300

# 2. Her chunk + her dil için diğer AI'den sonuç dosyası iste (aşağıdaki prompt)
#    Gelen dosyayı şuraya kaydet:
#    data/translations/results/chunk-001.ar.json

# 3. Doğrula
python scripts/translate-vocabulary-chunks.py validate --file data/translations/results/chunk-001.ar.json

# 4. Ana dosyaya birleştir
python scripts/translate-vocabulary-chunks.py merge

# 5. Kapsam raporu
python scripts/translate-vocabulary-chunks.py stats
```

### Diğer AI'ye verilecek prompt (kopyala-yapıştır)

> You are translating an engineering-English vocabulary dataset for a language
> learning app. I will give you a JSON array of terms. For EACH term produce
> translations into **{DİL ADI} ({dil kodu})**:
>
> - `meaning`: translate the `meaning_tr` field (short gloss, 1-4 words).
> - `definition`: translate the `definition_en` field (full sentence).
> - `example`: translate the `example_en` field (keep it natural in {DİL ADI}).
>
> RULES:
>
> 1. These are **engineering/construction-site terms**. Choose the technical
>    meaning, not the everyday one (e.g. "panel", "switch", "line", "load").
> 2. Output MUST be a single valid JSON object keyed by the exact `term`
>    strings I gave you, no markdown fences, no commentary:
>    `{"height": {"meaning": "...", "definition": "...", "example": "..."}, ...}`
> 3. Keep every input term; do not add or remove keys.
> 4. No placeholder tokens, no `|||` separators, no empty strings.
> 5. Preserve numbers, units and brand-like tokens as-is.
>
> Here is the input chunk:
>
> ```json
> {CHUNK İÇERİĞİ}
> ```

Chunk dosyaları `data/translations/chunks/chunk-NNN.json` içindedir; her giriş
şu şekildedir (AI yalnızca `meaning_tr`, `definition_en`, `example_en` alanlarını çevirir):

```json
{
  "term": "height",
  "domain": "architecture",
  "cefrLevel": "A1",
  "meaning_tr": "yükseklik",
  "definition_en": "A architecture term meaning yükseklik, used in ...",
  "example_en": "Please confirm the ceiling height before we order the supports."
}
```

### Sonuç dosyası adlandırma kuralı

```
data/translations/results/chunk-<NNN>.<dil>.json
örn: chunk-003.ar.json, chunk-003.es.json
```

`validate` komutu şunları kontrol eder: tüm terimler mevcut mu, 3 alan dolu mu,
placeholder/artık işaret yok mu. Sorunlu dosyalar `merge` tarafından otomatik atlanır.

### Paralelizasyon önerisi

Diller bağımsızdır — 11 chunk × 14 dil = **154 bağımsız iş** vardır.
Birden fazla AI oturumuna aynı anda farklı dil/chunk verebilirsiniz.

---

## SEÇENEK B — DeepL ile otomatik (hızlı, ücretli)

`.env` içinde `DEEPL_API_KEY` olmalı. Yaklaşık karakter maliyeti:
dil başına ~0,5 M karakter (P1) → DeepL Pro kotasına sığar.

```bash
python scripts/translate-vocabulary-chunks.py deepl --chunk 001 --lang all
python scripts/translate-vocabulary-chunks.py deepl --chunk 002 --lang all
# ... sonra
python scripts/translate-vocabulary-chunks.py merge
```

Yarım kalırsa kaldığı yerden devam eder (`results/` dolu olanlar atlanır, `--force` ile tekrar).

## SEÇENEK C — NLLB (ücretsiz, yerel, düşük kalite)

`scripts/translate-vocabulary-nllb.py` mevcuttur; sadece taslak üretim için
kullanın, nihai içerik için A veya B önerilir.

---

## Çeviriler geldikten sonra (Qoder tarafında yapılacaklar)

1. `merge` ile `data/translations/vocabulary-translations.json` güncellenir.
2. Frontend'e `getTermTranslation(term, language)` katmanı eklenir:
   bulunamazsa zincir `seçilen dil → tr → EN tanım` şeklinde düşer.
3. WordCard / quiz / CSV bileşenleri bu soyutlamaya bağlanır.
4. Her dil tesliminde deploy tekrarlanır — uygulama dilleri kademeli kazanır.

## Mevcut durum (bu doküman yazıldığında)

- Kaynak korpus: 14.199 benzersiz kelime (`data/canonical/vocabulary/vocabulary.normalized.json`)
- Çevrili: 208 kelime × 14 dil (%1)
- P1 hedef: 3.003 kelime × 14 dil (42.042 terim-dil girdisi)
