import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  useState,
} from 'react';
import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Filter,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
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
  getVocabularyReviewReason,
  isVocabularyProgressDue,
  repairVocabularyText,
  searchVocabularyMenu,
  selectVocabularyLearningSet,
  VocabularyMenuService,
  VocabularyRepository,
  type VocabularyMenuProgress,
  type VocabularyMenuState,
  type VocabularyMenuStatus,
  type VocabularySearchFilters,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';

import { SectionCard } from '@/shared/components/SectionCard';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';
import {
  dataReducer,
  uiReducer,
  searchReducer,
  type VocabularyDataState,
  type VocabularyUIState,
  type VocabularySearchState,
} from './VocabularyPage/VocabularyPageReducer';
import { emptyFilters } from './VocabularyPage/VocabularyPageUtils';

const TABS: VocabularyMenuStatus[] = ['New', 'Learning', 'Mastered'];
type VocabularySetMode = 'Quiz' | 'Review' | 'View';
const TAB_LABELS: Record<VocabularyMenuStatus, string> = {
  New: 'New',
  Learning: 'Learned',
  Mastered: 'Mastered',
};
const SEARCH_RESULT_LIMIT = 30;

const normalizeAnswer = (value: string): string =>
  repairVocabularyText(value)
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

interface WordCardProps {
  term: VocabularyTerm;
  progress?: VocabularyMenuProgress;
  mode: VocabularySetMode;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onLearn?: (term: VocabularyTerm) => void;
}

const WordCard = ({
  term,
  progress,
  mode,
  onReview,
  onLearn,
}: WordCardProps) => {
  const language = useLocalizationStore((state) => state.language);
  const [answer, setAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [knowThisCheck, setKnowThisCheck] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const status = progress?.status ?? 'New';
  const showAnswer = mode !== 'Quiz' || quizResult !== null;

  const submitQuiz = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim() || quizResult !== null) return;
    const expected = normalizeAnswer(term.turkishMeaning);
    const response = normalizeAnswer(answer);
    const correct = expected
      .split('/')
      .map((item) => item.trim())
      .some((item) => response === item || expected === response);
    setQuizResult(correct);
    onReview(term, correct);
  };

  return (
    <article
      data-testid="vocabulary-word-card"
      className="flex h-full flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-foreground">
            {repairVocabularyText(term.term)}
          </h3>
          {showAnswer && (
            <p className="mt-1 font-semibold text-primary">
              {repairVocabularyText(term.turkishMeaning)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
            {term.cefrLevel}
          </span>
          <span className="rounded-full border border-border-soft bg-surface-hover px-2 py-1 text-[10px] font-bold text-muted-copy">
            {status}
          </span>
          {progress?.isWeak && (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
              Weak
            </span>
          )}
          {progress?.isForgotten && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              Forgotten
            </span>
          )}
        </div>
      </div>

      {showAnswer && (
        <div className="mt-4 flex-1 space-y-2 text-sm leading-6 text-muted-copy">
          <p>{repairVocabularyText(term.exampleSentence)}</p>
          <p className="text-foreground0">
            {repairVocabularyText(term.turkishExample)}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-3 text-xs text-foreground0">
        <span className="font-semibold capitalize">
          Domain: {repairVocabularyText(term.domain).replace(/-/g, ' ')}
        </span>
        <span>{status === 'New' ? 'Ready to learn' : status}</span>
      </div>

      {mode === 'Review' && progress && (
        <div className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <span className="font-black">Why review now: </span>
          {getVocabularyReviewReason(progress)}
        </div>
      )}

      <div className="mt-3 rounded-lg border border-border-soft bg-surface-hover p-3 text-xs text-muted-copy">
        <button
          type="button"
          onClick={() => setShowDetails((value) => !value)}
          aria-expanded={showDetails}
          className="flex w-full items-center justify-between font-bold text-foreground"
        >
          Word details
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
        </button>
        {showDetails && (
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-bold">Part of speech</dt>
              <dd>{term.partOfSpeech}</dd>
            </div>
            <div>
              <dt className="font-bold">Content domain</dt>
              <dd>{term.contentDomain}</dd>
            </div>
            <div>
              <dt className="font-bold">Life context</dt>
              <dd>{term.lifeContext}</dd>
            </div>
            <div>
              <dt className="font-bold">Register</dt>
              <dd>{term.register}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Primary use case</dt>
              <dd>{term.primaryUseCase}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Grammar fits</dt>
              <dd>{term.grammarFits.join(', ') || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Skill use</dt>
              <dd>{term.skillUse.join(', ')}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Common mistakes</dt>
              <dd>{repairVocabularyText(term.commonMistakes)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold">Related terms</dt>
              <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
            </div>
          </dl>
        )}
      </div>

      {mode === 'Quiz' && status === 'New' && (
        <form onSubmit={submitQuiz} className="mt-4 space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onLearn?.(term)}
          >
            <CheckCircle2 className="h-4 w-4" /> Learn this word
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setKnowThisCheck(true)}
          >
            I Know This — Take Mini Quiz
          </Button>
          {knowThisCheck && (
            <p className="text-xs font-semibold text-primary">
              Use the mini quiz if you want to check recall before saving.
            </p>
          )}
          <label className="text-xs font-bold text-foreground">
            Turkish meaning
            <input
              value={answer}
              disabled={quizResult !== null}
              onChange={(event) => setAnswer(event.target.value)}
              className="mt-1 min-h-10 w-full rounded-lg border border-border-soft px-3 font-normal"
            />
          </label>
          <Button type="submit" className="w-full" disabled={!answer.trim()}>
            Check answer
          </Button>
          {quizResult !== null && (
            <p
              className={`text-sm font-bold ${quizResult ? 'text-emerald-700' : 'text-rose-700'}`}
            >
              {quizResult ? 'Correct review recorded.' : 'Added to Weak Words.'}
            </p>
          )}
        </form>
      )}

      {mode === 'Review' && status !== 'Mastered' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="success"
            className="px-3"
            aria-label={`Mark ${term.term} remembered`}
            onClick={() => onReview(term, true)}
          >
            <CheckCircle2 className="h-4 w-4" /> Remembered
          </Button>
          <Button
            variant="danger"
            className="px-3"
            aria-label={`Review ${term.term} again`}
            onClick={() => onReview(term, false)}
          >
            <XCircle className="h-4 w-4" /> Review again
          </Button>
        </div>
      )}

      {mode === 'View' && status === 'New' && onLearn && (
        <Button className="mt-4 w-full" onClick={() => onLearn(term)}>
          <Plus className="h-4 w-4" />
          {LocalizationService.translate('vocabulary.saveLearned', language)}
        </Button>
      )}
    </article>
  );
};

const VocabularyPage = () => {
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

  // Data state via useReducer
  const [data, dispatchData] = useReducer(dataReducer, {
    terms: [] as VocabularyTerm[],
    allLevelsLoaded: false,
    loadError: null as string | null,
    menuState: VocabularyMenuService.getState(),
    wordSetIds: [] as string[],
  } satisfies VocabularyDataState);

  // UI state via useReducer
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

  // Search state via useReducer
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

  // Convenience aliases for JSX compatibility
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
      state: VocabularyMenuState,
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

  const startVocabularySession = () => {
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
      ...selectSet('Learning', menuState),
    ]
      .filter((id, index, values) => values.indexOf(id) === index)
      .slice(0, 2);
    dispatchUI({ type: 'START_SESSION' });
    dispatchData({
      type: 'SET_WORD_SET_IDS',
      wordSetIds: [...newWordIds, ...reviewIds].slice(0, 10),
    });
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

  const resetSearch = () => {
    dispatchSearch({ type: 'RESET_SEARCH' });
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

  return (
    <div className="animate-in fade-in duration-300 relative">
      {/* LEVEL 1: Fixed Title */}
      <div className="sticky top-0 z-40 bg-background pt-4 pb-2 border-b border-border-soft">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Vocabulary
          </h1>
        </div>
      </div>

      {/* LEVEL 2: Sticky Search + Tabs */}
      <div className="sticky top-[52px] z-30 bg-background pt-3 pb-3 border-b border-border-soft space-y-3">
        <form onSubmit={runSearch} className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={searchInput}
              onChange={(event) =>
                dispatchSearch({
                  type: 'SET_SEARCH_INPUT',
                  input: event.target.value,
                })
              }
              className="min-h-11 flex-1 rounded-[10px] border border-border-soft bg-surface px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Search by English, Turkish, Domain..."
              aria-label="Search vocabulary"
            />
            <Button type="submit" disabled={isSearchLoading}>
              <Search className="h-4 w-4" /> Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                dispatchUI({ type: 'TOGGLE_FILTERS' });
                if (!allLevelsLoaded) void loadAllLevels();
              }}
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button type="button" variant="ghost" onClick={resetSearch}>
              Reset
            </Button>
          </div>
          {showFilters && (
            <div className="grid gap-3 rounded-xl border border-border-soft bg-surface-hover p-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ['cefr', 'CEFR'],
                  ['domain', 'Domain'],
                  ['contentDomain', 'Content domain'],
                  ['lifeContext', 'Life context'],
                  ['partOfSpeech', 'Part of speech'],
                  ['skillUse', 'Skill use'],
                  ['status', 'Status'],
                ] as Array<[keyof VocabularySearchFilters, string]>
              ).map(([field, label]) => (
                <label
                  key={field}
                  className="text-xs font-bold text-foreground"
                >
                  {label}
                  <select
                    aria-label={`Filter by ${label}`}
                    value={filters[field]}
                    onChange={(event) =>
                      dispatchSearch({
                        type: 'COMMIT_FILTERS',
                        filters: { ...filters, [field]: event.target.value },
                      })
                    }
                    className="mt-1 min-h-10 w-full rounded-lg border border-border-soft bg-surface px-2 font-normal focus:border-primary outline-none"
                  >
                    {(field === 'status'
                      ? [
                          'All',
                          'New',
                          'Learning',
                          'Mastered',
                          'Weak',
                          'Forgotten',
                          'Due Today',
                        ]
                      : filterOptions(field)
                    ).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          {searchError && (
            <p className="text-sm font-semibold text-rose-700">{searchError}</p>
          )}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy">
            {allLevelsLoaded
              ? 'All 5,000 canonical terms are available for this search.'
              : `${vocabularyLevel} learning terms are loaded. Full search loads the remaining levels only when requested.`}
          </p>
          {isSearchLoading && (
            <p role="status" className="text-xs font-bold text-primary">
              Checking all 5,000 canonical terms before enabling a custom word…
            </p>
          )}
        </form>

        <div
          role="tablist"
          aria-label="Vocabulary status"
          className="grid grid-cols-3 gap-2 rounded-xl border border-border-soft bg-surface p-2 shadow-sm"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={activeTab === tab}
              onClick={() => chooseTab(tab)}
              className={`min-h-10 rounded-[8px] px-4 py-2 text-sm font-bold transition-all ${activeTab === tab ? 'bg-foreground text-background shadow-md' : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'}`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Content area - scrolls under sticky headers */}
      <div className="pt-4 space-y-4 pb-20">
        {hasSearched && searchResults.length > 0 && (
          <SectionCard
            title="Search Results"
            subtitle={`Showing ${searchResults.length} of ${allSearchResults.length} matches`}
            icon={Search}
          >
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {searchResults.map((term) => (
                <WordCard
                  key={term.id}
                  term={term}
                  progress={menuState.progress[term.id]}
                  mode="View"
                  onReview={reviewWord}
                  onLearn={learnWord}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {hasSearched && searchResults.length === 0 && !isSearchLoading && (
          <SectionCard
            title="No canonical match"
            subtitle={
              searchQuery
                ? `${searchQuery} is not in the canonical repository`
                : 'No terms match the selected filters'
            }
            icon={Plus}
          >
            {searchQuery && !showAddForm && (
              <Button
                onClick={() => {
                  dispatchUI({
                    type: 'SET_CUSTOM_DRAFT',
                    draft: { ...customDraft, term: searchQuery },
                  });
                  dispatchUI({ type: 'SET_SHOW_ADD_FORM', show: true });
                }}
              >
                <Plus className="h-4 w-4" /> Add to My Vocabulary
              </Button>
            )}
            {showAddForm && (
              <form
                aria-label="Add to My Vocabulary"
                onSubmit={addCustomWord}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm font-semibold">
                  English term
                  <input
                    required
                    value={customDraft.term}
                    onChange={(event) =>
                      dispatchUI({
                        type: 'SET_CUSTOM_DRAFT',
                        draft: { ...customDraft, term: event.target.value },
                      })
                    }
                    className="mt-1 min-h-11 w-full rounded-lg border border-border-soft px-3 font-normal"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Turkish meaning
                  <input
                    required
                    value={customDraft.turkishMeaning}
                    onChange={(event) =>
                      dispatchUI({
                        type: 'SET_CUSTOM_DRAFT',
                        draft: {
                          ...customDraft,
                          turkishMeaning: event.target.value,
                        },
                      })
                    }
                    className="mt-1 min-h-11 w-full rounded-lg border border-border-soft px-3 font-normal"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Example
                  <input
                    required
                    value={customDraft.exampleSentence}
                    onChange={(event) =>
                      dispatchUI({
                        type: 'SET_CUSTOM_DRAFT',
                        draft: {
                          ...customDraft,
                          exampleSentence: event.target.value,
                        },
                      })
                    }
                    className="mt-1 min-h-11 w-full rounded-lg border border-border-soft px-3 font-normal"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-semibold">
                    CEFR
                    <select
                      value={customDraft.cefrLevel}
                      onChange={(event) =>
                        dispatchUI({
                          type: 'SET_CUSTOM_DRAFT',
                          draft: {
                            ...customDraft,
                            cefrLevel: event.target.value as CefrLevel,
                          },
                        })
                      }
                      className="mt-1 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 font-normal"
                    >
                      {CEFR_LEVELS.map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Domain
                    <input
                      required
                      value={customDraft.domain}
                      onChange={(event) =>
                        dispatchUI({
                          type: 'SET_CUSTOM_DRAFT',
                          draft: { ...customDraft, domain: event.target.value },
                        })
                      }
                      className="mt-1 min-h-11 w-full rounded-lg border border-border-soft px-3 font-normal"
                    />
                  </label>
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <Button type="submit">
                    <Plus className="h-4 w-4" /> Save to My Vocabulary
                  </Button>
                  <span className="text-xs font-bold text-foreground0">
                    AI Assist Coming Soon
                  </span>
                </div>
              </form>
            )}
          </SectionCard>
        )}

        <SectionCard
          title={`${TAB_LABELS[activeTab]} 9-word set`}
          subtitle={`Selected by ${vocabularyProfile.cefrBand}, vocabulary skill use, memory state, and canonical order`}
          icon={BookMarked}
          headerActions={
            <div className="flex flex-wrap items-center gap-1">
              <select
                aria-label="Learning set domain"
                value={learningDomain}
                onChange={(event) => {
                  const nextDomain = event.target.value;
                  dispatchUI({
                    type: 'SET_LEARNING_DOMAIN',
                    domain: nextDomain,
                  });
                  dispatchData({
                    type: 'SET_WORD_SET_IDS',
                    wordSetIds: selectSet(activeTab, menuState, nextDomain),
                  });
                }}
                className="min-h-8 rounded-lg border border-border-soft bg-surface px-2 text-xs font-semibold text-foreground"
              >
                {filterOptions('domain').map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          }
        >
          {loadError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {loadError}
            </p>
          )}
          {!loadError && terms.length === 0 && (
            <p className="text-sm text-foreground0">
              Loading canonical words...
            </p>
          )}
          {terms.length > 0 && wordSet.length === 0 && (
            <p className="rounded-xl border border-dashed border-border-soft bg-surface-hover p-8 text-center text-sm text-muted-copy">
              No words currently have {activeTab.toLowerCase()} status. Select
              New to begin a ten-word set.
            </p>
          )}
          {wordSet.length > 0 && (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {wordSet.map((term) => (
                  <WordCard
                    key={term.id}
                    term={term}
                    progress={menuState.progress[term.id]}
                    mode={mode}
                    onReview={reviewWord}
                    onLearn={learnWord}
                  />
                ))}
              </div>
              <div className="flex justify-end border-t border-border-soft pt-4">
                <Button variant="outline" onClick={loadNextBatch}>
                  Next 9-word batch
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default VocabularyPage;
