import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { _ApiError } from '../src/errors.js';

interface LearningOverview {
  vocabulary: { total: number; learned: number; mastered: number; struggling: number };
  grammar: { total: number; learned: number; mastered: number; struggling: number };
  reading: { total: number; completed: number; avgScore: number };
  writing: { total: number; submitted: number; avgScore: number };
  listening: { total: number; completed: number; avgScore: number };
  speaking: { total: number; submitted: number; avgScore: number };
  overallLevel: string;
  dailyGoal: { target: number; completed: number };
  weeklyGoal: { target: number; completed: number };
}

const createLearningPathService = () => {
  const overviewStore = new Map<string, LearningOverview>();

  const getOverview = (userId: string): LearningOverview => {
    if (!overviewStore.has(userId)) {
      overviewStore.set(userId, {
        vocabulary: { total: 120, learned: 74, mastered: 31, struggling: 12 },
        grammar: { total: 85, learned: 52, mastered: 28, struggling: 8 },
        reading: { total: 48, completed: 36, avgScore: 78.5 },
        writing: { total: 24, submitted: 18, avgScore: 72.3 },
        listening: { total: 32, completed: 25, avgScore: 81.2 },
        speaking: { total: 16, submitted: 11, avgScore: 69.8 },
        overallLevel: 'B1',
        dailyGoal: { target: 5, completed: 3 },
        weeklyGoal: { target: 15, completed: 9 },
      });
    }
    return overviewStore.get(userId)!;
  };

  const updateOverview = (userId: string, updates: Partial<LearningOverview>): LearningOverview => {
    const existing = getOverview(userId);
    const merged = { ...existing, ...updates };
    overviewStore.set(userId, merged);
    return merged;
  };

  const computeProgressPercent = (learned: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((learned / total) * 100);
  };

  const computeOverallProgress = (overview: LearningOverview) => {
    const totalActivities =
      overview.vocabulary.total +
      overview.grammar.total +
      overview.reading.total +
      overview.writing.total +
      overview.listening.total +
      overview.speaking.total;

    const completedActivities =
      overview.vocabulary.learned +
      overview.grammar.learned +
      overview.reading.completed +
      overview.writing.submitted +
      overview.listening.completed +
      overview.speaking.submitted;

    return {
      totalActivities,
      completedActivities,
      percent: computeProgressPercent(completedActivities, totalActivities),
    };
  };

  return { getOverview, updateOverview, computeProgressPercent, computeOverallProgress };
};

describe('Learning Path Service', () => {
  describe('getOverview', () => {
    it('returns default overview for a new user', () => {
      const service = createLearningPathService();
      const overview = service.getOverview('new-user');
      assert.equal(overview.vocabulary.total, 120);
      assert.equal(overview.vocabulary.learned, 74);
      assert.equal(overview.grammar.total, 85);
      assert.equal(overview.overallLevel, 'B1');
      assert.equal(overview.dailyGoal.target, 5);
      assert.equal(overview.weeklyGoal.target, 15);
    });

    it('returns the same reference for repeated calls', () => {
      const service = createLearningPathService();
      const first = service.getOverview('user-1');
      const second = service.getOverview('user-1');
      assert.strictEqual(first, second);
    });

    it('isolates overviews by user', () => {
      const service = createLearningPathService();
      const userA = service.getOverview('user-a');
      const userB = service.getOverview('user-b');
      assert.notStrictEqual(userA, userB);
      assert.deepEqual(userA, userB);
    });
  });

  describe('updateOverview', () => {
    it('updates specific fields while preserving others', () => {
      const service = createLearningPathService();
      const updated = service.updateOverview('user-1', {
        overallLevel: 'B2',
        dailyGoal: { target: 10, completed: 7 },
      });
      assert.equal(updated.overallLevel, 'B2');
      assert.equal(updated.dailyGoal.target, 10);
      assert.equal(updated.dailyGoal.completed, 7);
      assert.equal(updated.vocabulary.total, 120, 'untouched fields should remain');
    });

    it('persists updates for subsequent getOverview calls', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', { overallLevel: 'C1' });
      const overview = service.getOverview('user-1');
      assert.equal(overview.overallLevel, 'C1');
    });

    it('can update nested vocabulary fields', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', {
        vocabulary: { total: 200, learned: 100, mastered: 50, struggling: 5 },
      });
      const overview = service.getOverview('user-1');
      assert.equal(overview.vocabulary.total, 200);
      assert.equal(overview.vocabulary.learned, 100);
      assert.equal(overview.vocabulary.mastered, 50);
      assert.equal(overview.vocabulary.struggling, 5);
    });
  });

  describe('computeProgressPercent', () => {
    it('returns 0 when total is 0', () => {
      const service = createLearningPathService();
      assert.equal(service.computeProgressPercent(0, 0), 0);
    });

    it('returns 0 when learned is 0', () => {
      const service = createLearningPathService();
      assert.equal(service.computeProgressPercent(0, 100), 0);
    });

    it('returns 100 when all items are learned', () => {
      const service = createLearningPathService();
      assert.equal(service.computeProgressPercent(100, 100), 100);
    });

    it('rounds to nearest integer', () => {
      const service = createLearningPathService();
      assert.equal(service.computeProgressPercent(1, 3), 33);
      assert.equal(service.computeProgressPercent(2, 3), 67);
    });
  });

  describe('computeOverallProgress', () => {
    it('computes combined progress across all skill areas', () => {
      const service = createLearningPathService();
      const overview = service.getOverview('user-1');
      const progress = service.computeOverallProgress(overview);
      assert.ok(progress.totalActivities > 0);
      assert.ok(progress.completedActivities > 0);
      assert.ok(progress.percent > 0);
      assert.ok(progress.percent <= 100);
    });

    it('returns 0% for empty overview', () => {
      const service = createLearningPathService();
      const emptyOverview = {
        vocabulary: { total: 0, learned: 0, mastered: 0, struggling: 0 },
        grammar: { total: 0, learned: 0, mastered: 0, struggling: 0 },
        reading: { total: 0, completed: 0, avgScore: 0 },
        writing: { total: 0, submitted: 0, avgScore: 0 },
        listening: { total: 0, completed: 0, avgScore: 0 },
        speaking: { total: 0, submitted: 0, avgScore: 0 },
        overallLevel: 'A0',
        dailyGoal: { target: 0, completed: 0 },
        weeklyGoal: { target: 0, completed: 0 },
      };
      const progress = service.computeOverallProgress(emptyOverview);
      assert.equal(progress.totalActivities, 0);
      assert.equal(progress.completedActivities, 0);
      assert.equal(progress.percent, 0);
    });

    it('returns 100% when all activities are completed', () => {
      const service = createLearningPathService();
      const overview: LearningOverview = {
        vocabulary: { total: 10, learned: 10, mastered: 10, struggling: 0 },
        grammar: { total: 10, learned: 10, mastered: 10, struggling: 0 },
        reading: { total: 10, completed: 10, avgScore: 95 },
        writing: { total: 10, submitted: 10, avgScore: 90 },
        listening: { total: 10, completed: 10, avgScore: 100 },
        speaking: { total: 10, submitted: 10, avgScore: 85 },
        overallLevel: 'C2',
        dailyGoal: { target: 5, completed: 5 },
        weeklyGoal: { target: 15, completed: 15 },
      };
      const progress = service.computeOverallProgress(overview);
      assert.equal(progress.percent, 100);
    });
  });

  describe('User Isolation', () => {
    it('different users have independent progress', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', { overallLevel: 'B2' });
      service.updateOverview('user-2', { overallLevel: 'C1' });

      const overview1 = service.getOverview('user-1');
      const overview2 = service.getOverview('user-2');

      assert.equal(overview1.overallLevel, 'B2');
      assert.equal(overview2.overallLevel, 'C1');
    });

    it('overview mutation does not affect other users', () => {
      const service = createLearningPathService();
      const overviewA = service.getOverview('user-a');
      overviewA.overallLevel = 'Z9';
      const overviewB = service.getOverview('user-b');
      assert.equal(overviewB.overallLevel, 'B1');
    });
  });

  describe('Daily and Weekly Goals', () => {
    it('returns default goal values', () => {
      const service = createLearningPathService();
      const overview = service.getOverview('user-1');
      assert.equal(overview.dailyGoal.target, 5);
      assert.equal(overview.dailyGoal.completed, 3);
      assert.equal(overview.weeklyGoal.target, 15);
      assert.equal(overview.weeklyGoal.completed, 9);
    });

    it('can update daily goal', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', {
        dailyGoal: { target: 10, completed: 8 },
      });
      const overview = service.getOverview('user-1');
      assert.equal(overview.dailyGoal.target, 10);
      assert.equal(overview.dailyGoal.completed, 8);
    });

    it('can update weekly goal', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', {
        weeklyGoal: { target: 30, completed: 25 },
      });
      const overview = service.getOverview('user-1');
      assert.equal(overview.weeklyGoal.target, 30);
      assert.equal(overview.weeklyGoal.completed, 25);
    });
  });

  describe('Skill Area Scores', () => {
    it('stores average scores for reading, writing, listening, and speaking', () => {
      const service = createLearningPathService();
      const overview = service.getOverview('user-1');
      assert.equal(typeof overview.reading.avgScore, 'number');
      assert.equal(typeof overview.writing.avgScore, 'number');
      assert.equal(typeof overview.listening.avgScore, 'number');
      assert.equal(typeof overview.speaking.avgScore, 'number');
    });

    it('can update skill scores', () => {
      const service = createLearningPathService();
      service.updateOverview('user-1', {
        reading: { total: 50, completed: 40, avgScore: 85.5 },
        speaking: { total: 20, submitted: 15, avgScore: 78.0 },
      });
      const overview = service.getOverview('user-1');
      assert.equal(overview.reading.avgScore, 85.5);
      assert.equal(overview.reading.completed, 40);
      assert.equal(overview.speaking.avgScore, 78.0);
      assert.equal(overview.speaking.submitted, 15);
    });
  });
});
