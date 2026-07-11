// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { AnalyticsSummary } from '@/features/analytics';
import { createLearningState } from '@/test/fixtures';
import {
  buildMissionProgress,
  getLevelInfo,
  getSessionCountForTemplate,
} from './gamification.helpers';
import { GamificationMissionTemplate } from './gamification.types';

const analytics: AnalyticsSummary = {
  overallProgress: 0,
  estimatedCefr: 'B1',
  skillRadar: [],
  xpTimeline: [],
  eloTimeline: [],
  weeklyActivity: [],
  studyHeatmap: [],
  recentSessions: [],
  recentAchievements: [],
  weakSkills: [],
  strongSkills: [],
  vocabularyRetention: 0,
  vocabularySummary: {
    wordsLearned: 0,
    todaysReviews: 0,
    vocabularyStreak: 0,
    weakVocabulary: [],
    nextReviewSession: null,
    retentionPercentage: 0,
    mostDifficultWords: [],
    categoryMastery: [],
    reviewCalendar: [],
  },
  aiCoachUsage: {
    totalSessions: 0,
    mostUsedMode: 'None',
    suggestedFocusArea: 'Reading',
    lastUsedAt: null,
  },
  nextRecommendedStudy: {
    module: 'Reading',
    title: 'Read',
    reason: 'Practice',
  },
  xpGrowth: 0,
  eloGrowth: 0,
  studyConsistency: 0,
  averageSessionLength: 0,
  retention: 0,
  improvementVelocity: 0,
  assessmentProfile: {
    hasEnoughData: false,
    dataStatus: 'insufficient',
    overallScore: null,
    engineerCefr: null,
    engineerElo: 1200,
    dimensionScores: [],
    strongestDimensions: [],
    weakestDimensions: [],
    recentHistory: [],
    recommendedNextMissions: [],
    readiness: {
      meetings: null,
      reports: null,
      consultantCommunication: null,
    },
    trustLabel: 'Not enough assessment data yet',
    confidenceScore: 0,
    confidenceExplanation:
      'No completed learning evidence is available yet, so the assessment estimate is not reliable.',
    certificateDisclaimer:
      'This is an internal Engineering Communication estimate, not an official CEFR certificate.',
  },
};

const template: GamificationMissionTemplate = {
  id: 'daily_reading',
  title: 'Daily Reading',
  description: 'Read once.',
  cadence: 'daily',
  category: 'Reading',
  target: 1,
  xpReward: 10,
  coinReward: 5,
};

describe('gamification helpers', () => {
  it('calculates level information from XP', () => {
    expect(getLevelInfo(750)).toMatchObject({
      currentLevel: 2,
      levelStartXp: 500,
      nextLevelXp: 1000,
      xpRequired: 250,
      progressPercentage: 50,
    });
  });

  it('counts daily sessions that match the template category', () => {
    const today = new Date().toISOString();
    const state = createLearningState({
      studySessions: [
        { timestamp: today, durationMinutes: 10, score: 80, module: 'Reading' },
        { timestamp: today, durationMinutes: 10, score: 80, module: 'Writing' },
      ],
    });

    expect(getSessionCountForTemplate(template, state, analytics)).toBe(1);
  });

  it('counts mixed template sessions across modules', () => {
    const today = new Date().toISOString();
    const mixedTemplate: GamificationMissionTemplate = {
      ...template,
      category: 'Mixed',
      target: 2,
    };
    const state = createLearningState({
      studySessions: [
        { timestamp: today, durationMinutes: 10, score: 80, module: 'Reading' },
        { timestamp: today, durationMinutes: 10, score: 80, module: 'Writing' },
      ],
    });

    expect(getSessionCountForTemplate(mixedTemplate, state, analytics)).toBe(2);
  });

  it('builds completed mission progress when target is reached', () => {
    const state = createLearningState({
      studySessions: [
        {
          timestamp: new Date().toISOString(),
          durationMinutes: 10,
          score: 90,
          module: 'Reading',
        },
      ],
    });

    expect(buildMissionProgress(template, state, analytics)).toMatchObject({
      progress: 1,
      isCompleted: true,
    });
  });
});
