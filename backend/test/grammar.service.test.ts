import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '../src/errors.js';
import { validateBody } from '../src/validation.js';
import { ProgressBodySchema } from '../src/validation.js';

interface GrammarRecord {
  ruleId: string;
  result: 'correct' | 'incorrect';
  timestamp: string;
}

const createGrammarService = () => {
  const progressStore = new Map<string, GrammarRecord[]>();

  const getUserRecords = (userId: string): GrammarRecord[] => {
    if (!progressStore.has(userId)) {
      progressStore.set(userId, []);
    }
    return progressStore.get(userId)!;
  };

  const recordProgress = (
    userId: string,
    ruleId: string,
    result: 'correct' | 'incorrect'
  ): { success: boolean; ruleId: string; result: string; updatedAt: string } => {
    getUserRecords(userId).push({
      ruleId,
      result,
      timestamp: new Date().toISOString(),
    });
    return {
      success: true,
      ruleId,
      result,
      updatedAt: new Date().toISOString(),
    };
  };

  const getStats = (userId: string) => {
    const records = getUserRecords(userId);
    const total = records.length;
    const correctCount = records.filter((r) => r.result === 'correct').length;
    const incorrectCount = records.filter((r) => r.result === 'incorrect').length;

    const ruleMap = new Map<string, { correct: number; incorrect: number }>();
    for (const r of records) {
      if (!ruleMap.has(r.ruleId)) ruleMap.set(r.ruleId, { correct: 0, incorrect: 0 });
      const entry = ruleMap.get(r.ruleId)!;
      if (r.result === 'correct') entry.correct++;
      else entry.incorrect++;
    }

    let newCount = 0;
    let learning = 0;
    let learned = 0;
    let mastered = 0;
    let struggling = 0;

    for (const [, stats] of ruleMap) {
      const totalAttempts = stats.correct + stats.incorrect;
      if (totalAttempts === 1 && stats.correct === 1) {
        newCount++;
      } else if (totalAttempts <= 3 && stats.correct >= 1) {
        learning++;
      } else if (stats.correct / totalAttempts >= 0.8) {
        mastered++;
      } else if (stats.correct / totalAttempts >= 0.5) {
        learned++;
      } else {
        struggling++;
      }
    }

    return {
      total,
      correct: correctCount,
      incorrect: incorrectCount,
      new: newCount,
      learning,
      learned,
      mastered,
      struggling,
    };
  };

  const getAccessStatus = (userId: string) => {
    const records = getUserRecords(userId);
    const grammarLearnedCount = records.filter((r) => r.result === 'correct').length;
    return {
      vocabularyLearnedCount: 0,
      grammarLearnedCount,
      readingActivitiesDone: 0,
      writingActivitiesDone: 0,
      canAccessReading: grammarLearnedCount >= 5,
      canAccessWriting: grammarLearnedCount >= 10,
      canAccessSpeaking: grammarLearnedCount >= 8,
      canAccessListening: grammarLearnedCount >= 3,
    };
  };

  return { recordProgress, getStats, getAccessStatus };
};

describe('Grammar Service', () => {
  describe('recordProgress', () => {
    it('records correct progress', () => {
      const service = createGrammarService();
      const result = service.recordProgress('user-1', 'past-simple', 'correct');
      assert.equal(result.success, true);
      assert.equal(result.ruleId, 'past-simple');
      assert.equal(result.result, 'correct');
      assert.ok(result.updatedAt);
    });

    it('records incorrect progress', () => {
      const service = createGrammarService();
      const result = service.recordProgress('user-1', 'conditionals', 'incorrect');
      assert.equal(result.success, true);
      assert.equal(result.result, 'incorrect');
    });

    it('accumulates records for the same user', () => {
      const service = createGrammarService();
      service.recordProgress('user-1', 'rule-a', 'correct');
      service.recordProgress('user-1', 'rule-b', 'correct');
      service.recordProgress('user-1', 'rule-a', 'incorrect');
      const stats = service.getStats('user-1');
      assert.equal(stats.total, 3);
      assert.equal(stats.correct, 2);
      assert.equal(stats.incorrect, 1);
    });

    it('isolates records by user', () => {
      const service = createGrammarService();
      service.recordProgress('user-1', 'rule-a', 'correct');
      service.recordProgress('user-2', 'rule-a', 'incorrect');
      const stats1 = service.getStats('user-1');
      const stats2 = service.getStats('user-2');
      assert.equal(stats1.total, 1);
      assert.equal(stats1.correct, 1);
      assert.equal(stats2.total, 1);
      assert.equal(stats2.incorrect, 1);
    });
  });

  describe('getStats', () => {
    it('returns zero stats for a new user', () => {
      const service = createGrammarService();
      const stats = service.getStats('new-user');
      assert.equal(stats.total, 0);
      assert.equal(stats.correct, 0);
      assert.equal(stats.incorrect, 0);
      assert.equal(stats.new, 0);
      assert.equal(stats.learning, 0);
      assert.equal(stats.learned, 0);
      assert.equal(stats.mastered, 0);
      assert.equal(stats.struggling, 0);
    });

    it('classifies a single correct attempt as "new"', () => {
      const service = createGrammarService();
      service.recordProgress('user-1', 'rule-x', 'correct');
      const stats = service.getStats('user-1');
      assert.equal(stats.new, 1);
      assert.equal(stats.learning, 0);
      assert.equal(stats.mastered, 0);
      assert.equal(stats.learned, 0);
      assert.equal(stats.struggling, 0);
    });

    it('classifies 2-3 attempts with at least 1 correct as "learning"', () => {
      const service = createGrammarService();
      service.recordProgress('user-1', 'rule-x', 'correct');
      service.recordProgress('user-1', 'rule-x', 'incorrect');
      const stats = service.getStats('user-1');
      assert.equal(stats.learning, 1);
    });

    it('classifies high accuracy (>80%) as "mastered"', () => {
      const service = createGrammarService();
      // 5 correct, 1 incorrect = 83.3%
      service.recordProgress('user-1', 'rule-m', 'correct');
      service.recordProgress('user-1', 'rule-m', 'correct');
      service.recordProgress('user-1', 'rule-m', 'correct');
      service.recordProgress('user-1', 'rule-m', 'correct');
      service.recordProgress('user-1', 'rule-m', 'correct');
      service.recordProgress('user-1', 'rule-m', 'incorrect');
      const stats = service.getStats('user-1');
      assert.equal(stats.mastered, 1);
    });

    it('classifies 50-80% accuracy as "learned"', () => {
      const service = createGrammarService();
      // 2 correct, 2 incorrect = 50%
      service.recordProgress('user-1', 'rule-l', 'correct');
      service.recordProgress('user-1', 'rule-l', 'correct');
      service.recordProgress('user-1', 'rule-l', 'incorrect');
      service.recordProgress('user-1', 'rule-l', 'incorrect');
      const stats = service.getStats('user-1');
      assert.equal(stats.learned, 1);
    });

    it('classifies below 50% accuracy as "struggling"', () => {
      const service = createGrammarService();
      // 1 correct, 3 incorrect = 25%
      service.recordProgress('user-1', 'rule-s', 'correct');
      service.recordProgress('user-1', 'rule-s', 'incorrect');
      service.recordProgress('user-1', 'rule-s', 'incorrect');
      service.recordProgress('user-1', 'rule-s', 'incorrect');
      const stats = service.getStats('user-1');
      assert.equal(stats.struggling, 1);
    });

    it('handles multiple rules with different classifications', () => {
      const service = createGrammarService();
      // Rule A: new (1 correct)
      service.recordProgress('user-1', 'rule-a', 'correct');
      // Rule B: mastered (5 correct, 1 incorrect)
      for (let i = 0; i < 5; i++) service.recordProgress('user-1', 'rule-b', 'correct');
      service.recordProgress('user-1', 'rule-b', 'incorrect');
      // Rule C: struggling (1 correct, 3 incorrect)
      service.recordProgress('user-1', 'rule-c', 'correct');
      service.recordProgress('user-1', 'rule-c', 'incorrect');
      service.recordProgress('user-1', 'rule-c', 'incorrect');
      service.recordProgress('user-1', 'rule-c', 'incorrect');

      const stats = service.getStats('user-1');
      assert.equal(stats.new, 1);
      assert.equal(stats.mastered, 1);
      assert.equal(stats.struggling, 1);
      assert.equal(stats.total, 11);
    });
  });

  describe('getAccessStatus', () => {
    it('returns no access for a new user', () => {
      const service = createGrammarService();
      const access = service.getAccessStatus('new-user');
      assert.equal(access.canAccessReading, false);
      assert.equal(access.canAccessWriting, false);
      assert.equal(access.canAccessSpeaking, false);
      assert.equal(access.canAccessListening, false);
      assert.equal(access.grammarLearnedCount, 0);
    });

    it('grants listening access at 3 correct grammar records', () => {
      const service = createGrammarService();
      service.recordProgress('user-1', 'r1', 'correct');
      service.recordProgress('user-1', 'r2', 'correct');
      const access2 = service.getAccessStatus('user-1');
      assert.equal(access2.canAccessListening, false);
      service.recordProgress('user-1', 'r3', 'correct');
      const access3 = service.getAccessStatus('user-1');
      assert.equal(access3.canAccessListening, true);
    });

    it('grants reading access at 5 correct grammar records', () => {
      const service = createGrammarService();
      for (let i = 0; i < 4; i++) {
        service.recordProgress('user-1', `r${i}`, 'correct');
      }
      assert.equal(service.getAccessStatus('user-1').canAccessReading, false);
      service.recordProgress('user-1', 'r5', 'correct');
      assert.equal(service.getAccessStatus('user-1').canAccessReading, true);
    });

    it('grants speaking access at 8 correct grammar records', () => {
      const service = createGrammarService();
      for (let i = 0; i < 7; i++) {
        service.recordProgress('user-1', `r${i}`, 'correct');
      }
      assert.equal(service.getAccessStatus('user-1').canAccessSpeaking, false);
      service.recordProgress('user-1', 'r8', 'correct');
      assert.equal(service.getAccessStatus('user-1').canAccessSpeaking, true);
    });

    it('grants writing access at 10 correct grammar records', () => {
      const service = createGrammarService();
      for (let i = 0; i < 9; i++) {
        service.recordProgress('user-1', `r${i}`, 'correct');
      }
      assert.equal(service.getAccessStatus('user-1').canAccessWriting, false);
      service.recordProgress('user-1', 'r10', 'correct');
      assert.equal(service.getAccessStatus('user-1').canAccessWriting, true);
    });

    it('only counts correct records for access level', () => {
      const service = createGrammarService();
      // 10 incorrect records should not grant access
      for (let i = 0; i < 10; i++) {
        service.recordProgress('user-1', `r${i}`, 'incorrect');
      }
      const access = service.getAccessStatus('user-1');
      assert.equal(access.canAccessReading, false);
      assert.equal(access.canAccessWriting, false);
      assert.equal(access.canAccessSpeaking, false);
      assert.equal(access.canAccessListening, false);
      assert.equal(access.grammarLearnedCount, 0);
    });
  });

  describe('Validation Integration', () => {
    it('accepts valid correct result', () => {
      const result = ProgressBodySchema.safeParse({ result: 'correct' });
      assert.equal(result.success, true);
    });

    it('accepts valid incorrect result', () => {
      const result = ProgressBodySchema.safeParse({ result: 'incorrect' });
      assert.equal(result.success, true);
    });

    it('rejects invalid result value', () => {
      const result = ProgressBodySchema.safeParse({ result: 'maybe' });
      assert.equal(result.success, false);
    });

    it('rejects missing result field', () => {
      const result = ProgressBodySchema.safeParse({});
      assert.equal(result.success, false);
    });
  });
});
