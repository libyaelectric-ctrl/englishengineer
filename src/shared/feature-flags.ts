/**
 * Feature flags — centralised configuration.
 *
 * Each flag controls whether a feature is enabled in production.
 * Default value is used when no environment variable is set.
 *
 * To enable a flag: set VITE_FEATURE_FLAG_<NAME>=true in .env
 */

export const FEATURE_FLAGS = {
  /** Team feature is in beta — flag controls visibility in router */
  TEAM_BETA: import.meta.env.VITE_FEATURE_FLAG_TEAM_BETA === 'true',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
