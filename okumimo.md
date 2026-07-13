# EngineerOS — Havuz Mimarisi: Gerçek Durum & Mimo Görev Listesi

## X-Ray: Neyin Gerçekten Çalıştığı

```
Vocabulary Mastered ──► event bus ──► ??? ──► addToVocabularyPool ──► localStorage
                         (YANLIYOR)          (BAĞLI DEĞİL)
Grammar Strong ──────► event bus ──► ??? ──► addToGrammarPool ──► localStorage  
                         (YANLIYOR)          (BAĞLI DEĞİL)

getMissionsSortedByPoolRatio() ──► reading.store.ts'de VAR
                                  ama ReadingPage bunu çağırmıyor ❌

writing.store.ts ──► pool'u hiç bilmiyor ❌
speaking/listening ──► VocabularyService import var, kullanmıyor ❌
```

**Kısaca:** Event bus atışları var, pool yazma var, sıralama fonksiyonu var —
ama hiçbiri birbirine bağlı değil. Mimari doğru, kablolar takılmamış.

---

## GÖREV 1 — Event Bus → addToVocabularyPool Bağlantısı
**Dosya:** `src/core/learning/learning.store.ts`

Store başlatılırken (store oluşturulunca) event bus'ı dinle:
```typescript
// useLearningStore create() dışına ekle — modül yüklenince çalışır
import { eventBus } from '@/core/events/event-bus';

eventBus.subscribe('vocabulary:mastered', (event) => {
  const termId = (event.payload as { termId: string }).termId;
  useLearningStore.getState().addToVocabularyPool(termId);
});

eventBus.subscribe('grammar:mastered', (event) => {
  const ruleId = (event.payload as { ruleId: string }).ruleId;
  useLearningStore.getState().addToGrammarPool(ruleId);
});
```
Bu 2 subscribe'ı dosyanın en altına ekle (store export'larından sonra).

**Doğrulama:** Kelimeyi 3 kez doğru cevapla → konsola `[VocabPool] +1 term` logu gelmeli.

---

## GÖREV 2 — Reading Page: Havuza Göre Sıralama Aktif Et
**Dosya:** `src/pages/ReadingPage.tsx`

`useReadingStore` ve `useLearningStore` kullanıldığı yere pool bağla:
```typescript
const vocabularyPool = useLearningStore((s) => s.vocabularyPool);
const getMissionsSortedByPoolRatio = useReadingStore(
  (s) => s.getMissionsSortedByPoolRatio
);

// missions listesi yerine:
const poolEntry = vocabularyPool.map(id => ({ content_type: 'vocabulary', content_id: id }));
const sortedMissions = getMissionsSortedByPoolRatio(poolEntry);
```
Sonra `visibleMissions` veya `missions` değişkeni yerine `sortedMissions` kullan.

**Sonuç:** Mastered kelimeleri içeren reading passajları otomatik olarak üste gelir.

---

## GÖREV 3 — Writing Store: Pool Bağlantısı Ekle
**Dosya:** `src/features/writing/writing.store.ts`

`writing.store.ts`'e `scoreContentByPoolRatio` import et:
```typescript
import { scoreContentByPoolRatio } from '@/core/content-selection/personalized-content.service';
import { useLearningStore } from '@/core/learning';
```

`getMissions()` çağrısını sıralama ile güncelle:
```typescript
getMissionsSortedByPoolRatio: (): WritingMission[] => {
  const pool = useLearningStore.getState().vocabularyPool.map(id => ({
    content_type: 'vocabulary',
    content_id: id,
  }));
  return WritingService.getMissions().sort((a, b) => {
    const scoreA = scoreContentByPoolRatio(a, pool).score;
    const scoreB = scoreContentByPoolRatio(b, pool).score;
    return scoreB - scoreA;
  });
},
```

---

## GÖREV 4 — Writing Page: Havuza Göre Sıralama Aktif Et
**Dosya:** `src/pages/WritingPage.tsx`

GÖREV 3'ten sonra. Reading Page ile aynı pattern:
```typescript
const vocabularyPool = useLearningStore((s) => s.vocabularyPool);
// missions yerine pool'a göre sıralanmış missions kullan
```

---

## GÖREV 5 — Listening: Pool'dan Kelimeli İçerik Önce Gelsin
**Dosya:** `src/features/listening/listening.service.ts`

Zaten `VocabularyService` import var ama kullanılmıyor. `getMissions()` fonksiyonuna pool sıralaması ekle:
```typescript
getMissionsSortedByPool(pool: string[]): ListeningMission[] {
  const all = this.getMissions();
  // pool'daki kelimeleri içeren transcript'ler önce gelsin
  return all.sort((a, b) => {
    const aHas = pool.some(w => a.transcript?.toLowerCase().includes(w.toLowerCase())) ? 1 : 0;
    const bHas = pool.some(w => b.transcript?.toLowerCase().includes(w.toLowerCase())) ? 1 : 0;
    return bHas - aHas;
  });
}
```

---

## GÖREV 6 — Speaking: Pool'dan Kelimeli Senaryo Önce Gelsin
**Dosya:** `src/features/speaking/speaking.selection.ts` (veya speaking service)

Listening ile aynı mantık — pool kelimeleri içeren senaryo/prompt'lar önce gelsin.

---

## GÖREV 7 — VocabularyPage: Havuz Sayacı Sticky Header'da Göster
**Dosya:** `src/pages/VocabularyPage.tsx`

Sticky header'da Mastered kelime sayısını "havuzda" olarak göster (satır 178'de badge var ama header'a taşı):
```tsx
const vocabularyPool = useLearningStore((s) => s.vocabularyPool);
// sticky header içine:
<span className="text-xs font-bold text-emerald-600">
  {vocabularyPool.length} in pool
</span>
```

---

## GÖREV 8 — grammar:mastered Event payload'ı Düzelt
**Dosya:** `src/features/grammar/grammar.progress.ts` satır ~142

Grammar event'i `ruleId` mi yoksa `termId` mi gönderiyor? Kontrol et:
```typescript
// Şu an ne gönderiyor göster:
payload: { termId: wordId, masteredAt: ... }  ← vocabulary pattern
// Grammar için:
payload: { ruleId: ruleId, masteredAt: ... }  ← bu olmalı
```
GÖREV 1'deki subscribe ile eşleştiğinden emin ol.

---

## GÖREV 9 — Progress Page: Havuz Büyüklüğünü Göster
**Dosya:** `src/pages/ProgressPage.tsx`

"Vocabulary Pool" metriğini Progress sayfasına ekle:
```tsx
const { vocabularyPool, grammarPool } = useLearningStore(
  (s) => ({ vocabularyPool: s.vocabularyPool, grammarPool: s.grammarPool })
);
// Mevcut MetricCard'lardan birine yanına:
<MetricCard
  label="Knowledge Pool"
  value={vocabularyPool.length + grammarPool.length}
  description="Words & rules feeding Reading & Writing"
  icon={<Database />}
/>
```

---

## GÖREV 10 — RightSidebar: Vocabulary Havuz Sayısını Göster
**Dosya:** `src/shared/layout/RightSidebar.tsx`

`Vocabulary (X words)` başlığının altına:
```tsx
const pool = useLearningStore((s) => s.vocabularyPool);
// section içine ekle:
<p className="text-[10px] text-emerald-600 font-bold mt-1">
  ✓ {pool.length} words feeding Reading & Writing
</p>
```

---

## Öncelik Sırası

| Görev | Açıklama | Zorluk | Etki |
|-------|----------|--------|------|
| **1** | Event bus → pool bağlantısı | ⭐ | 🔥 KRİTİK — bağlantı olmadan hiçbir şey çalışmaz |
| **2** | Reading pool sıralaması aktif | ⭐⭐ | 🔥 Ana hedef |
| **3** | Writing store pool bağlantısı | ⭐⭐ | 🔥 Ana hedef |
| **4** | Writing page pool sıralaması | ⭐ | 🔥 Ana hedef |
| **8** | Grammar event payload kontrol | ⭐ | 🟡 Doğruluk |
| **5** | Listening pool sıralaması | ⭐⭐ | 🟡 Katman 4 |
| **6** | Speaking pool sıralaması | ⭐⭐ | 🟡 Katman 4 |
| **7** | VocabularyPage havuz sayacı | ⭐ | 🟢 UX |
| **9** | Progress havuz metriği | ⭐ | 🟢 UX |
| **10** | Sidebar havuz sayısı | ⭐ | 🟢 UX |

---

## Mimoya Başlangıç Notu

**Proje:** `C:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0`  
**Her görev sonrası:** `npm run test` çalıştır, hata yoksa devam.  
**En kritik:** GÖREV 1 yapılmadan diğerleri anlamsız.

---

## ✅ TAMAMLANMA DURUMU (2026-07-12)

### Yapılanların Teknik Özeti

**GÖREV 1 — Event Bus → Pool Bağlantısı:** ✅
- `learning.store.ts` dosyasının en altına `eventBus.subscribe()` eklendi
- `vocabulary:mastered` event'i tetiklendiğinde `addToVocabularyPool()` çağrılıyor
- `grammar:mastered` event'i tetiklendiğinde `addToGrammarPool()` çağrılıyor
- Duplicate `import { eventBus }` hatası düzeltildi
- **Artık:** Kelime 3 doğru cevaplandığında → vocabulary:mastered event'ü ateşleniyor → store addToVocabularyPool çağırıyor → hem localStorage hem Supabase'e yazılıyor

**GÖREV 2 — Reading Pool Sıralaması:** ✅
- `ReadingPage.tsx`'e `useLearningStore` ve `scoreContentByPoolRatio` import edildi
- `vocabularyPool` store'dan alınıyor, `poolEntries` formatına dönüştürülüyor
- `visibleMissions` artık `filteredMissions`'ı pool oranına göre sıralıyor
- **Artık:** Mastered kelimeleri içeren reading passajları otomatik olarak üste geliyor

**GÖREV 3 — Writing Store Pool Bağlantısı:** ✅
- `writing.store.ts`'e `scoreContentByPoolRatio` ve `useLearningStore` import edildi
- `getMissionsSortedByPoolRatio()` action'ı arayüze ve implementasyona eklendi
- Fonksiyon: pool'daki kelimeleri içeren writing görevlerini puanlayıp sıralıyor

**GÖREV 4 — Writing Page Pool Sıralaması:** ✅
- `WritingPage.tsx`'e `getMissionsSortedByPoolRatio` store'dan alındı
- `sortedMissions` değişkeni oluşturuldu
- `visibleMissions` artık `sortedMissions`'ı filtreliyor (eskiden `missions`'ı filtreliyordu)

**GÖREV 5 — Listening Pool Sıralaması:** ✅
- `listening.service.ts`'e `getMissionsSortedByPool(pool: string[])` metodu eklendi
- Her mission'ın `transcript` alanı pool kelimeleriyle karşılaştırılıyor
- Pool'daki kelimeleri içeren görevler önce geliyor

**GÖREV 6 — Speaking Pool Sıralaması:** ✅
- `speaking.service.ts`'e `getMissionsSortedByPool(pool: string[])` metodu eklendi
- `promptText` ve `expectedKeywords` alanları pool ile karşılaştırılıyor

**GÖREV 7 — VocabularyPage Havuz Sayacı:** ✅
- `useLearningStore` import edildi
- Sticky header'da `vocabularyPool.length` gösteriliyor ("N in pool" badge)

**GÖREV 8 — Grammar Event Payload:** ✅
- Zaten doğru: `payload: { ruleId, masteredAt }` — subscriber ile eşleşiyor

**GÖREV 9 — Progress Havuz Metriği:** ✅
- `useLearningStore` import edildi
- `vocabularyPool` ve `grammarPool` destructuring ile alındı
- "Knowledge Pool" MetricCard eklendi: toplam kelime + kural sayısı

**GÖREV 10 — RightSidebar Havuz Sayısı:** ✅
- `useLearningStore` import edildi
- Vocabulary bölümünde "In Pool" istatistiği gösteriliyor

### Deploy
- **Commit:** `94a542c`
- **Production:** https://englishengineer.vercel.app
- **Build:** Temiz (0 hata)
- **TypeScript:** 0 hata

### Akış artık nasıl çalışıyor:
```
Kullanıcı kelimeyi 3 doğru cevaplıyor
  → vocabulary.menu.ts: "Mastered" statüsüne geçiş
  → eventBus.publish('vocabulary:mastered', { termId })
  → learning.store.ts subscriber: addToVocabularyPool(termId)
  → Hem localStorage'a hem Supabase'e yazılıyor
  → Reading sayfası: pool'a göre sıralama otomatik devreye giriyor
  → Writing sayfası: pool'a göre sıralama otomatik devreye giriyor
  → Listening/Speaking: pool kelimelerini içeren görevler önce geliyor
```
