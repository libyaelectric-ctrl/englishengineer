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

/** HTTP statuses worth another attempt. A provider code is not a status. */
const RETRYABLE_STATUSES: ReadonlySet<number> = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Reads the HTTP status off a provider error.
 *
 * The Stripe SDK carries it in `statusCode` (`status` is not a StripeError
 * field), while this repo's own ApiError uses `status`. Reading only one of the
 * two is why the previous predicate — which stringified `status ?? code` and
 * compared it to status literals — never matched a real Stripe failure and so
 * never retried one, while treating a provider code whose text happened to be
 * `'503'` as a retryable status.
 */
const readHttpStatus = (error: unknown): number | undefined => {
  const candidate = error as { statusCode?: unknown; status?: unknown } | null;
  if (typeof candidate?.statusCode === 'number') return candidate.statusCode;
  if (typeof candidate?.status === 'number') return candidate.status;
  return undefined;
};

export const isRetryableProviderError = (error: unknown): boolean => {
  const status = readHttpStatus(error);
  return status !== undefined && RETRYABLE_STATUSES.has(status);
};

/** Pre-configured retry wrapper for Stripe API calls */
export const stripeRetry = <T>(fn: () => Promise<T>): Promise<T> =>
  withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: isRetryableProviderError,
  });
