import { create } from 'zustand';
import {
  GrammarProgressService,
  type RuleProgress,
} from '../services/grammar.progress';

interface GrammarStats {
  total: number;
  newCount: number;
  learning: number;
  learned: number;
  mastered: number;
  struggling: number;
}

interface GrammarStoreState {
  ruleProgress: Record<string, RuleProgress>;
  stats: GrammarStats;
}

interface GrammarStoreActions {
  markRuleViewed: (ruleId: string) => void;
  markRuleAsLearned: (ruleId: string) => void;
  onQuizCorrect: (ruleId: string) => void;
  onQuizIncorrect: (ruleId: string) => void;
  onStrugglingQuizCorrect: (ruleId: string) => void;
  fetchGrammarStats: () => void;
}

export const useGrammarStore = create<GrammarStoreState & GrammarStoreActions>(
  (set) => ({
    ruleProgress: {},
    stats: {
      total: 0,
      newCount: 0,
      learning: 0,
      learned: 0,
      mastered: 0,
      struggling: 0,
    },

    markRuleViewed: (ruleId: string) => {
      set((state) => {
        const current =
          state.ruleProgress[ruleId] || GrammarProgressService.addRule(ruleId);
        const updated = GrammarProgressService.onView(current);
        return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
      });
    },

    markRuleAsLearned: (ruleId: string) => {
      set((state) => {
        const current =
          state.ruleProgress[ruleId] || GrammarProgressService.addRule(ruleId);
        const updated = GrammarProgressService.onQuizCorrect({
          ...current,
          status: 'learning',
        });
        return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
      });
    },

    onQuizCorrect: (ruleId: string) => {
      set((state) => {
        const current =
          state.ruleProgress[ruleId] || GrammarProgressService.addRule(ruleId);
        const updated = GrammarProgressService.onQuizCorrect(current);
        return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
      });
    },

    onQuizIncorrect: (ruleId: string) => {
      set((state) => {
        const current =
          state.ruleProgress[ruleId] || GrammarProgressService.addRule(ruleId);
        const updated = GrammarProgressService.onQuizIncorrect(current);
        return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
      });
    },

    onStrugglingQuizCorrect: (ruleId: string) => {
      set((state) => {
        const current = state.ruleProgress[ruleId];
        if (!current || current.status !== 'struggling') return state;
        const updated = GrammarProgressService.onStrugglingQuizCorrect(current);
        return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
      });
    },

    fetchGrammarStats: () => {
      set((state) => {
        const progress = Object.values(state.ruleProgress);
        return {
          stats: {
            total: progress.length,
            newCount: progress.filter((p) => p.status === 'new').length,
            learning: progress.filter((p) => p.status === 'learning').length,
            learned: progress.filter((p) => p.status === 'learned').length,
            mastered: progress.filter((p) => p.status === 'mastered').length,
            struggling: progress.filter((p) => p.status === 'struggling')
              .length,
          },
        };
      });
    },
  })
);
