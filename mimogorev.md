# EngineerOS — Mimo Görev Listesi (Sıralı, Kademeli)

**Proje:** `C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0`  
**Stack:** React 19, TypeScript, Tailwind CSS v4, Vite  
**Kural:** Her görevi bitirince `npm run build` çalıştır, hata yoksa sıradakine geç.

---

## GÖREV 1 — `pt-12 sm:pt-0` Temizliği
**Dosya:** `src/pages/DashboardPage.tsx`  
`className` içinde `pt-12 sm:pt-0` geçen yeri bul, bu class'ları sil.

**Dosya:** `src/pages/GamificationPage.tsx`  
Aynı şeyi yap — `pt-12 sm:pt-0` sil.

---

## GÖREV 2 — Dashboard Hardcoded Skor Düzeltme
**Dosya:** `src/pages/DashboardPage.tsx`

Satır ~102: `85` sabit değerini `summary.averageScore` ile değiştir.  
Satır ~124: `style={{ width: '85%' }}` → `style={{ width: \`${summary.averageScore}%\` }}`

---

## GÖREV 3 — Dashboard Sticky Header Ekle
**Dosya:** `src/pages/DashboardPage.tsx`

Return içindeki en dıştaki `<div>` açıldıktan hemen sonra şunu ekle:
```tsx
<div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
  <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h1>
</div>
```

---

## GÖREV 4 — GamificationPage Sticky Header Ekle
**Dosya:** `src/pages/GamificationPage.tsx`

`<PageHeader ... />` bileşenini kaldır, yerine şunu ekle:
```tsx
<div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
  <h1 className="text-2xl font-black tracking-tight text-foreground">Milestones</h1>
</div>
```

---

## GÖREV 5 — CurriculumPage Sticky Header Ekle
**Dosya:** `src/pages/CurriculumPage.tsx`

Sayfanın return başına (PageHeader varsa kaldır), şunu ekle:
```tsx
<div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
  <h1 className="text-2xl font-black tracking-tight text-foreground">Learning Hub</h1>
</div>
```

---

## GÖREV 6 — Dashboard "Needs Attention" Boş Durum Mesajı
**Dosya:** `src/pages/DashboardPage.tsx`

`reviewPriorities.map(...)` satırının HEMEN ÖNÜNE ekle:
```tsx
{reviewPriorities.length === 0 && (
  <p className="text-sm text-muted-copy col-span-3 text-center py-6">
    🎉 Great job! No weak areas detected. Keep practicing!
  </p>
)}
```

---

## GÖREV 7 — Writing Word Count Sayacı
**Dosya:** `src/pages/WritingPage.tsx`

Kullanıcının yazdığı `<textarea>` bileşenini bul. Hemen altına şunu ekle:
```tsx
<p className="mt-1 text-right text-xs text-muted-copy">
  {response.trim().split(/\s+/).filter(Boolean).length} words
</p>
```
(`response` değişken adı farklıysa yazma alanının `value` prop'undaki değişkeni kullan.)

---

## GÖREV 8 — Listening Textarea Büyüt + Resize
**Dosya:** `src/pages/ListeningPage.tsx`

Cevap girilen `<textarea>` elementini bul:
- `min-h-[120px]` varsa → `min-h-[160px]` yap
- `resize-none` varsa → `resize-y` yap
- Yoksa class'lara `min-h-[160px] resize-y` ekle

---

## GÖREV 9 — ProgressPage Skill Bar Renkleri
**Dosya:** `src/pages/ProgressPage.tsx`

`SkillCard` bileşenini bul (~satır 75). İlerleme barının `className` içinde `bg-gradient-to-r from-primary to-indigo-400` veya sadece `bg-primary` geçen yeri bul.  
`skill.color` field'ı zaten var (örn: `'from-blue-500 to-cyan-400'`).  
Bar class'ını şöyle yap:
```tsx
className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
```

---

## GÖREV 10 — Dashboard CEFR Badge Renkleri
**Dosya:** `src/pages/DashboardPage.tsx`

Skill kartlarında CEFR seviyesi gösterilen yeri bul (`cefrBand` kullanılan yer).  
Şu fonksiyonu ekle ve badge rengini dinamik yap:
```tsx
const getCefrColor = (cefr: string) => {
  if (cefr.startsWith('A')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (cefr.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-violet-600 bg-violet-50 border-violet-200';
};
```
Badge element'ini `className={getCefrColor(skillProfile.cefrBand)}` ile güncelle.

---

## GÖREV 11 — Vocabulary Çift Border Düzeltme
**Dosya:** `src/pages/VocabularyPage.tsx`

Sticky header içinde (~satır 634) şu class'ı tutan `div`'i bul:
```
flex items-center justify-between pb-3 border-b border-border-soft mb-3
```
`border-b border-border-soft` class'larını bu iç div'den kaldır (dış div'de zaten border-b var).

---

## GÖREV 12 — Vocabulary Tab Aktif Stili Yumuşat
**Dosya:** `src/pages/VocabularyPage.tsx`

Tab butonlarında aktif durum için `bg-foreground text-background` geçen yeri bul.  
Şununla değiştir:
```tsx
'bg-primary/10 text-primary border border-primary/30 font-semibold'
```

---

## GÖREV 13 — Reading/Writing Empty State Link Stili Eşitle
**Dosya:** `src/pages/ReadingPage.tsx` (~satır 133)  
**Dosya:** `src/pages/WritingPage.tsx` (~satır 137)

"Back to Learning Hub" linklerini bul. İkisini de aynı yap:
```tsx
className="inline-flex text-sm font-bold text-primary hover:underline"
```

---

## GÖREV 14 — RightSidebar Vocabulary Toplam Sayı
**Dosya:** `src/shared/layout/RightSidebar.tsx`

Vocabulary section başlığının (`Section title="Vocabulary"` veya benzeri) yanına toplam kelime sayısını ekle.  
Mevcut `newCount`, `learningCount`, `masteredCount` değişkenleri varsa:
```tsx
// Section title prop'una ekle:
title={`Vocabulary · ${newCount + learningCount + masteredCount} words`}
```

---

## GÖREV 15 — Tüm Sayfalar `space-y` Standardizasyon
**Dosyalar:** `SpeakingPage.tsx`, `WritingPage.tsx`, `ReadingPage.tsx`, `ListeningPage.tsx`, `GrammarPage.tsx`, `VocabularyPage.tsx`

Her sayfa return'ünün en dıştaki wrapper `<div>`'inde `space-y-6` veya `space-y-8` var.  
Hepsini `space-y-6` yap (tutarlılık için).

---

## GÖREV 16 — ProgressPage Sticky Header Ekle
**Dosya:** `src/pages/ProgressPage.tsx`

`<PageHeader ... />` bileşenini bul ve kaldır. Yerine şunu ekle:
```tsx
<div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
  <h1 className="text-2xl font-black tracking-tight text-foreground">Progress</h1>
</div>
```

---

## GÖREV 17 — RightSidebar Grammar Tamamlanma Yüzdesi
**Dosya:** `src/shared/layout/RightSidebar.tsx`

Grammar section'ında `completed` ve `total` kural sayısı gösterilen yeri bul.  
Yanına yüzde ekle:
```tsx
<span className="text-[10px] text-muted-copy font-medium">
  {total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'}
</span>
```

---

## GÖREV 18 — SpeakingPage Kayıt Alanına "Restart" Butonu
**Dosya:** `src/pages/SpeakingPage.tsx`

Kayıt sırasında (recording state aktifken) görünen butonları bul. "Cancel" butonunun yanına şunu ekle:
```tsx
<button
  type="button"
  onClick={resetRecording}
  className="text-xs font-medium text-muted-copy hover:text-foreground transition-colors"
>
  ↺ Restart
</button>
```
(`resetRecording` fonksiyon adı farklıysa sayfada kayıt sıfırlayan mevcut fonksiyonu kullan.)

---

## GÖREV 19 — ProgressPage Knowledge Graph Responsive Düzelt
**Dosya:** `src/pages/ProgressPage.tsx`

Knowledge graph container'ını bul. `max-h-[400px]` ve `aspect-[16/10]` olan `div`.  
`max-h-[400px]` class'ını kaldır, yerine:
```
aspect-[4/3] sm:aspect-[16/10]
```
yap — küçük ekranlarda daha iyi görünüm için.

---

## GÖREV 20 — Dashboard Skill Kartları Animate-on-Scroll
**Dosya:** `src/pages/DashboardPage.tsx`

"Progress Cockpit" bölümündeki skill kartlarına hover animasyonu ekle.  
Her skill kartının `className`'ine şunu ekle:
```
transition-transform hover:-translate-y-0.5 hover:shadow-md
```

---

## GÖREV 21 — Tüm Sayfalarda `animate-in` Duration Standardizasyon
**Dosyalar:** Tüm `src/pages/*.tsx` dosyaları

Grep ile bul: `animate-in fade-in duration-`  
`duration-500` geçen tüm yerleri `duration-300` yap. (Vocabulary, Grammar, Reading, Writing, Speaking, Listening dahil.)

---

## GÖREV 22 — GrammarPage Mobil Search Düzeltme
**Dosya:** `src/pages/GrammarPage.tsx`

Sticky header içindeki başlık + search bar layout'unu değiştir.  
Mevcut `flex-row sm:flex-row` yerine:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```
yap. Mobilde başlık üstte, search barı altında olsun.

---

## GÖREV 23 — Reading/Writing Empty State Boşluk Küçült
**Dosya:** `src/pages/ReadingPage.tsx`  
**Dosya:** `src/pages/WritingPage.tsx`

Her iki sayfada da `if (!currentMission)` bloğundaki wrapper `<div>`'in `space-y-6` class'ını `space-y-4` yap.

---

## GÖREV 24 — ProgressPage "Strongest/Weakest" İkon Renkleri
**Dosya:** `src/pages/ProgressPage.tsx`

"Strongest" ve "Weakest" skill gösterilen kısımı bul (~satır 354-362).  
- Strongest skill için ikon rengi: `text-emerald-500` yap
- Weakest skill için ikon rengi: `text-rose-500` yap

Şu şekilde:
```tsx
<highestSkill.icon className="h-3.5 w-3.5 text-emerald-500" />
<lowestSkill.icon className="h-3.5 w-3.5 text-rose-500" />
```

---

## GÖREV 25 — Tüm Sayfalarda Mobil `pb-28` Kontrolü
**Dosyalar:** `DashboardPage.tsx`, `GamificationPage.tsx`, `CurriculumPage.tsx`, `ProgressPage.tsx`

Bu 4 sayfanın ana wrapper `<div>`'ine `pb-28 lg:pb-4` ekle (mobil bottom navigation bar için boşluk).  
Zaten varsa dokunma. Yoksa şunu ekle:
```tsx
className="... pb-28 lg:pb-4"
```

---

## ✅ Kontrol Listesi

Her görev bittikten sonra:
1. `npm run build` → hata yoksa devam
2. Bir önceki görevle çakışma var mı kontrol et
3. Sıradaki göreve geç

**Build hatası olursa:** Hata mesajını Mimo'ya aynen yapıştır.

---

## 📋 Öncelik Sırası (En Etkili → En Az Etkili)

| Görev | Konu | Zorluk |
|-------|------|--------|
| 1 | pt-12 temizliği | ⭐ |
| 2 | Hardcoded 85 skoru | ⭐ |
| 3 | Dashboard sticky header | ⭐ |
| 4 | Gamification sticky header | ⭐ |
| 5 | Curriculum sticky header | ⭐ |
| 16 | Progress sticky header | ⭐ |
| 6 | Boş "Needs Attention" mesajı | ⭐ |
| 7 | Writing word count | ⭐ |
| 25 | Mobil pb-28 kontrolü | ⭐ |
| 8 | Listening textarea büyüt | ⭐ |
| 9 | Progress skill bar renkleri | ⭐ |
| 10 | Dashboard CEFR badge renkleri | ⭐⭐ |
| 11 | Vocabulary çift border | ⭐ |
| 12 | Vocabulary tab stili | ⭐ |
| 13 | Empty state link stili | ⭐ |
| 14 | Sidebar vocab toplam sayı | ⭐⭐ |
| 15 | space-y standardizasyon | ⭐ |
| 17 | Sidebar grammar yüzde | ⭐⭐ |
| 18 | Speaking restart butonu | ⭐⭐ |
| 19 | Progress graph responsive | ⭐ |
| 20 | Dashboard kart hover animasyon | ⭐ |
| 21 | duration-300 standardizasyon | ⭐ |
| 22 | Grammar mobil search | ⭐⭐ |
| 23 | Empty state boşluk küçült | ⭐ |
| 24 | Progress ikon renkleri | ⭐ |
