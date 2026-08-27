import { logger } from '../logger.js';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const calcDelay = (attempt: number, baseDelay: number, maxDelay: number) =>
  Math.min(baseDelay * 2 ** attempt + Math.random() * 1000, maxDelay);

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

export const withRetry = async <T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, shouldRetry = () => true } = opts;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = toError(error);
      if (!(attempt < maxRetries && shouldRetry(error))) throw error;
      await sleep(calcDelay(attempt, baseDelay, maxDelay));
      logger.info('Retry attempt', {
        attempt: attempt + 1,
        maxRetries,
        error: lastError.message,
      });
    }
  }

  throw lastError;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Pre-configured retry wrapper for Stripe API calls */
export const stripeRetry = <T>(fn: () => Promise<T>): Promise<T> =>
  withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: (error: unknown) => {
      const err = error as Record<string, unknown>;
      const code = String(err.status ?? err.code ?? '');
      return ['429', '500', '502', '503'].includes(code);
    },
  });
