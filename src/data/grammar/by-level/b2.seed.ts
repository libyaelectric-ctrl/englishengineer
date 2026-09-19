import type { GrammarRule } from '@/shared/types/grammar.types';
import { fetchSeedJson } from '@/shared/utils/data-source';

export const loadB2GrammarRules = (): Promise<GrammarRule[]> =>
  fetchSeedJson<GrammarRule[]>('/data/grammar/b2.seed.json', 'B2 grammar');
