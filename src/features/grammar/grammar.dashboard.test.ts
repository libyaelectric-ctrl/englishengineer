import { describe, expect, it } from 'vitest';
import { GrammarDashboardService } from './grammar.dashboard';
import type { GrammarRuleProgress } from './grammar.progress';
import type { ErrorCategory } from './grammar.error-patterns';

const makeProgress = (
  id: string,
  overrides: Partial<GrammarRuleProgress> = {}
): GrammarRuleProgress => ({
  ruleId: id,
  exposures: 5,
  correctUsages: 3,
  incorrectUsages: 1,
  strength: 60,
  reviewStatus: 'Learning',
  lastUsedAt: null,
  nextReviewDate: null,
  skillEvidence: {},
  isPassed: false,
  ...overrides,
});

describe('GrammarDashboardService', () => {
  describe('buildDashboard', () => {
    it('calculates overall progress', () => {
      const progress = {
        r1: makeProgress('r1', { reviewStatus: 'Strong' }),
        r2: makeProgress('r2', { reviewStatus: 'Learning' }),
        r3: makeProgress('r3', { reviewStatus: 'Due' }),
      };
      const errorSummary = {
        totalErrors: 5,
        topCategories: [] as Array<{
          category: ErrorCategory;
          count: number;
          percentage: number;
        }>,
      };
      const dashboard = GrammarDashboardService.buildDashboard(
        progress,
        errorSummary,
        () => 'tense'
      );

      expect(dashboard.overallProgress.total).toBe(3);
      expect(dashboard.overallProgress.mastered).toBe(1);
      expect(dashboard.overallProgress.learning).toBe(1);
      expect(dashboard.overallProgress.masteryPercentage).toBe(33);
    });

    it('builds category breakdown', () => {
      const progress = {
        r1: makeProgress('r1'),
        r2: makeProgress('r2'),
      };
      const errorSummary = {
        totalErrors: 0,
        topCategories: [] as Array<{
          category: ErrorCategory;
          count: number;
          percentage: number;
        }>,
      };
      const dashboard = GrammarDashboardService.buildDashboard(
        progress,
        errorSummary,
        () => 'tense'
      );

      expect(dashboard.categoryBreakdown.length).toBeGreaterThan(0);
      expect(dashboard.categoryBreakdown[0].category).toBe('Tenses');
    });

    it('generates recommendations', () => {
      const progress = {
        r1: makeProgress('r1', { strength: 20 }),
        r2: makeProgress('r2', { strength: 30 }),
      };
      const errorSummary = {
        totalErrors: 10,
        topCategories: [
          { category: 'tense' as ErrorCategory, count: 8, percentage: 80 },
        ],
      };
      const dashboard = GrammarDashboardService.buildDashboard(
        progress,
        errorSummary,
        () => 'tense'
      );

      expect(dashboard.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getCategoryStrengthColor', () => {
    it('returns correct colors', () => {
      expect(GrammarDashboardService.getCategoryStrengthColor(90)).toBe(
        '#22c55e'
      );
      expect(GrammarDashboardService.getCategoryStrengthColor(50)).toBe(
        '#eab308'
      );
      expect(GrammarDashboardService.getCategoryStrengthColor(10)).toBe(
        '#ef4444'
      );
    });
  });
});
