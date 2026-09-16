import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

import { createApiClient } from './apiClient';

vi.mock('@/shared/services/backend-auth.service', () => ({
  getBackendAuthHeaders: vi.fn(async () => ({})),
}));

const errorResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const envelope = (code: string, message: string) => ({ ok: false, error: { code, message } });

const client = (maxRetries = 0) =>
  createApiClient({ baseUrl: 'http://backend.test', toastErrors: false, maxRetries });

const capture = async (call: () => Promise<unknown>): Promise<AppError> => {
  try {
    await call();
  } catch (error) {
    return error as AppError;
  }
  throw new Error('expected the request to reject');
};

describe('apiClient error envelope', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps the backend's error code instead of making callers match its message", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        errorResponse(
          503,
          envelope('audit_log_unavailable', 'Required audit logging is unavailable.')
        )
      )
    );

    const error = await capture(() => client().post('/v1/billing/x', {}, { skipAuth: true }));

    expect(error.apiCode).toBe('audit_log_unavailable');
    expect(error.httpStatus).toBe(503);
    expect(error.message).toBe('Required audit logging is unavailable.');
    expect(error.code).toBe(ErrorCode.NETWORK);
    expect(error.severity).toBe('error');
  });

  it('does not retry a 404', async () => {
    const fetchMock = vi.fn(async () => errorResponse(404, envelope('route_not_found', 'nope')));
    vi.stubGlobal('fetch', fetchMock);

    await capture(() => client(2).get('/v1/missing', { skipAuth: true }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a 503 up to the configured attempts', async () => {
    const fetchMock = vi.fn(async () =>
      errorResponse(503, envelope('billing_unavailable', 'down'))
    );
    vi.stubGlobal('fetch', fetchMock);

    await capture(() => client(1).get('/v1/billing/status', { skipAuth: true }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('classifies a validation failure and does not retry it', async () => {
    const fetchMock = vi.fn(async () => errorResponse(422, envelope('invalid_plan', 'bad plan')));
    vi.stubGlobal('fetch', fetchMock);

    const error = await capture(() => client(3).post('/v1/billing/x', {}, { skipAuth: true }));

    expect(error.code).toBe(ErrorCode.VALIDATION);
    expect(error.apiCode).toBe('invalid_plan');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('classifies an auth failure as auth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(401, envelope('authentication_required', 'sign in')))
    );

    const error = await capture(() => client().get('/v1/profile', { skipAuth: true }));

    expect(error.code).toBe(ErrorCode.AUTH);
    expect(error.httpStatus).toBe(401);
    expect(error.severity).toBe('error');
  });
});
