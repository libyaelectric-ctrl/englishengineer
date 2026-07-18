import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadB2GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/b2.seed.json');
  if (!res.ok) throw new Error(`Failed to load B2 grammar: ${res.status}`);
  return res.json() as Promise<GrammarRule[]>;
};
