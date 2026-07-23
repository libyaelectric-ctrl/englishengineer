import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName: string;
}

const PageFallback: React.FC<FallbackProps & { pageName: string }> = ({
  error,
  resetErrorBoundary,
  pageName,
}) => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-foreground">
          {pageName} Failed to Load
        </h2>
        <p className="text-sm text-muted-copy">
          Something went wrong while loading this page. Your other data is safe.
        </p>
        <p className="rounded-lg border border-border-soft bg-surface p-3 font-mono text-xs text-muted-copy">
          {message}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={resetErrorBoundary}>Try Again</Button>
        </div>
      </div>
    </div>
  );
};

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName,
}) => (
  <ErrorBoundary
    FallbackComponent={(props) => (
      <PageFallback {...props} pageName={pageName} />
    )}
    onReset={() => window.location.reload()}
  >
    {children}
  </ErrorBoundary>
);
