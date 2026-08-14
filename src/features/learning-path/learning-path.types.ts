import type {
  EngineeringDiscipline,
  VocabularyDomain,
} from '@/shared/constants/engineering-disciplines';
import type { CefrLevel } from '@/shared/types/domain.types';

/**
 * Learning Path v2 data model.
 *
 * A path is a real-data roadmap: stages (CEFR bands) containing levels
 * (chunks of real vocabulary terms pulled from the 14.199-term corpus via
 * VocabularyRepository). Content is never hardcoded — every level maps to
 * concrete term ids from the database.
 */
export type PathLevelStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface PathLevel {
  /** Stable id: `path-{discipline}-{level}-{index}`. */
  id: string;
  stageIndex: number;
  index: number;
  cefrLevel: CefrLevel;
  /** Discipline that owns this level within the path. */
  domain: VocabularyDomain;
  /** Real term ids from the corpus (may be fewer than `termCount` on partial stages). */
  termIds: string[];
  termCount: number;
  /** Fraction of `termIds` present in the user's mastered set (0..1). */
  masteryRatio: number;
  status: PathLevelStatus;
  xpReward: number;
}

export interface PathStage {
  id: string;
  cefrLevel: CefrLevel;
  /** i18n label key, e.g. `learningpath.band.a1`. */
  titleKey: string;
  color: string;
  levels: PathLevel[];
  totalTerms: number;
  masteredTerms: number;
  /** True for the stage matching the user's current vocabulary band. */
  isCurrent: boolean;
}

export interface LearningPath {
  discipline: EngineeringDiscipline;
  /** Resolved content domains: `[general, engineering, {discipline}]`. */
  domains: VocabularyDomain[];
  /** Date-based version used to rotate term selection between days. */
  buildVersion: string;
  stages: PathStage[];
  totalLevels: number;
  totalTerms: number;
  masteredTerms: number;
}