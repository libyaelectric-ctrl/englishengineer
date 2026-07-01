import type { CefrLevel } from '@/features/level-system';

export type ListeningContentStatus =
  | 'script_ready'
  | 'audio_missing'
  | 'audio_verified';

export interface ContentQuestion {
  id: string;
  prompt: string;
  choices: string[];
}

export interface ListeningLessonDefinition {
  id: string;
  title: string;
  cefrLevel: CefrLevel;
  domain: string;
  scenario: string;
  transcript: string;
  vocabularyTargets: string[];
  vocabularyIds: string[];
  comprehensionQuestions: ContentQuestion[];
  answerKey: string[];
  status: ListeningContentStatus;
  audioUrl?: string;
}

export interface RoleplayScenarioDefinition {
  id: string;
  title: string;
  level: CefrLevel;
  role: string;
  situation: string;
  userTask: string;
  expectedResponseStyle: string;
  evaluationRubric: string[];
  commonMistakes: string[];
  vocabularyTargets: string[];
  vocabularyIds: string[];
}

export interface WritingTaskDefinition {
  id: string;
  title: string;
  level: CefrLevel;
  scenario: string;
  userTask: string;
  targetFormat: string;
  rubric: string[];
  vocabularyTargets: string[];
  vocabularyIds: string[];
  commonMistakes: string[];
}
