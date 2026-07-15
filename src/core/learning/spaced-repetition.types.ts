import type { CefrLevel } from '@/features/level-system';

export type LearningDataSkill =
  | 'reading'
  | 'writing'
  | 'listening'
  | 'speaking'
  | 'vocabulary'
  | 'grammar';

export type UserSkillProfile = Partial<Record<LearningDataSkill, CefrLevel>>;
