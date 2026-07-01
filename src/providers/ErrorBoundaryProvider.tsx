import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
}

const isDevelopment =
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="premium-panel w-full max-w-xl space-y-6 p-8">
        <div className="flex items-center gap-3 text-rose-700">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-black tracking-tight uppercase">
            Application Error
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          EngineerOS hit an unexpected interface error. Your local progress
          remains stored; review the diagnostic message below and reload the
          workspace.
        </p>
        <div className="custom-scrollbar max-h-48 overflow-x-auto rounded-[12px] border border-rose-200 bg-rose-50 p-4 font-mono text-xs text-rose-700">
          {(error instanceof Error ? error.message : String(error)) ||
            'Unknown Exception'}
        </div>
        {isDevelopment && (
          <p className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Development hint: inspect the browser console and the component
            stack before retrying.
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </a>
          <button
            onClick={resetErrorBoundary}
            className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
}) => {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
};
