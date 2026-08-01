import { logger } from '@/shared/logger';

import { LocalTranslationEngine } from './local-translation.engine';

export type SupportedLang =
  | 'auto'
  | 'en'
  | 'tr'
  | 'ar'
  | 'zh'
  | 'ru'
  | 'de'
  | 'es'
  | 'it'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'pl';

export interface TranslationRequest {
  text: string;
  sourceLang: SupportedLang;
  targetLang: SupportedLang;
}

export interface WordAnalysis {
  word: string;
  isSingleWord: boolean;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'technical_term' | 'general';
  alternativeMeanings?: string[];
  phonetic?: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedLang?: string;
  serviceUsed: 'google_gtx' | 'lingva' | 'ftapi' | 'libretranslate' | 'mymemory' | 'fallback';
  wordAnalysis?: WordAnalysis;
}

const DEFAULT_ENDPOINTS = [
  import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://translate.argosopentech.com/translate',
  'https://libretranslate.com/translate',
  'https://libretranslate.de/translate',
];

// Offline / Local dictionary for instant fallback
const LOCAL_WORD_DB: Record<
  string,
  { pos: WordAnalysis['partOfSpeech']; tr: string; alts: string[] }
> = {
  hi: { pos: 'general', tr: 'selam', alts: ['merhaba', 'selamlar', 'hey'] },
  hello: { pos: 'general', tr: 'merhaba', alts: ['selam', 'günaydın', 'iyi günler'] },
  hey: { pos: 'general', tr: 'selam', alts: ['hey', 'merhaba'] },
  yes: { pos: 'general', tr: 'evet', alts: ['olur', 'tabiki', 'kabul'] },
  no: { pos: 'general', tr: 'hayır', alts: ['yok', 'olmaz', 'red'] },
  thanks: { pos: 'general', tr: 'teşekkürler', alts: ['teşekkür ederim', 'sağol'] },
  please: { pos: 'general', tr: 'lütfen', alts: ['rica etsem', 'müsaadenizle'] },
  enter: { pos: 'verb', tr: 'girmek', alts: ['giriniz', 'giriş yapmak', 'kaydetmek'] },
  turkey: { pos: 'noun', tr: 'Türkiye', alts: ['hindi', 'Türkiye Cumhuriyeti'] },
  come: { pos: 'verb', tr: 'gelmek', alts: ['ulaşmak', 'yaklaşmak', 'varım'] },
  specification: { pos: 'noun', tr: 'şartname', alts: ['teknik özellikler', 'spesifikasyon'] },
  concrete: { pos: 'noun', tr: 'beton', alts: ['somut', 'katılaşmış', 'harç'] },
  slump: { pos: 'noun', tr: 'çökme testi', alts: ['düşüş', 'çökme', 'sarkma'] },
  reinforcement: { pos: 'noun', tr: 'donatı', alts: ['takviye', 'güçlendirme', 'armatür'] },
  beam: { pos: 'noun', tr: 'kiriş', alts: ['ışın', 'kolon', 'destek'] },
  column: { pos: 'noun', tr: 'kolon', alts: ['sütun', 'direk'] },
  foundation: { pos: 'noun', tr: 'temel', alts: ['dayanak', 'vakıf', 'altyapı'] },
  contract: { pos: 'noun', tr: 'sözleşme', alts: ['kontrat', 'bağıt', 'anlaşma'] },
  delay: { pos: 'verb', tr: 'geciktirmek', alts: ['gecikme', 'ertelenme', 'aksama'] },
  inspection: { pos: 'noun', tr: 'denetim', alts: ['muayene', 'kontroldan geçirme', 'teftiş'] },
  permit: { pos: 'noun', tr: 'izin', alts: ['ruhsat', 'müsaade', 'onay'] },
  safety: { pos: 'noun', tr: 'güvenlik', alts: ['emniyet', 'iş sağlığı'] },
  audit: { pos: 'noun', tr: 'denetim', alts: ['teftiş', 'revizyon'] },
  hazard: { pos: 'noun', tr: 'tehlike', alts: ['risk', 'kaza riski'] },
  tender: { pos: 'noun', tr: 'ihale', alts: ['teklif', 'ihale evrakı'] },
  claim: { pos: 'noun', tr: 'hak talebi', alts: ['iddia', 'alacak talebi', 'tazminat'] },
  variation: { pos: 'noun', tr: 'değişiklik emri', alts: ['varyasyon', 'sapma', 'farklılık'] },
  drawing: { pos: 'noun', tr: 'çizim', alts: ['pafta', 'proje planı', 'resim'] },
  site: { pos: 'noun', tr: 'şantiye', alts: ['saha', 'arazi', 'konum'] },
  engineer: { pos: 'noun', tr: 'mühendis', alts: ['tekniker', 'uzman'] },
  execute: { pos: 'verb', tr: 'uygulamak', alts: ['yürütmek', 'yerine getirmek', 'imal etmek'] },
  inspect: { pos: 'verb', tr: 'denetlemek', alts: ['incelemek', 'kontrol etmek'] },
  approve: { pos: 'verb', tr: 'onaylamak', alts: ['tasdik etmek', 'kabul etmek'] },
  verify: { pos: 'verb', tr: 'doğrulamak', alts: ['teyit etmek', 'kanıtlamak'] },
  robust: { pos: 'adjective', tr: 'dayanıklı', alts: ['sağlam', 'güçlü', 'dirençli'] },
  critical: { pos: 'adjective', tr: 'kritik', alts: ['hayati', 'belirleyici'] },
  good: { pos: 'adjective', tr: 'iyi', alts: ['güzel', 'kaliteli'] },
  project: { pos: 'noun', tr: 'proje', alts: ['tasarım', 'plan'] },
  system: { pos: 'noun', tr: 'sistem', alts: ['düzenek', 'yapı'] },
  user: { pos: 'noun', tr: 'kullanıcı', alts: ['üye'] },
  data: { pos: 'noun', tr: 'veri', alts: ['bilgi'] },
};

const NOUN_SUFFIXES = ['tion', 'ment', 'ence', 'ity'];
const VERB_SUFFIXES = ['ize', 'ate', 'ing', 'ed'];
const ADJ_SUFFIXES = ['able', 'ible', 'ive', 'ous'];

export const detectPartOfSpeech = (word: string): WordAnalysis['partOfSpeech'] => {
  const lower = word.toLowerCase().trim();
  if (LOCAL_WORD_DB[lower]) return LOCAL_WORD_DB[lower].pos;
  if (NOUN_SUFFIXES.some((s) => lower.endsWith(s))) return 'noun';
  if (VERB_SUFFIXES.some((s) => lower.endsWith(s))) return 'verb';
  if (ADJ_SUFFIXES.some((s) => lower.endsWith(s))) return 'adjective';
  if (lower.endsWith('ly')) return 'adverb';
  return 'general';
};

export const analyzeSingleWord = (word: string, translatedText: string): WordAnalysis => {
  const cleanWord = word.trim();
  const lowerWord = cleanWord.toLowerCase();

  const isSingle = cleanWord.split(/\s+/).length === 1;
  if (!isSingle) {
    return { word: cleanWord, isSingleWord: false };
  }

  const dbMatch = LOCAL_WORD_DB[lowerWord];
  const partOfSpeech = dbMatch?.pos || detectPartOfSpeech(cleanWord);

  let alternativeMeanings = dbMatch?.alts || [];
  if (alternativeMeanings.length === 0 && translatedText) {
    const rawAlts = translatedText
      .split(/[,;/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    alternativeMeanings = Array.from(new Set(rawAlts));
  }

  return {
    word: cleanWord,
    isSingleWord: true,
    partOfSpeech,
    alternativeMeanings,
  };
};

const detectLanguageDirection = (
  trimmed: string,
  sourceLang: SupportedLang,
  targetLang: SupportedLang
): { effectiveSource: string; effectiveTarget: string } => {
  const hasTurkishChar =
    /[çğıöşüÇĞİÖŞÜ]/.test(trimmed) ||
    /\b(ve|veya|bir|bu|ile|da|de|için|ne|nasıl|nasılsın|merhaba|iyi|şartname|beton|gel|git|yap|gelin)\b/i.test(
      trimmed
    );
  const effectiveSource = sourceLang;
  let effectiveTarget = targetLang;
  if (effectiveSource === 'auto') {
    const inputIsTurkish = hasTurkishChar;
    if (inputIsTurkish && targetLang === 'tr') {
      effectiveTarget = 'en';
    }
  } else if (targetLang === effectiveSource) {
    effectiveTarget = effectiveSource === 'tr' ? 'en' : 'tr';
  }
  return { effectiveSource, effectiveTarget };
};

export class TranslationService {
  private static instance: TranslationService;
  private primaryEndpoint: string;

  private constructor() {
    this.primaryEndpoint = DEFAULT_ENDPOINTS[0];
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public setEndpoint(url: string): void {
    if (url && url.trim()) {
      this.primaryEndpoint = url.trim();
    }
  }

  public getEndpoint(): string {
    return this.primaryEndpoint;
  }

  private static parseGtxResponse(data: unknown): string {
    if (Array.isArray(data)) {
      if (typeof data[0] === 'string') return data[0];
      if (Array.isArray(data[0]) && typeof data[0][0] === 'string') return data[0][0];
    }
    return '';
  }

  private static buildGtxUrls(trimmed: string, sourceLang: string, targetLang: string): string[] {
    const encoded = encodeURIComponent(trimmed);
    const urls: string[] = [];
    if (typeof window !== 'undefined' && window.location) {
      urls.push(`${window.location.origin}/api/translate?text=${encoded}&sl=${sourceLang}&tl=${targetLang}`);
    }
    urls.push(
      `https://translate.googleapis.com/translate_a/t?client=gtx&sl=${sourceLang}&tl=${targetLang}&q=${encoded}`,
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encoded}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://translate.googleapis.com/translate_a/t?client=gtx&sl=${sourceLang}&tl=${targetLang}&q=${encoded}`)}`
    );
    return urls;
  }

  private async tryGoogleGTX_T(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    for (const url of TranslationService.buildGtxUrls(trimmed, sourceLang, targetLang)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) continue;
        const translatedText = TranslationService.parseGtxResponse(await response.json());
        if (translatedText && translatedText.toLowerCase() !== trimmed.toLowerCase()) {
          return {
            originalText: text,
            translatedText,
            sourceLang,
            targetLang,
            serviceUsed: 'google_gtx',
            wordAnalysis: analyzeSingleWord(trimmed, translatedText),
          };
        }
      } catch (err: unknown) {
        logger.w('[TranslationService] Google GTX engine attempt failed', err);
      }
    }
    return null;
  }

  private async tryMyMemory(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const translatedText = data?.responseData?.translatedText || '';
        if (
          translatedText &&
          !translatedText.startsWith('MYMEMORY WARNING') &&
          translatedText.toLowerCase() !== trimmed.toLowerCase()
        ) {
          return {
            originalText: text,
            translatedText,
            sourceLang,
            targetLang,
            serviceUsed: 'mymemory',
            wordAnalysis: analyzeSingleWord(trimmed, translatedText),
          };
        }
      }
    } catch (err: unknown) {
      logger.w('[TranslationService] MyMemory fallback failed', err);
    }
    return null;
  }

  private async tryLingva(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    const lingvaEndpoints = [
      `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(trimmed)}`,
      `https://lingva.lunar.icu/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(trimmed)}`,
    ];

    for (const url of lingvaEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data?.translation && data.translation.toLowerCase() !== trimmed.toLowerCase()) {
            return {
              originalText: text,
              translatedText: data.translation,
              sourceLang,
              targetLang,
              serviceUsed: 'lingva',
              wordAnalysis: analyzeSingleWord(trimmed, data.translation),
            };
          }
        }
      } catch (err: unknown) {
        logger.w('[TranslationService] Lingva proxy failed', err);
      }
    }
    return null;
  }

  private async tryFtApi(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    try {
      const url = `https://ftapi.pythonanywhere.com/translate?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(trimmed)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const translatedText = data?.['destination-text'] || '';
        if (translatedText && translatedText.toLowerCase() !== trimmed.toLowerCase()) {
          return {
            originalText: text,
            translatedText,
            sourceLang,
            targetLang,
            serviceUsed: 'ftapi',
            wordAnalysis: analyzeSingleWord(trimmed, translatedText),
          };
        }
      }
    } catch (err: unknown) {
      logger.w('[TranslationService] FtApi failed', err);
    }
    return null;
  }

  private async postToEndpoint(
    endpoint: string,
    trimmed: string,
    sourceLang: string,
    targetLang: string
  ): Promise<{ translatedText: string; detectedLang?: string } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: trimmed, source: sourceLang, target: targetLang, format: 'text' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      const data = await response.json();
      const translatedText = data?.translatedText || '';
      if (translatedText && translatedText.toLowerCase() !== trimmed.toLowerCase()) {
        return { translatedText, detectedLang: data?.detectedLanguage?.language };
      }
    } catch (err: unknown) {
      logger.w(`[TranslationService] LibreTranslate endpoint failed (${endpoint})`, err);
    }
    return null;
  }

  private async tryEndpoints(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    const endpointsToTry = Array.from(new Set([this.primaryEndpoint, ...DEFAULT_ENDPOINTS]));
    for (const endpoint of endpointsToTry) {
      const result = await this.postToEndpoint(endpoint, trimmed, sourceLang, targetLang);
      if (result) {
        return {
          originalText: text,
          translatedText: result.translatedText,
          sourceLang,
          targetLang,
          detectedLang: result.detectedLang || sourceLang,
          serviceUsed: 'libretranslate',
          wordAnalysis: analyzeSingleWord(trimmed, result.translatedText),
        };
      }
    }
    return null;
  }

  private static offlineFallback(
    trimmed: string,
    text: string,
    effectiveSource: string,
    effectiveTarget: string
  ): TranslationResult {
    const lower = trimmed.toLowerCase();
    const dbMatch = LOCAL_WORD_DB[lower];
    const fallbackText = dbMatch && effectiveTarget === 'tr' ? dbMatch.tr : lower;
    return {
      originalText: text,
      translatedText: fallbackText,
      sourceLang: effectiveSource,
      targetLang: effectiveTarget,
      serviceUsed: 'fallback',
      wordAnalysis: analyzeSingleWord(trimmed, fallbackText),
    };
  }

  public async translate({
    text,
    sourceLang = 'auto',
    targetLang = 'tr',
  }: TranslationRequest): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        originalText: text,
        translatedText: '',
        sourceLang,
        targetLang,
        serviceUsed: 'fallback',
      };
    }

    const { effectiveSource, effectiveTarget } = detectLanguageDirection(
      trimmed,
      sourceLang,
      targetLang
    );

    // 0. Local Engine Pattern & Phrase Matching (0ms latency)
    const localMatch = LocalTranslationEngine.translate(trimmed, effectiveSource, effectiveTarget);
    if (localMatch.isMatched) {
      return {
        originalText: text,
        translatedText: localMatch.translatedText,
        sourceLang: effectiveSource,
        targetLang: effectiveTarget,
        serviceUsed: 'google_gtx',
        wordAnalysis: analyzeSingleWord(trimmed, localMatch.translatedText),
      };
    }

    // 1. Ultra-Fast Google GTX API (With Proxy fallback)
    const gtxTResult = await this.tryGoogleGTX_T(trimmed, text, effectiveSource, effectiveTarget);
    if (gtxTResult) return gtxTResult;

    // 2. MyMemory Open API
    const myMemoryResult = await this.tryMyMemory(trimmed, text, effectiveSource, effectiveTarget);
    if (myMemoryResult) return myMemoryResult;

    // 3. Lingva Open-Source Proxy Network
    const lingvaResult = await this.tryLingva(trimmed, text, effectiveSource, effectiveTarget);
    if (lingvaResult) return lingvaResult;

    // 4. Free Translation API Proxy
    const ftResult = await this.tryFtApi(trimmed, text, effectiveSource, effectiveTarget);
    if (ftResult) return ftResult;

    // 5. LibreTranslate / Argos Uptime Endpoints
    const endpointResult = await this.tryEndpoints(trimmed, text, effectiveSource, effectiveTarget);
    if (endpointResult) return endpointResult;

    // 6. Offline / Local Dictionary Fallback
    return TranslationService.offlineFallback(trimmed, text, effectiveSource, effectiveTarget);
  }
}

export const translationService = TranslationService.getInstance();
