import { AppError, ErrorCode } from '@/core/errors';

import type { GrammarRule } from '@/shared/types/grammar.types';

export const loadC2GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/c2.seed.json');
  if (!res.ok)
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: `Failed to load C2 grammar: ${res.status}`,
    });
  return res.json() as Promise<GrammarRule[]>;
};
