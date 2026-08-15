# ENGVOX PHASE 2 — TEKNİK UYGULAMA SPECİFİKASYONU
### Başka Bir AI Ajanın Doğrudan Uygulayabileceği Detaylı Teknik Rehber

> **Proje Kökü:** `c:\Users\User\Desktop\EngineerOS_DENEME_CODEX\8.0`  
> **Stack:** React 19 + TypeScript + Vite + Zustand + Supabase + Railway (Express) + Vercel  
> **Paket Yöneticisi:** `npm`  
> **Test:** `npx vitest run` (her görev sonrası çalıştır)  
> **Tip Kontrolü:** `npx tsc --noEmit` (her görev sonrası çalıştır)  
> **Git:** Her görev sonrası ayrı commit at

---

## ⛔ MUTLAK KURALLAR (İHLAL ETME)

1. **Yeni Zustand store oluşturma.** Mevcut store'lara (`useLearningStore`, `useBillingStore`, `useLocalizationStore`, `useAuthStore`) action ekle.
2. **Sabit kodlanmış Türkçe string bırakma.** Her metin `useLocalizationStore(state => state.translate)('key')` ile çekilmeli.
3. **`turkishMeaning` alanını doğrudan UI'a yazdırma.** Her zaman `resolveTermMeaningAsync` veya `useTermMeaningResolver` kullan.
4. **`src/` dışına kaynak dosyası koyma.** Vite sadece `src/` içini bundle'a alır.
5. **`any` tipi kullanma.** TypeScript strict mode aktif.
6. **Eski commit'leri revert etme.** Sadece ileri git.
7. Her görev sonrası `npx tsc --noEmit` ve `npx vitest run` koştur. Hata varsa düzelt, sonra commit et.

---

## 📁 KRİTİK DOSYA HARİTASI (Oku, Anlayınca Başla)

```
src/
├── features/
│   ├── localization/
│   │   ├── localization.store.ts        ← useLocalizationStore (language, setLanguage, translate)
│   │   ├── localization.service.ts      ← LocalizationService.translate(key, lang)
│   │   ├── localization.types.ts        ← SupportedInterfaceLanguage, TranslationKey
│   │   └── translations/
│   │       ├── ui.translations.ts       ← Tüm UI çeviri map'leri (15 dil)
│   │       └── sidebar.translations.ts
│   ├── billing/
│   │   ├── billing.store.ts             ← useBillingStore (startCheckout, openCustomerPortal)
│   │   ├── billing.service.ts           ← BillingService
│   │   ├── stripe.provider.ts           ← StripeBillingProvider (API çağrıları)
│   │   ├── billing.types.ts             ← BillingPlanId, SubscriptionSnapshot
│   │   └── billing.entitlements.ts      ← canAccess(plan, feature)
│   ├── profile/
│   │   ├── profile.repository.ts        ← LearningProfileRepository.getProfile(userId)
│   │   └── profile.types.ts             ← UserLearningProfile (re-exports from domain.types)
│   ├── learning-path/
│   │   └── curriculum.service.ts        ← buildLearningPath(discipline, opts)
│   └── ai/
│       └── ai.service.ts                ← AIService (Gemini/OpenAI çağrısı)
├── core/
│   └── learning/
│       ├── learning.store.ts            ← useLearningStore (xp, streak, hearts, vocabularyPool)
│       ├── learning.types.ts
│       └── spaced-repetition.helpers.ts ← SM-2 algoritması (var ama kullanılmıyor)
├── shared/
│   ├── services/
│   │   └── vocabulary-translation.service.ts  ← resolveTermMeaning, resolveTermMeaningAsync
│   └── types/
│       └── vocabulary.types.ts          ← VocabularyTerm interface
├── data/
│   ├── vocabulary/by-level/             ← a1.seed.ts, a2.seed.ts ... c2.seed.ts
│   └── translations/
│       └── vocabulary-translations.json ← 56 MB, { "term": { "fr": {...}, "de": {...} } }
├── pages/
│   ├── LessonRunnerPage/index.tsx       ← İnteraktif ders oynatıcı
│   ├── LearningPathPage/index.tsx       ← Altıgen yol haritası
│   └── OnboardingPage/                  ← Kullanıcı ilk kurulum akışı
└── routes/router.tsx                    ← Tüm route tanımları
```

### Kritik Interface'ler

```typescript
// src/shared/types/vocabulary.types.ts
interface VocabularyTerm {
  id: string;
  term: string;
  turkishMeaning: string;   // SADECE Türkçe fallback için kullan
  definition: string;        // İngilizce tanım
  exampleSentence: string;
  turkishExample: string;
  category: string;
  domain: string;
  cefrLevel: string;
  partOfSpeech: string;
}

// src/features/localization/localization.types.ts
type SupportedInterfaceLanguage = 
  'en' | 'tr' | 'ar' | 'de' | 'es' | 'pt' | 'fr' | 
  'ru' | 'zh' | 'ja' | 'it' | 'vi' | 'pl' | 'id' | 'nl';

// src/features/localization/localization.store.ts
interface LocalizationStore {
  language: SupportedInterfaceLanguage;
  setLanguage: (language: SupportedInterfaceLanguage) => void;
  translate: (key: string) => string;
}

// src/core/learning/learning.store.ts (mevcut state alanları)
interface LearningState {
  xp: number;
  streak: number;
  hearts: number;           // 0-5, integrity % = hearts * 20
  vocabularyPool: string[]; // Ustalaşılan term ID'leri
}
```

---

## 🔴 GÖREV 1: Çeviri Corpus'unu Dillere Böl (Code Splitting)

### Problem
`src/data/translations/vocabulary-translations.json` → 56 MB tek dosya.  
Her kullanıcı tüm 15 dili indiriyor. Fransız kullanıcının Japonca çeviriye ihtiyacı yok.

### Hedef
- 56 MB tek dosya → 15 adet ~4 MB dil dosyası
- Kullanıcı yalnızca kendi dilini indirir
- Yükleme süresi 10x azalır

### Adımlar

#### 1.1 — Splitter Script Oluştur
`scripts/split-translation-corpus.mjs` dosyasını oluştur:

```javascript
// scripts/split-translation-corpus.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'data', 'translations', 'vocabulary-translations.json');
const OUT_DIR = join(ROOT, 'src', 'data', 'translations', 'by-lang');

const SUPPORTED_LANGS = ['en','tr','ar','de','es','pt','fr','ru','zh','ja','it','vi','pl','id','nl'];

console.log('📂 Loading corpus...');
const corpus = JSON.parse(readFileSync(SOURCE, 'utf8'));
const terms = Object.keys(corpus);

mkdirSync(OUT_DIR, { recursive: true });

for (const lang of SUPPORTED_LANGS) {
  const langMap = {};
  for (const term of terms) {
    const entry = corpus[term]?.[lang];
    if (entry) langMap[term] = entry;
  }
  const outPath = join(OUT_DIR, `${lang}.json`);
  writeFileSync(outPath, JSON.stringify(langMap));
  const kb = Math.round(Buffer.byteLength(JSON.stringify(langMap)) / 1024);
  console.log(`✅ ${lang}.json — ${kb} KB, ${Object.keys(langMap).length} terms`);
}
console.log('🎉 Done. Files in src/data/translations/by-lang/');
```

Çalıştır: `node scripts/split-translation-corpus.mjs`

#### 1.2 — Translation Service'i Güncelle
`src/shared/services/vocabulary-translation.service.ts` dosyasını şu şekilde düzenle:

```typescript
// Mevcut loadVocabularyTranslations() fonksiyonunu SİL.
// Yerine dil bazlı lazy loader yaz:

type LangEntry = { meaning?: string; definition?: string; example?: string };
type LangMap = Record<string, LangEntry>;

const langCache = new Map<string, LangMap>();
const pendingLoads = new Map<string, Promise<LangMap>>();

export const loadLanguageCorpus = (language: string): Promise<LangMap> => {
  if (langCache.has(language)) return Promise.resolve(langCache.get(language)!);
  if (pendingLoads.has(language)) return pendingLoads.get(language)!;

  const load = import(`../../data/translations/by-lang/${language}.json`)
    .then((mod) => {
      const map = (mod.default ?? mod) as LangMap;
      langCache.set(language, map);
      pendingLoads.delete(language);
      return map;
    })
    .catch(() => {
      // Dil bulunamazsa boş map döndür (İngilizce fallback)
      const empty: LangMap = {};
      langCache.set(language, empty);
      pendingLoads.delete(language);
      return empty;
    });

  pendingLoads.set(language, load);
  return load;
};

// resolveTermMeaning ve resolveTermMeaningAsync fonksiyonlarını
// yeni loadLanguageCorpus API'sine uyarla.
// Eski loadVocabularyTranslations export'unu koru (backward compat için
// sadece 'tr' corpus'unu yükleyen bir wrapper olarak bırak).
```

#### 1.3 — Hook'u Güncelle
`src/features/vocabulary/services/translation/vocabulary-translation.hook.ts` içindeki  
`loadVocabularyTranslations()` çağrısını `loadLanguageCorpus(language)` ile değiştir.

#### 1.4 — LessonRunnerPage'i Güncelle
`src/pages/LessonRunnerPage/index.tsx` içindeki `resolveTermMeaningAsync` çağrısı  
zaten `uiLanguage` parametresini alıyor. Servis güncellemesinden sonra otomatik çalışır.

#### 1.5 — Kabul Kriterleri
- [ ] `node scripts/split-translation-corpus.mjs` başarıyla 15 dosya üretir
- [ ] `src/data/translations/by-lang/fr.json` mevcut ve `"short": { "meaning": "court" }` içeriyor
- [ ] `npx tsc --noEmit` sıfır hata
- [ ] `npx vitest run` tüm testler geçiyor
- [ ] Vercel build'i başarılı (`npm run build`)

#### Commit Mesajı
```
feat(i18n): split 56 MB corpus into per-language chunks for lazy loading
```

---

## 🔴 GÖREV 2: Kullanıcı Anadili Ayrımı (nativeLanguage vs uiLanguage)

### Problem
Şu an `useLocalizationStore`'daki `language` hem **arayüz dilini** hem de **öğrenme çevirisi dilini** belirliyor.  
Bir Fransız kullanıcı arayüzü Fransızca görüyor ✅ ama doğru cevaplar da Fransızca geliyor ✅  
**Asıl sorun:** Kullanıcının anadili (native language) onboarding'de ayrıca sorulmuyor.  
Suudi Arabistanlı bir mühendis arayüzü Arapça, ama öğrenme cevaplarını da Arapça görmek isteyebilir.  
Bu zaten doğru çalışıyor FAKAT onboarding'de "Anadilim nedir?" diye sormak UX'i netleştirir.

### Hedef
`UserLearningProfile`'a `nativeLanguage: SupportedInterfaceLanguage` alanı ekle.  
Onboarding'de dil seçimi bunu doldursun.  
`LessonRunnerPage` ve `VocabularyPage` cevapları bu alandan okusun (mevcut `uiLanguage` yerine).

### Adımlar

#### 2.1 — Profile Type Güncelle
`src/shared/types/domain.types.ts` içinde `UserLearningProfile` interface'ini bul.  
`nativeLanguage?: SupportedInterfaceLanguage` alanını ekle (optional, geriye uyumlu).

```typescript
// domain.types.ts içindeki UserLearningProfile'a ekle:
nativeLanguage?: SupportedInterfaceLanguage; // Öğrenme cevaplarında kullanılır
```

#### 2.2 — LearningProfileRepository Güncelle
`src/features/profile/profile.repository.ts` içinde `getProfile()` metodunu bul.  
`nativeLanguage` alanı yoksa `language` alanından türet (backward compat):

```typescript
// getProfile() return'ünde:
nativeLanguage: stored.nativeLanguage ?? stored.language ?? 'tr',
```

#### 2.3 — LessonRunnerPage'i Güncelle
`src/pages/LessonRunnerPage/index.tsx` içinde:

```typescript
// ÖNCE:
const uiLanguage = useLocalizationStore((state) => state.language);

// SONRA:
const uiLanguage = useLocalizationStore((state) => state.language);
const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
const learningLanguage = profile.nativeLanguage ?? uiLanguage;
// resolveTermMeaningAsync çağrısında uiLanguage yerine learningLanguage kullan
```

#### 2.4 — Kabul Kriterleri
- [ ] `UserLearningProfile.nativeLanguage` tipi doğru
- [ ] `getProfile()` `nativeLanguage` döndürüyor
- [ ] `LessonRunnerPage` `learningLanguage` kullanıyor
- [ ] `npx tsc --noEmit` sıfır hata

#### Commit Mesajı
```
feat(i18n): separate nativeLanguage from uiLanguage in profile for correct answer resolution
```

---

## 🟡 GÖREV 3: Spaced Repetition (Yanlış Cevapların Tekrarı)

### Problem
Kullanıcı yanlış cevapladığı terimi bir daha görmüyor.  
`src/core/learning/spaced-repetition.helpers.ts` mevcut ama kullanılmıyor.

### Hedef
Yanlış cevaplanan terimler `learningStore.weakTermIds` dizisine eklenir.  
`LessonRunnerPage` ders başlarken bu zayıf terimleri normale ek olarak önce sıralar.

### Adımlar

#### 3.1 — Learning Store'a weakTermIds Ekle
`src/core/learning/learning.store.ts` dosyasını düzenle:

```typescript
// State'e ekle:
weakTermIds: string[];          // Yanlış cevaplanan term ID'leri

// Actions'a ekle:
markTermWeak: (termId: string) => void;
clearWeakTerm: (termId: string) => void;

// Implementasyon:
markTermWeak: (termId) => set((state) => ({
  weakTermIds: state.weakTermIds.includes(termId) 
    ? state.weakTermIds 
    : [...state.weakTermIds, termId],
})),

clearWeakTerm: (termId) => set((state) => ({
  weakTermIds: state.weakTermIds.filter(id => id !== termId),
})),

// Initial state:
weakTermIds: [],
```

> **Not:** `persist` middleware kullanılıyorsa `weakTermIds`'i partition'a ekle.

#### 3.2 — LessonRunnerPage'de Yanlış Cevap Takibi
`src/pages/LessonRunnerPage/index.tsx` içinde `handleCheckAnswer` fonksiyonunu bul.  
Yanlış cevap verildiğinde `markTermWeak(term.id)` çağır.  
Doğru cevap verildiğinde `clearWeakTerm(term.id)` çağır.

```typescript
// LessonRunnerPage içinde:
const { markTermWeak, clearWeakTerm } = useLearningStore(
  useShallow((state) => ({
    markTermWeak: state.markTermWeak,
    clearWeakTerm: state.clearWeakTerm,
  }))
);

// Cevap kontrol fonksiyonunda:
if (correct) {
  clearWeakTerm(currentQuestion.term.id);
} else {
  markTermWeak(currentQuestion.term.id);
}
```

#### 3.3 — Soru Sıralama: Zayıf Terimler Önce
`src/pages/LessonRunnerPage/index.tsx` içinde `questionList` oluşturma bölümünde:

```typescript
// questions oluşturulduktan sonra, setQuestions'dan önce:
const weakTermIds = useLearningStore.getState().weakTermIds;
const sortedQuestions = [
  ...questionList.filter(q => weakTermIds.includes(q.term.id)),   // Zayıflar önce
  ...questionList.filter(q => !weakTermIds.includes(q.term.id)),  // Geri kalanlar
];
setQuestions(sortedQuestions);
```

#### 3.4 — Kabul Kriterleri
- [ ] `useLearningStore` `weakTermIds`, `markTermWeak`, `clearWeakTerm` içeriyor
- [ ] Yanlış cevaplanan term ID'si `weakTermIds`'e ekleniyor
- [ ] Doğru cevaplanan term `weakTermIds`'den temizleniyor
- [ ] Ders başlangıcında zayıf terimler sıralamada önce geliyor
- [ ] `npx tsc --noEmit` ve `npx vitest run` geçiyor

#### Commit Mesajı
```
feat(learning): add spaced repetition weak-term tracking and priority reordering
```

---

## 🟡 GÖREV 4: Ders Tamamlama Ekranı (Completion Animation)

### Problem
Ders bitince düz metin gösteriliyor. Görsel ödül yok.

### Hedef
Ders bitince animasyonlu CP kazanma, doğruluk oranı ve "Sıradaki Derse Git" ekranı.

### Adımlar

#### 4.1 — LessonCompleteScreen Bileşeni Oluştur
`src/features/lesson-runner/components/LessonCompleteScreen.tsx` dosyasını oluştur:

```typescript
interface LessonCompleteScreenProps {
  earnedCp: number;
  correctCount: number;
  totalCount: number;
  onContinue: () => void;
  onBackToRoadmap: () => void;
  translate: (key: string) => string;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({
  earnedCp, correctCount, totalCount, onContinue, onBackToRoadmap, translate
}) => {
  const accuracy = Math.round((correctCount / totalCount) * 100);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8 p-8">
      {/* Animasyonlu rozet - CSS keyframe ile pulse/scale */}
      <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground">
        {translate('lesson.completedTitle')}
      </h1>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
        <div className="bg-card rounded-xl p-4 text-center border">
          <div className="text-2xl font-bold text-yellow-400">⚡ +{earnedCp}</div>
          <div className="text-sm text-muted-foreground">{translate('lesson.careerPoints')}</div>
        </div>
        <div className="bg-card rounded-xl p-4 text-center border">
          <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
        >
          {translate('lesson.nextTask')}
        </button>
        <button
          onClick={onBackToRoadmap}
          className="w-full py-3 rounded-xl bg-card border text-foreground hover:bg-muted transition-colors"
        >
          {translate('lesson.backToRoadmap')}
        </button>
      </div>
    </div>
  );
};
```

#### 4.2 — LessonRunnerPage'de Kullan
`src/pages/LessonRunnerPage/index.tsx` içindeki `completed` state render bölümünde  
mevcut düz metni `LessonCompleteScreen` bileşeniyle değiştir.

```typescript
// correctCount state'i ekle:
const [correctCount, setCorrectCount] = useState(0);

// Doğru cevap verilince: setCorrectCount(prev => prev + 1)

// Render'da:
if (completed) {
  return (
    <LessonCompleteScreen
      earnedCp={earnedCp}
      correctCount={correctCount}
      totalCount={questions.length}
      onContinue={() => navigate('/learning-path')}
      onBackToRoadmap={() => navigate('/learning-path')}
      translate={translate}
    />
  );
}
```

#### 4.3 — Kabul Kriterleri
- [ ] `LessonCompleteScreen` bileşeni oluşturuldu
- [ ] Ders bitince animasyonlu ekran görünüyor
- [ ] CP ve doğruluk oranı doğru gösteriliyor
- [ ] İki buton (Devam / Yol Haritasına Dön) çalışıyor

#### Commit Mesajı
```
feat(lesson): add animated completion screen with CP and accuracy stats
```

---

## 🔴 GÖREV 5: Stripe Canlı Entegrasyonu

### Mevcut Durum
`src/features/billing/stripe.provider.ts` — `StripeBillingProvider` sınıfı tamamen yazılmış.  
`src/features/billing/billing.store.ts` — `startCheckout()` action hazır.  
`src/features/billing/billing.service.ts` — Backend API çağrısı hazır.  
Railway backend'inde `/api/v1/billing/create-checkout-session` endpoint'i var.

**Eksik olan:** Railway backend'ine Stripe API anahtarlarının eklenmesi.

### Adımlar

#### 5.1 — Railway Environment Variables Ekle
[Railway.app](https://railway.app) → Projeye gir → Variables sekmesi → Şunları ekle:

```env
STRIPE_SECRET_KEY=sk_live_...          # Stripe Dashboard > Developers > API keys
STRIPE_WEBHOOK_SECRET=whsec_...        # Stripe Dashboard > Webhooks > Endpoint > Signing secret
STRIPE_PRICE_ID_PRO_MONTHLY=price_... # Stripe Dashboard > Products > Engineer Pro > Monthly Price ID
STRIPE_PRICE_ID_PRO_YEARLY=price_...  # Stripe Dashboard > Products > Engineer Pro > Yearly Price ID
FRONTEND_URL=https://eng-vox.vercel.app
```

#### 5.2 — Backend Webhook Route Kontrol
Railway backend'inde (`server/` veya `backend/`) şu endpoint'lerin var olduğunu doğrula:

```
POST /api/v1/billing/create-checkout-session
POST /api/v1/billing/create-customer-portal-session
GET  /api/v1/billing/subscription-status
POST /api/webhooks/stripe   ← Stripe webhook buraya gelecek
```

Eğer webhook route yoksa `backend/routes/billing.routes.ts` (veya `.js`) dosyasına ekle:

```typescript
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  if (event.type === 'customer.subscription.updated' || 
      event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    // Supabase'deki kullanıcı abonelik durumunu güncelle
    await supabase
      .from('subscriptions')
      .upsert({ 
        user_id: subscription.metadata.userId,
        plan: subscription.status === 'active' ? 'pro' : 'free',
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      });
  }

  res.json({ received: true });
});
```

#### 5.3 — Stripe Webhook URL Kaydet
Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://englishengineer-backend.onrender.com/api/webhooks/stripe`
- Events: `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`

#### 5.4 — Vercel Environment Variables Ekle
[Vercel Dashboard](https://vercel.com) → Project → Settings → Environment Variables:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...   # Stripe Dashboard > Developers > API keys
```

#### 5.5 — Paywall Kapısı (Feature Gate) Ekle
`src/features/billing/billing.entitlements.ts` dosyasını kontrol et.  
`canAccess(plan, 'lesson-runner')` fonksiyonu yoksa ekle:

```typescript
export const canAccess = (
  plan: BillingPlanId | undefined, 
  feature: 'lesson-runner' | 'ai-coach' | 'export'
): boolean => {
  if (feature === 'lesson-runner') {
    // Free kullanıcılar günde 3 ders
    return true; // Şimdilik açık, sonra kotayla sınırla
  }
  if (feature === 'ai-coach') {
    return plan === 'pro' || plan === 'project';
  }
  return false;
};
```

#### 5.6 — Kabul Kriterleri
- [ ] Railway'de `STRIPE_SECRET_KEY` set edildi
- [ ] Stripe Dashboard'da webhook endpoint kaydedildi
- [ ] Test kartıyla (`4242 4242 4242 4242`) ödeme akışı çalışıyor
- [ ] Başarılı ödeme sonrası `useBillingStore` Pro planı gösteriyor
- [ ] `npx tsc --noEmit` sıfır hata

#### Commit Mesajı
```
feat(billing): activate Stripe live integration with webhook subscription sync
```

---

## 🟡 GÖREV 6: RTL (Arapça/Farsça) Dil Desteği

### Hedef
Arapça seçilince tüm layout sağdan sola döner.

### Adımlar

#### 6.1 — Localization Store'a RTL Hook Ekle
`src/features/localization/localization.store.ts` içine:

```typescript
// RTL diller:
const RTL_LANGUAGES: SupportedInterfaceLanguage[] = ['ar'];

// setLanguage action içinde:
setLanguage: (language) => {
  LocalizationService.setLanguage(language);
  // HTML dir attribute güncelle
  document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  set({ language, translate: createTranslate(language) });
},

// Store init'te de çalıştır:
// (create callback'inin dışında, store oluştuktan sonra)
```

#### 6.2 — CSS RTL Desteği Ekle
`src/index.css` veya global CSS dosyasına:

```css
[dir="rtl"] .sidebar {
  border-right: none;
  border-left: 1px solid var(--border);
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}
```

#### Commit Mesajı
```
feat(i18n): add RTL layout support for Arabic language
```

---

## 🟡 GÖREV 7: Onboarding'e "Anadil" Adımı Ekle

### Hedef
Kullanıcı ilk girişte meslek ve arayüz dili yanında "Öğrenme çevirilerini hangi dilde görmek istiyorsun?" sorusunu cevaplar.

### Adımlar

#### 7.1 — OnboardingPage'i İncele
`src/pages/OnboardingPage/` klasörünü aç ve mevcut adım yapısını anla.  
Yeni bir adım eklemek için mevcut adım pattern'ini kopyala.

#### 7.2 — Profile'a Kaydet
Kullanıcı seçim yaptığında `LearningProfileRepository.saveProfile()` ile  
`profile.nativeLanguage = selectedLanguage` kaydet.

#### 7.3 — Aynı Dil Seçenekleri
Mevcut `SupportedInterfaceLanguage` listesini kullan. Onboarding'deki dil seçim bileşenini tekrar kullanabilirsin.

#### Commit Mesajı
```
feat(onboarding): add native language selection step for translation preference
```

---

## 🔵 GÖREV 8: PWA Dönüşümü (Progressive Web App)

### Hedef
Kullanıcılar "Ana Ekrana Ekle" ile EngVox'u native uygulama gibi kullanır.

### Adımlar

#### 8.1 — Vite PWA Plugin Kur
```bash
npm install -D vite-plugin-pwa
```

#### 8.2 — vite.config.ts Güncelle
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EngVox — Engineering English',
        short_name: 'EngVox',
        description: 'AI-powered Engineering English for 10 disciplines',
        theme_color: '#0ea5e9',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/learning-path',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Vocabulary verisini cache'le (offline kullanım için)
        runtimeCaching: [
          {
            urlPattern: /\/src\/data\/translations\/by-lang\/.+\.json/,
            handler: 'CacheFirst',
            options: { cacheName: 'translation-corpus', expiration: { maxAgeSeconds: 604800 } },
          },
        ],
      },
    }),
  ],
});
```

#### 8.3 — İkon Dosyaları
`public/icon-192.png` ve `public/icon-512.png` dosyalarını oluştur (EngVox logosu).

#### Commit Mesajı
```
feat(pwa): add Progressive Web App support with offline translation caching
```

---

## ✅ UYGULAMA SIRASINDA KONTROL LİSTESİ

Her görev sonrası şunları çalıştır ve **hepsi yeşil olmadan commit etme:**

```bash
# 1. Tip kontrolü
npx tsc --noEmit

# 2. Birim testler
npx vitest run

# 3. Build kontrolü
npm run build

# 4. Git commit
git add -A
git commit -m "feat(...): ..."
git push
```

---

## 🚨 SIK YAPILAN HATALAR VE ÇÖZÜMLER

| Hata | Sebebi | Çözüm |
|---|---|---|
| `turkishMeaning` Fransız kullanıcıya gösteriliyor | `resolveTermMeaningAsync` yerine doğrudan alan erişimi | Her yerde `resolveTermMeaningAsync(term, { turkishMeaning, definition }, language)` kullan |
| 56 MB dosya Vercel'de yüklenmez | `data/` kök klasörü Vite tarafından bundle edilmez | Sadece `src/data/` altındaki dosyalar kullanılabilir |
| Dil değişince sayfayı yenilemeden çeviriler güncellenmez | Store re-render tetiklenmiyor | `useLocalizationStore(state => state.translate)` ile direkt subscribe ol |
| Stripe checkout açılmıyor | `VITE_BILLING_API_URL` env var eksik veya yanlış | Vercel'de `VITE_BILLING_API_URL=https://englishengineer-backend.onrender.com` ekle |
| RTL layout bozuluyor | Tailwind flex yönleri hardcoded | `[dir="rtl"]` CSS overrides ekle |
| `UserLearningProfile` type hataları | `nativeLanguage` domain.types.ts'e eklenmemiş | `src/shared/types/domain.types.ts`'i düzenle |

---

## 📋 ÖZET: GÖREV ÖNCELİK SIRASI

| Sıra | Görev | Zorluk | Süre | Etki |
|---|---|---|---|---|
| 1 | Corpus'u dillere böl | Orta | 2 saat | 🚀 10x hız artışı |
| 2 | nativeLanguage ayrımı | Kolay | 1 saat | ✅ i18n doğru çalışır |
| 3 | Spaced Repetition | Orta | 3 saat | 📈 Öğrenme kalitesi |
| 4 | Tamamlama ekranı | Kolay | 2 saat | 🎮 Kullanıcı deneyimi |
| 5 | Stripe canlı | Orta | 4 saat | 💰 İlk gerçek gelir |
| 6 | RTL desteği | Kolay | 1 saat | 🌍 Arap pazarı |
| 7 | Onboarding dil adımı | Orta | 2 saat | 🎯 UX netliği |
| 8 | PWA dönüşümü | Orta | 3 saat | 📱 Mobile reach |
