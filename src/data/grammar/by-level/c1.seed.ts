import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadC1GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/c1.seed.json');
  if (!res.ok) throw new Error(`Failed to load C1 grammar: ${res.status}`);
  return res.json() as Promise<GrammarRule[]>;
};
