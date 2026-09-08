import { AlertTriangle, RefreshCw } from 'lucide-react';

import type { ReactNode } from 'react';

/**
 * Shared fallback primitives for React error boundaries.
 *
 * Every boundary (global / route / page) renders through these pieces so
 * the recovery screens share one visual language: rose alert accent on
 * the surface tokens, a dev-only details block, and consistent action
 * buttons. Layout decisions (full-screen vs panel vs inline) stay with
 * each scope.
 */

export const ErrorIcon = () => (
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
    <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
  </div>
);

export const ErrorDetailsBlock = ({ error }: { error: unknown }) => {
  const message = error instanceof Error ? error.message : String(error);
  if (!import.meta.env.DEV) return null;
  return (
    <p
      role="alert"
      className="custom-scrollbar max-h-24 overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-left font-mono text-xs text-rose-700"
    >
      {message || 'Unknown error'}
    </p>
  );
};

interface RetryButtonProps {
  onClick: () => void;
  label?: string;
}

export const RetryButton = ({ onClick, label = 'Try Again' }: RetryButtonProps) => (
  <button
    onClick={onClick}
    className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 active:scale-[0.97]"
  >
    <RefreshCw className="h-4 w-4" aria-hidden="true" />
    <span>{label}</span>
  </button>
);

export const ErrorActions = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">{children}</div>
);
