import { logger } from '../logger.js';

interface MetricPoint {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

interface Counter {
  name: string;
  value: number;
  tags: Record<string, string>;
}

interface Histogram {
  name: string;
  values: number[];
  tags: Record<string, string>;
}

/**
 * Metrics collector for monitoring.
 * Collects counters, histograms, and gauges.
 */
export class MetricsCollector {
  private counters = new Map<string, Counter>();
  private histograms = new Map<string, Histogram>();
  private gauges = new Map<string, { value: number; tags: Record<string, string> }>();
  private points: MetricPoint[] = [];

  /**
   * Increment a counter.
   */
  increment(name: string, value = 1, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`;
    const existing = this.counters.get(key);

    this.counters.set(key, {
      name,
      value: (existing?.value || 0) + value,
      tags,
    });
  }

  /**
   * Record a histogram value.
   */
  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(tags)}`;
    const existing = this.histograms.get(key);

    this.histograms.set(key, {
      name,
      values: [...(existing?.values || []), value],
      tags,
    });
  }

  /**
   * Set a gauge value.
   */
  gauge(name: string, value: number, tags: Record<string, string> = {}): void {
    this.gauges.set(name, { value, tags });
  }

  /**
   * Record timing of an operation.
   */
  timing(name: string, durationMs: number, tags: Record<string, string> = {}): void {
    this.histogram(name, durationMs, tags);
  }

  /**
   * Time an async operation.
   */
  async time<T>(name: string, fn: () => Promise<T>, tags: Record<string, string> = {}): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.timing(name, Date.now() - start, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.timing(name, Date.now() - start, { ...tags, status: 'error' });
      throw error;
    }
  }

  /**
   * Get counter value.
   */
  getCounter(name: string, tags: Record<string, string> = {}): number {
    const key = `${name}:${JSON.stringify(tags)}`;
    return this.counters.get(key)?.value || 0;
  }

  /**
   * Get histogram statistics.
   */
  getHistogramStats(name: string, tags: Record<string, string> = {}): {
    count: number;
    min: number;
    max: number;
    mean: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = `${name}:${JSON.stringify(tags)}`;
    const histogram = this.histograms.get(key);

    if (!histogram || histogram.values.length === 0) {
      return null;
    }

    const sorted = [...histogram.values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const mean = sorted.reduce((a, b) => a + b, 0) / count;

    const percentile = (p: number): number => {
      const index = Math.ceil((p / 100) * count) - 1;
      return sorted[Math.max(0, index)];
    };

    return {
      count,
      min,
      max,
      mean,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Get all metrics as a snapshot.
   */
  snapshot(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, ReturnType<typeof this.getHistogramStats>>;
  } {
    const counters: Record<string, number> = {};
    for (const [key, counter] of this.counters.entries()) {
      counters[counter.name] = counter.value;
    }

    const gauges: Record<string, number> = {};
    for (const [name, gauge] of this.gauges.entries()) {
      gauges[name] = gauge.value;
    }

    const histograms: Record<string, ReturnType<typeof this.getHistogramStats>> = {};
    for (const [key, histogram] of this.histograms.entries()) {
      histograms[histogram.name] = this.getHistogramStats(histogram.name, histogram.tags);
    }

    return { counters, gauges, histograms };
  }

  /**
   * Reset all metrics.
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.points = [];
  }
}

// Global metrics instance
let instance: MetricsCollector | null = null;

export const getMetrics = (): MetricsCollector => {
  if (!instance) {
    instance = new MetricsCollector();
  }
  return instance;
};
