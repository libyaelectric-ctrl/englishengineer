import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import ListeningPage from './index';

vi.mock('@/features/listening', async (importOriginal) => ({
  ...(await importOriginal()),
  useListeningMissionsStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const state = {
      missions: [],
      selectedMissionId: null,
      completedMissions: {},
      answers: {},
      summary: '',
      userKeywords: '',
      evaluationResult: null,
      initializeMissions: vi.fn(),
      selectMission: vi.fn(),
      setAnswer: vi.fn(),
      setSummary: vi.fn(),
      setUserKeywords: vi.fn(),
      submitCurrentMission: vi.fn(),
      resetCurrentMission: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/features/listening/AudioPlayer', () => ({
  AudioPlayer: () => null,
}));

vi.mock('@/features/listening/listening.constants', () => ({
  PLAYBACK_SPEEDS: [0.5, 1, 1.5, 2],
}));

vi.mock('@/features/reading', async (importOriginal) => ({
  ...(await importOriginal()),
  useReadingStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const state = { completedMissions: {} };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/features/writing/writing.store', async (importOriginal) => ({
  ...(await importOriginal()),
  useWritingStore: vi.fn((selector?: (s: Record<string, unknown>) => unknown) => {
    const state = { completedMissions: {} };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/features/level-system', async (importOriginal) => ({
  ...(await importOriginal()),
  useSkillLevel: vi.fn(() => ({ currentLevel: 'A1' })),
  LevelContentFilter: () => null,
  EmptyLevelState: () => null,
  LevelAccessBadge: () => null,
}));

vi.mock('@/shared/components/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/components/SectionCard', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ListeningPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/listening']}>
        <ListeningPage />
      </MemoryRouter>
    );
  });
});
