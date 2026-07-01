export const normalizeSpeechText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const countWords = (value: string): number => {
  const normalized = normalizeSpeechText(value);
  if (!normalized) return 0;
  return normalized.split(' ').filter(Boolean).length;
};

export const countSentences = (value: string): number => {
  const matches = value.trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return matches
    ? matches.filter((sentence) => sentence.trim().length > 0).length
    : 0;
};

export const countFillerWords = (value: string): number => {
  const fillerWords = [
    'um',
    'uh',
    'like',
    'basically',
    'actually',
    'you know',
    'sort of',
    'kind of',
  ];
  const normalized = ` ${normalizeSpeechText(value)} `;
  return fillerWords.reduce((total, filler) => {
    const pattern = new RegExp(`\\s${normalizeSpeechText(filler)}\\s`, 'g');
    return total + (normalized.match(pattern)?.length || 0);
  }, 0);
};

export interface WordsPerMinuteResult {
  value: number;
  isEstimated: boolean;
}

export const calculateWordsPerMinute = (
  wordCount: number,
  recordingSeconds: number
): WordsPerMinuteResult => {
  if (wordCount === 0) {
    return { value: 0, isEstimated: recordingSeconds === 0 };
  }

  const safeSeconds =
    recordingSeconds > 0
      ? recordingSeconds
      : Math.max(30, Math.round((wordCount / 135) * 60));
  const minutes = Math.max(safeSeconds / 60, 0.25);
  const value = Math.min(240, Math.round(wordCount / minutes));

  return {
    value,
    isEstimated: recordingSeconds === 0,
  };
};

export const keywordMatchRatio = (text: string, keywords: string[]): number => {
  if (keywords.length === 0) return 1;
  const normalized = normalizeSpeechText(text);
  const matches = keywords.filter((keyword) =>
    normalized.includes(normalizeSpeechText(keyword))
  );
  return matches.length / keywords.length;
};

export const formatSpeakingDifficulty = (difficulty: string): string =>
  difficulty.toUpperCase();
