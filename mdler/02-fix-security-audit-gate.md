# Görev: Güvenlik açığı taramasını gerçekten zorunlu (blocking) hale getir

## Bağlam
`.github/workflows/security.yml` içinde `npm audit --audit-level=moderate`
ve `npx audit-ci --moderate` adımları `continue-on-error: true` ile
işaretli. Bu, bilinen güvenlik açıkları bulunsa bile CI'ın yeşil kalacağı
anlamına geliyor — tarama sadece "bilgilendirme" amaçlı çalışıyor, gerçek bir
kapı değil.

## Yapılacaklar
1. Önce mevcut durumu ölç: `npm audit --audit-level=moderate` çalıştır ve
   çıktıyı incele. Kaç adet high/critical açık var, kaç tanesi moderate?
2. Eğer mevcut high/critical açık sayısı sıfırsa:
   - `npm audit --audit-level=high` adımından `continue-on-error: true`
     satırını kaldır (yani en az high/critical seviyesini blocking yap).
   - `moderate` seviyesini `continue-on-error: true` olarak bırakabilirsin
     (moderate seviyesi genelde false-positive'e daha açık olabilir),
     ama bunun bilinçli bir karar olduğunu workflow dosyasına yorum
     satırıyla not düş.
3. Eğer mevcut high/critical açıklar varsa:
   - Önce bu açıkları `npm audit fix` ile (breaking change'e dikkat ederek)
     gidermeyi dene.
   - Otomatik düzeltilemeyenler için `docs/TECH_DEBT.md`'ye her biri ayrı
     madde olarak ekle (paket adı, açık seviyesi, neden hemen
     güncellenemediği, hedef tarih).
   - Gate'i yine de high/critical seviyede blocking yap; gerekiyorsa geçici
     olarak belirli CVE'leri `audit-ci` config'inde allowlist'e al ama bunu
     `docs/RISK_REGISTER.md`'ye açık bir risk maddesi olarak işle.
4. `dependency-review` job'ı zaten var; onun da PR'larda gerçekten
   engelleyici olduğunu doğrula (fail-on-severity ayarını kontrol et).

## Kabul kriterleri
- [ ] En az high/critical seviyesindeki güvenlik açıkları artık CI'ı
      gerçekten kırıyor (continue-on-error kaldırıldı veya severity eşiği
      netleştirildi).
- [ ] Bilinçli olarak es geçilen her açık, `docs/TECH_DEBT.md` veya
      `docs/RISK_REGISTER.md`'de gerekçesiyle kayıtlı.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` temiz geçiyor
      (bağımlılık güncellemesi yapıldıysa özellikle önemli).
