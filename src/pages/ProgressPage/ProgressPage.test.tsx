import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ProgressPage from './index';

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: { id: 'user-1', displayName: 'Test User' },
  })),
}));

vi.mock('@/core/learning', () => ({
  useLearningStore: vi.fn((selector?: (s: any) => any) => {
    const state = {
      vocabularyPool: [],
      grammarPool: [],
      speakingPool: [],
      xp: 100,
      streak: 5,
      learningState: { studySessions: [] },
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/features/profile', () => ({
  useLearningCockpit: vi.fn(() => ({
    profile: {
      skills: {
        vocabulary: { elo: 800, cefrBand: 'A1' },
        grammar: { elo: 750, cefrBand: 'A1' },
        reading: { elo: 700, cefrBand: 'A1' },
        writing: { elo: 650, cefrBand: 'A1' },
        speaking: { elo: 600, cefrBand: 'A1' },
        listening: { elo: 700, cefrBand: 'A1' },
      },
    },
    memory: { weakWords: [], dueToday: 0 },
    missions: [],
    learningState: { studySessions: [] },
  })),
  LearningProfileEngine: { getBadges: vi.fn(() => []) },
}));

vi.mock('@/features/billing', () => ({
  useBillingStore: vi.fn(() => ({
    subscription: { planId: 'starter' },
  })),
  canViewAdvancedAnalytics: vi.fn(() => ({ allowed: false })),
}));

vi.mock('@/features/analytics', () => ({
  AnalyticsService: {
    getSummary: vi.fn(() => ({
      assessmentProfile: { trustLabel: 'Low', hasEnoughData: false },
    })),
  },
  useAnalyticsStore: vi.fn(() => ({
    activeChart: 'overview',
    setActiveChart: vi.fn(),
  })),
}));

vi.mock('@/features/grammar', () => ({
  GrammarProgressService: {
    getSummary: vi.fn(() => ({ strong: 0 })),
    getAll: vi.fn(() => ({})),
  },
  ErrorPatternAnalyzer: {
    getSummary: vi.fn(() => ({ totalErrors: 0 })),
  },
  AdaptiveDifficultyEngine: {
    assessDifficulty: vi.fn(() => ({ suggestedDifficulty: 'beginner' })),
  },
}));

vi.mock('@/features/learning-orchestrator', () => ({
  LearningTaskEngine: {
    getWeakestSkill: vi.fn(() => 'vocabulary'),
  },
}));

vi.mock('./HeroBanner', () => ({
  HeroBanner: () => <div data-testid="hero-banner" />,
}));

vi.mock('./QuickStats', () => ({
  QuickStats: () => <div data-testid="quick-stats" />,
}));

vi.mock('./AnalyticsMetricCards', () => ({
  AnalyticsMetricCards: () => <div data-testid="analytics-metrics" />,
}));

vi.mock('./AnalyticsChartsSection', () => ({
  AnalyticsChartsSection: () => <div data-testid="analytics-charts" />,
}));

vi.mock('./SkillSidebar', () => ({
  SkillSidebar: () => <div data-testid="skill-sidebar" />,
}));

vi.mock('./AnalyticsPanels', () => ({
  AssessmentProfilePanel: () => <div data-testid="assessment-panel" />,
}));

vi.mock('./utils', () => ({
  SKILLS: [
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'grammar', label: 'Grammar' },
    { id: 'reading', label: 'Reading' },
    { id: 'writing', label: 'Writing' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'listening', label: 'Listening' },
  ],
  getCEFRBand: vi.fn(() => 'A1'),
}));

describe('ProgressPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/progress']}>
        <ProgressPage />
      </MemoryRouter>
    );
  });
});
