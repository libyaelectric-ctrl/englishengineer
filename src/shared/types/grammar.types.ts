import type { CefrLevel } from '@/shared/types/domain.types';
import type { LearningDataSkill } from '@/core/learning';

export interface GrammarExample {
  english: string;
  turkish: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  cefrLevel: CefrLevel;
  ruleCefrLevel: CefrLevel;
  grammarCategory: string;
  ruleType: string;
  importTier: string;
  ruleTitle: string;
  definition: string;
  explanation: string;
  structure: string;
  coreStructure: string;
  examplePattern: string;
  languageFunction: string;
  progressionFamily: string;
  turkishExplanation: string;
  engineeringUseCase: string;
  examples: GrammarExample[];
  badExampleEnglish: string;
  badExampleTurkishExplanation: string;
  correctedExampleEnglish: string;
  mistakeType: string;
  commonMistakes: string;
  skillUse: LearningDataSkill[];
  linkedVocabularyTags: string[];
  grammarFits: string[];
  difficulty: number;
  prerequisites: string[];
  canGenerateTaskTypes: string[];
  domainFit: string[];
  taskPromptTemplate: string;
  minimumUserOutput: string;
  masteryCriteria: string;
  exampleCefrLevel: CefrLevel;
  status: string;
  confidence: number;
  cefrConfidence: number;
  exampleQualityScore: number;
  engineeringRelevanceScore: number;
  taskGenerationScore: number;
  importReadinessScore: number;
  notes: string;
}

export type GrammarReviewStatus = 'New' | 'Learning' | 'Due' | 'Strong';
export type GrammarTransferSkill = 'reading' | 'writing';

export interface GrammarSkillEvidence {
  skill: GrammarTransferSkill;
  missionId: string;
  score: number;
  demonstratedAt: string;
}

export interface GrammarRuleProgress {
  ruleId: string;
  exposures: number;
  correctUsages: number;
  incorrectUsages: number;
  strength: number;
  reviewStatus: GrammarReviewStatus;
  lastUsedAt: string | null;
  nextReviewDate: string | null;
  skillEvidence: Partial<Record<GrammarTransferSkill, GrammarSkillEvidence>>;
  isPassed?: boolean;
}

export interface GrammarProgressSummary {
  totalRules: number;
  newRules: number;
  learningRules: number;
  dueRules: number;
  strongRules: number;
  masteredRules: number;
  averageStrength: number;
  rulesWithEvidence: number;
}
