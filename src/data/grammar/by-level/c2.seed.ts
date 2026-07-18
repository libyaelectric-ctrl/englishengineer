import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadC2GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/c2.seed.json');
  if (!res.ok) throw new Error(`Failed to load C2 grammar: ${res.status}`);
  return res.json() as Promise<GrammarRule[]>;
};
