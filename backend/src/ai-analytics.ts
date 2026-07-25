import { logger } from './logger.js';

interface AIUsageRecord {
  timestamp: string;
  userId: string;
  operation: string;
  provider: string;
  mode: 'mock' | 'real';
  durationMs: number;
  tokenCount?: number;
  success: boolean;
  error?: string;
}

interface AIUsageStats {
  totalRequests: number;
  successRate: number;
  averageDurationMs: number;
  byProvider: Record<string, number>;
  byOperation: Record<string, number>;
  errorRate: number;
  peakHour: number;
}

const usageBuffer: AIUsageRecord[] = [];
const MAX_BUFFER_SIZE = 10000;

/**
 * Records an AI usage event for analytics.
 */
export const recordAIUsage = (record: Omit<AIUsageRecord, 'timestamp'>): void => {
  usageBuffer.push({
    ...record,
    timestamp: new Date().toISOString(),
  });

  // Keep buffer size manageable
  if (usageBuffer.length > MAX_BUFFER_SIZE) {
    usageBuffer.splice(0, usageBuffer.length - MAX_BUFFER_SIZE);
  }
};

/**
 * Gets usage statistics for a time period.
 */
export const getAIUsageStats = (
  startTime?: string,
  endTime?: string
): AIUsageStats => {
  const start = startTime ? new Date(startTime).getTime() : 0;
  const end = endTime ? new Date(endTime).getTime() : Date.now();

  const filtered = usageBuffer.filter((r) => {
    const ts = new Date(r.timestamp).getTime();
    return ts >= start && ts <= end;
  });

  const total = filtered.length;
  const successful = filtered.filter((r) => r.success).length;
  const failed = filtered.filter((r) => !r.success).length;

  const byProvider: Record<string, number> = {};
  const byOperation: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};

  let totalDuration = 0;

  for (const record of filtered) {
    byProvider[record.provider] = (byProvider[record.provider] || 0) + 1;
    byOperation[record.operation] = (byOperation[record.operation] || 0) + 1;
    totalDuration += record.durationMs;

    const hour = new Date(record.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  // Find peak hour
  let peakHour = 0;
  let maxCount = 0;
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }

  return {
    totalRequests: total,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    averageDurationMs: total > 0 ? totalDuration / total : 0,
    byProvider,
    byOperation,
    errorRate: total > 0 ? (failed / total) * 100 : 0,
    peakHour,
  };
};

/**
 * Gets recent errors for debugging.
 */
export const getRecentErrors = (limit = 10): AIUsageRecord[] => {
  return usageBuffer
    .filter((r) => !r.success)
    .slice(-limit)
    .reverse();
};

/**
 * Gets usage by user for billing/limits.
 */
export const getUserUsage = (
  userId: string,
  hours = 24
): {
  totalRequests: number;
  successfulRequests: number;
  totalDurationMs: number;
} => {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const userRecords = usageBuffer.filter(
    (r) => r.userId === userId && new Date(r.timestamp).getTime() >= cutoff
  );

  return {
    totalRequests: userRecords.length,
    successfulRequests: userRecords.filter((r) => r.success).length,
    totalDurationMs: userRecords.reduce((sum, r) => sum + r.durationMs, 0),
  };
};

/**
 * Clears old records from the buffer.
 */
export const cleanupOldRecords = (maxAgeHours = 24): number => {
  const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
  const before = usageBuffer.length;

  const filtered = usageBuffer.filter(
    (r) => new Date(r.timestamp).getTime() >= cutoff
  );

  usageBuffer.length = 0;
  usageBuffer.push(...filtered);

  return before - usageBuffer.length;
};
