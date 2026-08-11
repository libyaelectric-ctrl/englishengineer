import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress();
  });

  it('starts with default game state', () => {
    const state = useGameStore.getState();
    expect(state.hearts).toBe(5);
    expect(state.xp).toBe(0);
    expect(state.streak).toBe(1);
    expect(state.gems).toBe(100);
    expect(state.completedLevelIds).toEqual([]);
  });

  it('decrements hearts when loseHeart is called', () => {
    const { loseHeart } = useGameStore.getState();
    const hasHeartsLeft = loseHeart();
    expect(hasHeartsLeft).toBe(true);
    expect(useGameStore.getState().hearts).toBe(4);
  });

  it('refills hearts to maximum', () => {
    const store = useGameStore.getState();
    store.loseHeart();
    store.loseHeart();
    expect(useGameStore.getState().hearts).toBe(3);

    store.refillHearts();
    expect(useGameStore.getState().hearts).toBe(5);
  });

  it('adds XP and updates completed levels', () => {
    const store = useGameStore.getState();
    store.completeLevel('unit_civil_1_level_1', 3, 20);

    expect(useGameStore.getState().xp).toBe(20);
    expect(useGameStore.getState().completedLevelIds).toContain('unit_civil_1_level_1');
    expect(useGameStore.getState().levelStars['unit_civil_1_level_1']).toBe(3);
  });
});
