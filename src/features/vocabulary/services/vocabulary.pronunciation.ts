export interface PronunciationResult {
  word: string;
  audioUrl: string;
  phonetic: string | null;
  source: 'browser-tts' | 'cached';
  cached: boolean;
}

const CACHE_KEY = 'EngVox_pronunciation_cache';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedPronunciation {
  word: string;
  audioBlob: Blob;
  timestamp: number;
}

export const PronunciationService = {
  cache: new Map<string, CachedPronunciation>(),

  init(): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as Array<[string, { word: string; timestamp: number }]>;
        entries.forEach(([key, val]) => {
          this.cache.set(key, { ...val, audioBlob: new Blob() });
        });
      }
    } catch {
      this.cache.clear();
    }
  },

  async speak(word: string, rate = 0.9): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.includes('Google')
    ) ?? voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) utterance.voice = englishVoice;

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`TTS failed: ${e.error}`));
      speechSynthesis.speak(utterance);
    });
  },

  async getPronunciation(word: string): Promise<PronunciationResult> {
    const normalized = word.toLowerCase().trim();
    const cached = this.cache.get(normalized);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        word: normalized,
        audioUrl: URL.createObjectURL(cached.audioBlob),
        phonetic: null,
        source: 'browser-tts',
        cached: true,
      };
    }

    await this.speak(normalized);

    return {
      word: normalized,
      audioUrl: '',
      phonetic: null,
      source: 'browser-tts',
      cached: false,
    };
  },

  async pronounceAndCache(word: string): Promise<PronunciationResult> {
    const result = await this.getPronunciation(word);

    if (!result.cached) {
      this.cache.set(word.toLowerCase().trim(), {
        word: word.toLowerCase().trim(),
        audioBlob: new Blob(),
        timestamp: Date.now(),
      });
    }

    return result;
  },

  getPhonetic(word: string): string {
    const phonetics: Record<string, string> = {
      review: '/rɪˈvjuː/',
      approve: '/əˈpruːv/',
      submit: '/səbˈmɪt/',
      analyze: '/ˈænəlaɪz/',
      configure: '/kənˈfɪɡər/',
      deploy: '/dɪˈplɔɪ/',
      inspect: '/ɪnˈspɛkt/',
      commission: '/kəˈmɪʃən/',
      decommission: '/diːkəˈmɪʃən/',
      commissioning: '/kəˈmɪʃənɪŋ/',
    };
    return phonetics[word.toLowerCase()] ?? '';
  },

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  },
};
