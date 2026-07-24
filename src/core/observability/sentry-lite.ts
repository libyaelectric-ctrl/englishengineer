/**
 * Sentry Lite — stub implementation.
 * Sentry removed for bundle optimization. Errors logged to console only.
 */

export const initSentryLite = async (
  _dsn: string,
  _environment: string
): Promise<void> => {
  // No-op: Sentry removed to reduce bundle size
};

export const reportError = (error: Error): void => {
  console.error('[Error]', error.message);
};
