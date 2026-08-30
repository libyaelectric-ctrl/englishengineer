# 🔴 ACİL — Site Çökmesi Düzeltmesi (Uygulama Talimatı)

## Sorun (kanıtlı, kök nedeni bulundu)

Canlıda `engvox.com` beyaz ekran / "An error occurred. Please refresh the
page." hatası veriyordu. Kök neden:

`src/providers/AppProvider.tsx` şu ağaç yapısını kuruyor:
```
AppProvider
  └─ ErrorBoundaryProvider   ← hata yakalayıcı BURADA
       └─ (App.tsx'te) RouterProvider   ← router context SADECE burada var
```

`ErrorBoundaryProvider`, `RouterProvider`'ın **dışında/üstünde** olduğu için,
uygulamanın **herhangi bir yerinde** (hangi sayfa/bileşen olursa olsun) küçük
bir JS hatası oluştuğunda bu boundary onu yakalıyor ve kurtarma ekranını
(`ErrorFallback`) göstermeye çalışıyor. Ama o ekranın içinde
`<Link to="/">` (react-router-dom) kullanılıyordu — `Link` component'i
internal olarak router context'e `useContext` ile erişir, ve context
olmadığı için **ikinci bir çökme** daha oluyordu:

```
TypeError: Cannot destructure property 'basename' of 'd.useContext(...)' as it is null.
```

React, bir error boundary'nin fallback'i içinde oluşan hatadan kurtaramaz —
bu yüzden bütün ağaç unmount oluyor ve en dıştaki `Sentry.ErrorBoundary`'nin
jenerik fallback'i ("An error occurred. Please refresh the page.") devreye
giriyor. **Sonuç: uygulamanın herhangi bir yerindeki ufak bir hata bile tüm
siteyi tamamen çökertiyordu**, çünkü hata kurtarma ekranının kendisi bozuktu.

Bu, önceki testte fark edilmemişti çünkü `ErrorBoundaryProvider.test.tsx`
testi, gerçek production ağaç yapısını yanlış temsil ederek
`ErrorBoundaryProvider`'ı bir `<BrowserRouter>` içine sarıyordu — yani test
ortamında router context her zaman mevcuttu, production'da değildi.

## Düzeltme (zaten yapıldı, test edildi — sadece uygula)

İki dosya değiştirildi:

1. **`src/providers/ErrorBoundaryProvider.tsx`** — `<Link to="/">` yerine
   sade bir `<a href="/">` kullanılıyor artık. Bir üst seviye error boundary,
   router'ın kendisi bozulmuş olsa bile çalışabilmeli — bu yüzden router
   context'ine bağımlı olmaması doğru mimari karar.
2. **`src/providers/ErrorBoundaryProvider.test.tsx`** — Test artık
   `<BrowserRouter>` OLMADAN render ediyor (gerçek production ağacını doğru
   yansıtıyor). Bu sayede aynı regresyon gelecekte tekrar olursa test
   kırmızı yanacak.

### Yapılacak
Ekteki iki dosyayı, aynı adlarıyla, repodaki karşılıklarının üzerine yaz:
```
src/providers/ErrorBoundaryProvider.tsx
src/providers/ErrorBoundaryProvider.test.tsx
```

### Doğrulama
```bash
npx vitest run --configLoader runner src/providers/ErrorBoundaryProvider.test.tsx
# ✓ 1 test geçmeli

npx tsc --noEmit -p tsconfig.json
# hatasız olmalı

npm run build
# hatasız olmalı, ~3200 modül transform edilmeli
```

### Commit
```bash
git add src/providers/ErrorBoundaryProvider.tsx src/providers/ErrorBoundaryProvider.test.tsx
git commit -m "fix(critical): error boundary fallback crashed outside router context, turning any single error into a full site outage"
git push
```

---

## ⚠️ Önemli — Bu düzeltme SONUÇ'u (çökmeyi) engeller, ama asıl tetikleyici SEBEP hâlâ bilinmiyor

Bu düzeltme, **herhangi bir hatanın artık tüm siteyi çökertmemesini** sağlıyor
— kullanıcı artık düzgün "Application Error" ekranını görecek, "Home"
butonuna tıklayabilecek, sayfa "beyaz ekran"a düşmeyecek. **Ama kullanıcıyı
ilk başta hataya düşüren orijinal/gerçek sorunun ne olduğunu hâlâ bilmiyoruz**
— ekran görüntüsündeki stack trace sadece "bir yerde bir hata oldu, sonra
kurtarma ekranı da çöktü" diyor, hangi sayfa/bileşenin ilk hatayı fırlattığını
göstermiyordu (çünkü asıl hata mesajı ekran görüntüsünde kesilmişti).

**Bu düzeltme deploy edildikten sonra, eğer aynı türden bir hata tekrar
olursa** (artık site çökmeyecek, düzgün "Application Error" ekranı
görünecek), o ekrandaki **kırmızı kutudaki tam hata mesajını** paylaşın —
o zaman asıl kök nedeni de bulup düzeltebiliriz. Sentry kurulu olduğu için
(`@sentry/react` importu App.tsx'te görülüyor), Sentry dashboard'unuz varsa
oradan da orijinal hatayı görebilirsiniz.
