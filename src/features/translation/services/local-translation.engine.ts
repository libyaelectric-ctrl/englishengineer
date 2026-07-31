/**
 * Natural English-Turkish Technical & General Rule Engine
 */

interface TranslationPattern {
  regex: RegExp;
  replace: (match: RegExpMatchArray) => string;
}

const COUNTRY_SUFFIX_MAP: Record<string, { base: string; to: string; in: string; from: string }> = {
  turkey: { base: 'Türkiye', to: "Türkiye'ye", in: "Türkiye'de", from: "Türkiye'den" },
  türkiye: { base: 'Türkiye', to: "Türkiye'ye", in: "Türkiye'de", from: "Türkiye'den" },
  germany: { base: 'Almanya', to: "Almanya'ya", in: "Almanya'da", from: "Almanya'dan" },
  england: { base: 'İngiltere', to: "İngiltere'ye", in: "İngiltere'de", from: "İngiltere'den" },
  usa: { base: 'ABD', to: "ABD'ye", in: "ABD'de", from: "ABD'den" },
  america: { base: 'Amerika', to: "Amerika'ya", in: "Amerika'da", from: "Amerika'dan" },
};

const COMMON_PHRASES_EN_TR: Record<string, string> = {
  'come to turkey': "Türkiye'ye gelin",
  'come to turkey.': "Türkiye'ye gelin.",
  'welcome to turkey': "Türkiye'ye hoş geldiniz",
  'welcome to turkey.': "Türkiye'ye hoş geldiniz.",
  'how are you': 'Nasılsınız?',
  'how are you?': 'Nasılsınız?',
  'how are you doing': 'Nasıl gidiyor?',
  'good morning': 'Günaydın',
  'good evening': 'İyi akşamlar',
  'good night': 'İyi geceler',
  'thank you': 'Teşekkür ederim',
  'thank you very much': 'Çok teşekkür ederim',
  'please enter': 'Lütfen giriş yapınız',
  enter: 'Giriş yapınız / Girmek',
  'sub-clause 8.4': 'Alt-Madde 8.4 (Süre Uzatımı Talebi)',
  'extension of time': 'Süre uzatımı (EOT)',
  'concrete slump test': 'Beton çökme testi (ASTM C143)',
  'reinforcement steel': 'Donatı çeliği',
  'compressive strength': 'Basınç dayanımı',
  'tensile strength': 'Çekme dayanımı',
  'variation order': 'Değişiklik emri',
  'taking over certificate': 'Geçici kabul belgesi',
  'defect liability period': 'Kusur sorumluluk süresi',
  'bill of quantities': 'Metraj cetveli (BoQ)',
  'as built drawing': 'As-built (imalat sonu) projesi',
};

const COMMON_PHRASES_TR_EN: Record<string, string> = {
  "türkiye'ye gelin": 'Come to Turkey',
  "türkiye'ye hoş geldiniz": 'Welcome to Turkey',
  nasılsınız: 'How are you?',
  günaydın: 'Good morning',
  'teşekkür ederim': 'Thank you',
  şartname: 'Specification',
  'beton çökme testi': 'Concrete slump test',
  'süre uzatımı': 'Extension of time (EOT)',
};

const EN_TR_PATTERNS: TranslationPattern[] = [
  {
    // come to {country/place}
    regex: /^come\s+to\s+([a-zA-ZğüşıöçĞÜŞİÖÇ]+)([\.\?!]?)$/i,
    replace: (m) => {
      const countryKey = m[1].toLowerCase();
      const mapped = COUNTRY_SUFFIX_MAP[countryKey];
      const targetPlace = mapped ? mapped.to : `${m[1]}'e`;
      const punct = m[2] || '';
      return `${targetPlace} gelin${punct}`;
    },
  },
  {
    // go to {country/place}
    regex: /^go\s+to\s+([a-zA-ZğüşıöçĞÜŞİÖÇ]+)([\.\?!]?)$/i,
    replace: (m) => {
      const countryKey = m[1].toLowerCase();
      const mapped = COUNTRY_SUFFIX_MAP[countryKey];
      const targetPlace = mapped ? mapped.to : `${m[1]}'e`;
      const punct = m[2] || '';
      return `${targetPlace} gidin${punct}`;
    },
  },
  {
    // welcome to {country/place}
    regex: /^welcome\s+to\s+([a-zA-ZğüşıöçĞÜŞİÖÇ]+)([\.\?!]?)$/i,
    replace: (m) => {
      const countryKey = m[1].toLowerCase();
      const mapped = COUNTRY_SUFFIX_MAP[countryKey];
      const targetPlace = mapped ? mapped.to : `${m[1]}'e`;
      const punct = m[2] || '';
      return `${targetPlace} hoş geldiniz${punct}`;
    },
  },
  {
    // what is {term}
    regex: /^what\s+is\s+(the\s+)?(.+)([\.\?!]?)$/i,
    replace: (m) => {
      const term = m[2].trim();
      const punct = m[3] || '?';
      return `${term} nedir${punct}`;
    },
  },
  {
    // where is {term}
    regex: /^where\s+is\s+(the\s+)?(.+)([\.\?!]?)$/i,
    replace: (m) => {
      const term = m[2].trim();
      const punct = m[3] || '?';
      return `${term} neresidir / nerededir${punct}`;
    },
  },
];

export class LocalTranslationEngine {
  public static translateEnToTr(text: string): { translatedText: string; isMatched: boolean } {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Direct Phrase Match
    if (COMMON_PHRASES_EN_TR[lower]) {
      return { translatedText: COMMON_PHRASES_EN_TR[lower], isMatched: true };
    }

    // 2. Pattern Rule Match
    for (const pattern of EN_TR_PATTERNS) {
      if (pattern.regex.test(trimmed)) {
        const match = trimmed.match(pattern.regex);
        if (match) {
          return { translatedText: pattern.replace(match), isMatched: true };
        }
      }
    }

    return { translatedText: text, isMatched: false };
  }

  public static translateTrToEn(text: string): { translatedText: string; isMatched: boolean } {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    if (COMMON_PHRASES_TR_EN[lower]) {
      return { translatedText: COMMON_PHRASES_TR_EN[lower], isMatched: true };
    }

    return { translatedText: text, isMatched: false };
  }
}
