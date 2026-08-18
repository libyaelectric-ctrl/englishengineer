import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import WritingPage from './index';

vi.mock('./hooks/useWritingPage', () => ({
  useWritingPage: vi.fn(() => ({
    missions: [],
    selectedMissionId: null,
    draft: '',
    setDraft: vi.fn(),
    timeSpentSeconds: 0,
    evaluationResult: null,
    completedMissions: {},
    activeTab: 'missions',
    selectedRule: null,
    setSelectedRule: vi.fn(),
    userErrors: {},
    showModelAnswer: false,
    setShowModelAnswer: vi.fn(),
    levelFilter: { min: 'A1', max: 'C2' },
    setLevelFilter: vi.fn(),
    writingHistory: [],
    currentLevel: 'A1',
    visibleMissions: [],
    currentMission: null,
    currentMissionIndex: 0,
    finishedCount: 0,
    bestScoreAvg: 0,
    activeCorrections: [],
    getReadabilityScore: vi.fn(() => 0),
    handleApplyFix: vi.fn(),
    handleAutoFixAll: vi.fn(),
    handleLaunchMission: vi.fn(),
    handleSubmit: vi.fn(),
    handleBackToMissions: vi.fn(),
    moveMission: vi.fn(),
    resetCurrentMission: vi.fn(),
    resetAllWritingProgress: vi.fn(),
  })),
}));

vi.mock('./components/MissionListTab', () => ({
  MissionListTab: () => null,
}));

vi.mock('./components/WorkspaceTab', () => ({
  WorkspaceTab: () => null,
}));

vi.mock('@/features/grammar', async (importOriginal) => ({
  ...(await importOriginal()),
  useGrammarStore: vi.fn(() => ({
    stats: { learned: 0, mastered: 0, struggling: 0 },
  })),
}));

vi.mock('@/features/vocabulary/store/vocabulary.store', async (importOriginal) => ({
  ...(await importOriginal()),
  useVocabularyStore: vi.fn(() => ({
    stats: { learned: 0, mastered: 0 },
  })),
}));

vi.mock('@/features/writing', async (importOriginal) => ({
  ...(await importOriginal()),
  useWritingStore: vi.fn(() => ({
    missions: [],
    selectedMissionId: null,
    draft: '',
    timeSpentSeconds: 0,
    evaluationResult: null,
    completedMissions: {},
    initializeStore: vi.fn(),
    selectMission: vi.fn(),
    setDraft: vi.fn(),
    incrementAutoFixCount: vi.fn(),
    incrementTimer: vi.fn(),
    submitCurrentMission: vi.fn(),
    resetCurrentMission: vi.fn(),
    resetAllWritingProgress: vi.fn(),
    getMissionsSortedByPoolRatio: vi.fn(() => []),
  })),
}));

vi.mock('@/features/writing/FieldDocAssistant', () => ({
  FieldDocAssistant: () => null,
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

describe('WritingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/writing']}>
        <WritingPage />
      </MemoryRouter>
    );
  });
});
