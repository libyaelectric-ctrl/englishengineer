import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

import { showToast } from '@/shared/components/Toast';
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

/** Parse error body into human-readable message */
async function parseErrorBody(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error !== null) {
      const e = data.error as Record<string, unknown>;
      if (typeof e.message === 'string') return e.message;
    }
    if (typeof data.message === 'string') return data.message;
  } catch {
    // body not JSON
  }
  return `API ${response.status}: ${response.statusText}`;
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
      const message = await parseErrorBody(response);
      const code =
        response.status === 401 || response.status === 403
          ? ErrorCode.AUTH
          : response.status === 429
            ? ErrorCode.NETWORK
            : ErrorCode.NETWORK;

      throw new AppError({
        code,
        message,
        severity: response.status >= 500 ? 'error' : 'warning',
        metadata: { status: response.status, url },
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

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: AppError | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof AppError ? error : toAppError(error, '');
      // Don't retry auth or validation errors
      if (lastError.code === ErrorCode.AUTH || lastError.code === ErrorCode.VALIDATION) {
        throw lastError;
      }
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

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

export const apiClient = createApiClient();
