import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLevelUpDetector } from './level-up.hook';

describe('useLevelUpDetector', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not celebrate on first-ever render (no baseline yet)', () => {
    const { result } = renderHook(() => useLevelUpDetector(3));
    expect(result.current.justLeveledUp).toBeNull();
    expect(window.localStorage.getItem('gamification.lastSeenLevel.v1')).toBe('3');
  });

  it('celebrates when currentLevel is higher than last seen level', () => {
    window.localStorage.setItem('gamification.lastSeenLevel.v1', '2');
    const { result } = renderHook(() => useLevelUpDetector(3));
    expect(result.current.justLeveledUp).toBe(3);
  });

  it('does not celebrate when level is unchanged', () => {
    window.localStorage.setItem('gamification.lastSeenLevel.v1', '3');
    const { result } = renderHook(() => useLevelUpDetector(3));
    expect(result.current.justLeveledUp).toBeNull();
  });

  it('acknowledge() persists the new level and clears the celebration', () => {
    window.localStorage.setItem('gamification.lastSeenLevel.v1', '2');
    const { result } = renderHook(() => useLevelUpDetector(3));
    expect(result.current.justLeveledUp).toBe(3);

    act(() => {
      result.current.acknowledge();
    });

    expect(result.current.justLeveledUp).toBeNull();
    expect(window.localStorage.getItem('gamification.lastSeenLevel.v1')).toBe('3');
  });
});
