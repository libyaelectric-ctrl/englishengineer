import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { eventBus } from '@/core/events/event-bus';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import { IdService } from '@/core/ids/id.service';

import { eosPersistConfig } from '@/shared/storage/persist-middleware';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { AchievementService } from './achievement.service';
import { DEFAULT_ACHIEVEMENTS } from './learning.achievements.data';
import { DEFAULT_MISSIONS } from './learning.missions.data';
import { calculateStreak } from './learning.streak';
import {
  ensureArrays,
  emitLearningCompleted,
  mergeDefaults,
  MAX_HISTORY_SIZE,
  INITIAL_ELO,
} from './learning.store.helpers';
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
  resetAll: () => void;
}

export const useLearningStore = create<LearningState & LearningStoreActions>()(
  persist(
    (set, get) => ({
      missions: DEFAULT_MISSIONS,
      achievements: DEFAULT_ACHIEVEMENTS,
      xp: 0,
      level: 1,
      coins: 0,
    elo: INITIAL_ELO,
    streak: 0,
    lastActivityDate: null,
    studySessions: [],
    scoreHistory: [],
    xpHistory: [],
    eloHistory: [],
    vocabularyPool: [],
    grammarPool: [],
    speakingPool: [],

    startMission: (missionId: string) => {
        const updated = get().missions.map((m) =>
          m.id === missionId ? { ...m, status: 'active' as const } : m
        );

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
        if (!mission) throw new AppError({ code: ErrorCode.VALIDATION, message: `Mission ${missionId} not found` });

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

        const updatedMissions = get().missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                status: 'completed' as const,
                completedAt: now.toISOString(),
                score: result.score,
              }
            : m
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

        const skillName =
          module.toLowerCase() as import('@/features/profile/profile.types').SkillName;
        const userId = useAuthStore.getState().currentUser?.id || 'local-user';
        const profile = LearningProfileRepository.getProfile(userId);
        const currentSkillElo = profile.skills[skillName]?.elo || INITIAL_ELO;
        const newSkillElo = Math.max(INITIAL_ELO, currentSkillElo + result.eloChange);

        LearningProfileRepository.updateSkill(userId, skillName, {
          elo: newSkillElo,
          accuracy: score,
          completedTasks: (profile.skills[skillName]?.completedTasks || 0) + 1,
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

      resetAll: () => {
        set({
          missions: DEFAULT_MISSIONS,
          achievements: DEFAULT_ACHIEVEMENTS,
          xp: 0,
          level: 1,
          coins: 0,
          elo: INITIAL_ELO,
          streak: 0,
          lastActivityDate: null,
          studySessions: [],
          scoreHistory: [],
          xpHistory: [],
          eloHistory: [],
          vocabularyPool: [],
          grammarPool: [],
          speakingPool: [],
        });
      },
    }),
    {
      ...eosPersistConfig(STORAGE_KEY),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LearningState>;
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
