/**
 * Learning Store Helpers
 *
 * Extracted helper functions for the learning store.
 */
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';

import { INITIAL_ELO } from '@/shared/constants/elo.constants';
import { logger } from '@/shared/logger';

import { DEFAULT_ACHIEVEMENTS } from './learning.achievements.data';
import { MAX_HEARTS } from './learning.hearts';
import { DEFAULT_MISSIONS } from './learning.missions.data';
import type { LearningState } from './learning.types';

export { INITIAL_ELO } from '@/shared/constants/elo.constants';
export const STORAGE_KEY = 'learning_state';
export const MAX_HISTORY_SIZE = 500;
export const SECONDS_PER_MINUTE = 60;

export const mergeDefaults = <T extends { id: string }>(existing: T[], defaults: T[]): T[] => {
  const existingIds = new Set(existing.map((item) => item.id));
  const missing = defaults.filter((item) => !existingIds.has(item.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
};

export const ensureArrays = (state: Partial<LearningState>): LearningState => {
  const safe = <T>(v: T[] | undefined, fallback: T[]): T[] => (Array.isArray(v) ? v : fallback);
  return {
    missions: state.missions ?? DEFAULT_MISSIONS,
    achievements: state.achievements ?? DEFAULT_ACHIEVEMENTS,
    xp: state.xp ?? 0,
    level: state.level ?? 1,
    coins: state.coins ?? 0,
    elo: state.elo ?? INITIAL_ELO,
    streak: state.streak ?? 0,
    lastActivityDate: state.lastActivityDate ?? null,
    studySessions: safe(state.studySessions, []),
    scoreHistory: safe(state.scoreHistory, []),
    xpHistory: safe(state.xpHistory, []),
    eloHistory: safe(state.eloHistory, []),
    vocabularyPool: safe(state.vocabularyPool, []),
    grammarPool: safe(state.grammarPool, []),
    speakingPool: safe(state.speakingPool, []),
    hearts: state.hearts ?? MAX_HEARTS,
    heartsDepletedAt: state.heartsDepletedAt ?? null,
  };
};

export const emitLearningCompleted = (
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
    payload: { module, topicId, score, durationSeconds: durationMinutes * SECONDS_PER_MINUTE },
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
