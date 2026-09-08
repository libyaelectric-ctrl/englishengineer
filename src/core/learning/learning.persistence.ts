import { createInitialContentPoolState } from './domains/content-pool.domain';
import { createInitialGamificationState } from './domains/gamification.domain';
import { createInitialMissionState } from './domains/mission.domain';
import { createInitialProgressState } from './domains/progress.domain';
import type { LearningState } from './learning.types';

export const LEARNING_PERSISTENCE_VERSION = 2;

export type PersistedLearningStateV2 = LearningState;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const numberOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const stringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const stringArrayOr = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback;

export const createInitialLearningState = (): LearningState => ({
  ...createInitialMissionState(),
  ...createInitialProgressState(),
  ...createInitialGamificationState(),
  ...createInitialContentPoolState(),
});

export const migratePersistedLearningState = (persisted: unknown): PersistedLearningStateV2 => {
  const initial = createInitialLearningState();
  if (!isRecord(persisted)) return initial;

  return {
    missions: Array.isArray(persisted.missions)
      ? (persisted.missions as LearningState['missions'])
      : initial.missions,
    achievements: Array.isArray(persisted.achievements)
      ? (persisted.achievements as LearningState['achievements'])
      : initial.achievements,
    xp: numberOr(persisted.xp, initial.xp),
    level: numberOr(persisted.level, initial.level),
    coins: numberOr(persisted.coins, initial.coins),
    elo: numberOr(persisted.elo, initial.elo),
    streak: numberOr(persisted.streak, initial.streak),
    lastActivityDate: stringOrNull(persisted.lastActivityDate),
    studySessions: Array.isArray(persisted.studySessions)
      ? (persisted.studySessions as LearningState['studySessions'])
      : [],
    scoreHistory: Array.isArray(persisted.scoreHistory)
      ? (persisted.scoreHistory as LearningState['scoreHistory'])
      : [],
    xpHistory: Array.isArray(persisted.xpHistory)
      ? (persisted.xpHistory as LearningState['xpHistory'])
      : [],
    eloHistory: Array.isArray(persisted.eloHistory)
      ? (persisted.eloHistory as LearningState['eloHistory'])
      : [],
    vocabularyPool: stringArrayOr(persisted.vocabularyPool),
    grammarPool: stringArrayOr(persisted.grammarPool),
    speakingPool: stringArrayOr(persisted.speakingPool),
    hearts: numberOr(persisted.hearts, initial.hearts),
    heartsDepletedAt: stringOrNull(persisted.heartsDepletedAt),
    weakTermIds: stringArrayOr(persisted.weakTermIds),
  };
};
