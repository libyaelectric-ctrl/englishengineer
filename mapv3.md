# EngineerOS — Devam Talimatı: 1200 → 1800/2000 (Eski Sorunları Düzelt + Kalan 4 Blok)

Bu dosya kendi başına yeterlidir, yeni oturumda baştan sona ver. Önceki turda **gerçek ilerleme oldu** (20/22 dosya doğrulandı, testler doğru) ama **2 gerçek eksik** bulundu — önce onları düzelt, sonra kalan 4 bloğa geç.

---

## BÖLÜM 0 — KURALLAR (değişmedi, tekrar oku)

1. Tek görev, tek commit, tek amaç. Bitirmeden sonrakine geçme, kendi başına ek iş üretme.
2. Her commit sonrası, push etmeden önce mutlaka:
   ```bash
   npx tsc --noEmit
   npx vitest run --configLoader runner --exclude "src/e2e/**"
   cd backend && npm test
   ```
   Üçü de geçmeden push etme.
3. Backend'de düşük seviye HTTP/header kodu değiştiriyorsan, local'de gerçek bir istek atıp (`curl`) doğrula — sadece test geçmesi yetmez.
4. Kendi başına özellik/modül ekleme. Sadece bu dosyadaki görevleri yap.
5. Uydurma rapor yok. Gerçek komut çıktısı yapıştır. Kötü sonuç çıkarsa sakla­madan yaz.
6. **İşi bitirince mutlaka `git push` yap ve bana hangi commit hash'inin push edildiğini söyle** — geçen sefer bu adım atlanıp "bitti" denmişti, ben GitHub'da göremeyince karışıklık oldu. Push olmadan "tamamlandı" deme.
7. DOKUNMA: `backend/src/auth.js`, `backend/src/ai-core/**`, Redis/RAG Memory dosyaları, `vocabulary.data.json/.ts`, `docs/PERFORMANCE_TEST_RESULTS.md`, `docs/TEST_COVERAGE_REPORT.md`, `tests/load/*.js`.

---

## BÖLÜM 1 — ÖNCE DÜZELT: Önceki Turdan Kalan 2 Gerçek Eksik

### Düzeltme 1 — RBAC middleware gerçekten yok
Önceki rapor "RBAC doğrulama ✅" dedi ama `backend/src/middleware/rbac.middleware.js` diye bir dosya **repoda yok**, hiçbir yerde rol bazlı yetkilendirme kodu bulunamadı.
- Gerçek bir RBAC middleware yaz: en az `admin` ve `user` rolü, route bazlı yetki kontrolü (örn. `requireRole('admin')` middleware'i).
- Mevcut auth zincirine (DOKUNMA listesindeki `auth.js`'e değil, onu **kullanan** route tanımlarına) entegre et.
- En az 2-3 gerçek route'ta kullan (örn. az önce eklenen audit-log endpoint'i admin-only olmalıydı zaten, oraya bağla).
- Test yaz: admin olmayan kullanıcı admin route'una erişmeye çalışınca 403 dönüyor mu.

### Düzeltme 2 — Health check hâlâ gerçek ping yapmıyor
`toPublicHealth` fonksiyonu hâlâ sadece "env değişkeni var mı" (`configured`) kontrolü yapıyor, gerçekten Supabase'e/Redis'e bağlanıp bağlanamadığını test etmiyor. Önceki oturumda bu bilinçli olarak "testleri bozar" gerekçesiyle atlanmıştı.
- Şimdi doğru yap: `/api/health` endpoint'ini asenkron yap, gerçekten Supabase'e basit bir `select` (örn. `SELECT 1` veya en ucuz bir sorgu) at, Redis'e (varsa) bir `PING` at.
- Test ortamında bunun nasıl çalışacağını düşün: gerçek ağ çağrısı yapan kısmı mock'la (Supabase/Redis client'ı test'te mock'lanabilir), ama **production kodu gerçekten ping atmalı** — sadece "configured" kontrolü değil.
- 5 saniyelik bir timeout koy, timeout olursa `degraded` dön.
- Bunu yaparken testleri kırma; health testlerini mock'lu ping'i test edecek şekilde güncelle.

### Düzeltme 3 — Hijyen
- `docs/~$ployment.md` diye yanlışlıkla commitlenmiş bir Word geçici kilit dosyası var, sil.
- `PROGRESS.md` dosyasını da artık `docs/PROGRESS.md` olarak repoya commit et (bir önceki turda bu hiç push edilmemişti) ve her blok bitince güncelle.

---

## BÖLÜM 2 — KALAN 4 BLOK

### Blok 9 — AI & Enterprise Readiness (91 → 150)
- [ ] AI eval seti: 20-30 örnek input/expected-output çifti, otomatik skorlama script'i (`backend/src/ai-core` DOKUNMA listesinde ama yeni bir `backend/scripts/ai-eval.js` script'i ayrı dosya olarak eklenebilir, mevcut ai-core dosyalarına dokunmadan)
- [ ] RBAC'ı kullanan basit bir organizasyon/team izin sistemi (Düzeltme 1 ile birlikte gelir)
- [ ] Basit admin dashboard: kullanıcı sayısı, aktif abonelik sayısı, günlük AI kullanımı — mevcut audit log ve billing verisini kullanarak
- [ ] Audit log kullanan basit bir Activity Timeline UI (admin panelinde)
- [ ] AI çıktılarına temel bir içerik filtresi/uzunluk sınırı, `docs/AI_GUARDRAILS.md` ile dokümante et

### Blok 10 — Documentation & Governance (66 → 130)
- [ ] En az 3 mimari diyagram (Mermaid formatında, markdown içine gömülü yeterli): sistem mimarisi (C4 Context/Container), veri akışı, auth flow — `docs/architecture/` klasörüne
- [ ] `public/api-docs.html`'i güncelle (yeni RBAC/health endpoint'lerini de içersin)
- [ ] `docs/adr/` klasörü, en az 8 ADR: örn. "Neden Supabase," "Neden Zustand," "Neden JWT+HMAC," "Neden Redis/Upstash," "Neden feature-based mimari," "Neden mock AI provider modu," "Neden RBAC middleware pattern'i," "Neden Stripe"
- [ ] `docs/CODE_REVIEW_GUIDELINES.md`
- [ ] `docs/GOVERNANCE.md`
- [ ] `docs/VENDOR_RISK.md` — Supabase/Stripe/Vercel/Railway bağımlılığı ve çıkış stratejisi
- [ ] `docs/I18N_STRATEGY.md`

### Blok 1 — Executive Summary & Architecture (100 → 160)
- [ ] `docs/EXECUTIVE_SUMMARY.md`
- [ ] `docs/RISK_REGISTER.md` — bilinen riskleri (RBAC yeni eklendi ama test kapsamı düşük, coverage %10.61, vs.) önceliklendirilmiş tablo
- [ ] `docs/ENGINEERING_STANDARDS.md`
- [ ] `docs/SCALABILITY_PLAN.md`
- [ ] `docs/ROADMAP.md`
- [ ] `WritingPage.tsx`, `ReadingPage.tsx` gibi büyük dosyaları (1000+ satır) alt bileşenlere böl — daha önce `ProfilePage`/`VocabularyPage` için yapılan desenin aynısı

### Blok 2 — Code Quality (122 → 165)
- [ ] ESLint `complexity` kuralı aktif et, CI'a ekle
- [ ] `jscpd` kur, CI'a duplication raporu ekle
- [ ] GitHub Issues'da `tech-debt` etiketiyle bilinen 10-15 borç maddesi aç (büyük dosyalar, düşük coverage, health check sınırlamaları vb. — gerçek maddeler)

---

## BÖLÜM 3 — TESLİM

Her blok bitince `docs/PROGRESS.md`'ye ekle (üzerine yazma). İşin tamamı bitince (ya da 3 saat dolunca) dur, şunu raporla:
- Hangi bloklar bitti, hangileri kaldı
- Düzeltme 1/2/3'ün gerçekten yapıldığının kanıtı (RBAC test çıktısı, health check'in gerçek ping attığını gösteren log)
- **Push edilen son commit hash'i** — bu olmadan rapor eksik sayılır
- 3 standart komutun (tsc, frontend test, backend test) son çıktısı
