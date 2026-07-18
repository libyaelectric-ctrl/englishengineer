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
      logger.info('Retry attempt', { attempt: attempt + 1, maxRetries, error: lastError.message });
    }
  }

  throw lastError;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface RetryWrapperOptions {
  maxRetries?: number;
  baseDelay?: number;
  retryableErrors?: string[];
}

export const createRetryWrapper = (
  service_name: string,
  options: RetryWrapperOptions = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', '502', '503', '429'],
  } = options;

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    return withRetry(fn, {
      maxRetries,
      baseDelay,
      shouldRetry: (error: unknown) => {
        const err = error as Record<string, unknown>;
        if (retryableErrors.some((code) => err.code === code)) {
          return true;
        }
        if (err.status && retryableErrors.includes(String(err.status))) {
          return true;
        }
        if (typeof err.status === 'number' && err.status >= 400 && err.status < 500 && err.status !== 429) {
          return false;
        }
        return true;
      },
    });
  };
};

export const stripeRetry = createRetryWrapper('stripe', {
  maxRetries: 3,
  baseDelay: 1000,
  retryableErrors: ['429', '500', '502', '503'],
});

export const supabaseRetry = createRetryWrapper('supabase', {
  maxRetries: 3,
  baseDelay: 500,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '429', '500', '502', '503'],
});

export const anthropicRetry = createRetryWrapper('anthropic', {
  maxRetries: 3,
  baseDelay: 2000,
  retryableErrors: ['429', '500', '502', '503'],
});
