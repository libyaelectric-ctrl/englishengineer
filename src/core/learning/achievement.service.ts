import { LearningState, Achievement } from './learning.types';

export const AchievementService = {
  /**
   * Scans current global state, checks criteria, and returns the list of unlocked achievements
   * along with any newly unlocked achievement items to publish.
   */
  checkAndUnlockAchievements(state: LearningState): {
    updatedAchievements: Achievement[];
    newlyUnlocked: Achievement[];
  } {
    const newlyUnlocked: Achievement[] = [];
    const completedMissions = state.missions.filter(
      (m) => m.status === 'completed'
    );
    const totalXP = state.xp;
    const currentStreak = state.streak;

    const updatedAchievements = state.achievements.map((ach) => {
      // If already unlocked, keep as is
      if (ach.unlocked) {
        return ach;
      }

      let shouldUnlock = false;

      switch (ach.criteriaType) {
        case 'first_mission':
          shouldUnlock = completedMissions.length >= ach.criteriaValue;
          break;

        case 'module_count':
          if (ach.moduleFilter) {
            const moduleCompletedCount = completedMissions.filter(
              (m) => m.module === ach.moduleFilter
            ).length;
            shouldUnlock = moduleCompletedCount >= ach.criteriaValue;
          }
          break;

        case 'streak':
          shouldUnlock = currentStreak >= ach.criteriaValue;
          break;

        case 'xp_earned':
          shouldUnlock = totalXP >= ach.criteriaValue;
          break;

        case 'perfect_score':
          // Check if any completed mission achieved a perfect 100% score (optionally filter by module)
          shouldUnlock = state.studySessions.some(
            (s) =>
              s.score >= ach.criteriaValue &&
              (!ach.moduleFilter || s.module === ach.moduleFilter)
          );
          break;

        case 'fast_learner':
          // Custom check: completed a session in less than or equal to the estimated time
          shouldUnlock = state.studySessions.length >= ach.criteriaValue;
          break;

        default:
          break;
      }

      if (shouldUnlock) {
        const updatedAch = {
          ...ach,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(updatedAch);
        return updatedAch;
      }

      return ach;
    });

    return {
      updatedAchievements,
      newlyUnlocked,
    };
  },
};
