import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import SpeakingPage from './index';

vi.mock('./hooks/useSpeakingPage', () => ({
  useSpeakingPage: vi.fn(() => ({
    ROLEPLAY_FILTERS: ['All', 'Daily', 'Work', 'Engineering'],
    typedTranscript: '',
    setTypedTranscript: vi.fn(),
    evaluationResult: null,
    completedMissions: {},
    hasMaxAccess: false,
    subscription: { planId: 'starter' },
    voiceMinutesUsedThisMonth: 0,
    walletPercent: 0,
    responseMode: 'written',
    setResponseMode: vi.fn(),
    isRecording: false,
    isPaused: false,
    setIsPaused: vi.fn(),
    pauseRef: { current: null },
    recordedAudio: null,
    pronunciationScore: 0,
    phonemeFeedback: [],
    waveformBars: [],
    levelFilter: { min: 'A1', max: 'C2' },
    setLevelFilter: vi.fn(),
    roleplayFilter: 'All',
    setRoleplayFilter: vi.fn(),
    currentLevel: 'A1',
    roleplayMissions: [],
    activeMission: null,
    selectedMissionId: null,
    startRecording: vi.fn(),
    submitRoleplay: vi.fn(),
    handleMissionSelect: vi.fn(),
    resetRecording: vi.fn(),
    resetMission: vi.fn(),
    MAX_VOICE_MINUTES: 120,
    scoreResult: null,
    setScoreResult: vi.fn(),
  })),
}));

vi.mock('./components', () => ({
  EvaluationScores: () => null,
  MissionMetrics: () => null,
  MissionSelector: () => null,
  RoleplayCategoryFilter: () => null,
  ScoreComparison: () => null,
  VoiceMinuteWallet: () => null,
  VoicePracticePanel: () => null,
}));

vi.mock('@/features/reading', async (importOriginal) => ({
  ...(await importOriginal()),
  useReadingStore: vi.fn(() => ({ completedMissions: {} })),
}));

vi.mock('@/features/writing/writing.store', async (importOriginal) => ({
  ...(await importOriginal()),
  useWritingStore: vi.fn(() => ({ completedMissions: {} })),
}));

vi.mock('@/features/speaking', async (importOriginal) => ({
  ...(await importOriginal()),
  useSpeakingStore: vi.fn(() => ({
    missions: [],
    selectedMissionId: null,
    typedTranscript: '',
    evaluationResult: null,
    completedMissions: {},
    history: [],
    initializeStore: vi.fn(),
    selectMission: vi.fn(),
    setTypedTranscript: vi.fn(),
    submitCurrentMission: vi.fn(),
    resetCurrentMission: vi.fn(),
  })),
}));

vi.mock('@/features/speaking/simulator/DefenseSimulator', () => ({
  DefenseSimulator: () => null,
}));

vi.mock('@/features/speaking/components/InterviewSimulator', () => ({
  InterviewSimulator: () => null,
}));

vi.mock('@/features/level-system', async (importOriginal) => ({
  ...(await importOriginal()),
  useSkillLevel: vi.fn(() => ({ currentLevel: 'A1' })),
  LevelContentFilter: () => null,
}));

vi.mock('@/features/billing', async (importOriginal) => ({
  ...(await importOriginal()),
  useBillingStore: vi.fn(() => ({
    subscription: { planId: 'starter' },
  })),
}));

vi.mock('@/shared/utils/progression-lock.helpers', () => ({
  isProgressionBypassed: vi.fn(() => true),
}));

vi.mock('@/shared/components/Button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/components/SectionCard', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/SkillLockedState', () => ({
  SkillLockedState: () => null,
}));

vi.mock('@/shared/components/StatusBadge', () => ({
  StatusBadge: () => null,
}));

vi.mock('@/shared/components/ScoreFeedbackOverlay', () => ({
  ScoreFeedbackOverlay: () => null,
}));

describe('SpeakingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/speaking']}>
        <SpeakingPage />
      </MemoryRouter>
    );
  });
});
