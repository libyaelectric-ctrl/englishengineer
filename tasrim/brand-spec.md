# EngineerOS Ikon Sistemi Marka Özeti

Kaynak: `C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0\docs\DESIGN_SYSTEM.md` ve `src\index.css`.

```css
:root {
  --bg: oklch(98.26% 0.0095 299.24);
  --surface: oklch(100% 0 89.88);
  --fg: oklch(15.49% 0.0337 281.74);
  --muted: oklch(47.51% 0.032 285.12);
  --border: oklch(88.82% 0.0136 286.12);
  --accent: oklch(44.3% 0.1928 261.11);
}
```

Fontlar: display/body `'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif`; mono `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`.

Postür kuralları:

- Mühendislik ürünü gibi davran: kompakt, ölçülü, bilgi yoğun; dekoratif ikon yerine görev ikonları.
- Lucide React ana ikon kütüphanesi; özel SVG yalnızca grafik/veri görselleştirmesi için.
- Radius 4px; ikon kapsayıcıları da aynı köşe dilini korur.
- Birincil vurgu mühendislik mavisiyle sınırlı kalır; ikonların çoğu `currentColor` ile metin hiyerarşisini izler.
- Navigasyon ikonları aynı boy ve optik ağırlıkta kalır; emoji/string ikon kullanılmaz.
