export const durations = {
  instant: 0.08,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
  slower: 0.6,
} as const;

export const easings = {
  'ease-out': [0.25, 0.46, 0.45, 0.94] as const,
  'ease-in-out': [0.4, 0, 0.2, 1] as const,
  'ease-out-expo': [0.16, 1, 0.3, 1] as const,
  'spring-soft': { type: 'spring', stiffness: 300, damping: 30 } as const,
  'spring-snappy': { type: 'spring', stiffness: 500, damping: 35 } as const,
  'spring-bouncy': { type: 'spring', stiffness: 400, damping: 20 } as const,
} as const;

export const motionTokens = {
  durations,
  easings,
} as const;

export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;

export const getDuration = (key: DurationKey) => durations[key];
export const getEasing = (key: EasingKey) => easings[key];

export const pageTransitionDuration = durations.fast;
export const pageTransitionEasing = easings['ease-out-expo'];

export const panelTransitionDuration = durations.base;
export const panelTransitionEasing = easings['ease-in-out'];

export const cardTransitionDuration = durations.fast;
export const cardTransitionEasing = easings['spring-soft'];

export const microInteractionDuration = durations.instant;
export const microInteractionEasing = easings['spring-snappy'];