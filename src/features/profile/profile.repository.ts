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

export const LearningProfileRepository = {
  getProfile(userId = 'local-user'): UserLearningProfile {
    const initial = getInitialUserLearningProfile(userId);
    const stored = storage.get<UserLearningProfile>(`${STORAGE_KEY}_${userId}`);
    if (!stored) return initial;
    return {
      ...initial,
      ...stored,
      userId,
      goals: Array.isArray(stored.goals) ? stored.goals : initial.goals,
      professionId: stored.professionId ?? initial.professionId,
      industryId: stored.industryId ?? initial.industryId,
      communicationGoals: Array.isArray(stored.communicationGoals)
        ? stored.communicationGoals
        : initial.communicationGoals,
      selfReportedCefr: stored.selfReportedCefr ?? initial.selfReportedCefr,
      learningFocus: Array.isArray(stored.learningFocus)
        ? stored.learningFocus
        : initial.learningFocus,
      selectedPlan: stored.selectedPlan ?? initial.selectedPlan,
      professionalTrack: stored.professionalTrack ?? initial.professionalTrack,
      electricalSubdomain:
        stored.electricalSubdomain ?? initial.electricalSubdomain,
      experienceLevel: stored.experienceLevel ?? initial.experienceLevel,
      careerGoal: stored.careerGoal ?? initial.careerGoal,
      country: stored.country ?? initial.country,
      timezone: stored.timezone ?? initial.timezone,
      interfaceLanguage: stored.interfaceLanguage ?? initial.interfaceLanguage,
      placementCompleted:
        stored.placementCompleted ?? initial.placementCompleted,
      placementConfidence:
        stored.placementConfidence ?? initial.placementConfidence,
      placementBand: stored.placementBand ?? initial.placementBand,
      dailyTarget: {
        minutes: stored.dailyTarget?.minutes ?? initial.dailyTarget.minutes,
        taskCount:
          stored.dailyTarget?.taskCount ?? initial.dailyTarget.taskCount,
      },
      weeklyTolerance: {
        allowedMissedDays:
          stored.weeklyTolerance?.allowedMissedDays ??
          initial.weeklyTolerance.allowedMissedDays,
      },
      onboardingCompleted:
        stored.onboardingCompleted ?? initial.onboardingCompleted,
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
