/**
 * Config-based feature flags (ADR-006).
 *
 * - Environment override: VITE_FLAG_<UPPER_SNAKE_KEY> ('true' | 'false')
 * - Deterministic rollout bucketing: hash(`${flag}:${userId}`) % 100
 * - Anonymous users are bucketed under the stable id 'anonymous'
 */

export interface FeatureFlagDefinition {
  key: string;
  description: string;
  enabledByDefault: boolean;
  rolloutPercentage: number;
  /** Eski env var adlari (VITE_FEATURE_FLAG_*) - geriye donuk uyumluluk. */
  legacyEnvKeys?: string[];
}

export const FEATURE_FLAGS = {
  betaFeedbackWidget: {
    key: 'betaFeedbackWidget',
    description: 'In-app closed-beta feedback widget',
    enabledByDefault: true,
    rolloutPercentage: 100,
  },
  commandPalette: {
    key: 'commandPalette',
    description: 'Ctrl/Cmd+K command palette in the dashboard shell',
    enabledByDefault: true,
    rolloutPercentage: 100,
  },
  mascotEngagement: {
    key: 'mascotEngagement',
    description: 'EngVox mascot reactions on learning events',
    enabledByDefault: true,
    rolloutPercentage: 100,
  },
  teamBeta: {
    key: 'teamBeta',
    description: 'Team pages in the router (legacy VITE_FEATURE_FLAG_TEAM_BETA)',
    enabledByDefault: false,
    rolloutPercentage: 100,
    legacyEnvKeys: ['VITE_FEATURE_FLAG_TEAM_BETA'],
  },
  unifiedDifficultyScoring: {
    key: 'unifiedDifficultyScoring',
    description: 'Unified difficulty scoring in content selection',
    enabledByDefault: false,
    rolloutPercentage: 100,
    legacyEnvKeys: ['VITE_FEATURE_FLAG_UNIFIED_DIFFICULTY'],
  },
} as const satisfies Record<string, FeatureFlagDefinition>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export const ANONYMOUS_USER_ID = 'anonymous';

export function hashBucket(key: string, userId: string): number {
  let hash = 5381;
  const input = `${key}:${userId}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

function toEnvKey(flag: FeatureFlagKey): string {
  return `VITE_FLAG_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
}

function readEnvOverride(flag: FeatureFlagKey): boolean | undefined {
  const definition = FEATURE_FLAGS[flag];
  const legacyKeys = 'legacyEnvKeys' in definition ? definition.legacyEnvKeys : undefined;
  const names = [toEnvKey(flag), ...(legacyKeys ?? [])];
  for (const name of names) {
    const raw = (import.meta.env as Record<string, string | undefined>)[name];
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  }
  return undefined;
}

export function getFlagDetail(flag: FeatureFlagKey, userId: string = ANONYMOUS_USER_ID) {
  const definition = FEATURE_FLAGS[flag];
  const envOverride = readEnvOverride(flag);
  const bucket = hashBucket(flag, userId);
  const inRollout = bucket < definition.rolloutPercentage;
  const enabled = envOverride ?? (definition.enabledByDefault && inRollout);
  return {
    key: flag,
    enabled,
    bucket,
    rolloutPercentage: definition.rolloutPercentage,
    source: envOverride === undefined ? ('config' as const) : ('env' as const),
  };
}

export function isFeatureEnabled(flag: FeatureFlagKey, userId?: string): boolean {
  if (!(flag in FEATURE_FLAGS)) return false;
  return getFlagDetail(flag, userId).enabled;
}

export function listFlags(userId: string = ANONYMOUS_USER_ID) {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map((key) => getFlagDetail(key, userId));
}
