export interface SpeakingEvaluationResult {
  missionId: string;
  fluencyScore: number;
  clarityScore: number;
  grammarScore: number;
  technicalVocabularyScore: number;
  confidenceScore: number;
  finalScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  wordCount: number;
  sentenceCount: number;
  fillerWordCount: number;
  wordsPerMinute: number;
  isWordsPerMinuteEstimated: boolean;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  transcriptUsed: string;
}

export type SpeakingRoleplayCategory = 'Daily' | 'Work' | 'Engineering';
