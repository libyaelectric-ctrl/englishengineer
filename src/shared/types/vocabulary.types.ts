import type { CefrLevel } from '@/shared/types/domain.types';
import type { MissionDifficulty } from '@/core/learning/learning.types';
import type { LearningDataSkill } from '@/core/learning';

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
