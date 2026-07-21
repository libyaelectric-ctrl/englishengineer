import { describe, it, expect } from 'vitest';
import {
  dataReducer,
  uiReducer,
  searchReducer,
  type VocabularyDataState,
  type VocabularyUIState,
  type VocabularySearchState,
} from './VocabularyPageReducer';
import { VocabularyMenuService } from '@/features/vocabulary';

const initialData: VocabularyDataState = {
  terms: [],
  allLevelsLoaded: false,
  loadError: null,
  menuState: VocabularyMenuService.getState(),
  wordSetIds: [],
};

const initialUi: VocabularyUIState = {
  activeTab: 'New',
  mode: 'Quiz',
  batchOffset: 0,
  learningDomain: 'All',
  showFilters: false,
  showAddForm: false,
  customDraft: {
    term: '',
    turkishMeaning: '',
    exampleSentence: '',
    cefrLevel: 'A1',
    domain: '',
  },
};

const initialSearch: VocabularySearchState = {
  isSearchLoading: false,
  searchInput: '',
  searchQuery: '',
  searchError: null,
  hasSearched: false,
  filters: {
    cefr: 'All',
    domain: 'All',
    contentDomain: 'All',
    lifeContext: 'All',
    partOfSpeech: 'All',
    skillUse: 'All',
    status: 'All',
  },
  appliedFilters: {
    cefr: 'All',
    domain: 'All',
    contentDomain: 'All',
    lifeContext: 'All',
    partOfSpeech: 'All',
    skillUse: 'All',
    status: 'All',
  },
};

describe('VocabularyPage dataReducer', () => {
  it('SET_TERMS updates terms', () => {
    const result = dataReducer(initialData, {
      type: 'SET_TERMS',
      terms: [{ id: '1', term: 'hello' } as never],
    });
    expect(result.terms).toHaveLength(1);
  });

  it('SET_LOAD_ERROR updates loadError', () => {
    const result = dataReducer(initialData, {
      type: 'SET_LOAD_ERROR',
      error: 'Failed to load',
    });
    expect(result.loadError).toBe('Failed to load');
  });

  it('SET_MENU_STATE updates menuState', () => {
    const newState = VocabularyMenuService.getState();
    const result = dataReducer(initialData, {
      type: 'SET_MENU_STATE',
      menuState: newState,
    });
    expect(result.menuState).toBe(newState);
  });

  it('SET_WORD_SET_IDS updates wordSetIds', () => {
    const result = dataReducer(initialData, {
      type: 'SET_WORD_SET_IDS',
      wordSetIds: ['id1', 'id2'],
    });
    expect(result.wordSetIds).toEqual(['id1', 'id2']);
  });

  it('LOAD_ALL_LEVELS sets terms and allLevelsLoaded', () => {
    const result = dataReducer(initialData, {
      type: 'LOAD_ALL_LEVELS',
      terms: [{ id: '1', term: 'test' } as never],
    });
    expect(result.allLevelsLoaded).toBe(true);
    expect(result.terms).toHaveLength(1);
  });
});

describe('VocabularyPage uiReducer', () => {
  it('CHOOSE_TAB sets activeTab and resets batchOffset', () => {
    const result = uiReducer(
      { ...initialUi, batchOffset: 10 },
      { type: 'CHOOSE_TAB', status: 'Learned' }
    );
    expect(result.activeTab).toBe('Learned');
    expect(result.mode).toBe('View');
    expect(result.batchOffset).toBe(0);
  });

  it('SET_BATCH_OFFSET updates batchOffset', () => {
    const result = uiReducer(initialUi, {
      type: 'SET_BATCH_OFFSET',
      offset: 5,
    });
    expect(result.batchOffset).toBe(5);
  });

  it('SET_LEARNING_DOMAIN updates domain and resets batch', () => {
    const result = uiReducer(
      { ...initialUi, batchOffset: 10 },
      { type: 'SET_LEARNING_DOMAIN', domain: 'electrical' }
    );
    expect(result.learningDomain).toBe('electrical');
    expect(result.batchOffset).toBe(0);
  });

  it('TOGGLE_FILTERS toggles showFilters', () => {
    const result = uiReducer(initialUi, { type: 'TOGGLE_FILTERS' });
    expect(result.showFilters).toBe(true);
    const result2 = uiReducer(result, { type: 'TOGGLE_FILTERS' });
    expect(result2.showFilters).toBe(false);
  });

  it('SET_SHOW_ADD_FORM updates showAddForm', () => {
    const result = uiReducer(initialUi, {
      type: 'SET_SHOW_ADD_FORM',
      show: true,
    });
    expect(result.showAddForm).toBe(true);
  });

  it('SET_CUSTOM_DRAFT updates customDraft', () => {
    const result = uiReducer(initialUi, {
      type: 'SET_CUSTOM_DRAFT',
      draft: { ...initialUi.customDraft, term: 'hello' },
    });
    expect(result.customDraft.term).toBe('hello');
  });

  it('START_SESSION resets to default state', () => {
    const result = uiReducer(
      { ...initialUi, activeTab: 'Mastered', mode: 'View', batchOffset: 5 },
      { type: 'START_SESSION' }
    );
    expect(result.activeTab).toBe('New');
    expect(result.mode).toBe('Quiz');
    expect(result.batchOffset).toBe(0);
  });
});

describe('VocabularyPage searchReducer', () => {
  it('SET_SEARCH_LOADING updates isSearchLoading', () => {
    const result = searchReducer(initialSearch, {
      type: 'SET_SEARCH_LOADING',
      loading: true,
    });
    expect(result.isSearchLoading).toBe(true);
  });

  it('SET_SEARCH_INPUT updates searchInput', () => {
    const result = searchReducer(initialSearch, {
      type: 'SET_SEARCH_INPUT',
      input: 'hello',
    });
    expect(result.searchInput).toBe('hello');
  });

  it('RUN_SEARCH sets query and appliedFilters', () => {
    const result = searchReducer(
      {
        ...initialSearch,
        searchInput: 'test',
        filters: { ...initialSearch.filters, domain: 'electrical' },
      },
      { type: 'RUN_SEARCH', query: 'test' }
    );
    expect(result.searchQuery).toBe('test');
    expect(result.hasSearched).toBe(true);
    expect(result.searchError).toBeNull();
    expect(result.appliedFilters.domain).toBe('electrical');
  });

  it('SET_SEARCH_ERROR updates searchError', () => {
    const result = searchReducer(initialSearch, {
      type: 'SET_SEARCH_ERROR',
      error: 'No results',
    });
    expect(result.searchError).toBe('No results');
  });

  it('RESET_SEARCH resets all fields', () => {
    const dirty: VocabularySearchState = {
      ...initialSearch,
      searchInput: 'test',
      searchQuery: 'test',
      searchError: 'error',
      hasSearched: true,
    };
    const result = searchReducer(dirty, { type: 'RESET_SEARCH' });
    expect(result.searchInput).toBe('');
    expect(result.searchQuery).toBe('');
    expect(result.searchError).toBeNull();
    expect(result.hasSearched).toBe(false);
  });

  it('COMMIT_FILTERS updates filters', () => {
    const newFilters = { ...initialSearch.filters, cefr: 'B1' };
    const result = searchReducer(initialSearch, {
      type: 'COMMIT_FILTERS',
      filters: newFilters,
    });
    expect(result.filters.cefr).toBe('B1');
  });
});
