import { levenshteinSimilarity } from '@/shared/utils/string-utils';

export interface PhonemeDetail {
  phoneme: string;
  position: 'initial' | 'medial' | 'final';
  expected: string;
  recognized: string;
  accuracy: number;
  tip: string;
}

export interface PronunciationFeedback {
  word: string;
  ipa: string;
  overallAccuracy: number;
  phonemeDetails: PhonemeDetail[];
  problemArea: 'vowel' | 'consonant' | 'stress' | 'rhythm' | null;
  tip: string;
}

export interface PronunciationMap {
  timestamp: string;
  sessionId: string;
  feedbacks: PronunciationFeedback[];
  overallScore: number;
  weakPhonemes: string[];
  strongPhonemes: string[];
  trend: 'improving' | 'stable' | 'declining';
  totalSessions: number;
  averageScore: number;
}

const PHONEME_TIPS: Record<string, string> = {
  θ: 'Tongue between teeth, blow air gently (think)',
  ð: 'Tongue between teeth, vibrate (this)',
  ŋ: 'Back of tongue touches soft palate (sing)',
  ʃ: 'Lips rounded, tongue forward (ship)',
  ʒ: 'Like "sh" but with voice (measure)',
  tʃ: 'Tongue curls back, burst of air (church)',
  dʒ: 'Like "ch" but with voice (judge)',
  r: 'Tongue tip curls back, no touch (red)',
  l: 'Tongue tip touches behind teeth (let)',
  w: 'Lips rounded, quick glide (wet)',
  v: 'Bottom lip touches top teeth (vet)',
  ɪ: 'Short, relaxed vowel (sit)',
  iː: 'Long, tense vowel (seat)',
  ɛ: 'Open-mid vowel (bed)',
  æ: 'Open front vowel (bad)',
  ɑː: 'Open back vowel (father)',
  ɔː: 'Open-mid back vowel (caught)',
  ʊ: 'Short, rounded vowel (put)',
  uː: 'Long, rounded vowel (pool)',
  ʌ: 'Mid-central vowel (cup)',
  ə: 'Schwa — unstressed, relaxed (about)',
  ɜː: 'Mid-central long vowel (bird)',
  eɪ: 'Diphthong (day)',
  aɪ: 'Diphthong (day)',
  ɔɪ: 'Diphthong (boy)',
  aʊ: 'Diphthong (now)',
  oʊ: 'Diphthong (go)',
};

const TURKISH_ACCENT_PATTERNS: Array<{
  pattern: RegExp;
  issue: string;
  tip: string;
}> = [
  {
    pattern: /\b\w*th\b/i,
    issue: 'TH sounds',
    tip: 'Turkish speakers often replace "th" with "t" or "d". Practice "think" vs "tink".',
  },
  {
    pattern: /\b\w*w\b/i,
    issue: 'W/V distinction',
    tip: '"W" is lips-rounded (water), "V" is teeth-lip (very). Turkish has no "w".',
  },
  {
    pattern: /\b\w*r\b/i,
    issue: 'R pronunciation',
    tip: 'English "r" is curled-back, not rolled like Turkish "r".',
  },
  {
    pattern: /\b\w*ing\b/i,
    issue: 'NG sound',
    tip: 'The "ng" in "running" is one sound, not "n" + "g".',
  },
  {
    pattern: /\b\w*ed\b/i,
    issue: 'Past tense -ed',
    tip: 'The "-ed" ending has 3 pronunciations: /t/, /d/, /ɪd/.',
  },
];

const ACCENT_STRENGTH_MAP = {
  native: { min: 90, label: 'Native-like', color: '#22c55e' },
  strong: { min: 75, label: 'Strong', color: '#84cc16' },
  moderate: { min: 55, label: 'Moderate', color: '#eab308' },
  developing: { min: 35, label: 'Developing', color: '#f97316' },
  weak: { min: 0, label: 'Needs work', color: '#ef4444' },
};

export const PronunciationFeedbackEngine = {
  analyzeWord(word: string, ipa: string, recognizedText: string): PronunciationFeedback {
    const recognized = recognizedText.toLowerCase().trim();
    const similarity = this.calculateSimilarity(recognized, word);
    const phonemeDetails = this.extractPhonemeDetails(word, ipa, recognized);
    const problemArea = this.detectProblemArea(phonemeDetails, word);
    const tip = this.generateWordTip(word, ipa, problemArea, phonemeDetails);

    return {
      word,
      ipa,
      overallAccuracy: Math.round(similarity * 100),
      phonemeDetails,
      problemArea,
      tip,
    };
  },

  analyzeSession(
    targetWords: Array<{ word: string; ipa: string }>,
    recognizedText: string,
    sessionId: string
  ): PronunciationMap {
    const recognizedWords = recognizedText.toLowerCase().split(/\s+/).filter(Boolean);
    const feedbacks = targetWords.map((t) => {
      let bestMatch = '';
      let bestSim = 0;
      for (const rw of recognizedWords) {
        const sim = this.calculateSimilarity(rw, t.word);
        if (sim > bestSim) {
          bestSim = sim;
          bestMatch = rw;
        }
      }
      return this.analyzeWord(t.word, t.ipa, bestMatch);
    });

    const overallScore =
      feedbacks.length > 0
        ? Math.round(feedbacks.reduce((s, f) => s + f.overallAccuracy, 0) / feedbacks.length)
        : 0;

    const phonemeCounts = new Map<string, number>();
    feedbacks.forEach((f) => {
      f.phonemeDetails.forEach((p) => {
        if (p.accuracy < 70) {
          phonemeCounts.set(p.phoneme, (phonemeCounts.get(p.phoneme) ?? 0) + 1);
        }
      });
    });

    const weakPhonemes = [...phonemeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([p]) => p);

    const strongPhonemes = [
      ...new Set(
        feedbacks.flatMap((f) =>
          f.phonemeDetails.filter((p) => p.accuracy >= 90).map((p) => p.phoneme)
        )
      ),
    ].slice(0, 5);

    return {
      timestamp: new Date().toISOString(),
      sessionId,
      feedbacks,
      overallScore,
      weakPhonemes,
      strongPhonemes,
      trend: 'stable',
      totalSessions: 1,
      averageScore: overallScore,
    };
  },

  calculateSimilarity(a: string, b: string): number {
    return levenshteinSimilarity(a, b);
  },

  extractPhonemeDetails(word: string, ipa: string, recognized: string): PhonemeDetail[] {
    const phonemes = ipa
      .replace(/[/[\]]/g, '')
      .split(/(?=[ˈˌ])|[ˈˌ]/)
      .filter(Boolean);
    const overallAccuracy = this.calculateSimilarity(recognized.toLowerCase(), word.toLowerCase());
    const details: PhonemeDetail[] = [];

    phonemes.forEach((phoneme, i) => {
      const position = i === 0 ? 'initial' : i === phonemes.length - 1 ? 'final' : 'medial';
      const tip = PHONEME_TIPS[phoneme] ?? `Practice the "${phoneme}" sound in "${word}".`;

      details.push({
        phoneme,
        position,
        expected: phoneme,
        recognized: recognized.toLowerCase(),
        accuracy: Math.round(overallAccuracy * 100),
        tip,
      });
    });

    return details;
  },

  detectProblemArea(details: PhonemeDetail[], word: string): PronunciationFeedback['problemArea'] {
    const vowels = details.filter((d) => /[iɪɛæɑɔʊuʌəɜ]/.test(d.phoneme));
    const consonants = details.filter((d) => !/[iɪɛæɑɔʊuʌəɜ]/.test(d.phoneme));

    const vowelAccuracy =
      vowels.length > 0 ? vowels.reduce((s, v) => s + v.accuracy, 0) / vowels.length : 100;
    const consonantAccuracy =
      consonants.length > 0
        ? consonants.reduce((s, c) => s + c.accuracy, 0) / consonants.length
        : 100;

    if (vowelAccuracy < 60) return 'vowel';
    if (consonantAccuracy < 60) return 'consonant';

    const turkishMatch = TURKISH_ACCENT_PATTERNS.find((p) => p.pattern.test(word));
    if (turkishMatch) return 'rhythm';

    return null;
  },

  generateWordTip(
    word: string,
    _ipa: string,
    problemArea: PronunciationFeedback['problemArea'],
    details: PhonemeDetail[]
  ): string {
    if (problemArea === 'vowel') {
      const weakVowels = details.filter((d) => /[iɪɛæɑɔʊuʌəɜ]/.test(d.phoneme) && d.accuracy < 70);
      if (weakVowels.length > 0) {
        return `Focus on vowel sound "${weakVowels[0].phoneme}" — ${PHONEME_TIPS[weakVowels[0].phoneme] ?? 'practice this sound'}.`;
      }
    }

    if (problemArea === 'consonant') {
      const weakConsonants = details.filter(
        (d) => !/[iɪɛæɑɔʊuʌəɜ]/.test(d.phoneme) && d.accuracy < 70
      );
      if (weakConsonants.length > 0) {
        return `Consonant "${weakConsonants[0].phoneme}" needs work — ${PHONEME_TIPS[weakConsonants[0].phoneme] ?? 'practice this sound'}.`;
      }
    }

    const turkishIssue = TURKISH_ACCENT_PATTERNS.find((p) => p.pattern.test(word));
    if (turkishIssue) return turkishIssue.tip;

    return `Good pronunciation of "${word}". Keep practicing to maintain accuracy.`;
  },

  getAccentLabel(score: number): string {
    if (score >= 90) return ACCENT_STRENGTH_MAP.native.label;
    if (score >= 75) return ACCENT_STRENGTH_MAP.strong.label;
    if (score >= 55) return ACCENT_STRENGTH_MAP.moderate.label;
    if (score >= 35) return ACCENT_STRENGTH_MAP.developing.label;
    return ACCENT_STRENGTH_MAP.weak.label;
  },

  getAccentColor(score: number): string {
    if (score >= 90) return ACCENT_STRENGTH_MAP.native.color;
    if (score >= 75) return ACCENT_STRENGTH_MAP.strong.color;
    if (score >= 55) return ACCENT_STRENGTH_MAP.moderate.color;
    if (score >= 35) return ACCENT_STRENGTH_MAP.developing.color;
    return ACCENT_STRENGTH_MAP.weak.color;
  },

  getPhonemeTip(phoneme: string): string {
    return PHONEME_TIPS[phoneme] ?? `Practice the "${phoneme}" sound.`;
  },

  detectTurkishAccentPatterns(text: string): string[] {
    return TURKISH_ACCENT_PATTERNS.filter((p) => p.pattern.test(text)).map((p) => p.tip);
  },
};
