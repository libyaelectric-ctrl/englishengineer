import { storage } from '@/shared/storage';
import {
  type LearningGoal,
  type ProfessionId,
  SKILL_NAMES,
  type SkillName,
  type SkillProfile,
  type UserLearningProfile,
} from './profile.types';
import {
  clampSkillElo,
  getCefrBandFromElo,
  getInitialUserLearningProfile,
  getProgressToNextCefrBand,
} from './profile.utils';

const STORAGE_KEY = 'learning_profile';

const normalizeSkill = (
  skill: SkillName,
  value: Partial<SkillProfile> | undefined
): SkillProfile => {
  const initial = getInitialUserLearningProfile().skills[skill];
  const elo = clampSkillElo(value?.elo ?? initial.elo);
  return {
    ...initial,
    ...value,
    skill,
    elo,
    cefrBand: getCefrBandFromElo(elo),
    progressToNextBand: getProgressToNextCefrBand(elo),
  };
};

const mergeDailyTarget = (
  stored: UserLearningProfile,
  initial: UserLearningProfile
) => ({
  minutes: stored.dailyTarget?.minutes ?? initial.dailyTarget.minutes,
  taskCount: stored.dailyTarget?.taskCount ?? initial.dailyTarget.taskCount,
});

const mergeWeeklyTolerance = (
  stored: UserLearningProfile,
  initial: UserLearningProfile
) => ({
  allowedMissedDays:
    stored.weeklyTolerance?.allowedMissedDays ??
    initial.weeklyTolerance.allowedMissedDays,
});

const pickOrFallback = <T>(value: T | undefined | null, fallback: T): T =>
  value ?? fallback;

const pickArrayOrFallback = <T>(value: T[] | undefined, fallback: T[]): T[] =>
  Array.isArray(value) ? value : fallback;

const mergeProfileDefaults = (
  stored: UserLearningProfile,
  initial: UserLearningProfile
): Omit<UserLearningProfile, 'userId' | 'skills'> => ({
  ...stored,
  goals: pickArrayOrFallback(stored.goals, initial.goals),
  professionId: pickOrFallback(stored.professionId, initial.professionId),
  industryId: pickOrFallback(stored.industryId, initial.industryId),
  communicationGoals: pickArrayOrFallback(
    stored.communicationGoals,
    initial.communicationGoals
  ),
  selfReportedCefr: pickOrFallback(
    stored.selfReportedCefr,
    initial.selfReportedCefr
  ),
  learningFocus: pickArrayOrFallback(
    stored.learningFocus,
    initial.learningFocus
  ),
  selectedPlan: pickOrFallback(stored.selectedPlan, initial.selectedPlan),
  professionalTrack: pickOrFallback(
    stored.professionalTrack,
    initial.professionalTrack
  ),
  electricalSubdomain: pickOrFallback(
    stored.electricalSubdomain,
    initial.electricalSubdomain
  ),
  experienceLevel: pickOrFallback(
    stored.experienceLevel,
    initial.experienceLevel
  ),
  careerGoal: pickOrFallback(stored.careerGoal, initial.careerGoal),
  country: pickOrFallback(stored.country, initial.country),
  timezone: pickOrFallback(stored.timezone, initial.timezone),
  interfaceLanguage: pickOrFallback(
    stored.interfaceLanguage,
    initial.interfaceLanguage
  ),
  placementCompleted: pickOrFallback(
    stored.placementCompleted,
    initial.placementCompleted
  ),
  placementConfidence: pickOrFallback(
    stored.placementConfidence,
    initial.placementConfidence
  ),
  placementBand: pickOrFallback(stored.placementBand, initial.placementBand),
  dailyTarget: mergeDailyTarget(stored, initial),
  weeklyTolerance: mergeWeeklyTolerance(stored, initial),
  onboardingCompleted: pickOrFallback(
    stored.onboardingCompleted,
    initial.onboardingCompleted
  ),
});

export const LearningProfileRepository = {
  getProfile(userId = 'local-user'): UserLearningProfile {
    const initial = getInitialUserLearningProfile(userId);
    const stored = storage.get<UserLearningProfile>(`${STORAGE_KEY}_${userId}`);
    if (!stored) return initial;
    return {
      ...initial,
      ...mergeProfileDefaults(stored, initial),
      userId,
      skills: Object.fromEntries(
        SKILL_NAMES.map((skill) => [
          skill,
          normalizeSkill(skill, stored.skills?.[skill]),
        ])
      ) as Record<SkillName, SkillProfile>,
    };
  },

  saveProfile(profile: UserLearningProfile): void {
    storage.set(`${STORAGE_KEY}_${profile.userId}`, {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  },

  updateSkill(
    userId: string,
    skill: SkillName,
    update: Partial<SkillProfile>
  ): UserLearningProfile {
    const profile = this.getProfile(userId);
    const nextSkill = normalizeSkill(skill, {
      ...profile.skills[skill],
      ...update,
    });
    const next = {
      ...profile,
      skills: { ...profile.skills, [skill]: nextSkill },
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(next);
    return next;
  },

  updatePreferences(
    userId: string,
    update: Partial<{
      goals: LearningGoal[];
      professionId: ProfessionId | null;
      industryId: UserLearningProfile['industryId'];
      communicationGoals: UserLearningProfile['communicationGoals'];
      selfReportedCefr: UserLearningProfile['selfReportedCefr'];
      learningFocus: UserLearningProfile['learningFocus'];
      selectedPlan: UserLearningProfile['selectedPlan'];
      professionalTrack: UserLearningProfile['professionalTrack'];
      electricalSubdomain: UserLearningProfile['electricalSubdomain'];
      experienceLevel: UserLearningProfile['experienceLevel'];
      careerGoal: string;
      country: string;
      timezone: string;
      interfaceLanguage: UserLearningProfile['interfaceLanguage'];
      placementCompleted: boolean;
      placementConfidence: UserLearningProfile['placementConfidence'];
      placementBand: UserLearningProfile['placementBand'];
      dailyTarget: UserLearningProfile['dailyTarget'];
      weeklyTolerance: UserLearningProfile['weeklyTolerance'];
      onboardingCompleted: boolean;
    }>
  ): UserLearningProfile {
    const profile = this.getProfile(userId);
    const next = { ...profile, ...update, updatedAt: new Date().toISOString() };
    this.saveProfile(next);
    return next;
  },

  reset(userId = 'local-user'): void {
    storage.remove(`${STORAGE_KEY}_${userId}`);
  },
};
