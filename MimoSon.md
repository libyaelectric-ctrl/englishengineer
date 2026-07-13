# MimoSon — Son 25 Görev (Ürün Olgunlaştırma)

**Proje:** `C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0`
**Stack:** React 19, TypeScript, Tailwind CSS v4, Vite
**Kural:** Her görev bitince `npm run build` çalıştır.

---

## GÖREV 1 — Streak Günlük Takibi
**Dosya:** `src/features/gamification/streak.service.ts` (yeni)
Kullanıcının her gün giriş yapıp yapmadığını takip eden servis. `lastLoginDate`'i kontrol et, bugünden önceki gün mü diye bak, streak'i artır veya sıfırla. Dashboard'da streak göster.

## GÖREV 2 — XP Bildirimi
**Dosya:** `src/shared/components/XpPopup.tsx` (yeni)
XP kazanıldığında ekranda "+25 XP" popup'ı göster. Animasyonlu yukarı kayarak kaybolsun. Vocabulary ve Grammar review'larından sonra tetiklensin.

## GÖREV 3 — Günlük Hedef Göstergesi
**Dosya:** `src/pages/DashboardPage.tsx`
Dashboard'a günlük hedef progress bar'ı ekle: "Bugün 5/10 görev tamamlandı". `studySessions` verisinden bugünkü sayıyı hesapla.

## GÖREV 4 — Leaderboard (Kişisel)
**Dosya:** `src/pages/GamificationPage.tsx`
Kullanıcının kendi skor geçmişini gösteren basit bir tablo: tarih, XP, görev sayısı. Son 7 günlük veriyi listele.

## GÖREV 5 — Vocabulary Toplu Ekleme
**Dosya:** `src/pages/VocabularyPage.tsx`
Kullanıcının kendi kelimesini ekleyebilmesi için "Add Custom Word" butonu + modal. Form: term, turkishMeaning, cefrLevel.

## GÖREV 6 — Grammar Quick Quiz
**Dosya:** `src/pages/GrammarPage.tsx`
Her kural kartında "Quick Quiz" butonu. Tıklayınca 3 soruluk mini quiz açılsın (çoktan seçmeli).

## GÖREV 7 — Reading comprehension Score
**Dosya:** `src/pages/ReadingPage.tsx`
Okuma görevi tamamlanınca comprehension skorunu yüzdelik olarak göster: "85% comprehension".

## GÖREV 8 — Writing Model Answer
**Dosya:** `src/pages/WritingPage.tsx`
Kullanıcı yazdıktan sonra "Show Model Answer" butonu. AI'dan gelen örneği gizli/göster toggle ile sun.

## GÖREV 9 — Listening Replay
**Dosya:** `src/pages/ListeningPage.tsx`
Dinleme görevi bittikten sonra "Replay Audio" butonu. Aynı sesi tekrar dinleyebilsin.

## GÖREV 10 — Speaking Puan Karşılaştırması
**Dosya:** `src/pages/SpeakingPage.tsx`
Konuşma görevi sonrası "Your Score vs Average" karşılaştırması: kullanıcının skoru ve platform ortalaması (sabit %72).

## GÖREV 11 — ProgressPage Weekly Chart
**Dosya:** `src/pages/ProgressPage.tsx`
Son 7 günün toplam XP'sini bar chart olarak göster. Basit SVG bar'lar.

## GÖREV 12 — Vocabulary Mastery Calendar
**Dosya:** `src/pages/VocabularyPage.tsx`
"Mastered" sekmesinde takvim görünümü: hangi gün kaç kelime öğrenildi (GitHub contribution graph tarzı).

## GÖREV 13 — Grammar Rule Explorer
**Dosya:** `src/pages/GrammarPage.tsx`
Grammar sayfasına "Explore All Rules" butonu. Tüm kuralları filtresiz listeleyen genişletilebilir accordion.

## GÖREV 14 — Reading Level Badge
**Dosya:** `src/pages/ReadingPage.tsx`
Her görev kartında CEFR badge'i göster: A1, B2, C1 vb.

## GÖREV 15 — Writing Word Goal
**Dosya:** `src/pages/WritingPage.tsx`
Textarea altında hedef kelime sayısı: "Goal: 200 words" ve mevcut/heuretic göster.

## GÖREV 16 — Listening Subtitle Toggle
**Dosya:** `src/pages/ListeningPage.tsx`
"Show/Hide Transcript" butonu. Transcript'i açıp kapatabilsin.

## GÖREV 17 — Speaking Pause/Resume
**Dosya:** `src/pages/SpeakingPage.tsx`
Kayıt sırasında "Pause" butonu ekle. Duraklatıp devam ettirebilsin.

## GÖREV 18 — Dashboard Welcome Message
**Dosya:** `src/pages/DashboardPage.tsx`
Dashboard başına "Good morning, {name}!" selam mesajı. Saate göre: morning/afternoon/evening.

## GÖREV 19 — Profile Badges Display
**Dosya:** `src/pages/ProfilePage.tsx`
Kazanılan rozetleri galeri olarak göster. Her rozet için ikon + isim + tarih.

## GÖREV 20 — Vocabulary Export
**Dosya:** `src/pages/VocabularyPage.tsx`
"My Vocabulary" sekmesinde "Export as CSV" butonu. Kelimeleri CSV formatında indir.

## GÖREV 21 — Grammar Mistake Review
**Dosya:** `src/pages/GrammarPage.tsx`
"Review Mistakes" butonu. Yanlış cevap verilen kuralları tek bir listede göster.

## GÖREV 22 — Reading Bookmark
**Dosya:** `src/pages/ReadingPage.tsx`
Görev kartlarına bookmark ikonu ekle. Beğenilen görevleri işaretleyebilsin.

## GÖREV 23 — Writing History
**Dosya:** `src/pages/WritingPage.tsx`
Son 5 yazma görevinin kısa özeti: tarih, kelime sayısı, skor.

## GÖREV 24 — Listening Categories
**Dosya:** `src/pages/ListeningPage.tsx`
Dinleme görevlerini kategoriye göre filtrele: Site Meetings, Technical Briefings, Safety, Commissioning.

## GÖREV 25 — Speaking Scenario Tags
**Dosya:** `src/pages/SpeakingPage.tsx`
Her senaryoya etiket ekle: difficulty (Easy/Medium/Hard), duration, focus area.

---

## ✅ Kontrol Listesi

Her görev bitince `npm run build`, hata yoksa devam.
