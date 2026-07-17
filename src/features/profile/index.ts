export {
  SKILL_NAMES,
  type SkillName,
  type SkillElo,
  type LearningGoal,
  type ProfessionId,
  type IndustryId,
  type CommunicationGoal,
  type SelfReportedCefr,
  type InterfaceLanguage,
  type ExperienceLevel,
  type ProfessionalTrack,
  type ElectricalSubdomain,
  type CefrBand,
  type SkillTrend,
  type PromotionState,
  type MissionType,
  type MissionDifficulty,
  type SkillProfile,
  type UserLearningProfile,
  type VocabularyMemorySummary,
  type DailyMission,
  type AdaptivePaceInput,
  type AdaptivePaceDecision,
  type ProfileBadge,
} from './profile.types';

export {
  MIN_SKILL_ELO,
  MAX_SKILL_ELO,
  MEMORY_BANK_WEIGHT,
  CURRENT_LEVEL_NEW_WEIGHT,
  STRETCH_LEVEL_WEIGHT,
  LESSON_PATH_LENGTH,
  getSkillLessonNumber,
  clampSkillElo,
  getCefrBandFromElo,
  getEloBandRange,
  getBaseCefrLevel,
  getNextCefrBand,
  getTaskBandMix,
  getProgressToNextCefrBand,
  isSkillName,
  getInitialSkillProfile,
  getInitialUserLearningProfile,
  getAdaptivePaceDecision,
} from './profile.utils';

export {
  LEARNING_GOALS,
  PROFESSIONS,
  INDUSTRIES,
  COMMUNICATION_GOALS,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  PROFESSIONAL_TRACKS,
  ELECTRICAL_SUBDOMAINS,
  EXPERIENCE_LEVELS,
  CAREER_GOALS,
  COUNTRIES,
  TIMEZONES,
  getPreferredDomains,
  getWeeklyStreakStatus,
} from './profile.preferences';

export { LearningProfileRepository } from './profile.repository';

export { LearningProfileEngine } from './profile.engine';

export { SkillRadar } from './SkillRadar';

export { useLearningCockpit } from './useLearningCockpit';

export { OnboardingGate } from './OnboardingGate';

export { ProfileSidebar } from './components';
