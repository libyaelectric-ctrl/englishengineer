import { logger } from '../logger.js';

interface QueryStats {
  query: string;
  duration: number;
  rowsReturned: number;
  timestamp: string;
}

interface SlowQueryThreshold {
  warning: number;
  critical: number;
}

const defaultThreshold: SlowQueryThreshold = {
  warning: 1000, // 1 second
  critical: 5000, // 5 seconds
};

const queryStats: QueryStats[] = [];
const MAX_STATS_SIZE = 1000;

/**
 * Query optimizer and performance tracker.
 * Monitors query performance and identifies slow queries.
 */
export class QueryOptimizer {
  private threshold: SlowQueryThreshold;

  constructor(threshold: Partial<SlowQueryThreshold> = {}) {
    this.threshold = { ...defaultThreshold, ...threshold };
  }

  /**
   * Track a query execution.
   */
  track(query: string, duration: number, rowsReturned: number): void {
    const stats: QueryStats = {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      rowsReturned,
      timestamp: new Date().toISOString(),
    };

    queryStats.push(stats);

    // Keep buffer size manageable
    if (queryStats.length > MAX_STATS_SIZE) {
      queryStats.splice(0, queryStats.length - MAX_STATS_SIZE);
    }

    // Log slow queries
    if (duration >= this.threshold.critical) {
      logger.e('Critical slow query detected', {
        query: stats.query,
        duration,
        rowsReturned,
      });
    } else if (duration >= this.threshold.warning) {
      logger.w('Slow query detected', {
        query: stats.query,
        duration,
        rowsReturned,
      });
    }
  }

  /**
   * Wrap a query with performance tracking.
   */
  async trackQuery<T>(query: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;

      const rowsReturned = Array.isArray(result) ? result.length : 1;
      this.track(query, duration, rowsReturned);

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.track(query, duration, 0);
      throw error;
    }
  }

  /**
   * Get slow queries.
   */
  getSlowQueries(limit = 10): QueryStats[] {
    return queryStats
      .filter((s) => s.duration >= this.threshold.warning)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get query statistics.
   */
  getStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    criticalQueries: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const durations = queryStats.map((s) => s.duration).sort((a, b) => a - b);
    const total = durations.length;

    if (total === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        criticalQueries: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sum = durations.reduce((a, b) => a + b, 0);
    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * total) - 1;
      return durations[Math.max(0, index)];
    };

    return {
      totalQueries: total,
      averageDuration: sum / total,
      slowQueries: queryStats.filter((s) => s.duration >= this.threshold.warning).length,
      criticalQueries: queryStats.filter((s) => s.duration >= this.threshold.critical).length,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Get index recommendations based on slow queries.
   */
  getIndexRecommendations(): string[] {
    const recommendations: string[] = [];
    const slowQueries = this.getSlowQueries(20);

    for (const query of slowQueries) {
      // Simple pattern matching for common optimization opportunities
      if (query.query.includes('WHERE') && !query.query.includes('INDEX')) {
        recommendations.push(`Consider adding index for: ${query.query.substring(0, 100)}`);
      }
      if (query.query.includes('JOIN') && query.duration > 2000) {
        recommendations.push(`Optimize JOIN query: ${query.query.substring(0, 100)}`);
      }
      if (query.rowsReturned > 10000) {
        recommendations.push(`Add pagination for query returning ${query.rowsReturned} rows`);
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Global instance
let instance: QueryOptimizer | null = null;

export const getQueryOptimizer = (threshold?: Partial<SlowQueryThreshold>): QueryOptimizer => {
  if (!instance) {
    instance = new QueryOptimizer(threshold);
  }
  return instance;
};
