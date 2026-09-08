import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

import type { ReactNode } from 'react';

import {
  ErrorActions,
  ErrorDetailsBlock,
  ErrorIcon,
  RetryButton,
} from '@/shared/errors/ErrorFallbackCore';
import { logBoundaryError } from '@/shared/errors/boundaryLogging';

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
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="premium-panel w-full max-w-md space-y-4 p-8 text-center">
        <ErrorIcon />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{pageName} Error</h3>
          <p className="text-sm text-muted-copy">
            Something went wrong on this page. Your progress is safe.
          </p>
        </div>
        <ErrorDetailsBlock error={error} />
        <ErrorActions>
          <RetryButton onClick={resetErrorBoundary} />
        </ErrorActions>
      </div>
    </div>
  );
};

export const PageErrorBoundary = ({ children, pageName, fallback }: PageErrorBoundaryProps) => {
  const handleError = (error: unknown) => {
    logBoundaryError({ error, scope: 'page', pageName });
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
