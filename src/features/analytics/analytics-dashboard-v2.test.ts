import { describe, it, expect } from 'vitest';
import { AnalyticsDashboardV2 } from './analytics-dashboard-v2';

describe('AnalyticsDashboardV2', () => {
  const mockSkillScores = {
    vocabulary: { score: 85, sessions: 12, minutes: 120, trend: 'up' as const },
    grammar: { score: 60, sessions: 8, minutes: 80, trend: 'stable' as const },
    reading: { score: 75, sessions: 10, minutes: 100, trend: 'up' as const },
    writing: { score: 50, sessions: 6, minutes: 60, trend: 'down' as const },
    listening: { score: 70, sessions: 9, minutes: 90, trend: 'stable' as const },
    speaking: { score: 55, sessions: 5, minutes: 50, trend: 'down' as const },
  };

  describe('generateSkillRadar', () => {
    it('generates radar data for all skills', () => {
      const radar = AnalyticsDashboardV2.generateSkillRadar(mockSkillScores);
      expect(radar).toHaveLength(6);
      expect(radar.map((r) => r.skill)).toEqual(
        expect.arrayContaining(['vocabulary', 'grammar', 'reading', 'writing', 'listening', 'speaking'])
      );
    });

    it('includes correct scores', () => {
      const radar = AnalyticsDashboardV2.generateSkillRadar(mockSkillScores);
      const vocab = radar.find((r) => r.skill === 'vocabulary');
      expect(vocab?.score).toBe(85);
      expect(vocab?.maxScore).toBe(100);
    });

    it('includes trend data', () => {
      const radar = AnalyticsDashboardV2.generateSkillRadar(mockSkillScores);
      const writing = radar.find((r) => r.skill === 'writing');
      expect(writing?.trend).toBe('down');
    });
  });

  describe('generateHeatmap', () => {
    it('generates 168 cells (7 days x 24 hours)', () => {
      const heatmap = AnalyticsDashboardV2.generateHeatmap([]);
      expect(heatmap).toHaveLength(168);
    });

    it('populates cells from study sessions', () => {
      const now = new Date();
      const sessions = [
        { timestamp: now.toISOString(), durationMinutes: 30, score: 85 },
        { timestamp: now.toISOString(), durationMinutes: 20, score: 90 },
      ];
      const heatmap = AnalyticsDashboardV2.generateHeatmap(sessions);
      const totalActivity = heatmap.reduce((sum, h) => sum + h.activityCount, 0);
      expect(totalActivity).toBe(2);
    });

    it('handles empty sessions', () => {
      const heatmap = AnalyticsDashboardV2.generateHeatmap([]);
      expect(heatmap.every((h) => h.activityCount === 0)).toBe(true);
    });
  });

  describe('analyzeProductivity', () => {
    it('returns defaults for empty sessions', () => {
      const pattern = AnalyticsDashboardV2.analyzeProductivity([]);
      expect(pattern.bestHour).toBe(9);
      expect(pattern.totalStudyDays).toBe(0);
    });

    it('identifies best hour and day', () => {
      const now = new Date();
      const hour = now.getHours();
      const sessions = [
        { timestamp: now.toISOString(), durationMinutes: 30 },
        { timestamp: now.toISOString(), durationMinutes: 20 },
        { timestamp: now.toISOString(), durationMinutes: 15 },
        { timestamp: now.toISOString(), durationMinutes: 45 },
      ];
      const pattern = AnalyticsDashboardV2.analyzeProductivity(sessions);
      expect(pattern.bestHour).toBe(hour);
      expect(pattern.averageSessionLength).toBe(28);
      expect(pattern.totalStudyDays).toBeGreaterThanOrEqual(1);
    });

    it('calculates consistency score', () => {
      const sessions = [
        { timestamp: '2026-07-10T09:00:00Z', durationMinutes: 30 },
        { timestamp: '2026-07-11T09:00:00Z', durationMinutes: 30 },
        { timestamp: '2026-07-12T09:00:00Z', durationMinutes: 30 },
      ];
      const pattern = AnalyticsDashboardV2.analyzeProductivity(sessions);
      expect(pattern.consistencyScore).toBeGreaterThan(0);
    });
  });

  describe('generateInsights', () => {
    it('generates insights from data', () => {
      const sessions = [
        { timestamp: '2026-07-10T09:00:00Z', durationMinutes: 30, score: 85 },
      ];
      const insights = AnalyticsDashboardV2.generateInsights(mockSkillScores, sessions);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((i) => i.type === 'peak_hour')).toBe(true);
    });

    it('includes improvement insight when skills are improving', () => {
      const insights = AnalyticsDashboardV2.generateInsights(mockSkillScores, []);
      expect(insights.some((i) => i.type === 'improvement')).toBe(true);
    });

    it('includes plateau insight for low-scoring stable skills', () => {
      const lowScores = {
        vocabulary: { score: 50, sessions: 5, minutes: 30, trend: 'stable' as const },
      };
      const insights = AnalyticsDashboardV2.generateInsights(lowScores, []);
      expect(insights.some((i) => i.type === 'plateau')).toBe(true);
    });
  });
});
