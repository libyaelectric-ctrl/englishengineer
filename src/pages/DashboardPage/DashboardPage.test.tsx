import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import DashboardPage from './index';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

vi.mock('@/features/auth', async (importOriginal) => ({
  ...(await importOriginal()),
  useAuthStore: vi.fn(() => ({
    currentUser: { id: 'user-1', displayName: 'Test Engineer' },
  })),
}));

vi.mock('@/features/profile', async (importOriginal) => ({
  ...(await importOriginal()),
  useLearningCockpit: vi.fn(() => ({
    profile: {
      skills: {
        reading: { completedTasks: 5, weaknessScore: 0.3, skill: 'reading' },
        writing: { completedTasks: 3, weaknessScore: 0.5, skill: 'writing' },
        listening: { completedTasks: 2, weaknessScore: 0.6, skill: 'listening' },
        speaking: { completedTasks: 1, weaknessScore: 0.7, skill: 'speaking' },
        vocabulary: { completedTasks: 10, weaknessScore: 0.2, skill: 'vocabulary' },
        grammar: { completedTasks: 8, weaknessScore: 0.4, skill: 'grammar' },
      },
    },
    memory: { weakWords: [], dueToday: 0 },
    missions: [],
    learningState: { studySessions: [] },
  })),
  SKILL_NAMES: ['reading', 'writing', 'listening', 'speaking', 'vocabulary', 'grammar'],
}));

vi.mock('@/features/learning-intelligence', async (importOriginal) => ({
  ...(await importOriginal()),
  useLearningIntelligenceStore: vi.fn(() => ({
    mistakeLog: [],
  })),
  buildReviewPrioritiesFromInput: vi.fn(() => []),
}));

vi.mock('@/core/learning', () => ({
  ProgressService: {
    getSummary: vi.fn(() => ({ averageScore: 75, completedTasks: 10 })),
  },
}));

vi.mock('@/features/learning-orchestrator', () => ({
  LessonPathEngine: {
    getSkillProgress: vi.fn(() => ({ lesson: { number: 1 } })),
  },
}));

vi.mock('@/features/translation', () => ({
  DashboardTranslatorWidget: () => null,
}));

vi.mock('./DailyGoalBar', () => ({
  DailyGoalBar: () => null,
}));

vi.mock('./HeroPanel', () => ({
  HeroPanel: () => null,
}));

vi.mock('./ProgressCockpit', () => ({
  ProgressCockpit: () => null,
}));

vi.mock('./ReviewPriorities', () => ({
  ReviewPriorities: () => null,
}));

vi.mock('./SkillRadarChart', () => ({
  SkillRadarChart: () => null,
}));

vi.mock('./DashboardSkeleton', () => ({
  DashboardSkeleton: () => null,
}));

describe('DashboardPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    );
  });
});
