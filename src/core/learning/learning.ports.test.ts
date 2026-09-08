import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  configureLearningPorts,
  getLearningPorts,
  resetLearningPortsForTests,
} from './learning.ports';

afterEach(() => resetLearningPortsForTests());

describe('learning ports', () => {
  it('uses safe local fallbacks before the composition root is configured', () => {
    resetLearningPortsForTests();
    expect(getLearningPorts().currentUser.getUserId()).toBeNull();
    expect(getLearningPorts().profile.getSkillProfile('local-user', 'reading')).toEqual({
      elo: 1000,
      completedTasks: 0,
    });
  });

  it('delegates identity, profile and content persistence to configured adapters', () => {
    const updateSkill = vi.fn();
    const persistEntry = vi.fn();
    configureLearningPorts({
      currentUser: { getUserId: () => 'user-1' },
      profile: {
        getSkillProfile: () => ({ elo: 1300, completedTasks: 4 }),
        updateSkill,
      },
      contentPool: { persistEntry },
    });

    const ports = getLearningPorts();
    expect(ports.currentUser.getUserId()).toBe('user-1');
    expect(ports.profile.getSkillProfile('user-1', 'grammar').elo).toBe(1300);
    ports.contentPool.persistEntry('grammar', 'rule-1');
    expect(persistEntry).toHaveBeenCalledWith('grammar', 'rule-1');
  });
});
