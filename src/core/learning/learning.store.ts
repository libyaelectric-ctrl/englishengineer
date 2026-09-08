import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';

import { eosPersistConfig } from '@/shared/storage/persist-middleware';

import { AchievementService } from './achievement.service';
import { addUniqueContent, removeContent } from './domains/content-pool.domain';
import { activateMission, completeMission } from './domains/mission.domain';
import {
  createInitialLearningState,
  LEARNING_PERSISTENCE_VERSION,
  migratePersistedLearningState,
} from './learning.persistence';
import { getLearningPorts, type LearningSkillName } from './learning.ports';
import { DEFAULT_ACHIEVEMENTS } from './learning.achievements.data';
import { loseHeart as computeLoseHeart, refillHeartsIfDue } from './learning.hearts';
import { DEFAULT_MISSIONS } from './learning.missions.data';
import {
  INITIAL_ELO,
  MAX_HISTORY_SIZE,
  emitLearningCompleted,
  ensureArrays,
  mergeDefaults,
} from './learning.store.helpers';
import { calculateStreak } from './learning.streak';
import {
  LearningState,
  MissionModule,
  ScoreResult,
  StudySession,
  XP_PER_LEVEL,
} from './learning.types';
import { ScoringService } from './scoring.service';

const STORAGE_KEY = 'learning_state';

export interface LearningStoreActions {
  startMission: (missionId: string) => void;
  submitMissionResult: (
    missionId: string,
    performanceRatio: number,
    durationMinutes: number
  ) => ScoreResult;
  completeGenericPractice: (
    module: MissionModule,
    score: number,
    durationMinutes: number
  ) => ScoreResult;
  /** Consumes one heart on a wrong quiz answer. No-op once already at 0. */
  loseHeart: () => void;
  /** Marks a term as weak (answered incorrectly) so it is surfaced first again. */
  markTermWeak: (termId: string) => void;
  /** Clears a term from the weak set, e.g. after answering it correctly. */
  clearWeakTerm: (termId: string) => void;
  /** Adds mastered term IDs to the user's vocabulary pool. */
  masterTerms: (termIds: string[]) => void;
  /** Checks the 24h cooldown and refills to MAX_HEARTS if it has elapsed. */
  checkHeartsRefill: () => void;
  resetAll: () => void;
}

export const useLearningStore = create<LearningState & LearningStoreActions>()(
  persist(
    (set, get) => ({
      ...createInitialLearningState(),

      startMission: (missionId: string) => {
        const updated = activateMission(get().missions, missionId);

        set({ missions: updated });

        const active = updated.find((m) => m.id === missionId);
        if (active) {
          eventBus.publish({
            id: IdService.createId('evt'),
            type: 'learning.started',
            timestamp: new Date().toISOString(),
            payload: { module: active.module, topicId: active.id },
          });
        }
      },

      submitMissionResult: (
        missionId: string,
        performanceRatio: number,
        durationMinutes: number
      ) => {
        const mission = get().missions.find((m) => m.id === missionId);
        if (!mission)
          throw new AppError({
            code: ErrorCode.VALIDATION,
            message: `Mission ${missionId} not found`,
          });

        const result = ScoringService.calculateScore({
          module: mission.module,
          difficulty: mission.difficulty,
          performanceRatio,
          timeSpentMinutes: durationMinutes,
        });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentStreak = calculateStreak(get().streak, get().lastActivityDate, now);
        const totalXP = get().xp + result.xp;
        const computedLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
        const newElo = get().elo + result.eloChange;

        const updatedMissions = completeMission(
          get().missions,
          missionId,
          now.toISOString(),
          result.score
        );

        const newSession: StudySession = {
          timestamp: now.toISOString(),
          durationMinutes,
          score: result.score,
          module: mission.module,
        };

        const todayDateStr = now.toLocaleDateString();
        const updatedSessions = [...get().studySessions, newSession].slice(-MAX_HISTORY_SIZE);
        const updatedScoreHistory = [
          ...get().scoreHistory,
          { date: todayDateStr, score: result.score, module: mission.module },
        ].slice(-MAX_HISTORY_SIZE);
        const updatedXpHistory = [
          ...get().xpHistory,
          {
            date: todayDateStr,
            amount: result.xp,
            reason: `Completed ${mission.title}`,
          },
        ].slice(-MAX_HISTORY_SIZE);
        const updatedEloHistory = [
          ...get().eloHistory,
          { date: todayDateStr, value: newElo },
        ].slice(-MAX_HISTORY_SIZE);

        const tempState: LearningState = {
          ...get(),
          missions: updatedMissions,
          studySessions: updatedSessions,
          xp: totalXP,
          streak: currentStreak,
          coins: get().coins + result.coins,
          elo: newElo,
        };

        const { updatedAchievements, newlyUnlocked } =
          AchievementService.checkAndUnlockAchievements(tempState);

        set({
          missions: updatedMissions,
          studySessions: updatedSessions,
          scoreHistory: updatedScoreHistory,
          xpHistory: updatedXpHistory,
          eloHistory: updatedEloHistory,
          xp: totalXP,
          level: computedLevel,
          coins: get().coins + result.coins,
          elo: newElo,
          streak: currentStreak,
          lastActivityDate: todayStr,
          achievements: updatedAchievements,
        });

        emitLearningCompleted(
          mission.module,
          mission.id,
          result.score,
          durationMinutes,
          result.xp,
          `Mission: ${mission.title}`,
          newlyUnlocked
        );

        return result;
      },

      completeGenericPractice: (module: MissionModule, score: number, durationMinutes: number) => {
        const difficultyMap: Record<string, import('./learning.types').MissionDifficulty> = {
          Vocabulary: 'Beginner',
          Grammar: 'Intermediate',
          Reading: 'Intermediate',
          Writing: 'Advanced',
          Listening: 'Intermediate',
          Speaking: 'Advanced',
        };
        const result = ScoringService.calculateScore({
          module,
          difficulty: difficultyMap[module] ?? 'Intermediate',
          performanceRatio: score / 100,
          timeSpentMinutes: durationMinutes,
        });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentStreak = calculateStreak(get().streak, get().lastActivityDate, now);
        const totalXP = get().xp + result.xp;
        const computedLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;

        const skillName = module.toLowerCase() as LearningSkillName;
        const ports = getLearningPorts();
        const userId = ports.currentUser.getUserId() ?? 'local-user';
        const currentSkill = ports.profile.getSkillProfile(userId, skillName);
        const newSkillElo = Math.max(INITIAL_ELO, currentSkill.elo + result.eloChange);

        ports.profile.updateSkill(userId, skillName, {
          elo: newSkillElo,
          accuracy: score,
          completedTasks: currentSkill.completedTasks + 1,
          weaknessScore: 100 - score,
          lastPracticedAt: now.toISOString(),
        });

        const newElo = newSkillElo;

        const newSession: StudySession = {
          timestamp: now.toISOString(),
          durationMinutes,
          score: result.score,
          module,
        };

        const todayDateStr = now.toLocaleDateString();
        const updatedSessions = [...get().studySessions, newSession].slice(-MAX_HISTORY_SIZE);
        const updatedScoreHistory = [
          ...get().scoreHistory,
          { date: todayDateStr, score: result.score, module },
        ].slice(-MAX_HISTORY_SIZE);
        const updatedXpHistory = [
          ...get().xpHistory,
          {
            date: todayDateStr,
            amount: result.xp,
            reason: `Practiced ${module}`,
          },
        ].slice(-MAX_HISTORY_SIZE);
        const updatedEloHistory = [
          ...get().eloHistory,
          { date: todayDateStr, value: newElo },
        ].slice(-MAX_HISTORY_SIZE);

        const tempState: LearningState = {
          ...get(),
          studySessions: updatedSessions,
          xp: totalXP,
          streak: currentStreak,
          coins: get().coins + result.coins,
          elo: newElo,
        };

        const { updatedAchievements, newlyUnlocked } =
          AchievementService.checkAndUnlockAchievements(tempState);

        set({
          studySessions: updatedSessions,
          scoreHistory: updatedScoreHistory,
          xpHistory: updatedXpHistory,
          eloHistory: updatedEloHistory,
          xp: totalXP,
          level: computedLevel,
          coins: get().coins + result.coins,
          elo: newElo,
          streak: currentStreak,
          lastActivityDate: todayStr,
          achievements: updatedAchievements,
        });

        emitLearningCompleted(
          module,
          `generic_${module.toLowerCase()}`,
          result.score,
          durationMinutes,
          result.xp,
          `Practice: ${module}`,
          newlyUnlocked
        );

        return result;
      },

      loseHeart: () => {
        const { hearts, depletedAt } = computeLoseHeart(
          get().hearts,
          get().heartsDepletedAt,
          new Date()
        );
        set({ hearts, heartsDepletedAt: depletedAt });
      },

      masterTerms: (termIds: string[]) => {
        const current = get().vocabularyPool ?? [];
        set({ vocabularyPool: addUniqueContent(current, termIds) });
      },

      markTermWeak: (termId: string) => {
        const current = get().weakTermIds ?? [];
        if (!current.includes(termId)) {
          set({ weakTermIds: [...current, termId] });
        }
      },

      clearWeakTerm: (termId: string) => {
        const current = get().weakTermIds ?? [];
        if (current.includes(termId)) {
          set({ weakTermIds: removeContent(current, termId) });
        }
      },

      checkHeartsRefill: () => {
        const { hearts, depletedAt } = refillHeartsIfDue(
          get().hearts,
          get().heartsDepletedAt,
          new Date()
        );
        if (hearts !== get().hearts || depletedAt !== get().heartsDepletedAt) {
          set({ hearts, heartsDepletedAt: depletedAt });
        }
      },

      resetAll: () => set(createInitialLearningState()),
    }),
    {
      ...eosPersistConfig(STORAGE_KEY),
      version: LEARNING_PERSISTENCE_VERSION,
      migrate: (persistedState) =>
        migratePersistedLearningState(persistedState) as LearningState & LearningStoreActions,
      merge: (persistedState, currentState) => {
        const persisted = migratePersistedLearningState(persistedState);
        const state = currentState;
        const merged = {
          ...state,
          ...ensureArrays(persisted),
        };
        merged.missions = mergeDefaults(merged.missions, DEFAULT_MISSIONS);
        merged.achievements = mergeDefaults(merged.achievements ?? [], DEFAULT_ACHIEVEMENTS);
        return merged as LearningState & LearningStoreActions;
      },
    }
  )
);
