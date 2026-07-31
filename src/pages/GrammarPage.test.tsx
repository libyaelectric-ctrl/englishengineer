import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { useGrammarStore } from '@/features/grammar';

import GrammarPage from './GrammarPage';

vi.mock('@/features/grammar', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useGrammarStore: vi.fn(),
  };
});

vi.mock('./GrammarPage/hooks/useGrammarPage', () => ({
  useGrammarPage: vi.fn(() => ({
    level: 'A1',
    rules: [],
    grammarPoolIds: [],
    query: '',
    setQuery: vi.fn(),
    lessonStripRef: { current: null },
    quizOpen: false,
    setQuizOpen: vi.fn(),
    hintOpen: false,
    setHintOpen: vi.fn(),
    quizAnswers: {},
    setQuizAnswers: vi.fn(),
    levelCounts: { A1: 5, A2: 3, B1: 0, B2: 0, C1: 0, C2: 0 },
    totalGrammarLessons: 8,
    selectedRule: null,
    selectedProgress: null,
    pathGroups: [],
    linkedVocabulary: [],
    nextLesson: null,
    reviewTargets: [],
    masteredCount: 0,
    selectRule: vi.fn(),
    scrollLessonStrip: vi.fn(),
    recordUsage: vi.fn(),
    quizItems: [],
  })),
}));

describe('GrammarPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders grammar header with level', () => {
    vi.mocked(useGrammarStore).mockReturnValue({
      stats: { learned: 3, mastered: 1, struggling: 0 },
    } as unknown as ReturnType<typeof useGrammarStore>);

    render(
      <MemoryRouter>
        <GrammarPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Grammar/i).length).toBeGreaterThan(0);
  });

  it('shows placeholder when no lesson is selected', () => {
    vi.mocked(useGrammarStore).mockReturnValue({
      stats: { learned: 0, mastered: 0, struggling: 0 },
    } as unknown as ReturnType<typeof useGrammarStore>);

    render(
      <MemoryRouter>
        <GrammarPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Select a grammar lesson to begin.')).toBeTruthy();
  });
});
