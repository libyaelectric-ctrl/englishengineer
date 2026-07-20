# Fix Prompts — EngineerOS Repo Audit Follow-up

Bu klasör, `englishengineer` reposu için yapılan denetimde bulunan 8 sorunu
düzeltmek üzere hazırlanmış, birbirinden bağımsız prompt dosyalarını içerir.

## Nasıl kullanılır

Her dosyayı ilgili kodlama ajanına (Claude Code, Cursor, vs.) tek başına
verebilirsiniz. Örnek (Claude Code):

```bash
cd englishengineer
claude "$(cat prompts/01-fix-coverage-gate.md)"
```

Ya da tüm dosyaları sırayla, her birinden sonra `npm run typecheck && npm run lint && npm test`
çalıştırarak uygulayın — birbirlerine bağımlı değiller, istediğiniz sırada
uygulanabilirler. Öncelik sırası önerisi (etki/risk dengesine göre):

1. `01-fix-coverage-gate.md` — CI/dokümantasyon tutarsızlığı (düşük risk, hızlı)
2. `02-fix-security-audit-gate.md` — güvenlik taraması zorunlu hale getirme
3. `03-remove-console-log.md` — küçük temizlik
4. `04-reorganize-docs.md` — repo düzeni
5. `05-audit-backend-any-types.md` — tip güvenliği doğrulama
6. `06-bundle-size-code-splitting.md` — performans (orta risk, test gerektirir)
7. `07-design-system-refresh.md` — görsel kimlik (isteğe bağlı/subjektif)
8. `08-bus-factor-onboarding-docs.md` — dokümantasyon eklemesi

### Öğrenme motoru (kişisel öğrenme kuralları) denetimi — ikinci tur

9. `09-unify-vocabulary-scheduling.md` — **kritik**: kelime tekrar sisteminde
   iki ayrı, birbirinden habersiz "ne zaman tekrar edilsin" hesabı var
   (gerçek SM-2 motoru vs. sabit kurallı menü servisi). Önce bunu düzelt.
10. `10-resolve-learning-path-advisor.md` — yazılmış ama hiçbir yere
    bağlanmamış bir haftalık plan motoru için karar (bağla ya da kaldır).
11. `11-unify-cefr-type.md` — aynı CEFR sabiti üç yerde ayrı ayrı tanımlı,
    tek kaynağa indir.
12. `12-centralize-proficiency-thresholds.md` — seviye/zorluk eşiklerini
    ortak bir modülde topla, magic number'ları merkezi hale getir.

Öncelik: 09 > 11 > 10 > 12 (09 kullanıcının doğrudan gördüğü bir tutarsızlığı
düzeltiyor, en yüksek etkiye sahip).

## Genel kural (her prompt için geçerli)

Her prompt, ajana şunu hatırlatır: değişiklikten sonra
`npm run typecheck`, `npm run lint`, `npm test` ve varsa `npm run build`
komutlarının temiz geçtiğini doğrula, sonra değişikliği özetle.
