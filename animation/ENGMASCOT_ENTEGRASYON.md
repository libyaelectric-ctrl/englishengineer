# EngMascot — Entegrasyon Kılavuzu

## Genel Bakış

EngMascot, tek bir JPEG fotoğrafından üretilmiş, bağlama duyarlı bir animasyonlu maskot bileşenidir.  
Farklı sayfalar ve olaylar için otomatik olarak poz, mesaj ve ses değiştirir.

---

## Repo Durumu

**Commit:** `780ff1cb`  
**Branch:** `main`  
**Eklenen dosyalar:**

```
public/mascot/
  engmascot.webp          ← maskot görseli (61 KB, şeffaf arka plan)
  engmascot.png           ← yüksek kaliteli yedek

src/features/mascot/
  mascot.store.ts         ← Zustand store (durum, ses, konum, uyku timer)
  EngMascot.tsx           ← ana React bileşeni
  engmascot.css           ← tüm CSS animasyonlar

src/features/localization/translations/
  mascot.translations.ts  ← 15 dil × tüm durumlar
```

`AppShell.tsx` zaten güncellendi → `<EngMascot />` tüm sayfalarda aktif.

---

## Desteklenen 11 Durum

| Durum          | Ne zaman kullanılır              |
| -------------- | -------------------------------- |
| `idle`         | Varsayılan, normal gezinme       |
| `celebrate`    | Doğru cevap, başarı              |
| `concerned`    | Yanlış cevap, hata               |
| `thinking`     | Yüklenme, AI işliyor             |
| `point`        | Onboarding ipucu, dikkat çekme   |
| `streak`       | Günlük seri tamamlandı           |
| `levelUp`      | Seviye atlandı                   |
| `streakDanger` | Seri tehlikede (X saat kaldı)    |
| `empty`        | İçerik yok, ilk giriş            |
| `farewell`     | Kullanıcı ayrılıyor              |
| `sleeping`     | 90 sn hareketsizlik → easter egg |

---

## Başka Bir Projeye Entegrasyon

### 1. Dosyaları kopyala

```bash
# Görseli public klasörüne
cp public/mascot/engmascot.webp  HEDEF_PROJE/public/mascot/engmascot.webp

# Bileşen dosyaları
cp src/features/mascot/mascot.store.ts   HEDEF_PROJE/src/features/mascot/
cp src/features/mascot/EngMascot.tsx     HEDEF_PROJE/src/features/mascot/
cp src/features/mascot/engmascot.css     HEDEF_PROJE/src/features/mascot/

# Çeviri dosyası (isteğe bağlı — kendi i18n sisteminize uyarlayın)
cp src/features/localization/translations/mascot.translations.ts \
   HEDEF_PROJE/src/...
```

### 2. Bağımlılıklar

```bash
npm install zustand motion
```

Hedef projede `motion/react` yerine `framer-motion` kullanılıyorsa  
`EngMascot.tsx` içindeki import'u değiştirin:

```ts
// Değiştir:
import { AnimatePresence, motion } from 'motion/react';
// Bununla:
import { AnimatePresence, motion } from 'framer-motion';
```

### 3. i18n sistemine bağlama

`EngMascot.tsx` şu anda `useLocalizationStore` hook'unu kullanıyor.  
Hedef projede farklı bir i18n sistemi varsa şu satırı değiştirin:

```ts
// Mevcut (EngVox'a özgü):
const language = useLocalizationStore((s) => s.language);

// Örnek: react-i18next kullanan proje için:
import { useTranslation } from 'react-i18next';
const { i18n } = useTranslation();
const language = i18n.language.split('-')[0]; // 'tr-TR' → 'tr'
```

### 4. Görsel yolunu güncelle

`EngMascot.tsx` içindeki bu satırı hedef projenin public yoluna göre düzenleyin:

```ts
const MASCOT_IMG = '/mascot/engmascot.webp';
// veya CDN kullanıyorsanız:
const MASCOT_IMG = 'https://cdn.orneksite.com/mascot/engmascot.webp';
```

### 5. Kök layout'a monte et

```tsx
// App.tsx veya Layout bileşeniniz
import { EngMascot } from '@/features/mascot/EngMascot';

export const AppLayout = () => (
  <div>
    <main>...</main>
    <EngMascot /> {/* köşe widget — her sayfada görünür */}
  </div>
);
```

---

## Sayfa/Olay Bazlı Kullanım

Herhangi bir bileşenden maskotun durumunu değiştirin:

```tsx
import { useMascotStore } from '@/features/mascot/mascot.store';

// Doğru cevap sonrası kutlama:
const { setState, say } = useMascotStore();
setState('celebrate', 'Harika! 3 doğru üst üste 🔥');

// Yanlış cevap:
setState('concerned', 'Olmadı, bir daha deneyelim.');

// Seviye atlama:
setState('levelUp', 'B2 seviyesine ulaştın!');

// Seri tehlikede (kaç saat kaldı parametre olarak gönderilir):
setState('streakDanger', 'Serin 2 saat içinde bitiyor!');

// Sadece mesaj değiştir, poz aynı kalsın:
say('Bu kelimeyi daha önce 3 kez yanlış yaptın, dikkat!');

// Yüklenme:
setState('thinking');

// Gizle / göster:
useMascotStore.getState().hide();
useMascotStore.getState().show();
```

### Inline (sayfa içi) kullanım

Köşe widget yerine sayfa içine gömmek için:

```tsx
<EngMascot inline size={120} />
```

---

## Özellikler (Tamamı Built-in)

| Özellik             | Açıklama                                                |
| ------------------- | ------------------------------------------------------- |
| **Daktilo efekti**  | Konuşma balonu metni karakter karakter yazılır          |
| **Ses efektleri**   | Web Audio API ile sentezlenir (harici dosya yok)        |
| **Sürükle & bırak** | Kullanıcı konumu değiştirebilir, localStorage'da kalıcı |
| **Minimize**        | Küçültülebilir, durumu hatırlanır                       |
| **Ses kapat**       | 🔊/🔇 butonu ile toggle edilebilir                      |
| **Rastgele ipucu**  | Tıklandığında havuzdan rastgele mesaj gösterir          |
| **Uyku easter egg** | 90sn hareketsizlik → uyuyor, tıklayınca uyanır          |
| **Konfeti**         | celebrate/levelUp/streak durumlarında otomatik          |
| **15 dil**          | EN TR AR DE ES PT FR RU ZH JA IT VI PL ID NL            |
| **Erişilebilirlik** | `aria-live`, `role="status"`, klavye navigasyonu        |
| **Reduced motion**  | `prefers-reduced-motion` medya sorgusuna uyar           |

---

## Görsel Demo

`engvox-mascot.html` dosyasını herhangi bir tarayıcıda açın —  
internet bağlantısı gerekmez, tüm assets inline (base64) olarak gömülüdür.

Sekmeler arasında geçiş yaparak her durumu canlı olarak görebilirsiniz.

---

## Notlar

- Maskot görseli flood-fill algoritmasıyla arındırıldı (gözlük camı parlama sorunu düzeltildi).
- Ses efektleri için harici `.mp3`/`.ogg` dosyası yoktur; Web Audio API ile anlık olarak sentezlenir.
- `mascot.store.ts` içindeki `SLEEP_AFTER_MS` sabiti (varsayılan: 90000 ms) değiştirilerek uyku süresi ayarlanabilir.
