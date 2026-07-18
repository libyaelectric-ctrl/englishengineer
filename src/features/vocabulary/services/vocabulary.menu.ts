import { storage } from '@/shared/storage';
import type { CefrLevel } from '@/features/level-system/level-system.types';
import { LearningIntelligenceService } from '@/features/learning-intelligence/learning-intelligence.service';
import { eventBus } from '@/core/events/event-bus';
import type { VocabularyTerm } from '../types/vocabulary.types';

export const CANONICAL_VOCABULARY_TOTAL = 5000;

export type VocabularyMenuStatus = 'New' | 'Learning' | 'Mastered';

export interface VocabularyMenuProgress {
  correctReviews: number;
  wrongReviews: number;
  status: VocabularyMenuStatus;
  isWeak: boolean;
  isForgotten: boolean;
  lastReviewed: string;
  nextReviewDate: string;
}

export interface MyVocabularyWord {
  id: string;
  term: string;
  turkishMeaning: string;
  exampleSentence: string;
  cefrLevel: CefrLevel;
  domain: string;
  dateAdded: string;
  archivedAt: string | null;
}

export interface VocabularyMenuState {
  progress: Record<string, VocabularyMenuProgress>;
  myVocabulary: MyVocabularyWord[];
}

export interface VocabularyMenuSummary {
  total: number;
  newWords: number;
  learning: number;
  mastered: number;
  weak: number;
  forgotten: number;
  dueToday: number;
}

export interface AddMyVocabularyInput {
  term: string;
  turkishMeaning: string;
  exampleSentence: string;
  cefrLevel: CefrLevel;
  domain: string;
}

export interface VocabularySearchFilters {
  cefr?: string;
  domain?: string;
  contentDomain?: string;
  lifeContext?: string;
  partOfSpeech?: string;
  skillUse?: string;
  status?: string;
}

const STORAGE_KEY = 'EngVox_vocabulary_menu';
const DAY_MS = 24 * 60 * 60 * 1000;

const emptyState = (): VocabularyMenuState => ({
  progress: {},
  myVocabulary: [],
});

export const repairVocabularyText = (value: string): string => {
  const replacements: Array<[string, string]> = [
    ['\u00c3\u00bc', '\u00fc'],
    ['\u00c3\u0153', '\u00dc'],
    ['\u00c3\u00b6', '\u00f6'],
    ['\u00c3\u2013', '\u00d6'],
    ['\u00c3\u00a7', '\u00e7'],
    ['\u00c3\u2021', '\u00c7'],
    ['\u00c4\u00b1', '\u0131'],
    ['\u00c4\u00b0', '\u0130'],
    ['\u00c5\u0178', '\u015f'],
    ['\u00c5\u017d', '\u015e'],
    ['\u00c4\u0178', '\u011f'],
    ['\u00c4\u017d', '\u011e'],
    ['\u00e2\u20ac\u0153', '\u201c'],
    ['\u00e2\u20ac\u009d', '\u201d'],
    ['\u00e2\u20ac\u2122', '\u2019'],
    ['\u00e2\u20ac\u201c', '\u2013'],
    ['\u00e2\u20ac\u201d', '\u2014'],
  ];

  return [0, 1].reduce(
    (text) =>
      replacements.reduce(
        (current, [encoded, decoded]) => current.split(encoded).join(decoded),
        text
      ),
    value
  );
};

const normalize = (value: string): string =>
  repairVocabularyText(value)
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

const addDays = (now: Date, days: number): string =>
  new Date(now.getTime() + days * DAY_MS).toISOString();

export const isVocabularyProgressDue = (
  progress: VocabularyMenuProgress,
  now = new Date()
): boolean => new Date(progress.nextReviewDate).getTime() <= now.getTime();

export const isVocabularyForgotten = (
  progress: VocabularyMenuProgress,
  now = new Date()
): boolean => {
  if (progress.isForgotten) return true;
  if (!progress.lastReviewed) return false;
  return (
    now.getTime() - new Date(progress.lastReviewed).getTime() >= 60 * DAY_MS
  );
};

export const getVocabularyReviewReason = (
  progress: VocabularyMenuProgress,
  now = new Date()
): string => {
  if (isVocabularyForgotten(progress, now)) {
    return 'Recall has faded after repeated errors or a long gap, so this word needs recovery practice.';
  }
  if (progress.isWeak || progress.wrongReviews > progress.correctReviews) {
    return 'Recent answers show weak recall, so this word stays near the front of your review queue.';
  }
  if (isVocabularyProgressDue(progress, now)) {
    return progress.status === 'Mastered'
      ? 'A maintenance review is due to keep this mastered word available in long-term memory.'
      : 'The current spaced-review interval has ended, so this word is ready for another recall check.';
  }
  if (progress.status === 'Learning') {
    return 'This word is still building reliable recall before it can move to Mastered.';
  }
  return 'This word is available for an optional confidence check.';
};

const getDefaultProgress = (): VocabularyMenuProgress => ({
  correctReviews: 0,
  wrongReviews: 0,
  status: 'New',
  isWeak: false,
  isForgotten: false,
  lastReviewed: '',
  nextReviewDate: '',
});

const normalizeState = (
  state: VocabularyMenuState | null
): VocabularyMenuState => {
  if (!state || typeof state !== 'object') return emptyState();
  const rawProgress =
    state.progress && typeof state.progress === 'object' ? state.progress : {};
  return {
    progress: Object.fromEntries(
      Object.entries(rawProgress).map(([id, progress]) => [
        id,
        {
          ...getDefaultProgress(),
          ...progress,
          wrongReviews: progress.wrongReviews ?? 0,
          isForgotten: progress.isForgotten ?? false,
        },
      ])
    ),
    myVocabulary: Array.isArray(state.myVocabulary)
      ? state.myVocabulary.map((word) => ({
          ...word,
          archivedAt: word.archivedAt ?? null,
        }))
      : [],
  };
};

export const getVocabularyMenuStatus = (
  wordId: string,
  state: VocabularyMenuState
): VocabularyMenuStatus => state.progress[wordId]?.status ?? 'New';

const buildSearchableStatuses = (
  progress: VocabularyMenuProgress | undefined,
  status: VocabularyMenuStatus,
  now: Date
): string[] => [
  status,
  progress?.isWeak ? 'Weak' : '',
  progress && isVocabularyForgotten(progress, now) ? 'Forgotten' : '',
  progress && isVocabularyProgressDue(progress, now) ? 'Due Today' : '',
];

const matchesQuery = (
  term: VocabularyTerm,
  target: string,
  searchableStatuses: string[]
): boolean =>
  !target ||
  [
    term.term,
    term.turkishMeaning,
    term.cefrLevel,
    term.domain,
    term.partOfSpeech,
    ...term.skillUse,
    ...searchableStatuses,
  ].some((value) => normalize(value).includes(target));

const matchesFilter = (value: string, filter?: string): boolean =>
  !filter || filter === 'All' || normalize(value) === normalize(filter);

const matchesAllFilters = (
  term: VocabularyTerm,
  filters: VocabularySearchFilters,
  searchableStatuses: string[]
): boolean =>
  matchesFilter(term.cefrLevel, filters.cefr) &&
  matchesFilter(term.domain, filters.domain) &&
  matchesFilter(term.contentDomain, filters.contentDomain) &&
  matchesFilter(term.lifeContext, filters.lifeContext) &&
  matchesFilter(term.partOfSpeech, filters.partOfSpeech) &&
  (!filters.skillUse ||
    filters.skillUse === 'All' ||
    term.skillUse.some(
      (skill) => normalize(skill) === normalize(filters.skillUse ?? '')
    )) &&
  (!filters.status ||
    filters.status === 'All' ||
    searchableStatuses.some(
      (item) => normalize(item) === normalize(filters.status ?? '')
    ));

export const searchVocabularyMenu = (
  terms: VocabularyTerm[],
  query: string,
  state: VocabularyMenuState,
  now = new Date(),
  filters: VocabularySearchFilters = {}
): VocabularyTerm[] => {
  const target = normalize(query);
  const hasFilters = Object.values(filters).some(
    (value) => value && value !== 'All'
  );
  if (!target && !hasFilters) return [];

  return terms.filter((term) => {
    const progress = state.progress[term.id];
    const status = progress?.status ?? 'New';
    const searchableStatuses = buildSearchableStatuses(progress, status, now);
    return (
      matchesQuery(term, target, searchableStatuses) &&
      matchesAllFilters(term, filters, searchableStatuses)
    );
  });
};

export const VocabularyMenuService = {
  getState(): VocabularyMenuState {
    return normalizeState(storage.get<VocabularyMenuState>(STORAGE_KEY));
  },

  saveState(state: VocabularyMenuState): void {
    storage.set(STORAGE_KEY, state);
  },

  getSummary(
    state?: VocabularyMenuState,
    total = CANONICAL_VOCABULARY_TOTAL,
    now = new Date()
  ): VocabularyMenuSummary {
    const progress = Object.values((state ?? this.getState()).progress);
    const learning = progress.filter(
      (word) => word.status === 'Learning'
    ).length;
    const mastered = progress.filter(
      (word) => word.status === 'Mastered'
    ).length;

    return {
      total,
      newWords: Math.max(0, total - learning - mastered),
      learning,
      mastered,
      weak: progress.filter((word) => word.isWeak).length,
      forgotten: progress.filter((word) => isVocabularyForgotten(word, now))
        .length,
      dueToday: progress.filter((word) => isVocabularyProgressDue(word, now))
        .length,
    };
  },

  startLearning(wordId: string, now = new Date()): VocabularyMenuProgress {
    const state = this.getState();
    const current = state.progress[wordId] ?? getDefaultProgress();
    const next: VocabularyMenuProgress = {
      ...current,
      status: 'Learning',
      lastReviewed: now.toISOString(),
      nextReviewDate: now.toISOString(),
    };
    this.saveState({
      ...state,
      progress: { ...state.progress, [wordId]: next },
    });
    return next;
  },

  reviewWord(
    wordId: string,
    isCorrect: boolean,
    now = new Date(),
    wordLabel = wordId
  ): VocabularyMenuProgress {
    const state = this.getState();
    const current = state.progress[wordId] ?? getDefaultProgress();
    let next: VocabularyMenuProgress;

    if (isCorrect) {
      const correctReviews = current.correctReviews + 1;
      const isMastered = correctReviews >= 3;
      next = {
        correctReviews,
        wrongReviews: current.wrongReviews,
        status: isMastered ? 'Mastered' : 'Learning',
        isWeak: isMastered ? false : current.isWeak,
        isForgotten: isMastered ? false : current.isForgotten,
        lastReviewed: now.toISOString(),
        nextReviewDate: addDays(
          now,
          isMastered ? 7 : correctReviews === 2 ? 3 : 1
        ),
      };
      // Mastered'a geçince event bus'a bildir (havuza yazma tetiklenir)
      if (isMastered && current.status !== 'Mastered') {
        eventBus.publish({
          id: `vocab-mastered-${wordId}-${Date.now()}`,
          type: 'vocabulary:mastered',
          timestamp: now.toISOString(),
          payload: { termId: wordId, masteredAt: now.toISOString() },
        });
      }
    } else {
      const wrongReviews = current.wrongReviews + 1;
      next = {
        correctReviews: Math.min(current.correctReviews, 2),
        wrongReviews,
        status: 'Learning',
        isWeak: true,
        isForgotten: current.status === 'Mastered' || wrongReviews >= 3,
        lastReviewed: now.toISOString(),
        nextReviewDate: now.toISOString(),
      };
      LearningIntelligenceService.addMistake(
        'repeated vocabulary gap',
        wordLabel,
        'Review the Turkish meaning and use the word in one controlled sentence.',
        now
      );
    }

    this.saveState({
      ...state,
      progress: { ...state.progress, [wordId]: next },
    });
    return next;
  },

  addToMyVocabulary(
    input: AddMyVocabularyInput,
    now = new Date()
  ): MyVocabularyWord {
    const state = this.getState();
    const existing = state.myVocabulary.find(
      (word) => normalize(word.term) === normalize(input.term)
    );
    if (existing) return existing;

    const slug = normalize(input.term).replace(/[^a-z0-9]+/g, '_');
    const word: MyVocabularyWord = {
      id: `my_vocab_${slug || 'word'}_${now.getTime()}`,
      term: input.term.trim(),
      turkishMeaning: input.turkishMeaning.trim(),
      exampleSentence: input.exampleSentence.trim(),
      cefrLevel: input.cefrLevel,
      domain: input.domain.trim(),
      dateAdded: now.toISOString(),
      archivedAt: null,
    };

    this.saveState({
      ...state,
      myVocabulary: [word, ...state.myVocabulary],
    });
    return word;
  },

  archiveMyVocabulary(id: string, now = new Date()): void {
    const state = this.getState();
    this.saveState({
      ...state,
      myVocabulary: state.myVocabulary.map((word) =>
        word.id === id ? { ...word, archivedAt: now.toISOString() } : word
      ),
    });
  },

  restoreMyVocabulary(id: string): void {
    const state = this.getState();
    this.saveState({
      ...state,
      myVocabulary: state.myVocabulary.map((word) =>
        word.id === id ? { ...word, archivedAt: null } : word
      ),
    });
  },

  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
