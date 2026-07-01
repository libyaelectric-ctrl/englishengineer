import {
  SKILL_NAMES,
  type AdaptivePaceDecision,
  type AdaptivePaceInput,
  type CefrBand,
  type SkillElo,
  type SkillName,
  type SkillProfile,
  type UserLearningProfile,
} from './profile.types';
import type { CefrLevel } from '@/features/level-system';

export const MIN_SKILL_ELO = 1000;
export const MAX_SKILL_ELO = 5000;
export const MEMORY_BANK_WEIGHT = 0.7;
export const CURRENT_LEVEL_NEW_WEIGHT = 0.2;
export const STRETCH_LEVEL_WEIGHT = 0.1;
export const LESSON_PATH_LENGTH = 60;

export const getSkillLessonNumber = (completedTasks: number): number =>
  Math.min(LESSON_PATH_LENGTH, Math.max(1, completedTasks + 1));

const ELO_BANDS: Array<{
  band: CefrBand;
  min: number;
  max: number;
}> = [
  { band: 'A1', min: 1000, max: 1332 },
  { band: 'A1+', min: 1333, max: 1665 },
  { band: 'A2', min: 1666, max: 1998 },
  { band: 'A2+', min: 1999, max: 2331 },
  { band: 'B1', min: 2332, max: 2664 },
  { band: 'B1+', min: 2665, max: 2997 },
  { band: 'B2', min: 2998, max: 3330 },
  { band: 'B2+', min: 3331, max: 3663 },
  { band: 'C1', min: 3664, max: 3996 },
  { band: 'C1+', min: 3997, max: 4329 },
  { band: 'C2', min: 4330, max: 4662 },
  { band: 'C2+', min: 4663, max: 5000 },
];

const CEFR_BAND_ORDER: CefrBand[] = ELO_BANDS.map(({ band }) => band);

export const clampSkillElo = (elo: number): SkillElo =>
  Math.min(MAX_SKILL_ELO, Math.max(MIN_SKILL_ELO, Math.round(elo)));

export const getCefrBandFromElo = (elo: number): CefrBand => {
  const safeElo = clampSkillElo(elo);
  return (
    ELO_BANDS.find(({ min, max }) => safeElo >= min && safeElo <= max)?.band ??
    'A1'
  );
};

export const getEloBandRange = (
  cefrBand: CefrBand
): { min: number; max: number } => {
  const range = ELO_BANDS.find(({ band }) => band === cefrBand);
  return range ? { min: range.min, max: range.max } : { min: 1000, max: 1332 };
};

export const getBaseCefrLevel = (band: CefrBand): CefrLevel =>
  band.replace('+', '') as CefrLevel;

export const getNextCefrBand = (band: CefrBand): CefrBand => {
  const index = CEFR_BAND_ORDER.indexOf(band);
  return CEFR_BAND_ORDER[Math.min(index + 1, CEFR_BAND_ORDER.length - 1)];
};

export const getTaskBandMix = (
  band: CefrBand
): Array<{ band: CefrBand; share: number }> => [
  { band, share: 0.75 },
  { band: getNextCefrBand(band), share: 0.25 },
];

export const getProgressToNextCefrBand = (elo: number): number => {
  const safeElo = clampSkillElo(elo);
  if (safeElo === MAX_SKILL_ELO) return 100;
  const { min, max } = getEloBandRange(getCefrBandFromElo(safeElo));
  return Math.round(((safeElo - min) / Math.max(max - min + 1, 1)) * 100);
};

export const isSkillName = (value: string): value is SkillName =>
  SKILL_NAMES.includes(value as SkillName);

export const getInitialSkillProfile = (skill: SkillName): SkillProfile => ({
  skill,
  elo: MIN_SKILL_ELO,
  cefrBand: 'A1',
  progressToNextBand: 0,
  trend: 'not-enough-data',
  completedTasks: 0,
  accuracy: 0,
  weaknessScore: 100,
  lastPracticedAt: null,
  promotionState: 'progressing',
});

export const getInitialUserLearningProfile = (
  userId = 'local-user',
  now = new Date()
): UserLearningProfile => ({
  userId,
  skills: Object.fromEntries(
    SKILL_NAMES.map((skill) => [skill, getInitialSkillProfile(skill)])
  ) as Record<SkillName, SkillProfile>,
  goals: [],
  professionId: null,
  industryId: null,
  communicationGoals: [],
  selfReportedCefr: 'unknown',
  learningFocus: [],
  selectedPlan: 'free',
  professionalTrack: 'electrical',
  electricalSubdomain: 'low-voltage',
  experienceLevel: 'prefer-not-to-say',
  careerGoal: '',
  country: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  interfaceLanguage: 'en',
  placementCompleted: false,
  placementConfidence: 'not-assessed',
  placementBand: null,
  dailyTarget: { minutes: 20, taskCount: 2 },
  weeklyTolerance: { allowedMissedDays: 1 },
  onboardingCompleted: false,
  weeklyGoal: 5,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
});

export const getAdaptivePaceDecision = (
  input: AdaptivePaceInput
): AdaptivePaceDecision => {
  const sendToMistakeLog = input.repeatMistakeCount >= 3;
  if (input.accuracy >= 85 && input.responseTimeSeconds <= 90) {
    return {
      pace: 'faster',
      difficulty: 'slightly-harder',
      sendToMistakeLog,
      reason: `${input.skill} accuracy is strong at the current skill level.`,
    };
  }
  if (input.accuracy < 60) {
    return {
      pace: 'slower',
      difficulty: 'easier',
      sendToMistakeLog,
      reason: input.mistakeType
        ? `Repeat ${input.mistakeType} practice before increasing difficulty.`
        : 'Repeat current-level practice before increasing difficulty.',
    };
  }
  return {
    pace: 'maintain',
    difficulty: 'same',
    sendToMistakeLog,
    reason: 'Maintain the current pace while accuracy stabilizes.',
  };
};
