/**
 * Natural Multilingual Technical & General Rule Engine
 */

const MULTILINGUAL_PHRASES: Record<string, Record<string, string>> = {
  'come here': {
    ru: 'Иди сюда',
    tr: 'Buraya gel / Buraya gelin',
    de: 'Komm her',
    fr: 'Viens ici',
    es: 'Ven aquí',
    ar: 'تعال إلى هنا',
    zh: '过来',
    ja: 'ここに来て',
    ko: '이리로 오세요',
    it: 'Vieni qui',
    pt: 'Venha aqui',
    pl: 'Chodź tutaj',
  },
  'come to turkey': {
    ru: 'Приезжайте в Турцию',
    tr: "Türkiye'ye gelin",
    de: 'Kommen Sie in die Türkei',
    fr: 'Venez en Turquie',
    es: 'Ven a Turquía',
    ar: 'تعال إلى تركيا',
    zh: '来到土耳其',
    ja: 'トルコに来てください',
    ko: '터키로 오세요',
  },
  'welcome to turkey': {
    ru: 'Добро пожаловать в Турцию',
    tr: "Türkiye'ye hoş geldiniz",
    de: 'Willkommen in der Türkei',
    fr: 'Bienvenue en Turquie',
    es: 'Bienvenido a Turquía',
    ar: 'مرحبا بكم في تركيا',
  },
  'how are you': {
    ru: 'Как дела?',
    tr: 'Nasılsınız?',
    de: 'Wie geht es Ihnen?',
    fr: 'Comment allez-vous?',
    es: '¿Cómo estás?',
    ar: 'كيف حالك؟',
    zh: '你好吗？',
    ja: 'お元気ですか？',
    ko: '어떻게 지내세요?',
  },
};

export class LocalTranslationEngine {
  public static translate(
    text: string,
    _sourceLang: string,
    targetLang: string
  ): { translatedText: string; isMatched: boolean } {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Direct Multi-lingual Dictionary Match
    const match = MULTILINGUAL_PHRASES[lower];
    if (match && match[targetLang]) {
      return { translatedText: match[targetLang], isMatched: true };
    }

    return { translatedText: text, isMatched: false };
  }
}
