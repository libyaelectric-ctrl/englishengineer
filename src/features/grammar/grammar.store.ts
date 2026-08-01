import { create } from 'zustand';

import type { GrammarRule } from './grammar.types';
import { QuizGrammarProgressService, type RuleProgress } from './services/grammar.progress';

export type GrammarTab = 'New' | 'Learning' | 'Due' | 'Strong';

interface GrammarStats {
  total: number;
  newCount: number;
  learning: number;
  learned: number;
  mastered: number;
  struggling: number;
}

interface GrammarStoreState {
  rules: GrammarRule[];
  selectedId: string | null;
  tab: GrammarTab;
  query: string;
  ruleProgress: Record<string, RuleProgress>;
  stats: GrammarStats;
}

interface GrammarStoreActions {
  setRules: (rules: GrammarRule[]) => void;
  setSelectedId: (id: string | null) => void;
  setTab: (tab: GrammarTab) => void;
  setQuery: (query: string) => void;
  markRuleViewed: (ruleId: string) => void;
  markRuleAsLearned: (ruleId: string) => void;
  onQuizCorrect: (ruleId: string) => void;
  onQuizIncorrect: (ruleId: string) => void;
  onStrugglingQuizCorrect: (ruleId: string) => void;
  fetchGrammarStats: () => void;
}

export const useGrammarStore = create<GrammarStoreState & GrammarStoreActions>((set) => ({
  rules: [],
  selectedId: null,
  tab: 'New',
  query: '',
  ruleProgress: {},
  stats: {
    total: 0,
    newCount: 0,
    learning: 0,
    learned: 0,
    mastered: 0,
    struggling: 0,
  },

  setRules: (rules) => set({ rules }),
  setSelectedId: (id) => set({ selectedId: id }),
  setTab: (tab) => set({ tab }),
  setQuery: (query) => set({ query }),

  markRuleViewed: (ruleId: string) => {
    set((state) => {
      const current = state.ruleProgress[ruleId] || QuizGrammarProgressService.addRule(ruleId);
      const updated = QuizGrammarProgressService.onView(current);
      return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
    });
  },

  markRuleAsLearned: (ruleId: string) => {
    set((state) => {
      const current = state.ruleProgress[ruleId] || QuizGrammarProgressService.addRule(ruleId);
      const updated = QuizGrammarProgressService.onQuizCorrect({
        ...current,
        status: 'learning',
      });
      return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
    });
  },

  onQuizCorrect: (ruleId: string) => {
    set((state) => {
      const current = state.ruleProgress[ruleId] || QuizGrammarProgressService.addRule(ruleId);
      const updated = QuizGrammarProgressService.onQuizCorrect(current);
      return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
    });
  },

  onQuizIncorrect: (ruleId: string) => {
    set((state) => {
      const current = state.ruleProgress[ruleId] || QuizGrammarProgressService.addRule(ruleId);
      const updated = QuizGrammarProgressService.onQuizIncorrect(current);
      return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
    });
  },

  onStrugglingQuizCorrect: (ruleId: string) => {
    set((state) => {
      const current = state.ruleProgress[ruleId];
      if (!current || current.status !== 'struggling') return state;
      const updated = QuizGrammarProgressService.onStrugglingQuizCorrect(current);
      return { ruleProgress: { ...state.ruleProgress, [ruleId]: updated } };
    });
  },

  fetchGrammarStats: () => {
    set((state) => {
      const progress = Object.values(state.ruleProgress);
      let newCount = 0;
      let learningCount = 0;
      let learnedCount = 0;
      let masteredCount = 0;
      let strugglingCount = 0;
      for (const p of progress) {
        switch (p.status) {
          case 'new':
            newCount++;
            break;
          case 'learning':
            learningCount++;
            break;
          case 'learned':
            learnedCount++;
            break;
          case 'mastered':
            masteredCount++;
            break;
          case 'struggling':
            strugglingCount++;
            break;
        }
      }
      return {
        stats: {
          total: progress.length,
          newCount,
          learning: learningCount,
          learned: learnedCount,
          mastered: masteredCount,
          struggling: strugglingCount,
        },
      };
    });
  },
}));
