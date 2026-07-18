import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadB1GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/b1.seed.json');
  if (!res.ok) throw new Error(`Failed to load B1 grammar: ${res.status}`);
  return res.json() as Promise<GrammarRule[]>;
};
