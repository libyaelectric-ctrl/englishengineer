import { describe, it, expect } from 'vitest';
import {
  LearningReportGenerator,
  type ReportData,
} from './learning-report-generator';

const mockReportData: ReportData = {
  generatedAt: '2026-07-10T12:00:00Z',
  userName: 'John Engineer',
  overallLevel: 'B1',
  overallProgress: 65,
  totalStudyMinutes: 480,
  totalXp: 2500,
  currentStreak: 7,
  skillBreakdown: [
    {
      skill: 'vocabulary',
      level: 'B1',
      score: 75,
      sessionsCompleted: 12,
      minutesSpent: 120,
      trend: 'up',
    },
    {
      skill: 'grammar',
      level: 'A2',
      score: 60,
      sessionsCompleted: 8,
      minutesSpent: 80,
      trend: 'stable',
    },
    {
      skill: 'reading',
      level: 'B1',
      score: 80,
      sessionsCompleted: 10,
      minutesSpent: 100,
      trend: 'up',
    },
    {
      skill: 'writing',
      level: 'A2',
      score: 55,
      sessionsCompleted: 6,
      minutesSpent: 60,
      trend: 'down',
    },
    {
      skill: 'listening',
      level: 'B1',
      score: 70,
      sessionsCompleted: 9,
      minutesSpent: 90,
      trend: 'stable',
    },
    {
      skill: 'speaking',
      level: 'A2',
      score: 50,
      sessionsCompleted: 5,
      minutesSpent: 50,
      trend: 'down',
    },
  ],
  vocabularyStats: {
    totalWords: 500,
    mastered: 200,
    learning: 150,
    dueToday: 30,
    retentionRate: 78,
  },
  recentActivity: [
    { date: '2026-07-10', skill: 'Vocabulary', score: 85, durationMinutes: 15 },
    { date: '2026-07-09', skill: 'Grammar', score: 70, durationMinutes: 20 },
    { date: '2026-07-08', skill: 'Reading', score: 90, durationMinutes: 25 },
  ],
  strengths: ['Strong vocabulary retention', 'Consistent study habit'],
  weaknesses: ['Speaking confidence needs work', 'Grammar tense accuracy'],
  recommendations: [
    'Focus on speaking practice daily',
    'Review grammar tenses weekly',
  ],
};

describe('LearningReportGenerator', () => {
  describe('generateReport', () => {
    it('generates valid HTML string', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('EngineerOS Learning Report');
      expect(html).toContain('John Engineer');
    });

    it('includes all skill breakdowns', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('vocabulary');
      expect(html).toContain('grammar');
      expect(html).toContain('speaking');
    });

    it('includes vocabulary stats', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('500');
      expect(html).toContain('200');
      expect(html).toContain('78%');
    });

    it('includes strengths and weaknesses', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('Strong vocabulary retention');
      expect(html).toContain('Speaking confidence needs work');
    });

    it('includes recommendations', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('Focus on speaking practice daily');
    });

    it('includes recent activity', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('2026-07-10');
      expect(html).toContain('Vocabulary');
    });

    it('includes overall stats', () => {
      const html = LearningReportGenerator.generateReport(mockReportData);
      expect(html).toContain('65%');
      expect(html).toContain('480');
      expect(html).toContain('2500');
      expect(html).toContain('7');
    });

    it('handles empty data gracefully', () => {
      const emptyData: ReportData = {
        ...mockReportData,
        skillBreakdown: [],
        recentActivity: [],
        strengths: [],
        weaknesses: [],
        recommendations: [],
      };
      const html = LearningReportGenerator.generateReport(emptyData);
      expect(html).toContain('EngineerOS Learning Report');
    });
  });
});
