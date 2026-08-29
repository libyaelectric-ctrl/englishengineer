import { hashBucket } from '@/shared/feature-flags/featureFlags';

export interface ExperimentDefinition {
  key: string;
  description: string;
  variants: [string, string];
  rolloutPercentage: number;
}

export const EXPERIMENTS = {
  quizFeedbackStyle: {
    key: 'quizFeedbackStyle',
    description: 'Immediate vs end-of-quiz feedback on vocabulary quizzes',
    variants: ['control', 'treatment'],
    rolloutPercentage: 100,
  },
  landingHeroCopy: {
    key: 'landingHeroCopy',
    description: 'Landing hero headline copy test',
    variants: ['control', 'treatment'],
    rolloutPercentage: 100,
  },
} as const satisfies Record<string, ExperimentDefinition>;

export type ExperimentKey = keyof typeof EXPERIMENTS;
export type ExperimentVariant = 'control' | 'treatment';

/**
 * Deterministic variant assignment: the same user always lands in the same
 * variant of the same experiment. Returns null when the user is not enrolled
 * (bucket >= rolloutPercentage) or the experiment is not registered.
 */
export function assignVariant(experiment: ExperimentKey, userId: string): ExperimentVariant | null {
  const definition = EXPERIMENTS[experiment];
  if (!definition) return null;
  const bucket = hashBucket(experiment, userId);
  if (bucket >= definition.rolloutPercentage) return null;
  return definition.variants[bucket % definition.variants.length] as ExperimentVariant;
}
