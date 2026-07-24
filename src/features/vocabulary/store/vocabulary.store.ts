import { create } from 'zustand';
import { VocabularyService } from '../services/vocabulary.service';
import {
  VocabularyProgressService,
  type WordProgress,
} from '../services/vocabulary.progress';
import {
  VocabularyEntry,
  VocabularyEvaluationResult,
  VocabularyHistoryEntry,
  VocabularyState,
  VocabularyTrainingMode,
} from '../types/vocabulary.types';

interface VocabularyStats {
  total: number;
  newCount: number;
  learned: number;
  mastered: number;
  struggling: number;
}

interface VocabularyStoreState {
  entries: VocabularyEntry[];
  activeEntries: VocabularyEntry[];
  mode: VocabularyTrainingMode;
  responses: Record<string, string>;
  startedAt: number;
  evaluationResult: VocabularyEvaluationResult | null;
  history: VocabularyHistoryEntry[];
  summary: ReturnType<typeof VocabularyService.getSummary>;
  isSubmitting: boolean;
  wordProgress: Record<string, WordProgress>;
  stats: VocabularyStats;
}

interface VocabularyStoreActions {
  initializeStore: () => void;
  setMode: (mode: VocabularyTrainingMode) => void;
  setResponse: (wordId: string, response: string) => void;
  loadReviewSession: (allowedEntries?: VocabularyEntry[]) => void;
  submitReview: () => VocabularyEvaluationResult;
  resetVocabularyProgress: () => void;
  updateWordProgress: (wordId: string, result: 'correct' | 'incorrect') => void;
  fetchVocabularyStats: () => void;
  markWordAsLearned: (wordId: string) => void;
  onQuizCorrect: (wordId: string) => void;
  onQuizIncorrect: (wordId: string) => void;
  moveToNew: (wordId: string) => void;
  moveToLearned: (wordId: string) => void;
  keepStruggling: (wordId: string) => void;
}

const getA1Entries = (): VocabularyEntry[] =>
  VocabularyService.getEntries().filter((entry) => entry.CEFR === 'A1');

export const useVocabularyStore = create<
  VocabularyStoreState & VocabularyStoreActions
>((set, get) => ({
  entries: VocabularyService.getEntries(),
  activeEntries: VocabularyService.getDueEntries(12, getA1Entries()),
  mode: 'flashcards',
  responses: {},
  startedAt: Date.now(),
  evaluationResult: null,
  history: [],
  summary: VocabularyService.getSummary(),
  isSubmitting: false,
  wordProgress: {},
  stats: { total: 0, newCount: 0, learned: 0, mastered: 0, struggling: 0 },

  initializeStore: () => {
    const state: VocabularyState = VocabularyService.getState();
    set({
      entries: VocabularyService.getEntries(),
      activeEntries: VocabularyService.getDueEntries(12, getA1Entries()),
      responses: {},
      startedAt: Date.now(),
      evaluationResult: null,
      history: state.history,
      summary: VocabularyService.getSummary(),
      isSubmitting: false,
    });
  },

  setMode: (mode) => {
    set({ mode, responses: {}, startedAt: Date.now(), evaluationResult: null });
  },

  setResponse: (wordId, response) => {
    set((state) => ({ responses: { ...state.responses, [wordId]: response } }));
  },

  loadReviewSession: (allowedEntries) => {
    set({
      activeEntries: VocabularyService.getDueEntries(12, allowedEntries),
      responses: {},
      startedAt: Date.now(),
      evaluationResult: null,
    });
  },

  submitReview: () => {
    set({ isSubmitting: true });
    const { activeEntries, responses, mode, startedAt } = get();
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000)
    );
    const responseTimeSeconds = Math.max(
      1,
      Math.round(elapsedSeconds / Math.max(activeEntries.length, 1))
    );
    const answers = activeEntries.map((entry) => ({
      wordId: entry.id,
      mode,
      response: responses[entry.id] || '',
      isCorrect: mode === 'flashcards' ? true : false,
      responseTimeSeconds,
    }));

    try {
      const result = VocabularyService.submitReview(answers);
      set({
        evaluationResult: result,
        history: VocabularyService.getState().history,
        summary: VocabularyService.getSummary(),
        isSubmitting: false,
      });
      return result;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  resetVocabularyProgress: () => {
    VocabularyService.resetVocabularyState();
    set({
      activeEntries: VocabularyService.getDueEntries(12, getA1Entries()),
      responses: {},
      startedAt: Date.now(),
      evaluationResult: null,
      history: [],
      summary: VocabularyService.getSummary(),
    });
  },

  markWordAsLearned: (wordId: string) => {
    set((state) => {
      const current =
        state.wordProgress[wordId] || VocabularyProgressService.addWord(wordId);
      const updated = VocabularyProgressService.markAsLearned(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  updateWordProgress: (wordId: string, result: 'correct' | 'incorrect') => {
    set((state) => {
      const current =
        state.wordProgress[wordId] || VocabularyProgressService.addWord(wordId);
      const updated =
        result === 'correct'
          ? VocabularyProgressService.onQuizCorrect(current)
          : VocabularyProgressService.onQuizIncorrect(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  onQuizCorrect: (wordId: string) => {
    set((state) => {
      const current =
        state.wordProgress[wordId] || VocabularyProgressService.addWord(wordId);
      const updated = VocabularyProgressService.onQuizCorrect(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  onQuizIncorrect: (wordId: string) => {
    set((state) => {
      const current =
        state.wordProgress[wordId] || VocabularyProgressService.addWord(wordId);
      const updated = VocabularyProgressService.onQuizIncorrect(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  moveToNew: (wordId: string) => {
    set((state) => {
      const current = state.wordProgress[wordId];
      if (!current) return state;
      const updated = VocabularyProgressService.moveToNew(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  moveToLearned: (wordId: string) => {
    set((state) => {
      const current = state.wordProgress[wordId];
      if (!current) return state;
      const updated = VocabularyProgressService.moveToLearned(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  keepStruggling: (wordId: string) => {
    set((state) => {
      const current = state.wordProgress[wordId];
      if (!current) return state;
      const updated = VocabularyProgressService.keepStruggling(current);
      return { wordProgress: { ...state.wordProgress, [wordId]: updated } };
    });
  },

  fetchVocabularyStats: () => {
    set((state) => {
      const progress = Object.values(state.wordProgress);
      return {
        stats: {
          total: progress.length,
          newCount: progress.filter((p) => p.status === 'new').length,
          learned: progress.filter((p) => p.status === 'learned').length,
          mastered: progress.filter((p) => p.status === 'mastered').length,
          struggling: progress.filter((p) => p.status === 'struggling').length,
        },
      };
    });
  },
}));
