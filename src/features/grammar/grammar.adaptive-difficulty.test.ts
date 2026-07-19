import { describe, it, expect } from 'vitest';
import { AdaptiveDifficultyEngine } from './grammar.adaptive-difficulty';
import type { GrammarRuleProgress } from './grammar.progress';

const makeProgress = (
  overrides: Partial<GrammarRuleProgress> = {}
): GrammarRuleProgress => ({
  ruleId: 'rule-1',
  exposures: 0,
  correctUsages: 0,
  incorrectUsages: 0,
  strength: 0,
  reviewStatus: 'New',
  lastUsedAt: null,
  nextReviewDate: null,
  skillEvidence: {},
  isPassed: false,
  ...overrides,
});

describe('AdaptiveDifficultyEngine', () => {
  describe('assessDifficulty', () => {
    it('returns beginner for no usage', () => {
      const progress = makeProgress();
      const result = AdaptiveDifficultyEngine.assessDifficulty('r1', progress);
      expect(result.suggestedDifficulty).toBe('beginner');
    });

    it('returns advanced for high strength and accuracy', () => {
      const progress = makeProgress({
        strength: 85,
        correctUsages: 10,
        incorrectUsages: 1,
      });
      const result = AdaptiveDifficultyEngine.assessDifficulty('r1', progress);
      expect(result.suggestedDifficulty).toBe('advanced');
    });

    it('returns challenge for excellent performance', () => {
      const progress = makeProgress({
        strength: 95,
        correctUsages: 15,
        incorrectUsages: 1,
        exposures: 20,
      });
      const result = AdaptiveDifficultyEngine.assessDifficulty('r1', progress);
      expect(result.suggestedDifficulty).toBe('challenge');
    });
  });

  describe('selectQuestionDifficulty', () => {
    it('upgrades difficulty on correct streak', () => {
      const progress = makeProgress({
        strength: 50,
        correctUsages: 5,
        incorrectUsages: 2,
      });
      const result = AdaptiveDifficultyEngine.selectQuestionDifficulty(
        progress,
        3
      );
      expect(['intermediate', 'advanced', 'challenge']).toContain(result);
    });

    it('downgrades difficulty on incorrect answers', () => {
      const progress = makeProgress({
        strength: 30,
        correctUsages: 2,
        incorrectUsages: 3,
      });
      const result = AdaptiveDifficultyEngine.selectQuestionDifficulty(
        progress,
        0
      );
      expect(['beginner', 'intermediate']).toContain(result);
    });
  });

  describe('getDifficultyMultiplier', () => {
    it('returns correct multipliers', () => {
      expect(AdaptiveDifficultyEngine.getDifficultyMultiplier('beginner')).toBe(
        1.0
      );
      expect(
        AdaptiveDifficultyEngine.getDifficultyMultiplier('intermediate')
      ).toBe(1.5);
      expect(AdaptiveDifficultyEngine.getDifficultyMultiplier('advanced')).toBe(
        2.0
      );
      expect(
        AdaptiveDifficultyEngine.getDifficultyMultiplier('challenge')
      ).toBe(3.0);
    });
  });
});
