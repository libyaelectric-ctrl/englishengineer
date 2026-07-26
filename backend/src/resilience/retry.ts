import { logger } from '../logger.js';

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Retry with exponential backoff.
 * Retries failed operations with increasing delays.
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const cfg = { ...defaultConfig, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === cfg.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      let delay = cfg.baseDelayMs * Math.pow(cfg.backoffMultiplier, attempt);
      delay = Math.min(delay, cfg.maxDelayMs);

      // Add jitter
      if (cfg.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      logger.w(`Retry attempt ${attempt + 1}/${cfg.maxRetries} after ${Math.round(delay)}ms`, {
        error: lastError.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Retry configuration for different scenarios.
 */
export const RetryPresets = {
  /** Fast retry for transient errors */
  fast: { maxRetries: 2, baseDelayMs: 100, backoffMultiplier: 2 },

  /** Standard retry */
  standard: { maxRetries: 3, baseDelayMs: 1000, backoffMultiplier: 2 },

  /** Slow retry for persistent errors */
  slow: { maxRetries: 5, baseDelayMs: 5000, backoffMultiplier: 3 },

  /** No retry */
  none: { maxRetries: 0 },
} as const;
