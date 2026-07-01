import { storage } from '@/shared/storage';
import { useLearningStore } from '@/core/learning';
import { VOCABULARY_ENTRIES } from './vocabulary.data';
import { VocabularyEvaluator } from './vocabulary.evaluator';
import {
  getPreviousDateKey,
  getTodayDateKey,
  isDueForReview,
  sortByNextReview,
} from './vocabulary.helpers';
import {
  createInitialReviewState,
  updateSm2ReviewState,
} from './vocabulary.spaced-repetition';
import {
  VocabularyAnswer,
  VocabularyEntry,
  VocabularyEvaluationResult,
  VocabularyHistoryEntry,
  VocabularyState,
  VocabularySummary,
} from './vocabulary.types';
import { VocabularyMemoryService } from './vocabulary.memory';
import { VocabularyMenuService } from './vocabulary.menu';

const STORAGE_KEY = 'engineeros_vocabulary_state';

const DEFAULT_STATE: VocabularyState = {
  completedWords: {},
  reviewStates: {},
  discoveredWords: [],
  history: [],
  streak: 0,
  lastActivityDate: null,
};

const VOCABULARY_ACHIEVEMENTS = [
  { id: 'ach_vocab_first_word', threshold: 1 },
  { id: 'ach_vocab_100_words', threshold: 100 },
  { id: 'ach_vocab_500_words', threshold: 500 },
  { id: 'ach_vocab_master', threshold: 750 },
];

export const VocabularyService = {
  getState(): VocabularyState {
    const data = storage.get<VocabularyState>(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...data,
      completedWords: data.completedWords || {},
      reviewStates: data.reviewStates || {},
      discoveredWords: data.discoveredWords || [],
      history: data.history || [],
    };
  },

  saveState(state: VocabularyState): void {
    storage.set(STORAGE_KEY, state);
  },

  getEntries(): VocabularyEntry[] {
    return VOCABULARY_ENTRIES;
  },

  getEntryById(id: string): VocabularyEntry | undefined {
    return VOCABULARY_ENTRIES.find((entry) => entry.id === id);
  },

  getDueEntries(
    limit = 12,
    allowedEntries: VocabularyEntry[] = VOCABULARY_ENTRIES
  ): VocabularyEntry[] {
    const state = this.getState();
    const now = new Date();
    const allowedIds = new Set(allowedEntries.map((entry) => entry.id));
    const dueIds = Object.values(state.reviewStates)
      .filter(
        (reviewState) =>
          allowedIds.has(reviewState.wordId) && isDueForReview(reviewState, now)
      )
      .sort(sortByNextReview)
      .map((reviewState) => reviewState.wordId);

    const seededIds =
      dueIds.length > 0
        ? dueIds
        : allowedEntries.slice(0, limit).map((entry) => entry.id);

    return seededIds
      .map((id) => this.getEntryById(id))
      .filter((entry): entry is VocabularyEntry => Boolean(entry))
      .slice(0, limit);
  },

  submitReview(answers: VocabularyAnswer[]): VocabularyEvaluationResult {
    const state = this.getState();
    const reviewedAt = new Date();

    answers.forEach((answer) => {
      const previous =
        state.reviewStates[answer.wordId] ||
        createInitialReviewState(answer.wordId);
      const quality = answer.isCorrect
        ? answer.responseTimeSeconds <= 5
          ? 5
          : 4
        : 2;
      state.reviewStates[answer.wordId] = updateSm2ReviewState(
        previous,
        quality,
        reviewedAt
      );
      if (!answer.isCorrect) {
        VocabularyMemoryService.markEntryWeak(answer.wordId, reviewedAt);
      }
      if (answer.isCorrect) {
        state.completedWords[answer.wordId] = Math.max(
          state.completedWords[answer.wordId] || 0,
          1
        );
      }
    });

    const evaluation = VocabularyEvaluator.evaluate(
      answers,
      state.reviewStates
    );
    const today = getTodayDateKey();
    const yesterday = getPreviousDateKey(today);
    if (state.lastActivityDate === yesterday) {
      state.streak += 1;
    } else if (state.lastActivityDate !== today) {
      state.streak = 1;
    }
    state.lastActivityDate = today;

    const historyEntry: VocabularyHistoryEntry = {
      timestamp: reviewedAt.toISOString(),
      mode: answers[0]?.mode || 'flashcards',
      reviewedCount: answers.length,
      score: evaluation.finalScore,
      accuracy: evaluation.accuracy,
      retention: evaluation.retention,
      weakWords: evaluation.weakWords,
      strongWords: evaluation.strongWords,
    };
    state.history = [historyEntry, ...state.history];
    this.saveState(state);

    const learningStore = useLearningStore.getState();
    learningStore.completeGenericPractice(
      'Vocabulary',
      evaluation.finalScore,
      Math.max(1, Math.round(answers.length * 0.5))
    );
    this.unlockVocabularyAchievements(
      Object.keys(state.completedWords).length,
      evaluation.finalScore,
      state.streak
    );

    return evaluation;
  },

  addDiscoveredTerms(terms: string[]): void {
    const state = this.getState();
    const normalizedTerms = terms.map((term) => term.toLowerCase());
    const matchingIds = VOCABULARY_ENTRIES.filter((entry) =>
      normalizedTerms.some(
        (term) =>
          entry.word.toLowerCase().includes(term) || entry.tags.includes(term)
      )
    ).map((entry) => entry.id);

    state.discoveredWords = Array.from(
      new Set([...state.discoveredWords, ...matchingIds])
    );
    matchingIds.forEach((id) => {
      state.reviewStates[id] =
        state.reviewStates[id] || createInitialReviewState(id);
      VocabularyMenuService.startLearning(id);
    });
    this.saveState(state);
  },

  getSummary(): VocabularySummary {
    const state = this.getState();
    const entries = this.getEntries();
    const learnedIds = new Set(Object.keys(state.completedWords));
    const todayReviews = Object.values(state.reviewStates).filter(
      (reviewState) => isDueForReview(reviewState)
    ).length;
    const weakIds = state.history
      .flatMap((entry) => entry.weakWords)
      .slice(0, 8);
    const retentionPercentage =
      state.history.length > 0
        ? Math.round(
            state.history.reduce((sum, item) => sum + item.retention, 0) /
              state.history.length
          )
        : 0;

    const nextReview =
      Object.values(state.reviewStates).sort(sortByNextReview)[0]?.nextReview ||
      null;

    const categoryMastery = Array.from(
      new Set(entries.map((entry) => entry.discipline))
    ).map((discipline) => {
      const categoryEntries = entries.filter(
        (entry) => entry.discipline === discipline
      );
      const learned = categoryEntries.filter((entry) =>
        learnedIds.has(entry.id)
      ).length;
      return {
        discipline,
        learned,
        total: categoryEntries.length,
        percentage: Math.round(
          (learned / Math.max(categoryEntries.length, 1)) * 100
        ),
      };
    });

    return {
      wordsLearned: learnedIds.size,
      todaysReviews: todayReviews,
      vocabularyStreak: state.streak,
      weakVocabulary: weakIds
        .map((id) => this.getEntryById(id))
        .filter((entry): entry is VocabularyEntry => Boolean(entry)),
      nextReviewSession: nextReview,
      retentionPercentage,
      mostDifficultWords: weakIds
        .map((id) => this.getEntryById(id))
        .filter((entry): entry is VocabularyEntry => Boolean(entry)),
      categoryMastery,
      reviewCalendar: state.history.slice(0, 30).map((entry) => ({
        date: entry.timestamp.split('T')[0],
        count: entry.reviewedCount,
      })),
    };
  },

  resetVocabularyState(): void {
    this.saveState(DEFAULT_STATE);
  },

  unlockVocabularyAchievements(
    wordsLearned: number,
    score: number,
    streak: number
  ): void {
    const learningStore = useLearningStore.getState();
    const newlyUnlockedIds = new Set<string>();
    VOCABULARY_ACHIEVEMENTS.forEach((achievement) => {
      if (wordsLearned >= achievement.threshold)
        newlyUnlockedIds.add(achievement.id);
    });
    if (score === 100) newlyUnlockedIds.add('ach_vocab_perfect_review');
    if (streak >= 30) newlyUnlockedIds.add('ach_vocab_30_day_retention');

    useLearningStore.setState({
      achievements: learningStore.achievements.map((achievement) =>
        newlyUnlockedIds.has(achievement.id) && !achievement.unlocked
          ? {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            }
          : achievement
      ),
    });
  },
};
