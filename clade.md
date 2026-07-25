# EngineerOS (englishengineer) — Düzeltme Talimatları

> Bu dosya, repo denetiminde (Claude tarafından) tespit edilen sorunları Mimo'nun
> sırayla düzeltmesi için hazırlanmıştır. Her madde: **Sorun / Neden / Yapılacak /
> Kabul Kriteri** formatındadır. Mimo bitirdikten sonra bu liste tekrar Claude
> tarafından denetlenecektir — bu yüzden hiçbir maddeyi atlamadan, "yapıldı"
> demeden önce kabul kriterini gerçekten sağladığından emin ol.

---

## ÖNCELİK 1 — Güvenlik / Sızıntı (ACİL)

### 1.1 `.agents/` klasörünü git geçmişinden temizle
- **Sorun:** `.gitignore` içinde `.agents/` hariç tutulmuş olsa da
  `.agents/skills/engineeros-deploy/SKILL.md` dosyası repoda commit'li ve
  gerçek Supabase proje URL'si, Supabase anon/publishable key, gerçek
  Upstash Redis URL'si ve Vercel proje ID'sini içeriyor.
- **Neden önemli:** Bu bilgiler public GitHub repo üzerinden herkese açık.
  Anon key tek başına kritik olmasa da proje ID + endpoint bilgisi saldırı
  yüzeyini genişletir.
- **Yapılacak:**
  1. `git filter-repo --path .agents --invert-paths` (veya BFG Repo-Cleaner)
     ile dosyayı **tüm commit geçmişinden** sil, sadece HEAD'den değil.
  2. Force-push sonrası tüm collaborator'ların repoyu yeniden klonlaması
     gerektiğini not al.
  3. Sızan Supabase anon key'i ve Upstash token'ını **rotate et** (Supabase
     dashboard → Settings → API; Upstash console).
  4. `.agents/` klasörünün bundan sonra hiç commit'lenmediğini doğrula:
     `git log --all --full-history -- .agents/` boş dönmeli.
- **Kabul kriteri:** `git log --all -- .agents` hiçbir sonuç döndürmemeli;
  rotate edilen anahtarlarla ilgili yeni değerler sadece Railway/Vercel
  dashboard'larında, repoda değil.

### 1.2 Diğer secret taramasını genişlet
- **Yapılacak:** `git log -p --all | grep -iE "sk-|service_role|secret_key|BEGIN.*PRIVATE"`
  ile geçmişte başka sızıntı olup olmadığını tara. Bulunursa aynı şekilde
  history'den temizle ve rotate et.
- **Kabul kriteri:** Tarama sonucu boş veya bulunanlar rotate edilmiş.

---

## ÖNCELİK 2 — Bozuk Dosyalar

### 2.1 `.gitignore` kodlama bozukluğunu düzelt
- **Sorun:** Dosyanın büyük kısmı UTF-8, son ~3 satırı UTF-16LE (muhtemelen
  Windows'ta `Add-Content` ile eklenmiş). `file .gitignore` şu an "data"
  (binary) dönüyor, "ASCII text" değil.
- **Yapılacak:**
  1. Dosyayı UTF-8 olarak yeniden oluştur (mevcut satırları koru, sadece
     encoding'i düzelt): `iconv -f UTF-16LE -t UTF-8` ile bozuk kısmı çevir
     veya dosyayı elle temiz UTF-8 olarak yeniden yaz.
  2. `FULL_CODEBASE.txt` ve `mimogorev.md` gibi anlamsız/kişisel çalışma
     notu satırlarının gerçekten ignore listesinde kalması gerekip
     gerekmediğini gözden geçir.
- **Kabul kriteri:** `file .gitignore` → `ASCII text` veya `UTF-8 Unicode text`
  dönmeli, `data`/binary dönmemeli.

---

## ÖNCELİK 3 — Dokümantasyon Tutarlılığı

### 3.1 Kırık README referanslarını düzelt
- **Sorun:** README şu dosyalara atıf yapıyor ama hiçbiri yok:
  - `DEPLOYMENT.md` (kökte)
  - `PROJECT_PACKAGE_GUIDE.md`
  - `TESTING.md`
- **Yapılacak (ikisinden birini seç):**
  - **A)** Bu üç dosyayı gerçekten oluştur (içerik: deploy adımları, paketleme
    rehberi, test stratejisi — zaten `docs/deployment.md` ve
    `docs/TESTING_STRATEGY.md` içinde dağınık halde mevcut, oradan derle).
  - **B)** README'deki referansları kaldır veya var olan doğru dosyalara
    (`docs/deployment.md`, `docs/TESTING_STRATEGY.md`) işaret edecek şekilde
    güncelle.
- **Kabul kriteri:** README'de bahsi geçen her dosya yolu gerçekten repoda
  var olmalı (case-sensitive kontrol dahil).

### 3.2 Case-mismatch linklerini düzelt
- **Sorun:** `docs/README.md` ve `docs/ONBOARDING.md`, `docs/DEPLOYMENT.md`
  (büyük harf) diye referans veriyor ama gerçek dosya `docs/deployment.md`
  (küçük harf). Linux/Vercel gibi case-sensitive sistemlerde bu kırılır.
- **Yapılacak:** Ya dosyayı `docs/DEPLOYMENT.md` olarak yeniden adlandır ya
  da tüm referansları küçük harfe çevir. Tek bir standarda karar ver ve
  tüm repoda tutarlı uygula.
- **Kabul kriteri:** `grep -rn "DEPLOYMENT.md" --include="*.md" .` içindeki
  her satırın harf büyüklüğü gerçek dosya adıyla birebir eşleşmeli.

### 3.3 Çelişen öz-değerlendirme raporlarını birleştir
- **Sorun:** Üç ayrı VC checklist dosyası (`docs/VC_CHECKLIST_SCORE.md`,
  `docs/VC_CHECKLIST_SCORE_100.md`, `docs/VC_CHECKLIST_SCORE_FRESH.md`) ve
  silinecek `.agents/skills/.../SKILL.md` içindeki puanlama tablosu
  birbiriyle çelişiyor (`%70.6` vs `100/100`).
- **Yapılacak:**
  1. Üç dosyayı tek bir güncel, tarihli, kanıta dayalı dosyada birleştir
     (`docs/VC_CHECKLIST_SCORE.md` kalsın, diğer ikisini sil veya
     `docs/archive/`'a taşı).
  2. Puanlamanın "kanıt" sütununu gerçek test/build sonuçlarıyla güncelle
     (bkz. Öncelik 4).
- **Kabul kriteri:** `docs/` altında tek bir güncel VC checklist dosyası
  kalmalı, tarihi ve puanı Öncelik 4'teki gerçek test sonuçlarıyla tutarlı
  olmalı.

### 3.4 `docs/` klasörünü sadeleştir
- **Sorun:** 60+ markdown dosyası var, çoğu tekrar/arşiv niteliğinde
  (`docs/internal-process-archive/` 348K).
- **Yapılacak:** Dış paydaşlara (yatırımcı, yeni geliştirici) yönelik
  olmayan iç süreç notlarını `docs/archive/` altına taşı, ana `docs/`
  klasöründe sadece güncel/aktif dokümanlar kalsın.
- **Kabul kriteri:** `docs/` kök dizininde sadece aktif/güncel dosyalar
  görünür durumda.

---

## ÖNCELİK 4 — Doğrulama (Gerçek Sonuçlarla Kanıtlama)

### 4.1 Build/lint/test'i gerçekten çalıştır ve sonuçları kaydet
- **Sorun:** Bu denetimde bağımlılık kurulumu zaman kısıtı nedeniyle
  yapılamadı; mevcut dokümanlardaki "380+ test geçiyor", "100/100" gibi
  iddialar bağımsız doğrulanmadı.
- **Yapılacak:**
  ```bash
  npm ci
  npm run typecheck
  npm run lint
  npm run test
  npm run build
  npm --prefix backend ci
  npm --prefix backend test
  ```
  Çıktıları (hata sayısı, geçen/kalan test sayısı, build başarı/başarısızlığı)
  `docs/VC_CHECKLIST_SCORE.md` içine tarih damgasıyla ekle.
- **Kabul kriteri:** Her komutun gerçek çıktısı (kopyala-yapıştır log,
  uydurma değil) dokümana eklenmiş olmalı.

### 4.2 Canlı deployment iddialarını doğrula
- **Sorun:** `englishengineer.vercel.app` ve `...railway.app` prod URL'leri
  dokümanlarda geçiyor ama bu denetimde canlı erişilebilirlikleri
  doğrulanamadı.
- **Yapılacak:** `curl -I https://englishengineer.vercel.app` ve
  `curl -s https://englishengineer-production.up.railway.app/api/health`
  çalıştır, sonucu not al. Çalışmıyorsa README'deki iddiayı düzelt.
- **Kabul kriteri:** README'deki deployment durumu gerçek curl sonucuyla
  birebir örtüşmeli.

---

## ÖNCELİK 5 — Kabul Edilmiş Teknik Borç (docs/TECH_DEBT.md)

Aşağıdaki "High Priority" maddeleri kapat (Medium/Low şimdilik opsiyonel):

- **TD-001:** `src/pages/WritingPage.tsx` 500+ satır — küçük component'lere böl.
- **TD-002:** `src/features/billing/billing-flow.test.tsx` içindeki iş
  mantığını custom hook'lara çıkar.
- **TD-003:** Kilit route'lara error boundary ekle.

Her biri kapatıldığında `docs/TECH_DEBT.md` içindeki `Status` sütununu
`Open` → `Resolved` yap ve hangi commit'te çözüldüğünü not et.

---

## Mimo Bitirdiğinde Ne Yapmalı

Her öncelik grubunu bitirdikten sonra durdur ve şunu bildir:
- Hangi maddeler tamamlandı, hangileri atlandı ve neden.
- Öncelik 4'teki komutların gerçek çıktı loglarını paylaş.
- `.agents/` temizliği yapıldıysa, force-push sonrası repo linkini tekrar ver.

Bu liste tamamlandıktan sonra repo **Claude tarafından yeniden denetlenecek**;
"yapıldı" diye işaretlenip gerçekte çözülmemiş maddeler bir sonraki denetimde
tekrar açık olarak raporlanacaktır.
