import { useCallback, useEffect, useRef, useState } from 'react';

import { AppError } from '@/core/errors/app-error';
import type { ErrorCode } from '@/core/errors/error-codes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseApiQueryResult<T> {
  data: T | null;
  error: AppError | null;
  loading: boolean;
  /** True after first successful fetch (useful for skeleton vs empty) */
  loaded: boolean;
  /** Manually re-trigger the fetch */
  refetch: () => void;
}

export interface UseApiQueryOptions {
  /** Skip the initial fetch (default false) */
  enabled?: boolean;
  /** Refetch interval in ms (0 = disabled) */
  refetchIntervalMs?: number;
  /** Called on successful fetch */
  onSuccess?: (data: unknown) => void;
  /** Called on error */
  onError?: (error: AppError) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Generic async data fetcher with loading/error state.
 *
 * @example
 * const { data, loading, error } = useApiQuery(
 *   () => AiAnalyticsService.fetch(),
 *   { refetchIntervalMs: 30_000 }
 * );
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  options?: UseApiQueryOptions
): UseApiQueryResult<T> {
  const { enabled = true, refetchIntervalMs = 0, onSuccess, onError } = options ?? {};

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [loaded, setLoaded] = useState<boolean>(false);
  const fetchIdRef = useRef(0);
  const mountedRef = useRef(true);

  const execute = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!mountedRef.current || id !== fetchIdRef.current) return;
        setData(result);
        setLoaded(true);
        setLoading(false);
        onSuccess?.(result);
      })
      .catch((err) => {
        if (!mountedRef.current || id !== fetchIdRef.current) return;
        const appError =
          err instanceof AppError
            ? err
            : ({
                code: 'error.unknown' as ErrorCode,
                message: err instanceof Error ? err.message : 'Unknown error',
                severity: 'error' as const,
                timestamp: new Date().toISOString(),
                metadata: {},
                toJSON() {
                  return {};
                },
              } as unknown as AppError);
        setError(appError);
        setLoading(false);
        onError?.(appError);
      });
  }, [fetcher, enabled, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  // Polling
  useEffect(() => {
    if (refetchIntervalMs <= 0 || !enabled) return;
    const timer = window.setInterval(execute, refetchIntervalMs);
    return () => window.clearInterval(timer);
  }, [execute, refetchIntervalMs, enabled]);

  return { data, error, loading, loaded, refetch: execute };
}

// ---------------------------------------------------------------------------
// useApiMutation — for POST/PUT/DELETE
// ---------------------------------------------------------------------------

export interface UseApiMutationResult<TInput, TOutput> {
  data: TOutput | null;
  error: AppError | null;
  loading: boolean;
  mutate: (input: TInput) => Promise<TOutput>;
  reset: () => void;
}

export function useApiMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<TOutput>,
  options?: { onSuccess?: (data: TOutput) => void; onError?: (error: AppError) => void }
): UseApiMutationResult<TInput, TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(input);
        setData(result);
        setLoading(false);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const appError =
          err instanceof AppError
            ? err
            : ({
                code: 'error.unknown',
                message: err instanceof Error ? err.message : 'Unknown error',
                severity: 'error',
                timestamp: new Date().toISOString(),
                metadata: {},
                toJSON() {
                  return {};
                },
              } as unknown as AppError);
        setError(appError);
        setLoading(false);
        options?.onError?.(appError);
        throw appError;
      }
    },
    [mutator, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, mutate, reset };
}
