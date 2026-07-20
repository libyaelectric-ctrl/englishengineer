# Görev: TECH_DEBT.md'deki tip güvenliği maddesini kodla karşılaştır ve güncelle

## Bağlam
`docs/TECH_DEBT.md` içinde şu madde var:

> ### TD-007: Improve Type Safety
> **File:** `backend/src/ai.js`
> **Issue:** Uses `any` type in places

Ancak repo taramasında `backend/src/ai.js` diye bir dosya artık yok — dosya
muhtemelen `backend/src/ai.ts` olarak yeniden adlandırılmış/dönüştürülmüş.
Bu, tech-debt dokümanının koddan geride kaldığını gösteriyor.

## Yapılacaklar
1. `backend/src/ai.ts` (ve varsa ilgili `ai-core/`, `ai-ledger.ts`,
   `ai-memory.ts`, `ai-monitoring.ts` dosyalarını) `: any` ve `as any`
   kullanımı için tara:
   ```bash
   grep -rn ": any\b\|as any\b" backend/src --include="*.ts"
   ```
2. Bulunan her `any` kullanımı için:
   - Mümkünse gerçek/daraltılmış bir tip tanımla (gerekirse
     `backend/types.d.ts` içine yeni bir tip ekle).
   - Gerçekten dinamik/öngörülemez bir yapı ise (örn. üçüncü parti AI
     sağlayıcı ham yanıtı), `unknown` + tip daraltma (type guard) kullan,
     `any` yerine.
3. `docs/TECH_DEBT.md`'yi güncelle:
   - TD-007 maddesini ya kapat (dosya artık `.ts` ve `any` kalmadıysa
     "Resolved" olarak işaretle, tarih ekle) ya da güncel dosya adı ve
     satır numaralarıyla yeniden yaz.
4. Aynı taramayı `src/` için de çalıştırıp (mevcut sonuç 0 çıkmıştı, bunu
   doğrula ve TECH_DEBT.md'de bu bilgiyi tazele) genel bir
   "tip güvenliği: temiz" notu ekle.
5. Tüm `docs/TECH_DEBT.md` maddelerini gözden geçir: her maddenin
   `File:` alanındaki yolun hâlâ repoda var olduğunu doğrula, olmayanları
   güncelle veya kaldır.

## Kabul kriterleri
- [ ] `backend/src` içinde gereksiz `any` kalmadı (ya da kalanlar
      gerekçesiyle TECH_DEBT.md'de belgelendi).
- [ ] `docs/TECH_DEBT.md`'deki her `File:` referansı gerçek, mevcut bir
      dosya yoluna işaret ediyor.
- [ ] `npm run typecheck` (root ve backend için ayrı ayrı,
      `npm --prefix backend run typecheck`) temiz geçiyor.
- [ ] `npm run backend:test` temiz geçiyor.
