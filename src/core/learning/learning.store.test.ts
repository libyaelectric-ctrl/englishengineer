import { describe, it, expect, beforeEach } from 'vitest';
import { useLearningStore } from './learning.store';

describe('learning.store', () => {
  beforeEach(() => {
    useLearningStore.setState({
      xp: 0,
      level: 1,
      streak: 0,
      completedTasks: [],
      achievements: [],
    });
  });

  it('has initial state', () => {
    const state = useLearningStore.getState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
  });

  it('can set state', () => {
    useLearningStore.setState({ xp: 100 });
    expect(useLearningStore.getState().xp).toBe(100);
  });

  it('can reset state', () => {
    useLearningStore.setState({ xp: 500, level: 5 });
    useLearningStore.setState({ xp: 0, level: 1, streak: 0, completedTasks: [], achievements: [] });
    const state = useLearningStore.getState();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
  });
});
