import type { GrammarRule } from '@/shared/types/grammar.types';
import { fetchSeedJson } from '@/shared/utils/data-source';

export const loadC1GrammarRules = (): Promise<GrammarRule[]> =>
  fetchSeedJson<GrammarRule[]>('/data/grammar/c1.seed.json', 'C1 grammar');
