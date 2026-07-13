# MimoRan — Ürün Geliştirme Görevleri (25 Madde)

**Proje:** `C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0`
**Stack:** React 19, TypeScript, Tailwind CSS v4, Vite
**Kural:** Her görev bitince `npm run build` çalıştır, hata yoksa sıradakine geç.

---

## GÖREV 1 — PWA Install Banner
**Dosya:** `src/shared/components/InstallPrompt.tsx` (yeni)
Kullanıcı mobilde veya masaüstünde PWA olarak yükleyebilsin. `beforeinstallprompt` event'ini dinleyen, "Install App" butonu gösteren bir bileşen oluştur. AppShell'e ekle.

## GÖREV 2 — Theme Toggle (Dark/Light)
**Dosya:** `src/shared/components/ThemeToggle.tsx` (yeni)
Header veya sidebar'da dark/light mode geçişi yapan buton. `localStorage`'a kaydetsin, `document.documentElement.classList` ile uygulasın.

## GÖREV 3 — Keyboard Shortcut (Cmd+K)
**Dosya:** `src/shared/components/CommandPalette.tsx`
Mevcut CommandPalette'i Ctrl+K / Cmd+K ile açılsın. `keydown` event listener ekle.

## GÖREV 4 — Toast Notification Sistemi
**Dosya:** `src/shared/components/Toast.tsx` (yeni)
Basit bir toast notification sistemi: `showToast(message, type)` çağrıldığında sağ üstte bildirim göstersin. Başarı/hata/bilgi tipleri olsun.

## GÖREV 5 — Skeleton Loading
**Dosya:** `src/shared/components/Skeleton.tsx` (yeni)
Sayfalar yüklenirken içerik yerine skeleton/grey box göstersin. Dashboard, Vocabulary, Grammar sayfalarına ekle.

## GÖREV 6 — Empty State Bileşenleri
**Dosya:** `src/shared/components/EmptyState.tsx` (yeni)
Tüm sayfalarda veri yoksa gösterilecek boş durum bileşeni: ikon + başlık + açıklama + CTA butonu. Vocabulary, Grammar, Reading, Writing, Listening sayfalarına uygula.

## GÖREV 7 — Confetti Animasyonu (Milestone)
**Dosya:** `src/shared/components/Confetti.tsx` (yeni)
Kullanıcı bir milestone'a ulaştığında (örn: 100 kelime, level up) konfeti animasyonu göstersin. Basit canvas tabanlı olsun.

## GÖREV 8 — Dark Mode Renk Paleti
**Dosya:** `src/index.css`
`dark:` Tailwind varyantları için CSS custom property'ler ekle. `--background`, `--foreground`, `--surface` gibi token'lar tanımla.

## GÖREV 9 — Profil Fotoğrafı Yükleme
**Dosya:** `src/features/profile/ProfileAvatar.tsx` (yeni)
Kullanıcının avatar yükleyebilmesi. Supabase Storage'a yükle, circular göstersin.

## GÖREV 10 — Bildirim Tercihleri
**Dosya:** `src/features/profile/NotificationPreferences.tsx` (yeni)
Kullanıcı hangi bildirimleri almak istiyor seçebilsin: daily reminder, weekly report, achievement notifications.

## GÖREV 11 — Dark Mode Sayfa Teması
**Dosya:** Tüm `src/pages/*.tsx`
Tüm sayfalardaki hardcoded `bg-white`, `text-black`, `border-gray-*` gibi renkleri `bg-background`, `text-foreground`, `border-border-soft` ile değiştir.

## GÖREV 12 — Skeleton ile Loading State
**Dosya:** `src/pages/DashboardPage.tsx`
Dashboard yüklenirken skeleton göster. Mevcut loading state'i Skeleton bileşeniyle değiştir.

## GÖREV 13 — Vocabulary Kart Animasyonu
**Dosya:** `src/pages/VocabularyPage.tsx`
Kart geçişlerinde flip veya slide animasyonu ekle. `motion/react` kullanarak yumuşak geçiş sağla.

## GÖREV 14 — Grammar Quiz Sonrası Geri Bildirim
**Dosya:** `src/pages/GrammarPage.tsx`
Quiz cevabı verildikten sonra kısa bir feedback toast'ı göster: "Correct! +25 XP" veya "Incorrect, try again".

## GÖREV 15 — Reading Hız Göstergesi
**Dosya:** `src/pages/ReadingPage.tsx`
Kullanıcı okurken ortalama okuma hızını (kelime/dakika) göster. Timer başlat, kelime sayısını say, WPM hesapla.

## GÖREV 16 — Writing Sesli Okuma
**Dosya:** `src/pages/WritingPage.tsx`
"Read Aloud" butonu ekle. `speechSynthesis` API ile kullanıcının yazdığı metni sesli okusun.

## GÖREV 17 — Listening Puan Animasyonu
**Dosya:** `src/pages/ListeningPage.tsx`
Dinleme görevi tamamlandığında puan Animasyonlu sayı sayacıyla (0'dan puana) gösterilsin.

## GÖREV 18 — Speaking Waveform Göstergesi
**Dosya:** `src/pages/SpeakingPage.tsx`
Kayıt sırasında ses dalgası animasyonu göster. `AnalyserNode` ile frekans verisini canvas'a çiz.

## GÖREV 19 — Dashboard Mini Grafikler
**Dosya:** `src/pages/DashboardPage.tsx`
Skill kartlarında son 7 günlük trend mini sparkline'ı göster. Basit SVG path ile çiz.

## GÖREV 20 — Vocabulary Flashcard Modu
**Dosya:** `src/pages/VocabularyPage.tsx`
"Flashcard" butonu ekle. Kartlara tıklayınca tersine dönsün, İngilizce→Türkçe veya tersi göstersin.

## GÖREV 21 — Grammar İpucu Sistemi
**Dosya:** `src/pages/GrammarPage.tsx`
Zor sorularda "Hint" butonu olsun. Tıklayınca ipucu gösterilsin (örn: "Bu kural passive voice ile ilgili").

## GÖREV 22 — Reading Timer
**Dosya:** `src/pages/ReadingPage.tsx`
Okuma görevi başladığında timer başlat. Bitirince süreyi kaydet ve "Bu metni X dakikada okudun" göster.

## GÖREV 23 — Writing Karakter Sınırı
**Dosya:** `src/pages/WritingPage.tsx`
Textarea altında karakter sayacı + renkli bar. 500 karaktere yaklaşınca sarı, geçince kırmızı olsun.

## GÖREV 24 — Listening Hız Ayarı
**Dosya:** `src/pages/ListeningPage.tsx`
Audio player'da hız seçeneği ekle: 0.5x, 0.75x, 1x, 1.25x, 1.5x. `playbackRate` ile.

## GÖREV 25 — speaking Practic Script Özeti
**Dosya:** `src/pages/SpeakingPage.tsx`
Her senaryo için kısa bir "practice script" özeti göster. "Bu senaryoda X konusunu tartışacaksınız, Z jargonunu kullanın" gibi.

---

## ✅ Kontrol Listesi

Her görev bittikten sonra:
1. `npm run build` → hata yoksa devam
2. Sıradaki göreve geç

**Build hatası olursa:** Hata mesajını aynen yapıştır.
