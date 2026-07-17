import { logger } from './logger.js';

interface SlowQueryRecord {
  timestamp: string;
  query: string;
  durationMs: number;
  [key: string]: unknown;
}

const slowQueries: SlowQueryRecord[] = [];
const SLOW_THRESHOLD_MS = 500;

export const logQuery = (query: string | unknown, durationMs: number, meta: Record<string, unknown> = {}): void => {
  if (durationMs >= SLOW_THRESHOLD_MS) {
    const record: SlowQueryRecord = {
      timestamp: new Date().toISOString(),
      query: typeof query === 'string' ? query.slice(0, 200) : 'unknown',
      durationMs,
      ...meta,
    };
    slowQueries.push(record);
    if (slowQueries.length > 1000)
      slowQueries.splice(0, slowQueries.length - 1000);
    logger.warn('Slow query detected', { durationMs, query: record });
  }
};

export const getSlowQueries = (limit: number = 50): SlowQueryRecord[] => {
  return slowQueries.slice(-limit);
};
