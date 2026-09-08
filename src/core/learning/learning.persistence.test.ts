import { describe, expect, it } from 'vitest';

import {
  createInitialLearningState,
  LEARNING_PERSISTENCE_VERSION,
  migratePersistedLearningState,
} from './learning.persistence';

describe('learning persistence v2', () => {
  it('uses the documented persistence version', () => {
    expect(LEARNING_PERSISTENCE_VERSION).toBe(2);
  });

  it('migrates legacy flat state without losing user progress', () => {
    const migrated = migratePersistedLearningState({
      xp: 740,
      level: 3,
      coins: 41,
      elo: 1280,
      streak: 9,
      lastActivityDate: '2026-09-06',
      vocabularyPool: ['term-1', 'term-2'],
      grammarPool: ['rule-1'],
      weakTermIds: ['term-3'],
    });

    expect(migrated).toMatchObject({
      xp: 740,
      level: 3,
      coins: 41,
      elo: 1280,
      streak: 9,
      lastActivityDate: '2026-09-06',
      vocabularyPool: ['term-1', 'term-2'],
      grammarPool: ['rule-1'],
      weakTermIds: ['term-3'],
    });
    expect(migrated.missions.length).toBeGreaterThan(0);
    expect(migrated.achievements.length).toBeGreaterThan(0);
  });

  it('is idempotent and replaces corrupt scalar values with safe defaults', () => {
    const initial = createInitialLearningState();
    const once = migratePersistedLearningState({
      ...initial,
      xp: Number.NaN,
      vocabularyPool: ['term-1', 42, null],
    });
    const twice = migratePersistedLearningState(once);

    expect(once.xp).toBe(initial.xp);
    expect(once.vocabularyPool).toEqual(['term-1']);
    expect(twice).toEqual(once);
  });
});
