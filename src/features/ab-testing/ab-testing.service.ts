import { useCallback, useMemo } from 'react';

type Variant = 'A' | 'B';

interface Experiment {
  name: string;
  weights: { A: number; B: number };
}

const EXPERIMENTS: Record<string, Experiment> = {
  homepage_layout: { name: 'homepage_layout', weights: { A: 50, B: 50 } },
  pricing_page_v2: { name: 'pricing_page_v2', weights: { A: 70, B: 30 } },
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const ASSIGNMENTS = new Map<string, Variant>();

export const getVariant = (experimentName: string, userId: string): Variant => {
  const key = `${experimentName}:${userId}`;
  const cached = ASSIGNMENTS.get(key);
  if (cached) return cached;

  const experiment = EXPERIMENTS[experimentName];
  if (!experiment) return 'A';

  const hash = hashString(key);
  const percentage = hash % 100;
  const variant: Variant = percentage < experiment.weights.A ? 'A' : 'B';

  ASSIGNMENTS.set(key, variant);
  return variant;
};

export const useABTest = (experimentName: string, userId: string = 'anonymous'): { variant: Variant } => {
  const variant = useMemo(() => getVariant(experimentName, userId), [experimentName, userId]);
  return { variant };
};
