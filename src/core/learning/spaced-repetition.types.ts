import type { CefrLevel } from '@/shared/types/domain.types';

export type LearningDataSkill =
  'reading' | 'writing' | 'listening' | 'speaking' | 'vocabulary' | 'grammar';

export type UserSkillProfile = Partial<Record<LearningDataSkill, CefrLevel>>;
