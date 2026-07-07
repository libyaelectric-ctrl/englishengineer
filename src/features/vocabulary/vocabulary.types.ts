import { MissionDifficulty } from '@/core/learning';
import { CefrLevel } from '@/features/level-system';
import type { LearningDataSkill } from '@/features/learning-data';

export type VocabularyDiscipline =
  | 'Electrical Engineering'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Architecture'
  | 'Construction'
  | 'Commissioning'
  | 'Testing'
  | 'Data Centers'
  | 'Procurement'
  | 'QA/QC'
  | 'HSE'
  | 'Hospital Projects'
  | 'Oil & Gas'
  | 'Testing & Commissioning'
  | 'Professional Communication'
  | 'Health & Safety'
  | 'Project Management'
  | 'Construction Site'
  | 'Meetings'
  | 'Safety'
  | 'General Professional English';

export type VocabularyTrainingMode =
  | 'flashcards'
  | 'multiple_choice'
  | 'typing_practice'
  | 'meaning_match'
  | 'sentence_completion'
  | 'synonym_challenge';

export type VocabularyWordStatus =
  | 'New'
  | 'Learning'
  | 'Weak'
  | 'Review Today'
  | 'Mastered';

export type VocabularyWordSource =
  | 'EngVox Dictionary'
  | 'Free Dictionary API'
  | 'Wiktionary-powered lookup'
  | 'LibreTranslate'
  | 'MyMemory fallback'
  | 'Cached result';

export type MyVocabularyFilter =
  | 'All'
  | CefrLevel
  | 'Weak'
  | 'Review Today'
  | 'Mastered';

export interface VocabularyEntry {
  id: string;
  word: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  meaning: string;
  definition: string;
  example: string;
  synonyms: string[];
  collocations: string[];
  difficulty: MissionDifficulty;
  discipline: VocabularyDiscipline;
  CEFR: CefrLevel;
  tags: string[];
}

export interface VocabularyTerm {
  id: string;
  term: string;
  normalizedTerm: string;
  turkishMeaning: string;
  cefrLevel: CefrLevel;
  domain: string;
  contentDomain: string;
  lifeContext: string;
  register: string;
  primaryUseCase: string;
  category: string;
  termType: string;
  partOfSpeech: string;
  wordCount: number;
  definition: string;
  exampleSentence: string;
  turkishExample: string;
  relatedTerms: string[];
  commonMistakes: string;
  grammarFits: string[];
  skillUse: LearningDataSkill[];
  tags: string[];
  source: string;
  confidence: number;
  status: string;
  importTier: string;
  isCore: boolean;
  isTechnical: boolean;
  isProfessionalPhrase: boolean;
  isContractual: boolean;
  isDailySiteEnglish: boolean;
  isLifeWideEnglish: boolean;
  reviewReason: string;
  variantOf: string;
  grammarDomainAlias: string;
  qcRepairNotes: string;
}

export interface SavedVocabularyWord {
  id: string;
  entryId: string | null;
  term: string;
  turkishMeaning: string;
  cefrLevel: CefrLevel;
  category: VocabularyDiscipline;
  exampleSentence: string;
  status: VocabularyWordStatus;
  dateAdded: string;
  lastReviewed: string | null;
  nextReviewDate: string;
  reviewCount: number;
  source: VocabularyWordSource;
}

export interface VocabularyMemoryState {
  savedWords: SavedVocabularyWord[];
}

export interface VocabularyMemorySummary {
  savedWords: number;
  dueToday: number;
  weakWords: number;
  masteredWords: number;
}

export interface ExternalVocabularyResult {
  word: string;
  phonetic: string | null;
  definitions: string[];
  translation: string | null;
  source: VocabularyWordSource;
  translationSource: VocabularyWordSource | null;
  cached: boolean;
}

export type ExternalLookupState =
  | { status: 'idle' | 'not-configured' | 'unavailable' }
  | { status: 'success'; result: ExternalVocabularyResult };

export interface VocabularyReviewState {
  wordId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
}

export interface VocabularyAnswer {
  wordId: string;
  mode: VocabularyTrainingMode;
  response: string;
  isCorrect: boolean;
  responseTimeSeconds: number;
}

export interface VocabularyEvaluationResult {
  accuracy: number;
  speed: number;
  retention: number;
  finalScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  weakWords: string[];
  strongWords: string[];
  feedback: string;
}

export interface VocabularyHistoryEntry {
  timestamp: string;
  mode: VocabularyTrainingMode;
  reviewedCount: number;
  score: number;
  accuracy: number;
  retention: number;
  weakWords: string[];
  strongWords: string[];
}

export interface VocabularyState {
  completedWords: Record<string, number>;
  reviewStates: Record<string, VocabularyReviewState>;
  discoveredWords: string[];
  history: VocabularyHistoryEntry[];
  streak: number;
  lastActivityDate: string | null;
}

export interface VocabularySummary {
  wordsLearned: number;
  todaysReviews: number;
  vocabularyStreak: number;
  weakVocabulary: VocabularyEntry[];
  nextReviewSession: string | null;
  retentionPercentage: number;
  mostDifficultWords: VocabularyEntry[];
  categoryMastery: Array<{
    discipline: VocabularyDiscipline;
    learned: number;
    total: number;
    percentage: number;
  }>;
  reviewCalendar: Array<{ date: string; count: number }>;
}
