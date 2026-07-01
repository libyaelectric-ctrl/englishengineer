import type { CefrLevel } from '@/features/level-system';
import type {
  LearningDataSkill,
  UserSkillProfile,
} from '@/features/learning-data';

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

export type GrammarExplanationLanguage = 'english' | 'turkish';

export type GrammarUserSkillProfile = UserSkillProfile;
