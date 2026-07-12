import { create } from 'zustand';
import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import {
  LearningState,
  MissionModule,
  ScoreResult,
  StudySession,
} from './learning.types';
import { ScoringService } from './scoring.service';
import { AchievementService } from './achievement.service';
import { DEFAULT_MISSIONS } from './learning.missions.data';
import { DEFAULT_ACHIEVEMENTS } from './learning.achievements.data';
import { calculateStreak } from './learning.streak';

const STORAGE_KEY = 'learning_state';
const MAX_HISTORY_SIZE = 500;

const getInitialState = (): LearningState => {
  const persisted = storage.get<LearningState>(STORAGE_KEY);
  if (persisted) {
    const existingMissionIds = new Set(persisted.missions.map((m) => m.id));
    const newMissions = DEFAULT_MISSIONS.filter(
      (m) => !existingMissionIds.has(m.id)
    );
    if (newMissions.length > 0) {
      persisted.missions = [...persisted.missions, ...newMissions];
    }

    const existingAchIds = new Set(
      persisted.achievements?.map((a) => a.id) || []
    );
    const newAchievements = DEFAULT_ACHIEVEMENTS.filter(
      (a) => !existingAchIds.has(a.id)
    );
    if (newAchievements.length > 0) {
      persisted.achievements = [
        ...(persisted.achievements || []),
        ...newAchievements,
      ];
    }
    return persisted;
  }
  return {
    missions: DEFAULT_MISSIONS,
    achievements: DEFAULT_ACHIEVEMENTS,
    xp: 0,
    level: 1,
    coins: 0,
    elo: 1000,
    streak: 0,
    lastActivityDate: null,
    studySessions: [],
    scoreHistory: [],
    xpHistory: [],
    eloHistory: [],
    vocabularyPool: [],
    grammarPool: [],
  };
};

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
  /** Add a mastered vocabulary term ID to the personal pool */
  addToVocabularyPool: (termId: string) => void;
  /** Add a strong grammar rule ID to the personal pool */
  addToGrammarPool: (ruleId: string) => void;
  /** Get current vocabulary pool (deduplicated list of mastered term IDs) */
  getVocabularyPool: () => string[];
}

const emitLearningCompleted = (
  module: string,
  topicId: string,
  score: number,
  durationMinutes: number,
  xp: number,
  reason: string,
  newlyUnlocked: { id: string; title: string }[]
) => {
  const now = new Date();

  eventBus.publish({
    id: IdService.createId('evt'),
    type: 'learning.completed',
    timestamp: now.toISOString(),
    payload: { module, topicId, score, durationSeconds: durationMinutes * 60 },
  });

  eventBus.publish({
    id: IdService.createId('evt'),
    type: 'xp.earned',
    timestamp: now.toISOString(),
    payload: { amount: xp, reason },
  });

  newlyUnlocked.forEach((ach) => {
    eventBus.publish({
      id: IdService.createId('evt'),
      type: 'badge.unlocked',
      timestamp: now.toISOString(),
      payload: { badgeId: ach.id, badgeName: ach.title },
    });
    logger.i(`Achievement unlocked! Name: "${ach.title}"`);
  });
};

export const useLearningStore = create<LearningState & LearningStoreActions>(
  (set, get) => ({
    ...getInitialState(),

    startMission: (missionId: string) => {
      const updated = get().missions.map((m) =>
        m.id === missionId ? { ...m, status: 'active' as const } : m
      );

      set({ missions: updated });
      storage.set(STORAGE_KEY, { ...get() });

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
      if (!mission) throw new Error(`Mission ${missionId} not found`);

      const result = ScoringService.calculateScore({
        module: mission.module,
        difficulty: mission.difficulty,
        performanceRatio,
        timeSpentMinutes: durationMinutes,
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentStreak = calculateStreak(
        get().streak,
        get().lastActivityDate,
        now
      );
      const totalXP = get().xp + result.xp;
      const computedLevel = Math.floor(totalXP / 500) + 1;
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
      const updatedSessions = [...get().studySessions, newSession].slice(
        -MAX_HISTORY_SIZE
      );
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

      storage.set(STORAGE_KEY, { ...get() });

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

    completeGenericPractice: (
      module: MissionModule,
      score: number,
      durationMinutes: number
    ) => {
      const result = ScoringService.calculateScore({
        module,
        difficulty: 'Intermediate',
        performanceRatio: score / 100,
        timeSpentMinutes: durationMinutes,
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentStreak = calculateStreak(
        get().streak,
        get().lastActivityDate,
        now
      );
      const totalXP = get().xp + result.xp;
      const computedLevel = Math.floor(totalXP / 500) + 1;
      const newElo = get().elo + result.eloChange;

      const newSession: StudySession = {
        timestamp: now.toISOString(),
        durationMinutes,
        score: result.score,
        module,
      };

      const todayDateStr = now.toLocaleDateString();
      const updatedSessions = [...get().studySessions, newSession].slice(
        -MAX_HISTORY_SIZE
      );
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

      storage.set(STORAGE_KEY, { ...get() });

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
        elo: 1000,
        streak: 0,
        lastActivityDate: null,
        studySessions: [],
        scoreHistory: [],
        xpHistory: [],
        eloHistory: [],
        vocabularyPool: [],
        grammarPool: [],
      });
      storage.set(STORAGE_KEY, { ...get() });
    },

    addToVocabularyPool: (termId: string) => {
      const current = get().vocabularyPool ?? [];
      if (current.includes(termId)) return; // already in pool
      const updated = [...current, termId];
      set({ vocabularyPool: updated });
      storage.set(STORAGE_KEY, { ...get(), vocabularyPool: updated });
      logger.i(`[VocabPool] +1 term → pool size: ${updated.length}`);

      // Supabase'e yaz (offline-tolerant: başarısız olursa sessizce devam)
      try {
        const { getSupabaseClient, isSupabaseConfigured } = require('@/features/auth/supabase.client');
        const { useAuthStore } = require('@/features/auth');
        if (isSupabaseConfigured()) {
          const client = getSupabaseClient();
          const userId = useAuthStore.getState().currentUser?.id;
          if (client && userId) {
            client.from('knowledge_pool_entries').upsert(
              { user_id: userId, content_type: 'vocabulary', content_id: termId },
              { onConflict: 'user_id,content_type,content_id' }
            ).then(({ error }: { error: unknown }) => {
              if (error) console.warn('[VocabPool] Supabase write failed:', error);
            });
          }
        }
      } catch {
        // Supabase modülü mevcut değilse sessizce devam et
      }
    },

    addToGrammarPool: (ruleId: string) => {
      const current = get().grammarPool ?? [];
      if (current.includes(ruleId)) return;
      const updated = [...current, ruleId];
      set({ grammarPool: updated });
      storage.set(STORAGE_KEY, { ...get(), grammarPool: updated });
      logger.i(`[GrammarPool] +1 rule → pool size: ${updated.length}`);
    },

    getVocabularyPool: () => get().vocabularyPool ?? [],
  })
);
