import { CEFR_LEVELS, type CefrLevel } from '@/shared/types/domain.types';

export { CEFR_LEVELS, type CefrLevel };
export type SkillKey =
  'reading' | 'writing' | 'listening' | 'speaking' | 'vocabulary' | 'workTools' | 'quickAI';
export type LevelConfidence = 'demo' | 'estimated' | 'calibrated';
export type ContentLevelFilter = 'my-level' | 'review-previous' | 'preview-next' | 'all-levels';
export const DEFAULT_CONTENT_LEVEL_FILTER: ContentLevelFilter = 'my-level';
export type ContentAccessLabel = 'Current' | 'Review' | 'Preview' | 'Locked';
export type LevelNodeStatus = 'completed' | 'current' | 'available' | 'locked' | 'preview-only';

export interface SkillLevelProgress {
  skill: SkillKey;
  currentLevel: CefrLevel;
  completedTasks: number;
  requiredTasksForNextLevel: number;
  nextLevel: CefrLevel | null;
  confidence: LevelConfidence;
}

export interface LevelPathNode {
  level: CefrLevel;
  status: LevelNodeStatus;
  reason: string;
}

export interface EngineeringLevelProfile {
  overallLevel: CefrLevel;
  confidence: LevelConfidence;
  isDemo: boolean;
  skills: SkillLevelProgress[];
  explanation: string;
}

export interface LevelledContent {
  cefrLevel: CefrLevel;
}
