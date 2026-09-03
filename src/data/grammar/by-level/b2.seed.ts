import { AppError, ErrorCode } from '@/core/errors';

import type { GrammarRule } from '@/shared/types/grammar.types';

export const loadB2GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/b2.seed.json');
  if (!res.ok)
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: `Failed to load B2 grammar: ${res.status}`,
    });
  return res.json() as Promise<GrammarRule[]>;
};
