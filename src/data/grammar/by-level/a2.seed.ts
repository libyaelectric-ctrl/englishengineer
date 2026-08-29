import { AppError, ErrorCode } from '@/core/errors';

import type { GrammarRule } from '@/features/grammar/grammar.types';

export const loadA2GrammarRules = async (): Promise<GrammarRule[]> => {
  const res = await fetch('/data/grammar/a2.seed.json');
  if (!res.ok)
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: `Failed to load A2 grammar: ${res.status}`,
    });
  return res.json() as Promise<GrammarRule[]>;
};
