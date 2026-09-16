import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

import { showToast } from '@/shared/components/Toast';
import {
  RETRYABLE_STATUSES,
  classifyHttpStatus,
  parseApiErrorResponse,
} from '@/shared/services/api-error';
import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiClientConfig {
  /** Base URL — falls back to env vars */
  baseUrl?: string;
  /** Default timeout in ms (default 15 000) */
  timeoutMs?: number;
  /** Max retries for transient failures (default 1 — no retry) */
  maxRetries?: number;
  /** Show toast on error (default true for singleton) */
  toastErrors?: boolean;
}

interface RequestOptions extends Omit<RequestInit, 'signal'> {
  /** Override timeout for this single request */
  timeoutMs?: number;
  /** Skip auth header (e.g. public endpoints) */
  skipAuth?: boolean;
  /** Retry count override */
  maxRetries?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 15_000;

function resolveBase(config?: ApiClientConfig): string {
  const raw =
    config?.baseUrl ?? import.meta.env.VITE_AI_PROXY_URL ?? import.meta.env.VITE_BACKEND_URL ?? '';
  return raw.replace(/\/+$/, '');
}

/** Map network / abort errors to AppError */
function toAppError(error: unknown, url: string): AppError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AppError({
      code: ErrorCode.NETWORK,
      message: `Request to ${url} timed out.`,
      severity: 'warning',
      cause: error instanceof Error ? error : undefined,
    });
  }

  if (error instanceof TypeError) {
    return new AppError({
      code: ErrorCode.NETWORK,
      message: `Network unreachable — ${url}`,
      severity: 'error',
      cause: error,
    });
  }

  if (error instanceof AppError) return error;

  return new AppError({
    code: ErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown API error',
    severity: 'error',
    cause: error instanceof Error ? error : undefined,
  });
}

/** Sleep with jitter for exponential backoff */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 100));
}

// ---------------------------------------------------------------------------
// apiFetch — the core wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number; skipAuth?: boolean },
  config: Required<ApiClientConfig>
): Promise<T> {
  const controller = new AbortController();
  const timeout = init.timeoutMs ?? config.timeoutMs;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    // Auth
    const authHeaders = init.skipAuth ? {} : await getBackendAuthHeaders();

    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...init.headers,
      },
    });

    if (!response.ok) {
      const { message, apiCode } = await parseApiErrorResponse(response);
      const code = classifyHttpStatus(response.status);

      // 401/403 must be visible to the user — a silently-failing auth error
      // looks like "my progress isn't saving" with zero diagnostic signal.
      const severity: AppError['severity'] =
        response.status >= 500 || code === ErrorCode.AUTH ? 'error' : 'warning';

      throw new AppError({
        code,
        // The backend already said what failed; carrying it is what lets callers
        // stop matching the sentence below.
        apiCode,
        httpStatus: response.status,
        message,
        severity,
        metadata: { url },
      });
    }

    // 204 No Content
    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
  } catch (error) {
    const appError = toAppError(error, url);
    // Global toast for non-retried errors
    if (config.toastErrors && appError.severity === 'error') {
      showToast(appError.message, 'error');
    }
    throw appError;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Retry wrapper
// ---------------------------------------------------------------------------

/**
 * Retry by what the server actually answered, not by the coarse class: a 404 or
 * a 409 must not be attempted again, and a 503 or a timeout must.
 */
const isRetryable = (error: AppError): boolean =>
  error.httpStatus === undefined ? true : RETRYABLE_STATUSES.has(error.httpStatus);

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: AppError | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof AppError ? error : toAppError(error, '');
      if (!isRetryable(lastError)) throw lastError;
      if (attempt < maxRetries) {
        await sleep(1000 * 2 ** attempt); // 1s, 2s, 4s...
      }
    }
  }
  throw lastError!;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function createApiClient(config?: ApiClientConfig) {
  const cfg: Required<ApiClientConfig> = {
    baseUrl: resolveBase(config),
    timeoutMs: config?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxRetries: config?.maxRetries ?? 0,
    toastErrors: config?.toastErrors ?? true,
  };

  const get = <T>(path: string, opts?: RequestOptions): Promise<T> => {
    const url = `${cfg.baseUrl}${path}`;
    return withRetry(
      () => apiFetch<T>(url, { method: 'GET', ...opts }, cfg),
      opts?.maxRetries ?? cfg.maxRetries
    );
  };

  const post = <T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> => {
    const url = `${cfg.baseUrl}${path}`;
    return withRetry(
      () =>
        apiFetch<T>(
          url,
          { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...opts },
          cfg
        ),
      opts?.maxRetries ?? cfg.maxRetries
    );
  };

  const put = <T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> => {
    const url = `${cfg.baseUrl}${path}`;
    return withRetry(
      () =>
        apiFetch<T>(
          url,
          { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...opts },
          cfg
        ),
      opts?.maxRetries ?? cfg.maxRetries
    );
  };

  const del = <T>(path: string, opts?: RequestOptions): Promise<T> => {
    const url = `${cfg.baseUrl}${path}`;
    return withRetry(
      () => apiFetch<T>(url, { method: 'DELETE', ...opts }, cfg),
      opts?.maxRetries ?? cfg.maxRetries
    );
  };

  return { get, post, put, del };
}
