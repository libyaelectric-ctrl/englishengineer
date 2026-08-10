import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ACHIEVEMENTS } from './learning.achievements.data';
import { DEFAULT_MISSIONS } from './learning.missions.data';
import { useLearningStore } from './learning.store';
import { calculateStreak } from './learning.streak';

vi.mock('@/shared/logger', () => ({
  logger: { i: vi.fn(), w: vi.fn(), e: vi.fn() },
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      currentUser: { id: 'test-user', displayName: 'Test' },
    })),
  },
}));

vi.mock('@/features/profile/profile.repository', () => ({
  LearningProfileRepository: {
    getProfile: vi.fn(() => ({
      skills: {
        vocabulary: { elo: 1000, completedTasks: 0 },
        grammar: { elo: 1000, completedTasks: 0 },
        reading: { elo: 1000, completedTasks: 0 },
        writing: { elo: 1000, completedTasks: 0 },
        listening: { elo: 1000, completedTasks: 0 },
        speaking: { elo: 1000, completedTasks: 0 },
      },
    })),
    updateSkill: vi.fn(),
  },
}));

describe('learning.store', () => {
  beforeEach(() => {
    useLearningStore.setState({
      xp: 0,
      level: 1,
      coins: 0,
      elo: 1000,
      streak: 0,
      lastActivityDate: null,
      missions: DEFAULT_MISSIONS.slice(0, 3),
      achievements: DEFAULT_ACHIEVEMENTS.slice(0, 2),
      studySessions: [],
      scoreHistory: [],
      xpHistory: [],
      eloHistory: [],
      vocabularyPool: [],
      grammarPool: [],
      speakingPool: [],
      hearts: 5,
      heartsDepletedAt: null,
    });
  });

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useLearningStore.getState();
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
      expect(state.coins).toBe(0);
      expect(state.elo).toBe(1000);
      expect(state.streak).toBe(0);
      expect(state.lastActivityDate).toBeNull();
    });

    it('has missions and achievements', () => {
      const state = useLearningStore.getState();
      expect(state.missions.length).toBe(3);
      expect(state.achievements.length).toBe(2);
    });
  });

  describe('startMission', () => {
    it('sets mission status to active', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      useLearningStore.getState().startMission(missionId);

      const updated = useLearningStore.getState();
      const mission = updated.missions.find((m) => m.id === missionId);
      expect(mission?.status).toBe('active');
    });

    it('sets the target mission to active', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      useLearningStore.getState().startMission(missionId);

      const updated = useLearningStore.getState();
      const mission = updated.missions.find((m) => m.id === missionId);
      expect(mission?.status).toBe('active');
    });
  });

  describe('submitMissionResult', () => {
    it('throws for non-existent mission', () => {
      expect(() => {
        useLearningStore.getState().submitMissionResult('non-existent-id', 0.8, 10);
      }).toThrow();
    });

    it('completes a mission and updates score', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      const result = useLearningStore.getState().submitMissionResult(missionId, 0.9, 15);

      expect(result.score).toBeGreaterThan(0);
      expect(result.xp).toBeGreaterThan(0);
      expect(result.coins).toBeGreaterThan(0);
    });

    it('increments xp and coins', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      const result = useLearningStore.getState().submitMissionResult(missionId, 0.8, 10);

      const updated = useLearningStore.getState();
      expect(updated.xp).toBe(result.xp);
      expect(updated.coins).toBe(result.coins);
    });

    it('adds to studySessions', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      useLearningStore.getState().submitMissionResult(missionId, 0.7, 5);

      const updated = useLearningStore.getState();
      expect(updated.studySessions.length).toBe(1);
      expect(updated.studySessions[0].durationMinutes).toBe(5);
    });

    it('updates lastActivityDate', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      useLearningStore.getState().submitMissionResult(missionId, 0.8, 10);

      const updated = useLearningStore.getState();
      expect(updated.lastActivityDate).not.toBeNull();
    });

    it('sets mission status to completed', () => {
      const state = useLearningStore.getState();
      const missionId = state.missions[0].id;

      useLearningStore.getState().submitMissionResult(missionId, 0.8, 10);

      const updated = useLearningStore.getState();
      const mission = updated.missions.find((m) => m.id === missionId);
      expect(mission?.status).toBe('completed');
    });
  });

  describe('completeGenericPractice', () => {
    it('returns score result', () => {
      const result = useLearningStore.getState().completeGenericPractice('Vocabulary', 85, 10);

      expect(result.score).toBe(85);
      expect(result.xp).toBeGreaterThan(0);
    });

    it('increments xp', () => {
      const before = useLearningStore.getState().xp;

      useLearningStore.getState().completeGenericPractice('Grammar', 90, 5);

      const after = useLearningStore.getState().xp;
      expect(after).toBeGreaterThan(before);
    });

    it('adds to studySessions', () => {
      const before = useLearningStore.getState().studySessions.length;

      useLearningStore.getState().completeGenericPractice('Reading', 75, 8);

      const after = useLearningStore.getState().studySessions.length;
      expect(after).toBe(before + 1);
    });
  });

  describe('resetAll', () => {
    it('resets all state to defaults', () => {
      useLearningStore.setState({
        xp: 500,
        level: 5,
        coins: 100,
        streak: 10,
      });

      useLearningStore.getState().resetAll();

      const state = useLearningStore.getState();
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
      expect(state.coins).toBe(0);
      expect(state.elo).toBe(1000);
      expect(state.streak).toBe(0);
      expect(state.lastActivityDate).toBeNull();
      expect(state.studySessions).toEqual([]);
    });
  });

  describe('calculateStreak', () => {
    it('returns 1 when no previous activity', () => {
      const result = calculateStreak(0, null, new Date());
      expect(result).toBe(1);
    });

    it('increments streak for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = calculateStreak(5, yesterday.toISOString(), new Date());
      expect(result).toBe(6);
    });

    it('resets streak when more than 1 day gap', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = calculateStreak(10, threeDaysAgo.toISOString(), new Date());
      expect(result).toBe(1);
    });

    it('keeps streak same for same day', () => {
      const today = new Date();

      const result = calculateStreak(7, today.toISOString(), new Date());
      expect(result).toBe(7);
    });
  });

  describe('hearts', () => {
    it('starts at 5 by default', () => {
      expect(useLearningStore.getState().hearts).toBe(5);
      expect(useLearningStore.getState().heartsDepletedAt).toBeNull();
    });

    it('loseHeart decrements hearts by 1', () => {
      useLearningStore.getState().loseHeart();
      expect(useLearningStore.getState().hearts).toBe(4);
    });

    it('loseHeart stamps heartsDepletedAt once hearts reach 0', () => {
      useLearningStore.setState({ hearts: 1, heartsDepletedAt: null });
      useLearningStore.getState().loseHeart();
      expect(useLearningStore.getState().hearts).toBe(0);
      expect(useLearningStore.getState().heartsDepletedAt).not.toBeNull();
    });

    it('loseHeart is a no-op once already at 0', () => {
      const depletedAt = new Date().toISOString();
      useLearningStore.setState({ hearts: 0, heartsDepletedAt: depletedAt });
      useLearningStore.getState().loseHeart();
      expect(useLearningStore.getState().hearts).toBe(0);
      expect(useLearningStore.getState().heartsDepletedAt).toBe(depletedAt);
    });

    it('checkHeartsRefill does nothing before the 24h window elapses', () => {
      const depletedAt = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1h ago
      useLearningStore.setState({ hearts: 0, heartsDepletedAt: depletedAt });
      useLearningStore.getState().checkHeartsRefill();
      expect(useLearningStore.getState().hearts).toBe(0);
    });

    it('checkHeartsRefill refills to 5 once the 24h window has elapsed', () => {
      const depletedAt = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25h ago
      useLearningStore.setState({ hearts: 0, heartsDepletedAt: depletedAt });
      useLearningStore.getState().checkHeartsRefill();
      expect(useLearningStore.getState().hearts).toBe(5);
      expect(useLearningStore.getState().heartsDepletedAt).toBeNull();
    });

    it('resetAll resets hearts to 5', () => {
      useLearningStore.setState({ hearts: 0, heartsDepletedAt: new Date().toISOString() });
      useLearningStore.getState().resetAll();
      expect(useLearningStore.getState().hearts).toBe(5);
      expect(useLearningStore.getState().heartsDepletedAt).toBeNull();
    });
  });
});
