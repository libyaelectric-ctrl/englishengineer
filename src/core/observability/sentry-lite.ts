/**
 * Sentry Lite — minimal error monitoring wrapper.
 * Uses @sentry/browser directly for smaller bundle size.
 * Only captures errors, no tracing/replay/extensions.
 */

import type { BrowserOptions } from '@sentry/browser';

let initialized = false;
let sentryClient: { captureException: (e: Error) => void } | null = null;

export const initSentryLite = async (
  dsn: string,
  environment: string
): Promise<void> => {
  if (initialized || !dsn) return;

  const { init, captureException } = await import('@sentry/browser');

  init({
    dsn,
    environment,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [],
    enabled: true,
  } as BrowserOptions);

  sentryClient = { captureException };
  initialized = true;
};

export const reportError = (error: Error): void => {
  sentryClient?.captureException(error);
};
