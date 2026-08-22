/**
 * Usage Metering Service
 *
 * Tracks plan-based resource consumption with detailed breakdowns.
 * Supports daily/monthly windows, per-feature tracking, and usage alerts.
 */
import { logger } from './logger.js';

type UsagePeriod = 'daily' | 'monthly' | 'yearly';

interface UsageRecord {
  userId: string;
  feature: string;
  count: number;
  tokens?: number;
  costUsd?: number;
  timestamp: number;
}

interface UsageSummary {
  userId: string;
  planId: string;
  period: UsagePeriod;
  features: Array<{
    feature: string;
    used: number;
    limit: number | null;
    percentage: number;
  }>;
  totalCostUsd: number;
  periodStart: string;
  periodEnd: string;
}

interface UsageAlert {
  type: 'warning' | 'critical' | 'exceeded';
  feature: string;
  percentage: number;
  message: string;
}

const PLAN_USAGE_LIMITS: Record<string, Record<string, number | null>> = {
  free: {
    ai_requests: 3,
    vocabulary_lookups: 50,
    grammar_exercises: 10,
    speaking_sessions: 2,
    writing_reviews: 2,
    reading_passages: 5,
  },
  junior: {
    ai_requests: 50,
    vocabulary_lookups: 500,
    grammar_exercises: 200,
    speaking_sessions: 50,
    writing_reviews: 50,
    reading_passages: 200,
  },
  senior: {
    ai_requests: 150,
    vocabulary_lookups: 2000,
    grammar_exercises: 500,
    speaking_sessions: 150,
    writing_reviews: 150,
    reading_passages: 500,
  },
  specialist: {
    ai_requests: 300,
    vocabulary_lookups: 5000,
    grammar_exercises: 1000,
    speaking_sessions: 300,
    writing_reviews: 300,
    reading_passages: 1000,
  },
  master: {
    ai_requests: 600,
    vocabulary_lookups: 10000,
    grammar_exercises: 2000,
    speaking_sessions: 600,
    writing_reviews: 600,
    reading_passages: 2000,
  },
  team: {
    ai_requests: 1500,
    vocabulary_lookups: 50000,
    grammar_exercises: 5000,
    speaking_sessions: 1500,
    writing_reviews: 1500,
    reading_passages: 5000,
  },
};

const ALERT_THRESHOLDS = { warning: 80, critical: 95 };

const getPeriodWindow = (period: UsagePeriod): number => {
  switch (period) {
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000;
  }
};

export class UsageMeteringService {
  private records: UsageRecord[] = [];

  constructor(
    private getPlanLimits: (planId: string) => Record<string, number | null> = (planId) =>
      PLAN_USAGE_LIMITS[planId] ?? PLAN_USAGE_LIMITS.free
  ) {}

  /**
   * Record a usage event.
   */
  record(
    userId: string,
    feature: string,
    count: number = 1,
    tokens?: number,
    costUsd?: number
  ): void {
    this.records.push({
      userId,
      feature,
      count,
      tokens,
      costUsd,
      timestamp: Date.now(),
    });

    // Prune old records (keep last 30 days)
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.records = this.records.filter((r) => r.timestamp >= cutoff);
  }

  /**
   * Get usage summary for a user.
   */
  getSummary(userId: string, planId: string, period: UsagePeriod = 'monthly'): UsageSummary {
    const now = Date.now();
    const windowMs = getPeriodWindow(period);
    const periodStart = new Date(now - windowMs).toISOString();
    const periodEnd = new Date(now).toISOString();

    const userRecords = this.records.filter(
      (r) => r.userId === userId && r.timestamp >= now - windowMs
    );

    const limits = this.getPlanLimits(planId);
    const featureUsage = new Map<string, number>();
    let totalCostUsd = 0;

    for (const record of userRecords) {
      featureUsage.set(record.feature, (featureUsage.get(record.feature) ?? 0) + record.count);
      if (record.costUsd) totalCostUsd += record.costUsd;
    }

    const features = Object.entries(limits).map(([feature, limit]) => {
      const used = featureUsage.get(feature) ?? 0;
      return {
        feature,
        used,
        limit,
        percentage: limit !== null ? Math.min(100, Math.round((used / limit) * 100)) : 0,
      };
    });

    return {
      userId,
      planId,
      period,
      features,
      totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
      periodStart,
      periodEnd,
    };
  }

  /**
   * Check usage alerts for a user.
   */
  getAlerts(userId: string, planId: string): UsageAlert[] {
    const summary = this.getSummary(userId, planId);
    const alerts: UsageAlert[] = [];

    for (const feature of summary.features) {
      if (feature.limit === null) continue;
      if (feature.percentage >= ALERT_THRESHOLDS.critical) {
        alerts.push({
          type: feature.percentage >= 100 ? 'exceeded' : 'critical',
          feature: feature.feature,
          percentage: feature.percentage,
          message: `${feature.feature} usage is at ${feature.percentage}% (${feature.used}/${feature.limit})`,
        });
      } else if (feature.percentage >= ALERT_THRESHOLDS.warning) {
        alerts.push({
          type: 'warning',
          feature: feature.feature,
          percentage: feature.percentage,
          message: `${feature.feature} usage is approaching limit (${feature.percentage}%)`,
        });
      }
    }

    return alerts;
  }

  /**
   * Check if a specific feature is within limits.
   */
  canUseFeature(userId: string, planId: string, feature: string): boolean {
    const limits = this.getPlanLimits(planId);
    const limit = limits[feature];
    if (limit === null || limit === undefined) return true;

    const now = Date.now();
    const userRecords = this.records.filter(
      (r) =>
        r.userId === userId &&
        r.feature === feature &&
        r.timestamp >= now - getPeriodWindow('monthly')
    );
    const used = userRecords.reduce((sum, r) => sum + r.count, 0);
    return used < limit;
  }

  /**
   * Get usage trend for a feature over time.
   */
  getTrend(
    userId: string,
    feature: string,
    days: number = 7
  ): Array<{ date: string; count: number }> {
    const now = Date.now();
    const trend: Array<{ date: string; count: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayStart).toISOString().split('T')[0];

      const dayCount = this.records
        .filter(
          (r) =>
            r.userId === userId &&
            r.feature === feature &&
            r.timestamp >= dayStart &&
            r.timestamp < dayEnd
        )
        .reduce((sum, r) => sum + r.count, 0);

      trend.push({ date: date!, count: dayCount });
    }

    return trend;
  }

  /**
   * Get aggregate usage stats across all users (admin).
   */
  getAggregateStats(
    feature: string,
    period: UsagePeriod = 'monthly'
  ): {
    totalUsers: number;
    totalUsage: number;
    averagePerUser: number;
    topUsers: Array<{ userId: string; count: number }>;
  } {
    const now = Date.now();
    const windowMs = getPeriodWindow(period);
    const relevantRecords = this.records.filter(
      (r) => r.feature === feature && r.timestamp >= now - windowMs
    );

    const userUsage = new Map<string, number>();
    for (const record of relevantRecords) {
      userUsage.set(record.userId, (userUsage.get(record.userId) ?? 0) + record.count);
    }

    const totalUsage = [...userUsage.values()].reduce((sum, count) => sum + count, 0);
    const totalUsers = userUsage.size;

    return {
      totalUsers,
      totalUsage,
      averagePerUser: totalUsers > 0 ? Math.round(totalUsage / totalUsers) : 0,
      topUsers: [...userUsage.entries()]
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
    };
  }
}

// Singleton instance
let globalMetering: UsageMeteringService | null = null;

export const getUsageMeteringService = (): UsageMeteringService => {
  if (!globalMetering) {
    globalMetering = new UsageMeteringService();
  }
  return globalMetering;
};

export const resetUsageMeteringService = (): void => {
  globalMetering = null;
};
