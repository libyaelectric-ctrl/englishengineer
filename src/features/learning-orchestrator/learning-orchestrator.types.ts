import type { GrammarRule } from '@/features/grammar/grammar.types';
import type { CefrBand, SkillName } from '@/features/profile/profile.types';
import type { VocabularyTerm } from '@/features/vocabulary/vocabulary.types';

export type TaskSourceBucket = 'memory' | 'current-new' | 'stretch';

export interface SelectedVocabularyTerm {
  term: VocabularyTerm;
  bucket: TaskSourceBucket;
}

export interface TaskLevelAllocation {
  band: CefrBand;
  kind: 'safe' | 'stretch';
}

export interface LearningTaskRecommendation {
  id: string;
  skill: SkillName;
  taskType: string;
  targetCefr: CefrBand;
  safeCefr: CefrBand;
  stretchCefr: CefrBand;
  levelAllocation: TaskLevelAllocation[];
  whyRecommended: string;
  context: string;
  prompt: string;
  vocabularyFocus: SelectedVocabularyTerm[];
  grammarFocus: GrammarRule[];
  estimatedMinutes: number;
  expectedAnswerType: string;
  evaluationCriteria: string[];
  sourceSummary: {
    vocabularyDatabase: boolean;
    grammarDatabase: boolean;
    memoryTerms: number;
    weakWords: number;
    mistakeLogEntries: number;
  };
  requiresAi: false;
  focusPriority: 'grammar' | 'vocabulary';
  lessonNumber: number;
  sharedLessonTitle: string;
  explanation: {
    skillPosition: string;
    levelReason: string;
    dataReason: string;
    eloRule: string;
  };
}

export interface TaskVocabularyOutcome {
  wordId: string;
  term?: string;
  correct: boolean;
}

export interface TaskEvaluationInput {
  taskId: string;
  skill: SkillName;
  taskType: string;
  targetCefr: CefrBand;
  vocabularyUsed: string[];
  grammarUsed: string[];
  correct: boolean;
  accuracy: number;
  mistakeTypes: string[];
  repeatMistakeCount: number;
  responseTimeSeconds: number;
  expectedResponseTimeSeconds: number;
  vocabularyOutcomes?: TaskVocabularyOutcome[];
  grammarOutcomes?: Array<{ ruleId: string; correct: boolean }>;
}

export interface TaskEvaluationRecord extends TaskEvaluationInput {
  id: string;
  createdAt: string;
  previousElo: number;
  nextElo: number;
  eloDelta: number;
  previousCefr: CefrBand;
  nextCefr: CefrBand;
  cefrImpact: string;
  reviewRecommendation: string;
  wordsMovedToLearning: string[];
  wordsMovedToMastered: string[];
  wordsMovedToWeak: string[];
  grammarIssues: string[];
  nextRecommendedAction: string;
}
