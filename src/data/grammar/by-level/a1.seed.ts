import type { GrammarRule } from '@/shared/types/grammar.types';
import { fetchSeedJson } from '@/shared/utils/data-source';

export const loadA1GrammarRules = (): Promise<GrammarRule[]> =>
  fetchSeedJson<GrammarRule[]>('/data/grammar/a1.seed.json', 'A1 grammar');
