/**
 * Feature Flag System
 * Controls feature rollout by user, plan, or percentage
 */

export type FeatureFlag =
  | 'ai_coaching'
  | 'vocabulary_system'
  | 'grammar_lessons'
  | 'writing_practice'
  | 'admin_dashboard'
  | 'team_management'
  | 'advanced_analytics'
  | 'beta_features';

export interface FeatureFlagConfig {
  enabled: boolean;
  percentage?: number; // 0-100, for gradual rollout
  allowedPlans?: string[]; // 'free', 'pro', 'team'
  allowedUsers?: string[]; // specific user IDs
}

const DEFAULT_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  ai_coaching: { enabled: true, allowedPlans: ['free', 'pro', 'team'] },
  vocabulary_system: { enabled: true, allowedPlans: ['free', 'pro', 'team'] },
  grammar_lessons: { enabled: true, allowedPlans: ['free', 'pro', 'team'] },
  writing_practice: { enabled: true, allowedPlans: ['pro', 'team'] },
  admin_dashboard: { enabled: true, allowedPlans: ['pro', 'team'] },
  team_management: { enabled: false, allowedPlans: ['team'] },
  advanced_analytics: { enabled: false, allowedPlans: ['team'] },
  beta_features: { enabled: false, percentage: 10 },
};

class FeatureFlagService {
  private flags: Record<FeatureFlag, FeatureFlagConfig>;
  private overrides: Map<string, boolean> = new Map();

  constructor(initialFlags?: Partial<Record<FeatureFlag, FeatureFlagConfig>>) {
    this.flags = { ...DEFAULT_FLAGS, ...initialFlags };
  }

  private isPlanRestricted(
    allowedPlans: string[] | undefined,
    plan: string | undefined
  ): boolean {
    return Boolean(allowedPlans && plan && !allowedPlans.includes(plan));
  }

  private isUserRestricted(
    allowedUsers: string[] | undefined,
    userId: string | undefined
  ): boolean {
    return Boolean(allowedUsers && userId && !allowedUsers.includes(userId));
  }

  private isPercentageExcluded(
    percentage: number | undefined,
    userId: string | undefined,
    flag: FeatureFlag | undefined
  ): boolean {
    if (percentage === undefined || !userId || !flag) return false;
    return this.hashString(userId + flag) % 100 >= percentage;
  }

  private isEligible(
    config: FeatureFlagConfig,
    context?: { plan?: string; userId?: string },
    flag?: FeatureFlag
  ): boolean {
    if (this.isPlanRestricted(config.allowedPlans, context?.plan)) return false;
    if (this.isUserRestricted(config.allowedUsers, context?.userId))
      return false;
    if (this.isPercentageExcluded(config.percentage, context?.userId, flag))
      return false;
    return true;
  }

  isEnabled(
    flag: FeatureFlag,
    context?: { plan?: string; userId?: string }
  ): boolean {
    const overrideKey = context?.userId ? `${flag}:${context.userId}` : flag;
    if (this.overrides.has(overrideKey)) {
      return this.overrides.get(overrideKey)!;
    }

    const config = this.flags[flag];
    if (!config?.enabled) return false;
    return this.isEligible(config, context, flag);
  }

  setOverride(flag: FeatureFlag, enabled: boolean, userId?: string): void {
    const key = userId ? `${flag}:${userId}` : flag;
    this.overrides.set(key, enabled);
  }

  clearOverride(flag: FeatureFlag, userId?: string): void {
    const key = userId ? `${flag}:${userId}` : flag;
    this.overrides.delete(key);
  }

  getAllFlags(): Record<FeatureFlag, FeatureFlagConfig> {
    return { ...this.flags };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

// Singleton instance
let instance: FeatureFlagService | null = null;

export const getFeatureFlags = (
  config?: Partial<Record<FeatureFlag, FeatureFlagConfig>>
): FeatureFlagService => {
  if (!instance) {
    instance = new FeatureFlagService(config);
  }
  return instance;
};

export const isFeatureEnabled = (
  flag: FeatureFlag,
  context?: { plan?: string; userId?: string }
): boolean => {
  return getFeatureFlags().isEnabled(flag, context);
};
