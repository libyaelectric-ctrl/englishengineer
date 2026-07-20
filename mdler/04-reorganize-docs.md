# Görev: `docs/` klasörünü sadeleştir, iç süreç kanıt dosyalarını arşivle

## Bağlam
`docs/` klasöründe 60+ dosya var. Bunların önemli bir kısmı proje
dokümantasyonu (ADR'ler, mimari, uyumluluk) olsa da, `faz3-evidence/`,
`faz4-evidence/`, `faz5-evidence/`, `faz6-evidence/`, `faz7-evidence/`,
`final-evidence/`, `internal-process/` gibi klasörler geliştirme sürecinin
iç kanıt/log dosyaları (`kademeXX.txt`, `maddeXX.txt` gibi) ve okuyucuya
(katkıda bulunan/incelemeci) gerçek ürün dokümantasyonu gibi görünüyor,
kalabalık yaratıyor.

## Yapılacaklar
1. `docs/` altındaki dosyaları iki kategoriye ayır:
   - **Ürün/mimari/uyumluluk dokümantasyonu** (kalıcı, okuyucuya yönelik):
     `ADR`, `architecture/`, `compliance/`, `DESIGN_SYSTEM.md`,
     `DATA_MODEL.md`, `GLOSSARY.md`, `PRODUCT.md`, `ROADMAP.md`,
     `TESTING_STRATEGY.md`, `TECH_DEBT.md`, `RISK_REGISTER.md` vb.
   - **İç süreç kanıt/log dosyaları** (geliştirme sürecinin arşivi):
     `faz*-evidence/`, `final-evidence/`, `internal-process/`.
2. İkinci kategoriyi `docs/internal-process-archive/` adlı tek bir klasöre
   taşı (alt klasör yapısını koruyarak, örn.
   `docs/internal-process-archive/faz3-evidence/...`).
3. `docs/` kök dizinine kısa bir `docs/README.md` ekle: hangi dosyanın nerede
   olduğunu, `internal-process-archive/`'ın ne olduğunu (geliştirme
   sürecinin iç kanıt kayıtları, güncel ürün dokümantasyonu değil) açıklayan
   2-3 paragraf.
4. Ana `README.md`'de `docs/` klasörüne veren linkleri kontrol et, kırılmış
   link kalmasın.
5. `scripts/verify-evidence-consistency.js` gibi bu dosyaları referans alan
   script varsa, yeni path'lere göre güncelle (CI workflow'unda da
   `docs/faz5-evidence` gibi referanslar var — onları da güncelle).

## Kabul kriterleri
- [ ] `docs/` kök dizininde artık sadece kalıcı ürün/mimari dokümantasyonu
      var; iç süreç kanıtları `internal-process-archive/` altında.
- [ ] `docs/README.md` eklendi ve klasör yapısını açıklıyor.
- [ ] `.github/workflows/*.yml` içindeki path referansları güncellendi,
      CI kırılmıyor.
- [ ] Hiçbir dosya silinmedi, sadece taşındı (git history korunmalı —
      `git mv` kullan).
