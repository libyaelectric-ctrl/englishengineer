import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ReadingPage from './index';

vi.mock('./hooks/useReadingPage', () => ({
  useReadingPage: vi.fn(() => ({
    missions: [],
    answers: {},
    clickedVocab: [],
    timeSpentSeconds: 0,
    evaluationResult: null,
    completedMissions: {},
    setAnswer: vi.fn(),
    addClickedVocab: vi.fn(),
    resetCurrentMission: vi.fn(),
    resetAllReadingProgress: vi.fn(),
    activeTab: 'missions',
    selectedWord: null,
    setSelectedWord: vi.fn(),
    userErrors: {},
    levelFilter: { min: 'A1', max: 'C2' },
    setLevelFilter: vi.fn(),
    bookmarkedIds: new Set(),
    toggleBookmark: vi.fn(),
    currentLevel: 'A1',
    visibleMissions: [],
    currentMission: null,
    currentMissionIndex: 0,
    finishedCount: 0,
    bestScoreAvg: 0,
    handleLaunchMission: vi.fn(),
    handleSubmit: vi.fn(),
    handleBackToMissions: vi.fn(),
    moveMission: vi.fn(),
  })),
}));

vi.mock('./ReadingMissionCard', () => ({
  ReadingMissionCard: () => null,
}));

vi.mock('./ReadingWorkspace', () => ({
  ReadingWorkspace: () => null,
}));

vi.mock('./components/ReaderView', () => ({
  ReaderView: () => null,
}));

vi.mock('@/features/grammar', async (importOriginal) => ({
  ...(await importOriginal()),
  useGrammarStore: vi.fn(() => ({
    stats: { learned: 0, mastered: 0 },
  })),
}));

vi.mock('@/features/vocabulary/store/vocabulary.store', async (importOriginal) => ({
  ...(await importOriginal()),
  useVocabularyStore: vi.fn(() => ({
    stats: { learned: 0, mastered: 0 },
  })),
}));

vi.mock('@/features/level-system', async (importOriginal) => ({
  ...(await importOriginal()),
  useSkillLevel: vi.fn(() => ({ currentLevel: 'A1' })),
  LevelContentFilter: () => null,
  EmptyLevelState: () => null,
}));

vi.mock('@/shared/utils/progression-lock.helpers', () => ({
  isProgressionBypassed: vi.fn(() => true),
}));

vi.mock('@/shared/components/PageContainer', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/MetricCard', () => ({
  MetricCard: () => null,
}));

vi.mock('@/shared/components/SkillLockedState', () => ({
  SkillLockedState: () => null,
}));

vi.mock('@/shared/components/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('ReadingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/reading']}>
        <ReadingPage />
      </MemoryRouter>
    );
  });
});
