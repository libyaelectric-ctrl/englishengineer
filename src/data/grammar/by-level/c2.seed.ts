import type { GrammarRule } from '@/shared/types/grammar.types';
import { fetchSeedJson } from '@/shared/utils/data-source';

export const loadC2GrammarRules = (): Promise<GrammarRule[]> =>
  fetchSeedJson<GrammarRule[]>('/data/grammar/c2.seed.json', 'C2 grammar');
