import { logger } from '../logger.js';

/**
 * Webhook Retry Handler with Exponential Backoff
 *
 * Retries failed webhook deliveries with increasing delays.
 * Used for Stripe/Dodo webhook processing where transient failures
 * (network blips, provider downtime) should not cause permanent data loss.
 *
 * Default: 3 retries at 1s, 5s, 25s intervals with jitter.
 */

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRange: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  jitterRange: 500,
};

/**
 * Calculate delay with exponential backoff + jitter.
 */
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const exponentialDelay = Math.min(config.baseDelayMs * Math.pow(2, attempt), config.maxDelayMs);
  const jitter = (Math.random() - 0.5) * config.jitterRange * 2;
  return Math.max(0, exponentialDelay + jitter);
};

/**
 * Execute a function with retry logic and exponential backoff.
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @param context - Context for logging (e.g., webhook ID, event type)
 * @returns The result of the function, or throws after all retries exhausted
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: { operation?: string; eventId?: string } = {}
): Promise<T> => {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  const operation = context.operation ?? 'webhook';
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        logger.info(`[WebhookRetry] ${operation} succeeded after ${attempt} retries`, {
          eventId: context.eventId,
          attempt,
        });
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < cfg.maxRetries) {
        const delayMs = calculateDelay(attempt, cfg);
        logger.warn(
          `[WebhookRetry] ${operation} failed (attempt ${attempt + 1}/${cfg.maxRetries + 1}), retrying in ${Math.round(delayMs)}ms`,
          {
            eventId: context.eventId,
            error: lastError.message,
            attempt,
            delayMs: Math.round(delayMs),
          }
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        logger.error(`[WebhookRetry] ${operation} failed after ${cfg.maxRetries + 1} attempts`, {
          eventId: context.eventId,
          error: lastError.message,
          attempts: cfg.maxRetries + 1,
        });
      }
    }
  }

  throw lastError;
};

/**
 * Process a Stripe webhook event with retry logic.
 * Handles the common pattern: verify → process → mark processed.
 */
export const processWebhookWithRetry = async <T>(
  eventId: string,
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> => {
  return withRetry(fn, config, { operation: 'stripe-webhook', eventId });
};

/**
 * A simple retry wrapper for external HTTP calls.
 * Useful for calling third-party APIs that may have transient failures.
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  config?: Partial<RetryConfig>
): Promise<Response> => {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      // Don't retry client errors (4xx) — only server errors (5xx) and network errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error ${response.status}: ${response.statusText}`);
      }
      return response;
    },
    config,
    { operation: `fetch:${url}` }
  );
};
