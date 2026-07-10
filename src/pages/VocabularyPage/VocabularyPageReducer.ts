import type { VocabularyMenuState, VocabularyMenuStatus } from '@/features/vocabulary';
import type { CefrLevel } from '@/features/level-system';
import { emptyFilters } from './VocabularyPageUtils';

export interface VocabularyDataState {
  terms: import('@/features/vocabulary').VocabularyTerm[];
  allLevelsLoaded: boolean;
  loadError: string | null;
  menuState: VocabularyMenuState;
  wordSetIds: string[];
}

export interface VocabularyUIState {
  activeTab: VocabularyMenuStatus;
  mode: 'Quiz' | 'Review' | 'View';
  batchOffset: number;
  learningDomain: string;
  showFilters: boolean;
  showAddForm: boolean;
  customDraft: {
    term: string;
    turkishMeaning: string;
    exampleSentence: string;
    cefrLevel: CefrLevel;
    domain: string;
  };
}

export interface VocabularySearchState {
  isSearchLoading: boolean;
  searchInput: string;
  searchQuery: string;
  searchError: string | null;
  hasSearched: boolean;
  filters: ReturnType<typeof emptyFilters>;
  appliedFilters: ReturnType<typeof emptyFilters>;
}

// --- Data Actions ---

type DataAction =
  | { type: 'SET_TERMS'; terms: VocabularyDataState['terms'] }
  | { type: 'SET_LOAD_ERROR'; error: string }
  | { type: 'SET_MENU_STATE'; menuState: VocabularyMenuState }
  | { type: 'SET_WORD_SET_IDS'; wordSetIds: string[] }
  | { type: 'LOAD_ALL_LEVELS'; terms: VocabularyDataState['terms'] };

export const dataReducer = (
  state: VocabularyDataState,
  action: DataAction
): VocabularyDataState => {
  switch (action.type) {
    case 'SET_TERMS':
      return { ...state, terms: action.terms };
    case 'SET_LOAD_ERROR':
      return { ...state, loadError: action.error };
    case 'SET_MENU_STATE':
      return { ...state, menuState: action.menuState };
    case 'SET_WORD_SET_IDS':
      return { ...state, wordSetIds: action.wordSetIds };
    case 'LOAD_ALL_LEVELS':
      return { ...state, terms: action.terms, allLevelsLoaded: true };
    default:
      return state;
  }
};

// --- UI Actions ---

type UIAction =
  | { type: 'CHOOSE_TAB'; status: VocabularyMenuStatus }
  | { type: 'SET_BATCH_OFFSET'; offset: number }
  | { type: 'SET_LEARNING_DOMAIN'; domain: string }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'SET_SHOW_ADD_FORM'; show: boolean }
  | { type: 'SET_CUSTOM_DRAFT'; draft: VocabularyUIState['customDraft'] }
  | { type: 'START_SESSION' };

export const uiReducer = (
  state: VocabularyUIState,
  action: UIAction
): VocabularyUIState => {
  switch (action.type) {
    case 'CHOOSE_TAB':
      return {
        ...state,
        activeTab: action.status,
        mode: action.status === 'New' ? 'Quiz' : 'View',
        batchOffset: 0,
      };
    case 'SET_BATCH_OFFSET':
      return { ...state, batchOffset: action.offset };
    case 'SET_LEARNING_DOMAIN':
      return { ...state, learningDomain: action.domain, batchOffset: 0 };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'SET_SHOW_ADD_FORM':
      return { ...state, showAddForm: action.show };
    case 'SET_CUSTOM_DRAFT':
      return { ...state, customDraft: action.draft };
    case 'START_SESSION':
      return { ...state, activeTab: 'New', mode: 'Quiz', batchOffset: 0 };
    default:
      return state;
  }
};

// --- Search Actions ---

type SearchAction =
  | { type: 'SET_SEARCH_LOADING'; loading: boolean }
  | { type: 'SET_SEARCH_INPUT'; input: string }
  | { type: 'RUN_SEARCH'; query: string }
  | { type: 'SET_SEARCH_ERROR'; error: string | null }
  | { type: 'RESET_SEARCH' }
  | { type: 'COMMIT_FILTERS'; filters: VocabularySearchState['filters'] };

export const searchReducer = (
  state: VocabularySearchState,
  action: SearchAction
): VocabularySearchState => {
  switch (action.type) {
    case 'SET_SEARCH_LOADING':
      return { ...state, isSearchLoading: action.loading };
    case 'SET_SEARCH_INPUT':
      return { ...state, searchInput: action.input };
    case 'RUN_SEARCH':
      return {
        ...state,
        searchError: null,
        searchQuery: action.query,
        appliedFilters: state.filters,
        hasSearched: true,
      };
    case 'SET_SEARCH_ERROR':
      return { ...state, searchError: action.error };
    case 'RESET_SEARCH':
      return {
        isSearchLoading: false,
        searchInput: '',
        searchQuery: '',
        searchError: null,
        hasSearched: false,
        filters: emptyFilters(),
        appliedFilters: emptyFilters(),
      };
    case 'COMMIT_FILTERS':
      return { ...state, filters: action.filters };
    default:
      return state;
  }
};
