import { AppError, ErrorCode } from '@/core/errors';

import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadA1GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/a1.seed.json');
  if (!res.ok)
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: `Failed to load A1 grammar: ${res.status}`,
    });
  return res.json() as Promise<GrammarRule[]>;
};
