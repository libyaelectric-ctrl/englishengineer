import { logger } from '@/shared/logger';

export interface TranslationRequest {
  text: string;
  sourceLang: 'auto' | 'en' | 'tr';
  targetLang: 'en' | 'tr';
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
  serviceUsed: 'libretranslate' | 'argos' | 'mymemory' | 'fallback';
  wordAnalysis?: WordAnalysis;
}

const DEFAULT_ENDPOINTS = [
  import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://translate.argosopentech.com/translate',
  'https://libretranslate.com/translate',
  'https://libretranslate.de/translate',
];

// Offline / Local quick dictionary dictionary for instant single-word fallback
const LOCAL_WORD_DB: Record<
  string,
  { pos: WordAnalysis['partOfSpeech']; tr: string; alts: string[] }
> = {
  specification: {
    pos: 'noun',
    tr: 'şartname',
    alts: ['teknik özellikler', 'tanımlama', 'spesifikasyon'],
  },
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

  private async tryEndpoints(
    trimmed: string,
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> {
    const endpointsToTry = Array.from(new Set([this.primaryEndpoint, ...DEFAULT_ENDPOINTS]));
    for (const endpoint of endpointsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: trimmed, source: sourceLang, target: targetLang, format: 'text' }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          const translatedText = data?.translatedText || '';
          if (translatedText) {
            return {
              originalText: text,
              translatedText,
              sourceLang,
              targetLang,
              detectedLang: data?.detectedLanguage?.language || sourceLang,
              serviceUsed: 'libretranslate',
              wordAnalysis: analyzeSingleWord(trimmed, translatedText),
            };
          }
        }
      } catch (err: unknown) {
        logger.w(`[TranslationService] LibreTranslate endpoint failed (${endpoint})`, err);
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
      const srcPair = sourceLang === 'auto' ? (/[a-zA-Z]/.test(trimmed) ? 'en' : 'tr') : sourceLang;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${srcPair}|${targetLang}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const translatedText = data?.responseData?.translatedText || '';
        if (translatedText && !translatedText.startsWith('MYMEMORY WARNING')) {
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

  public async translate({
    text,
    sourceLang = 'auto',
    targetLang = 'tr',
  }: TranslationRequest): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return { originalText: text, translatedText: '', sourceLang, targetLang, serviceUsed: 'fallback' };
    }

    const endpointResult = await this.tryEndpoints(trimmed, text, sourceLang, targetLang);
    if (endpointResult) return endpointResult;

    const myMemoryResult = await this.tryMyMemory(trimmed, text, sourceLang, targetLang);
    if (myMemoryResult) return myMemoryResult;

    const lower = trimmed.toLowerCase();
    const localMatch = LOCAL_WORD_DB[lower];
    if (localMatch) {
      const translatedText = targetLang === 'tr' ? localMatch.tr : lower;
      return {
        originalText: text,
        translatedText,
        sourceLang,
        targetLang,
        serviceUsed: 'fallback',
        wordAnalysis: analyzeSingleWord(trimmed, translatedText),
      };
    }

    return {
      originalText: text,
      translatedText: trimmed,
      sourceLang,
      targetLang,
      serviceUsed: 'fallback',
      wordAnalysis: analyzeSingleWord(trimmed, trimmed),
    };
  }
}

export const translationService = TranslationService.getInstance();
