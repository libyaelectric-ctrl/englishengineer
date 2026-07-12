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

## ✅ Kontrol Listesi

Her görev bittikten sonra:
1. `npm run build` → hata yoksa devam
2. Bir önceki görevle çakışma var mı kontrol et
3. Sıradaki göreve geç

**Build hatası olursa:** Hata mesajını Mimo'ya aynen yapıştır.
