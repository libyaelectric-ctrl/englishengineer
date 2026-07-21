import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from 'react';
import { useLearningStore } from '@/core/learning';
import { playSound } from '@/shared/utils/sound';
import { useAuthStore } from '@/features/auth';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { CEFR_LEVELS, type CefrLevel } from '@/features/level-system';
import {
  getBaseCefrLevel,
  getPreferredDomains,
  LearningProfileRepository,
} from '@/features/profile';
import {
  isVocabularyProgressDue,
  repairVocabularyText,
  searchVocabularyMenu,
  selectVocabularyLearningSet,
  VocabularyMenuService,
  VocabularyRepository,
  type VocabularyMenuStatus,
  type VocabularySearchFilters,
  type VocabularyTerm,
} from '@/features/vocabulary';
import {
  dataReducer,
  uiReducer,
  searchReducer,
  type VocabularyDataState,
  type VocabularyUIState,
  type VocabularySearchState,
} from '../VocabularyPageReducer';
import { emptyFilters } from '../VocabularyPageUtils';
import type { VocabularySetMode } from '../components/WordCard';

const SEARCH_RESULT_LIMIT = 30;

export type { VocabularySetMode };

export function useVocabularyPage() {
  const userId = useAuthStore((state) => state.currentUser?.id);
  const learningProfile = useMemo(
    () => LearningProfileRepository.getProfile(userId || 'local-user'),
    [userId]
  );
  const vocabularyProfile = learningProfile.skills.vocabulary;
  const vocabularyLevel = getBaseCefrLevel(vocabularyProfile.cefrBand);
  const preferredDomains = useMemo(
    () => getPreferredDomains(learningProfile),
    [learningProfile]
  );

  const [data, dispatchData] = useReducer(dataReducer, {
    terms: [] as VocabularyTerm[],
    allLevelsLoaded: false,
    loadError: null as string | null,
    menuState: VocabularyMenuService.getState(),
    wordSetIds: [] as string[],
  } satisfies VocabularyDataState);

  const [ui, dispatchUI] = useReducer(uiReducer, {
    activeTab: 'New' as VocabularyMenuStatus,
    mode: 'Quiz' as VocabularySetMode,
    batchOffset: 0,
    learningDomain: 'All',
    showFilters: false,
    showAddForm: false,
    customDraft: {
      term: '',
      turkishMeaning: '',
      exampleSentence: '',
      cefrLevel: 'A1' as CefrLevel,
      domain: '',
    },
  } satisfies VocabularyUIState);

  const [search, dispatchSearch] = useReducer(searchReducer, {
    isSearchLoading: false,
    searchInput: '',
    searchQuery: '',
    searchError: null as string | null,
    hasSearched: false,
    filters: emptyFilters(),
    appliedFilters: emptyFilters(),
  } satisfies VocabularySearchState);

  const initializedSet = useRef(false);

  const { terms, allLevelsLoaded, loadError, menuState, wordSetIds } = data;
  const {
    activeTab,
    mode,
    batchOffset,
    learningDomain,
    showFilters,
    showAddForm,
    customDraft,
  } = ui;
  const {
    isSearchLoading,
    searchInput,
    searchQuery,
    searchError,
    hasSearched,
    filters,
    appliedFilters,
  } = search;

  useEffect(() => {
    let cancelled = false;
    void VocabularyRepository.getVocabularyByLevel(vocabularyLevel)
      .then((levelTerms) => {
        if (!cancelled) dispatchData({ type: 'SET_TERMS', terms: levelTerms });
      })
      .catch(() => {
        if (!cancelled) {
          dispatchData({
            type: 'SET_LOAD_ERROR',
            error: 'The canonical vocabulary repository could not be loaded.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [vocabularyLevel]);

  const loadAllLevels = useCallback(async (): Promise<VocabularyTerm[]> => {
    if (allLevelsLoaded) return terms;
    dispatchSearch({ type: 'SET_SEARCH_LOADING', loading: true });
    try {
      const levels = await Promise.all(
        CEFR_LEVELS.map((level) =>
          VocabularyRepository.getVocabularyByLevel(level)
        )
      );
      const allTerms = levels.flat();
      dispatchData({ type: 'LOAD_ALL_LEVELS', terms: allTerms });
      return allTerms;
    } finally {
      dispatchSearch({ type: 'SET_SEARCH_LOADING', loading: false });
    }
  }, [allLevelsLoaded, terms]);

  const selectSet = useCallback(
    (
      status: VocabularyMenuStatus,
      state: import('@/features/vocabulary').VocabularyMenuState,
      domain = learningDomain,
      offset = 0
    ) =>
      selectVocabularyLearningSet(terms, state, {
        cefrBand: vocabularyProfile.cefrBand,
        skillUse: 'vocabulary',
        status,
        domain: domain === 'All' ? undefined : domain,
        preferredDomains,
        offset,
      }).map((term) => term.id),
    [learningDomain, preferredDomains, terms, vocabularyProfile.cefrBand]
  );

  useEffect(() => {
    if (initializedSet.current || terms.length === 0) return;
    initializedSet.current = true;
    dispatchData({
      type: 'SET_WORD_SET_IDS',
      wordSetIds: selectSet('New', menuState),
    });
  }, [menuState, selectSet, terms.length]);

  const termsById = useMemo(
    () => new Map(terms.map((term) => [term.id, term])),
    [terms]
  );
  const wordSet = wordSetIds
    .map((id) => termsById.get(id))
    .filter((term): term is VocabularyTerm => Boolean(term));
  const dueTerms = useMemo(
    () =>
      Object.entries(menuState.progress)
        .filter(([, progress]) => isVocabularyProgressDue(progress))
        .map(([id]) => termsById.get(id))
        .filter((term): term is VocabularyTerm => Boolean(term))
        .slice(0, 10),
    [menuState, termsById]
  );
  const allSearchResults = useMemo(
    () =>
      searchVocabularyMenu(
        terms,
        searchQuery,
        menuState,
        new Date(),
        appliedFilters
      ),
    [appliedFilters, menuState, searchQuery, terms]
  );
  const searchResults = allSearchResults.slice(0, SEARCH_RESULT_LIMIT);

  const filterOptions = (field: keyof VocabularySearchFilters): string[] => {
    const values =
      field === 'skillUse'
        ? terms.flatMap((term) => term.skillUse)
        : terms.map((term) =>
            String(term[field as keyof VocabularyTerm] ?? '')
          );
    return ['All', ...new Set(values.filter(Boolean))].sort();
  };

  const chooseTab = (status: VocabularyMenuStatus) => {
    dispatchUI({ type: 'CHOOSE_TAB', status });
    dispatchData({
      type: 'SET_WORD_SET_IDS',
      wordSetIds: selectSet(status, menuState),
    });
  };

  const reviewWord = (term: VocabularyTerm, isCorrect: boolean) => {
    const prevStatus =
      VocabularyMenuService.getState().progress[term.id]?.status ?? 'New';

    VocabularyMenuService.reviewWord(
      term.id,
      isCorrect,
      new Date(),
      repairVocabularyText(term.term)
    );
    if (isCorrect) playSound('ding');
    useLearningStore
      .getState()
      .completeGenericPractice('Vocabulary', isCorrect ? 100 : 0, 0.5);
    dispatchData({
      type: 'SET_MENU_STATE',
      menuState: VocabularyMenuService.getState(),
    });

    setTimeout(() => {
      const currentState = VocabularyMenuService.getState();
      const nextStatus =
        isCorrect && prevStatus === 'New' ? 'Learned' : activeTab;
      const nextSet = selectVocabularyLearningSet(terms, currentState, {
        cefrBand: vocabularyProfile?.cefrBand ?? 'A1',
        skillUse: 'vocabulary',
        status: nextStatus,
      });
      if (nextSet.length > 0 && nextSet[0].id !== term.id) {
        dispatchData({ type: 'SET_MENU_STATE', menuState: currentState });
      }
    }, 500);
    ProductAnalyticsService.track(
      'vocabulary_review_completed',
      '/vocabulary',
      {
        metadata: {
          skill: 'vocabulary',
          missionId: term.id,
          source: 'user',
        },
      }
    );
    ProductAnalyticsService.trackOnce('first_task_completed', '/vocabulary', {
      skill: 'vocabulary',
      source: 'user',
    });
  };

  const learnWord = (term: VocabularyTerm) => {
    VocabularyMenuService.startLearning(term.id, new Date());
    playSound('success');
    useLearningStore.getState().completeGenericPractice('Vocabulary', 100, 0.5);
    dispatchData({
      type: 'SET_MENU_STATE',
      menuState: VocabularyMenuService.getState(),
    });
    ProductAnalyticsService.track(
      'vocabulary_review_completed',
      '/vocabulary',
      {
        metadata: {
          skill: 'vocabulary',
          missionId: term.id,
          source: 'user',
        },
      }
    );
  };

  const startVocabularySession = useCallback(() => {
    ProductAnalyticsService.track('vocabulary_review_started', '/vocabulary', {
      metadata: { skill: 'vocabulary', source: 'user' },
    });
    ProductAnalyticsService.trackOnce('first_task_started', '/vocabulary', {
      skill: 'vocabulary',
      source: 'user',
    });
    const newWordIds = selectSet('New', menuState).slice(0, 8);
    const reviewIds = [
      ...dueTerms.map((term) => term.id),
      ...selectSet('Learned', menuState),
    ]
      .filter((id, index, values) => values.indexOf(id) === index)
      .slice(0, 2);
    dispatchUI({ type: 'START_SESSION' });
    dispatchData({
      type: 'SET_WORD_SET_IDS',
      wordSetIds: [...newWordIds, ...reviewIds].slice(0, 10),
    });
  }, [menuState, selectSet, dueTerms]);

  const exportCSV = () => {
    const header = 'term,turkishMeaning,cefrLevel,domain,status\n';
    const rows = wordSet
      .map((term) => {
        const progress = menuState.progress[term.id];
        const status = progress?.status ?? 'New';
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        return [
          escape(term.term),
          escape(term.turkishMeaning),
          term.cefrLevel,
          escape(term.domain),
          status,
        ].join(',');
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vocabulary-${activeTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadNextBatch = () => {
    const nextOffset = batchOffset + 9;
    const nextIds = selectSet(activeTab, menuState, learningDomain, nextOffset);
    const resolvedOffset = nextIds.length > 0 ? nextOffset : 0;
    dispatchUI({ type: 'SET_BATCH_OFFSET', offset: resolvedOffset });
    dispatchData({
      type: 'SET_WORD_SET_IDS',
      wordSetIds:
        nextIds.length > 0
          ? nextIds
          : selectSet(activeTab, menuState, learningDomain, 0),
    });
  };

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    const query = searchInput.trim();
    const hasFilter = Object.values(filters).some(
      (value) => value && value !== 'All'
    );
    if (!query && !hasFilter) {
      dispatchSearch({
        type: 'SET_SEARCH_ERROR',
        error: 'Enter a search term or select an advanced filter.',
      });
      return;
    }
    dispatchSearch({ type: 'RUN_SEARCH', query });
    dispatchUI({ type: 'SET_SHOW_ADD_FORM', show: false });
    if (!allLevelsLoaded) {
      try {
        await loadAllLevels();
      } catch {
        dispatchSearch({
          type: 'SET_SEARCH_ERROR',
          error: 'The full vocabulary index could not be loaded.',
        });
      }
    }
  };

  const addCustomWord = (event: FormEvent) => {
    event.preventDefault();
    VocabularyMenuService.addToMyVocabulary(customDraft);
    dispatchData({
      type: 'SET_MENU_STATE',
      menuState: VocabularyMenuService.getState(),
    });
    dispatchUI({ type: 'SET_SHOW_ADD_FORM', show: false });
  };

  useEffect(() => {
    const handleStartSession = () => startVocabularySession();
    window.addEventListener('startVocabularySession', handleStartSession);
    return () =>
      window.removeEventListener('startVocabularySession', handleStartSession);
  }, [startVocabularySession]);

  useEffect(() => {
    const handleAddCustomWord = () => {
      dispatchUI({ type: 'SET_SHOW_ADD_FORM', show: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('addCustomWord', handleAddCustomWord);
    return () =>
      window.removeEventListener('addCustomWord', handleAddCustomWord);
  }, []);

  return {
    vocabularyLevel,
    allLevelsLoaded,
    loadError,
    terms,
    menuState,
    wordSet,
    searchResults,
    allSearchResults,
    activeTab,
    mode,
    learningDomain,
    showFilters,
    showAddForm,
    customDraft,
    isSearchLoading,
    searchInput,
    searchQuery,
    searchError,
    hasSearched,
    filters,
    vocabularyProfile,
    chooseTab,
    reviewWord,
    learnWord,
    exportCSV,
    loadNextBatch,
    runSearch,
    addCustomWord,
    filterOptions,
    dispatchUI,
    dispatchSearch,
    dispatchData,
    selectSet,
  };
}
