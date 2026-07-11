import React, { useCallback } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
}

const isDevelopment =
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const errorDetails = error instanceof Error ? error.message : String(error);

  const handleReport = () => {
    const subject = encodeURIComponent('EngVox Error Report');
    const body = encodeURIComponent(
      `Error: ${errorDetails}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`
    );
    window.open(`mailto:support@engvox.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-hover p-6 text-foreground">
      <div className="premium-panel w-full max-w-xl space-y-6 p-8">
        <div className="flex items-center gap-3 text-rose-700">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-black tracking-tight uppercase">
            Application Error
          </h2>
        </div>
        <p className="text-sm text-muted-copy leading-relaxed">
          EngVox hit an unexpected error. Your progress is saved locally. Try
          reloading or contact support if the issue persists.
        </p>
        <div className="custom-scrollbar max-h-48 overflow-x-auto rounded-[12px] border border-rose-200 bg-rose-50 p-4 font-mono text-xs text-rose-700">
          {errorDetails || 'Unknown error'}
        </div>
        {isDevelopment && (
          <p className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Dev: check browser console for stack trace.
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <a
            href="/"
            className="flex items-center gap-2 rounded-[12px] border border-border-soft bg-surface px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-surface-hover"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </a>
          <button
            onClick={handleReport}
            className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-border-soft bg-surface px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-surface-hover"
          >
            <Mail className="h-4 w-4" />
            <span>Report</span>
          </button>
          <button
            onClick={resetErrorBoundary}
            className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
}) => {
  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
};
