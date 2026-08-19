import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import VocabularyPage from './index';

vi.mock('./hooks/useVocabularyPage', () => ({
  useVocabularyPage: vi.fn(() => ({
    vocabularyLevel: 'A1',
    loadError: null,
    terms: [],
    menuState: { progress: {}, myVocabulary: [] },
    wordSet: [],
    searchResults: [],
    allSearchResults: [],
    activeTab: 'To Review',
    mode: 'list',
    showFilters: false,
    showAddForm: false,
    customDraft: '',
    isSearchLoading: false,
    searchInput: '',
    searchQuery: '',
    searchError: null,
    hasSearched: false,
    filters: {},
    vocabularyProfile: null,
    chooseTab: vi.fn(),
    reviewWord: vi.fn(),
    learnWord: vi.fn(),
    exportCSV: vi.fn(),
    loadNextBatch: vi.fn(),
    addCustomWord: vi.fn(),
    filterOptions: {},
    dispatchUI: vi.fn(),
    dispatchSearch: vi.fn(),
    showSearchModal: false,
    openSearchModal: vi.fn(),
    closeSearchModal: vi.fn(),
  })),
}));

vi.mock('./components/VocabularyHeader', () => ({
  VocabularyHeader: () => null,
}));

vi.mock('./components/SearchModal', () => ({
  SearchModal: () => null,
}));

vi.mock('./components/SearchResultsSection', () => ({
  SearchResultsSection: () => null,
}));

vi.mock('./components/WordSetSection', () => ({
  WordSetSection: () => null,
}));

vi.mock('./components/QuizSection', () => ({
  QuizSection: () => null,
}));

vi.mock('./components/MasteredHeatmap', () => ({
  MasteredHeatmap: () => null,
}));

vi.mock('@/shared/components/SectionCard', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('VocabularyPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/vocabulary']}>
        <VocabularyPage />
      </MemoryRouter>
    );
  });
});
