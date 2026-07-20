# Görev: Marka kimliğini standart Tailwind paletinden ayırt edici hale getir

## Bağlam
`docs/DESIGN_SYSTEM.md` içindeki renk paleti (Primary `#3B82F6`, Primary Dark
`#1D4ED8`, Primary Light `#93C5FD`) neredeyse birebir Tailwind CSS'in
varsayılan `blue-500` / `blue-700` / `blue-300` değerlerine denk geliyor.
Bu, ürünü "jenerik SaaS mavisi" hissi veren, ayırt edici olmayan bir görsel
kimliğe sokuyor. Bu görev **isteğe bağlı/subjektiftir** — önce mevcut
marka varlıklarını (logo, maskot) incele, kararı ona göre ver.

## Yapılacaklar
1. `public/brand/` altındaki `logo-hq.webp`, `mascot-hq.webp`,
   `arkaplan.webp`/`background.webp` dosyalarını incele — mevcut marka
   renkleri zaten bu görsellerde tanımlı olabilir. Yeni palet bu görsellerle
   uyumlu olmalı, çelişmemeli.
2. `src/index.css` içindeki mevcut CSS custom property'leri (varsa
   `--color-*` gibi Tailwind v4 tema değişkenleri) ve
   `docs/DESIGN_SYSTEM.md`'yi karşılaştır — ikisi tutarlı mı kontrol et.
3. Ayırt edici bir birincil renk önerisi geliştir: doğrudan Tailwind'in
   varsayılan `blue-500/700/300` üçlüsünü kullanmak yerine, ya
   (a) hex değerlerini birkaç derece kaydır (ton/doygunluk farklılaştır),
   ya da (b) markanın "mühendislik/inşaat" temasına uygun ikincil bir vurgu
   rengi (örn. güvenlik turuncusu, çelik grisi gibi endüstriyel bir ton)
   ekleyerek paleti zenginleştir. Kararı ver, gerekçesini
   `docs/DESIGN_SYSTEM.md`'ye 2-3 cümleyle yaz.
4. Yeni paleti `src/index.css` (Tailwind v4 `@theme` / CSS variables) ve
   `docs/DESIGN_SYSTEM.md` içinde eşzamanlı güncelle — tek kaynak olarak
   CSS dosyasını referans al, doküman ondan türetilsin.
5. Storybook'u (`npm run storybook`) kullanarak birkaç temel bileşende
   (buton, kart, badge) yeni paletin görsel olarak makul göründüğünü
   kontrol et.
6. Görsel regresyon testi varsa (`tests/browser/visual-regression.spec.ts`)
   beklenen snapshot'ları güncelle.

## Kabul kriterleri
- [ ] `docs/DESIGN_SYSTEM.md` ve `src/index.css` aynı renk değerlerini
      kaynak gösteriyor (tek doğruluk kaynağı CSS, doküman ondan türetilmiş).
- [ ] Yeni palet mevcut logo/maskot görselleriyle çelişmiyor.
- [ ] `npm run build-storybook` hatasız tamamlanıyor.
- [ ] Görsel regresyon testleri güncellendi ve geçiyor (varsa).
- [ ] Bu değişiklik ayrı, geri alınabilir bir commit/PR olarak yapıldı
      (subjektif bir karar olduğu için diğer düzeltmelerle karıştırılmadı).
