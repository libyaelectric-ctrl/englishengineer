import { create } from 'zustand';
import { isVocabularyResponseCorrect } from '../engine/vocabulary.helpers';
import { VocabularyService } from '../services/vocabulary.service';
import {
  VocabularyAnswer,
  VocabularyEntry,
  VocabularyEvaluationResult,
  VocabularyHistoryEntry,
  VocabularyState,
  VocabularyTrainingMode,
} from '../types/vocabulary.types';

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
}

interface VocabularyStoreActions {
  initializeStore: () => void;
  setMode: (mode: VocabularyTrainingMode) => void;
  setResponse: (wordId: string, response: string) => void;
  loadReviewSession: (allowedEntries?: VocabularyEntry[]) => void;
  submitReview: () => VocabularyEvaluationResult;
  resetVocabularyProgress: () => void;
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
    const answers: VocabularyAnswer[] = activeEntries.map((entry) => {
      const response = responses[entry.id] || '';
      return {
        wordId: entry.id,
        mode,
        response,
        isCorrect:
          mode === 'flashcards'
            ? true
            : isVocabularyResponseCorrect(entry, response),
        responseTimeSeconds,
      };
    });

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
}));
