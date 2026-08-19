# AI #1 — Sıradaki Çeviri Görevi (2026-08-05, güncellendi)

## Durum özeti

P1 (A1+A2, 3.020 kelime) **TAMAMLANDI** — 14 dilin tamamında %100 (3.020/3.020).
Canlıda: https://eng-vox.vercel.app

- GÖREV 1 (chunk-011 finali) kapatıldı; teslim gerekmez.
- Kalan tek iş: **GÖREV 2 — P2**.

## GÖREV 2 — P2 (B1–C2) ana iş

P2 chunk'ları hazır: `data/translations/chunks/chunk-012.json` … `chunk-048.json`
(37 chunk × ~300 kelime = 11.056 kelime).

- Her teslim = **1 chunk × 1 dil** dosyası (örn. `chunk-012.de.json`).
- 14 hedef dil: `tr ar de es pt fr ru zh ja it vi pl id nl` (tr dahil — `meaning_tr` kaynaktan `meaning` alanına, definition/example EN'den).
- Sırayla başla: chunk-012, chunk-013, … ; diller serbest.
- Aynı adlandırma + format + kurallar geçerli.

## Teslim sonrası (Qoder tarafı — siz yapmayın)

Gelen dosyalar `data/translations/results/` altına konur; ben `validate` +
`merge` + deploy yaparım.
