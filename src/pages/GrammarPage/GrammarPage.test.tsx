import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import GrammarPage from './index';

vi.mock('@/features/grammar', async (importOriginal) => ({
  ...(await importOriginal()),
  useGrammarStore: vi.fn(() => ({
    stats: { learned: 3, mastered: 1, struggling: 0 },
  })),
}));

vi.mock('./hooks/useGrammarPage', () => ({
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
    rulesWithProgress: [],
    selectRule: vi.fn(),
    scrollLessonStrip: vi.fn(),
    recordUsage: vi.fn(),
    quizItems: [],
  })),
}));

describe('GrammarPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/grammar']}>
        <GrammarPage />
      </MemoryRouter>
    );
  });
});
