import { ObservabilityService } from '@/core/observability/observability.service';
import type { ErrorReport } from '@/core/observability/observability.types';

/**
 * Boundary scopes that map to the error-report codes used by the
 * observability contract. Kept in one place so every error boundary
 * (global / route / page) reports through the same channel and no
 * boundary can drift to a divergent logging behavior.
 */
export type BoundaryScope = 'global' | 'route' | 'page';

const SCOPE_TO_CODE: Record<BoundaryScope, string> = {
  global: 'unhandled_error',
  route: 'route_error',
  page: 'page_error',
};

const SCOPE_TO_SEVERITY: Record<BoundaryScope, ErrorReport['severity']> = {
  global: 'high',
  route: 'medium',
  page: 'medium',
};

export interface BoundaryErrorInput {
  error: unknown;
  scope: BoundaryScope;
  /** Page/route name for error reporting, e.g. "Vocabulary" or "Team". */
  pageName?: string;
  componentStack?: string | null;
}

/**
 * Single reporting path for React error boundaries. Wraps non-Error
 * values, prefixes page context, and forwards to the observability
 * service (local logger + Sentry when initialized), matching the
 * shape every boundary previously implemented by hand.
 */
export const logBoundaryError = ({
  error,
  scope,
  pageName,
  componentStack,
}: BoundaryErrorInput): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  const context: Record<string, unknown> = { scope };
  if (pageName) context.pageName = pageName;
  if (componentStack) context.componentStack = componentStack;

  ObservabilityService.logError({
    code: SCOPE_TO_CODE[scope],
    message: pageName ? `[${pageName}] ${err.message}` : err.message,
    severity: SCOPE_TO_SEVERITY[scope],
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    stack: err.stack,
    context,
  });
};
