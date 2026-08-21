import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

import type { ReactNode } from 'react';

import { ObservabilityService } from '@/core/observability/observability.service';

interface PageErrorBoundaryProps {
  children: ReactNode;
  /** Page name for error reporting */
  pageName: string;
  /** Optional custom fallback */
  fallback?: ReactNode;
}

const PageFallback = ({
  error,
  resetErrorBoundary,
  pageName,
}: FallbackProps & { pageName: string }) => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="premium-panel w-full max-w-md space-y-4 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle className="h-6 w-6 text-rose-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{pageName} Error</h3>
          <p className="text-sm text-muted-copy">
            Something went wrong on this page. Your progress is safe.
          </p>
        </div>
        {import.meta.env.DEV && (
          <p className="max-h-24 overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-left font-mono text-xs text-rose-700">
            {errorMessage}
          </p>
        )}
        <button
          onClick={resetErrorBoundary}
          className="mx-auto flex cursor-pointer items-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

export const PageErrorBoundary = ({ children, pageName, fallback }: PageErrorBoundaryProps) => {
  const handleError = (error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    ObservabilityService.logError({
      code: 'page_error',
      message: `[${pageName}] ${err.message}`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context: { pageName },
    });
  };

  if (fallback) {
    return (
      <ErrorBoundary fallbackRender={() => <>{fallback}</>} onError={handleError}>
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={(props) => <PageFallback {...props} pageName={pageName} />}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
