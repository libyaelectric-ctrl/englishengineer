import { describe, it, expect } from 'vitest';
import { LearningPathAdvisor } from './learning-path-advisor';

describe('LearningPathAdvisor', () => {
  const balancedLevels = {
    vocabulary: 'B1' as const,
    grammar: 'B1' as const,
    reading: 'B1' as const,
    writing: 'A2' as const,
    listening: 'B1' as const,
    speaking: 'A2' as const,
  };

  describe('generatePlan', () => {
    it('generates a 7-day plan', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      expect(plan.dailyPlan).toHaveLength(7);
      expect(plan.userId).toBe('user-1');
      expect(plan.generatedAt).toBeDefined();
    });

    it('identifies skill gaps correctly', () => {
      const plan = LearningPathAdvisor.generatePlan(
        'user-1',
        balancedLevels,
        'B2'
      );
      expect(plan.goals.length).toBeGreaterThan(0);
      expect(plan.goals.some((g) => g.skill === 'writing')).toBe(true);
      expect(plan.goals.some((g) => g.skill === 'speaking')).toBe(true);
    });

    it('prioritizes high-gap skills', () => {
      const unevenLevels = {
        vocabulary: 'A1' as const,
        grammar: 'B2' as const,
        reading: 'B2' as const,
        writing: 'A1' as const,
        listening: 'B2' as const,
        speaking: 'A2' as const,
      };
      const plan = LearningPathAdvisor.generatePlan(
        'user-1',
        unevenLevels,
        'B2'
      );
      const highPriority = plan.goals.filter((g) => g.priority === 'high');
      expect(highPriority.length).toBeGreaterThan(0);
      expect(highPriority.some((g) => g.skill === 'vocabulary')).toBe(true);
    });

    it('calculates total estimated minutes', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      expect(plan.totalEstimatedMinutes).toBeGreaterThan(0);
      expect(plan.totalEstimatedMinutes).toBe(
        plan.dailyPlan.reduce((sum, d) => sum + d.estimatedMinutes, 0)
      );
    });

    it('includes all 6 skills in weekly distribution', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      const skills = Object.keys(plan.skillDistribution);
      expect(skills).toHaveLength(6);
    });

    it('generates recommendations', () => {
      const plan = LearningPathAdvisor.generatePlan(
        'user-1',
        balancedLevels,
        'B2',
        'Electrical Engineer'
      );
      expect(plan.recommendations.length).toBeGreaterThan(0);
      expect(
        plan.recommendations.some((r) => r.includes('Electrical Engineer'))
      ).toBe(true);
    });

    it('handles already-at-target level', () => {
      const highLevels = {
        vocabulary: 'B2' as const,
        grammar: 'B2' as const,
        reading: 'B2' as const,
        writing: 'B2' as const,
        listening: 'B2' as const,
        speaking: 'B2' as const,
      };
      const plan = LearningPathAdvisor.generatePlan(
        'user-1',
        highLevels as never,
        'B2'
      );
      expect(plan.goals).toHaveLength(0);
      expect(plan.weakAreasIdentified).toHaveLength(0);
    });

    it('each day has at least one task', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      for (const day of plan.dailyPlan) {
        expect(day.tasks.length).toBeGreaterThan(0);
      }
    });

    it('daily plan covers all 7 days', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      const days = plan.dailyPlan.map((d) => d.day);
      expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('getWeeklySummary', () => {
    it('returns a formatted summary string', () => {
      const plan = LearningPathAdvisor.generatePlan('user-1', balancedLevels);
      const summary = LearningPathAdvisor.getWeeklySummary(plan);
      expect(summary).toContain('7-day plan');
      expect(summary).toContain('min total');
    });
  });
});
