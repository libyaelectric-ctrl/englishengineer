import { logger } from '../logger.js';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export const withRetry = async <T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      logger.info('Retry attempt', {
        attempt: attempt + 1,
        maxRetries,
        error: error.message,
        delayMs: Math.round(delay),
      });

      await sleep(delay);
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
      shouldRetry: (error: any) => {
        if (retryableErrors.some((code) => error.code === code)) {
          return true;
        }
        if (error.status && retryableErrors.includes(String(error.status))) {
          return true;
        }
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
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
