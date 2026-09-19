import type { GrammarRule } from '@/shared/types/grammar.types';
import { fetchSeedJson } from '@/shared/utils/data-source';

export const loadA2GrammarRules = (): Promise<GrammarRule[]> =>
  fetchSeedJson<GrammarRule[]>('/data/grammar/a2.seed.json', 'A2 grammar');
