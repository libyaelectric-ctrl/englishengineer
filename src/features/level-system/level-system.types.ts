export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type SkillKey =
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'workTools'
  | 'quickAI';
export type LevelConfidence = 'demo' | 'estimated' | 'calibrated';
export type ContentLevelFilter =
  | 'my-level'
  | 'review-previous'
  | 'preview-next'
  | 'all-levels';
export const DEFAULT_CONTENT_LEVEL_FILTER: ContentLevelFilter = 'my-level';
export type ContentAccessLabel = 'Current' | 'Review' | 'Preview' | 'Locked';
export type LevelNodeStatus =
  | 'completed'
  | 'current'
  | 'available'
  | 'locked'
  | 'preview-only';

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
