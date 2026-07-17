import { logger } from '../logger.js';

/**
 * Exponential Backoff Retry Utility
 * Retries failed operations with exponential delay.
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if retry is needed
 * @returns {Promise} Result of the function
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
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

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create retry wrapper for external service calls
 */
export const createRetryWrapper = (service_name, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', '502', '503', '429'],
  } = options;

  return async (fn) => {
    return withRetry(fn, {
      maxRetries,
      baseDelay,
      shouldRetry: (error) => {
        // Retry on network errors
        if (retryableErrors.some((code) => error.code === code)) {
          return true;
        }

        // Retry on specific HTTP status codes
        if (error.status && retryableErrors.includes(String(error.status))) {
          return true;
        }

        // Don't retry on client errors (4xx except 429)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          return false;
        }

        return true;
      },
    });
  };
};

/**
 * Pre-configured retry wrappers for external services
 */
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
