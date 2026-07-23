import { describe, it, expect, beforeEach } from 'vitest';
import { useLearningStore } from '@/core/learning/learning.store';

describe('Learning Integration', () => {
  beforeEach(() => {
    useLearningStore.setState({
      vocabularyPool: [],
      grammarPool: [],
      xp: 0,
      level: 1,
      streak: 0,
    });
  });

  it('initializes with zero progress', () => {
    const state = useLearningStore.getState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
  });

  it('can add XP', () => {
    useLearningStore.setState({ xp: 100 });
    expect(useLearningStore.getState().xp).toBe(100);

    useLearningStore.setState((state) => ({ xp: state.xp + 50 }));
    expect(useLearningStore.getState().xp).toBe(150);
  });

  it('can update level', () => {
    useLearningStore.setState({ level: 2 });
    expect(useLearningStore.getState().level).toBe(2);
  });

  it('can update streak', () => {
    useLearningStore.setState({ streak: 5 });
    expect(useLearningStore.getState().streak).toBe(5);
  });

  it('can manage vocabulary pool', () => {
    const pool = ['panel', 'circuit'];

    useLearningStore.setState({ vocabularyPool: pool });
    expect(useLearningStore.getState().vocabularyPool).toHaveLength(2);
  });

  it('can manage grammar pool', () => {
    const pool = ['present perfect'];

    useLearningStore.setState({ grammarPool: pool });
    expect(useLearningStore.getState().grammarPool).toHaveLength(1);
  });
});
