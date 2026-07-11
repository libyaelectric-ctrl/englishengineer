import { create } from 'zustand';
import type { GrammarRule } from './grammar.types';

export type GrammarTab = 'New' | 'Learning' | 'Due' | 'Strong';

interface GrammarStoreState {
  rules: GrammarRule[];
  selectedId: string | null;
  tab: GrammarTab;
  query: string;
  setRules: (rules: GrammarRule[]) => void;
  setSelectedId: (id: string | null) => void;
  setTab: (tab: GrammarTab) => void;
  setQuery: (query: string) => void;
}

export const useGrammarStore = create<GrammarStoreState>((set) => ({
  rules: [],
  selectedId: null,
  tab: 'New',
  query: '',
  setRules: (rules) => set({ rules }),
  setSelectedId: (id) => set({ selectedId: id }),
  setTab: (tab) => set({ tab }),
  setQuery: (query) => set({ query }),
}));
