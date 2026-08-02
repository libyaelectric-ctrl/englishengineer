/**
 * Simple config-based feature flag system for EngineerOS.
 * Addresses TD-014: Implement Feature Flags
 *
 * Usage:
 *   if (isFeatureEnabled('aiClaudeProvider')) { ... }
 *   if (isFeatureEnabled('newDashboard')) { ... }
 */

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';

export type FeatureFlag =
  | 'aiClaudeProvider'
  | 'aiOpenAIProvider'
  | 'aiGeminiProvider'
  | 'newDashboard'
  | 'teamManagement'
  | 'advancedAnalytics'
  | 'abTestingFramework'
  | 'darkMode'
  | 'offlineGrammar'
  | 'betaWritingReview';

interface FeatureFlagConfig {
  enabled: boolean;
  description: string;
  rolloutPercentage?: number; // 0-100, for gradual rollout
  allowedEnvironments?: ('development' | 'staging' | 'production')[];
}

const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  aiClaudeProvider: {
    enabled: true,
    description: 'Anthropic Claude AI provider integration',
    allowedEnvironments: ['development', 'staging', 'production'],
  },
  aiOpenAIProvider: {
    enabled: true,
    description: 'OpenAI GPT provider integration',
    allowedEnvironments: ['development', 'staging', 'production'],
  },
  aiGeminiProvider: {
    enabled: false,
    description: 'Google Gemini AI provider integration',
    allowedEnvironments: ['development', 'staging'],
  },
  newDashboard: {
    enabled: false,
    description: 'Redesigned learner dashboard with analytics',
    rolloutPercentage: 0,
    allowedEnvironments: ['development'],
  },
  teamManagement: {
    enabled: true,
    description: 'Team workspace and member management',
    allowedEnvironments: ['development', 'staging', 'production'],
  },
  advancedAnalytics: {
    enabled: false,
    description: 'Advanced learning analytics and insights',
    rolloutPercentage: 0,
    allowedEnvironments: ['development'],
  },
  abTestingFramework: {
    enabled: false,
    description: 'A/B testing capability for UI experiments',
    allowedEnvironments: ['development'],
  },
  darkMode: {
    enabled: true,
    description: 'Dark mode theme support',
    allowedEnvironments: ['development', 'staging', 'production'],
  },
  offlineGrammar: {
    enabled: true,
    description: 'Offline grammar exercises without AI',
    allowedEnvironments: ['development', 'staging', 'production'],
  },
  betaWritingReview: {
    enabled: false,
    description: 'Beta AI-powered writing review with advanced feedback',
    rolloutPercentage: 10,
    allowedEnvironments: ['development', 'staging'],
  },
};

/**
 * Check if a feature flag is enabled.
 * Respects environment restrictions and rollout percentage.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const config = FEATURE_FLAGS[flag];
  if (!config) return false;

  // A hard off-switch always wins, checked before rollout/environment logic
  // so overrideFeatureFlag(flag, false) reliably disables a flag.
  if (!config.enabled) return false;

  // Check environment restriction
  const env = getEnvironment();
  if (config.allowedEnvironments && !config.allowedEnvironments.includes(env)) {
    return false;
  }

  // Check rollout percentage (deterministic based on user ID)
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    const userId = getCurrentUserId();
    if (userId) {
      const hash = hashString(`${flag}:${userId}`);
      const percentage = (hash % 100) + 1; // 1-100
      return percentage <= config.rolloutPercentage;
    }
    return false;
  }

  return true;
}

/**
 * Get all feature flags for debugging/admin panels.
 */
export function getAllFeatureFlags(): Record<FeatureFlag, FeatureFlagConfig> {
  return { ...FEATURE_FLAGS };
}

/**
 * Override a feature flag at runtime (for testing).
 *
 * This is an unconditional override: enabling a flag also lifts its
 * rollout-percentage gate (set to 100) so tests/tools that call
 * overrideFeatureFlag(flag, true) reliably see isFeatureEnabled(flag)
 * return true, regardless of the flag's normal gradual-rollout config.
 * Disabling always wins via the enabled-check at the top of
 * isFeatureEnabled, so rolloutPercentage is left untouched in that case.
 */
export function overrideFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  if (!FEATURE_FLAGS[flag]) return;
  FEATURE_FLAGS[flag].enabled = enabled;
  if (enabled && FEATURE_FLAGS[flag].rolloutPercentage !== undefined) {
    FEATURE_FLAGS[flag].rolloutPercentage = 100;
  }
}

// Helpers
function getEnvironment(): 'development' | 'staging' | 'production' {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.VITE_APP_ENV === 'staging') return 'staging';
  return 'production';
}

function getCurrentUserId(): string | null {
  try {
    const parsed = storage.get<Record<string, unknown>>('auth_user');
    if (parsed?.id) return String(parsed.id);
  } catch (e) {
    logger.w('[FeatureFlags] Failed to read auth_user from storage', e);
  }
  return null;
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
