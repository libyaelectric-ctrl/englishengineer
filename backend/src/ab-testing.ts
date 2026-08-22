/**
 * A/B Testing & Feature Flags Backend
 *
 * Manages feature flags, experiments, and variant assignments.
 * Supports percentage-based rollouts, user targeting, and experiment tracking.
 */
import { logger } from './logger.js';

type FlagStatus = 'active' | 'inactive' | 'testing';
type TargetingRule = {
  type: 'plan' | 'user_id' | 'percentage';
  values: string[];
};

interface FeatureFlag {
  key: string;
  status: FlagStatus;
  defaultValue: boolean;
  targeting?: TargetingRule[];
  variants?: Variant[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  payload?: Record<string, unknown>;
}

interface Experiment {
  id: string;
  name: string;
  flagKey: string;
  variants: Variant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  goal: string;
  results?: ExperimentResults;
}

interface ExperimentResults {
  variantResults: Array<{
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
  }>;
  confidence: number;
  winner?: string;
  pValue?: number;
}

interface UserAssignment {
  userId: string;
  flagKey: string;
  variantId: string;
  assignedAt: string;
}

// Default feature flags for EngVox
const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    key: 'newDashboard',
    status: 'active',
    defaultValue: true,
    description: 'Redesigned dashboard layout',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    key: 'darkMode',
    status: 'active',
    defaultValue: true,
    description: 'Dark mode support',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    key: 'aiCoachV2',
    status: 'testing',
    defaultValue: false,
    targeting: [{ type: 'percentage', values: ['50'] }],
    variants: [
      { id: 'control', name: 'Control', weight: 50 },
      { id: 'v2', name: 'AI Coach V2', weight: 50, payload: { model: 'gpt-4o' } },
    ],
    description: 'Enhanced AI coaching with context awareness',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    key: 'pricingV2',
    status: 'inactive',
    defaultValue: false,
    variants: [
      { id: 'control', name: 'Current Pricing', weight: 33 },
      { id: 'annual-focus', name: 'Annual Focus', weight: 33, payload: { highlightAnnual: true } },
      { id: 'simplified', name: 'Simplified', weight: 34, payload: { tiers: 3 } },
    ],
    description: 'Pricing page experiment',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },
];

export class ABTestingService {
  private flags: Map<string, FeatureFlag> = new Map();
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, UserAssignment> = new Map();
  private conversionEvents: Array<{
    userId: string;
    experimentId: string;
    variantId: string;
    event: string;
    value?: number;
    timestamp: number;
  }> = [];

  constructor() {
    // Initialize with default flags
    for (const flag of DEFAULT_FLAGS) {
      this.flags.set(flag.key, flag);
      if (flag.variants && flag.status === 'testing') {
        const experiment: Experiment = {
          id: `exp_${flag.key}`,
          name: `${flag.description} Experiment`,
          flagKey: flag.key,
          variants: flag.variants,
          status: 'running',
          startDate: flag.createdAt,
          goal: 'conversion',
        };
        this.experiments.set(experiment.id, experiment);
      }
    }
  }

  /**
   * Get all feature flags.
   */
  getAllFlags(): FeatureFlag[] {
    return [...this.flags.values()];
  }

  /**
   * Get a specific feature flag.
   */
  getFlag(key: string): FeatureFlag | null {
    return this.flags.get(key) ?? null;
  }

  /**
   * Check if a feature flag is enabled for a user.
   */
  isEnabled(
    key: string,
    userId: string,
    planId?: string,
    context?: Record<string, unknown>
  ): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    if (flag.status === 'inactive') return false;
    if (flag.status === 'active') return true;

    // Testing mode — evaluate targeting rules
    if (flag.targeting) {
      for (const rule of flag.targeting) {
        if (rule.type === 'percentage') {
          const percentage = parseInt(rule.values[0] ?? '0', 10);
          if (this.hashToPercentage(userId, key) >= percentage) {
            return flag.defaultValue;
          }
        }
        if (rule.type === 'plan' && planId) {
          if (rule.values.includes(planId)) return true;
        }
        if (rule.type === 'user_id') {
          if (rule.values.includes(userId)) return true;
        }
      }
    }

    return flag.defaultValue;
  }

  /**
   * Get variant assignment for a user in an experiment.
   */
  getVariant(
    flagKey: string,
    userId: string,
    planId?: string
  ): { variantId: string; payload?: Record<string, unknown> } | null {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.variants || flag.status !== 'testing') {
      return null;
    }

    const assignmentKey = `${userId}:${flagKey}`;
    const existing = this.assignments.get(assignmentKey);
    if (existing) {
      const variant = flag.variants.find((v) => v.id === existing.variantId);
      return variant ? { variantId: variant.id, payload: variant.payload } : null;
    }

    // Assign variant based on hash
    const hash = this.hashToPercentage(userId, flagKey);
    let cumulative = 0;
    for (const variant of flag.variants) {
      cumulative += variant.weight;
      if (hash < cumulative) {
        this.assignments.set(assignmentKey, {
          userId,
          flagKey,
          variantId: variant.id,
          assignedAt: new Date().toISOString(),
        });
        return { variantId: variant.id, payload: variant.payload };
      }
    }

    // Fallback to first variant
    const fallback = flag.variants[0];
    if (fallback) {
      return { variantId: fallback.id, payload: fallback.payload };
    }
    return null;
  }

  /**
   * Track a conversion event for an experiment.
   */
  trackConversion(userId: string, experimentId: string, event: string, value?: number): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') return;

    const assignmentKey = `${userId}:${experiment.flagKey}`;
    const assignment = this.assignments.get(assignmentKey);
    if (!assignment) return;

    this.conversionEvents.push({
      userId,
      experimentId,
      variantId: assignment.variantId,
      event,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Get experiment results.
   */
  getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const events = this.conversionEvents.filter((e) => e.experimentId === experimentId);
    const variantResults = experiment.variants.map((variant) => {
      const variantEvents = events.filter((e) => e.variantId === variant.id);
      const uniqueUsers = new Set(variantEvents.map((e) => e.userId));
      const conversions = uniqueUsers.size;
      const participants = Math.max(1, conversions * 3); // Estimate

      return {
        variantId: variant.id,
        participants,
        conversions,
        conversionRate: Math.round((conversions / participants) * 10000) / 100,
        revenue: variantEvents.reduce((sum, e) => sum + (e.value ?? 0), 0),
      };
    });

    // Simple statistical significance check
    const confidence = this.calculateConfidence(variantResults);

    return {
      variantResults,
      confidence,
    };
  }

  /**
   * Create or update a feature flag.
   */
  upsertFlag(flag: Partial<FeatureFlag> & { key: string }): FeatureFlag {
    const existing = this.flags.get(flag.key);
    const updated: FeatureFlag = {
      key: flag.key,
      status: flag.status ?? existing?.status ?? 'active',
      defaultValue: flag.defaultValue ?? existing?.defaultValue ?? false,
      targeting: flag.targeting ?? existing?.targeting,
      variants: flag.variants ?? existing?.variants,
      description: flag.description ?? existing?.description ?? '',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.flags.set(flag.key, updated);
    logger.info('Feature flag upserted', { key: flag.key, status: updated.status });
    return updated;
  }

  /**
   * Delete a feature flag.
   */
  deleteFlag(key: string): boolean {
    const deleted = this.flags.delete(key);
    if (deleted) {
      logger.info('Feature flag deleted', { key });
    }
    return deleted;
  }

  /**
   * Get all active experiments.
   */
  getActiveExperiments(): Experiment[] {
    return [...this.experiments.values()].filter((e) => e.status === 'running');
  }

  /**
   * Update experiment status.
   */
  updateExperimentStatus(experimentId: string, status: Experiment['status']): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    experiment.status = status;
    if (status === 'completed') {
      experiment.endDate = new Date().toISOString();
      experiment.results = this.getExperimentResults(experimentId) ?? undefined;
    }
    return true;
  }

  private hashToPercentage(userId: string, key: string): number {
    let hash = 0;
    const str = `${userId}:${key}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + (str.charCodeAt(i) ?? 0);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private calculateConfidence(
    results: Array<{ variantId: string; participants: number; conversions: number }>
  ): number {
    if (results.length < 2) return 0;
    // Simplified confidence calculation
    // In production, use a proper statistical test
    const [a, b] = results;
    if (!a || !b) return 0;
    if (a.participants === 0 || b.participants === 0) return 0;

    const rateA = a.conversions / a.participants;
    const rateB = b.conversions / b.participants;
    const diff = Math.abs(rateA - rateB);

    // Simple heuristic: more data + bigger difference = higher confidence
    const minParticipants = Math.min(a.participants, b.participants);
    const dataConfidence = Math.min(1, minParticipants / 100);
    const diffConfidence = Math.min(1, diff * 10);

    return Math.round(dataConfidence * diffConfidence * 100);
  }
}

// Singleton instance
let globalABTesting: ABTestingService | null = null;

export const getABTestingService = (): ABTestingService => {
  if (!globalABTesting) {
    globalABTesting = new ABTestingService();
  }
  return globalABTesting;
};

export const resetABTestingService = (): void => {
  globalABTesting = null;
};
