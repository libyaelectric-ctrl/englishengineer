import type { Response } from 'express';

interface SuccessResponse {
  ok: true;
  data: unknown;
}

interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface PaginatedResponse extends SuccessResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Sends a success response.
 *
 * @example
 * sendSuccess(res, { id: '123', name: 'Item' });
 */
export const sendSuccess = (res: Response, data: unknown, statusCode = 200): void => {
  res.status(statusCode).json({ ok: true, data } satisfies SuccessResponse);
};

/**
 * Sends an error response.
 *
 * @example
 * sendError(res, 'NOT_FOUND', 'Item not found', 404);
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown
): void => {
  res.status(statusCode).json({
    ok: false,
    error: { code, message, details },
  } satisfies ErrorResponse);
};

/**
 * Sends a paginated response.
 *
 * @example
 * sendPaginated(res, items, { page: 1, limit: 20, total: 100 });
 */
export const sendPaginated = (
  res: Response,
  data: unknown,
  pagination: { page: number; limit: number; total: number }
): void => {
  res.status(200).json({
    ok: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  } satisfies PaginatedResponse);
};

/**
 * Sends a 204 No Content response.
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).end();
};

/**
 * Sends a health check response.
 */
export const sendHealth = (
  res: Response,
  status: 'ok' | 'degraded' | 'error',
  checks: Record<string, unknown>,
  version: string
): void => {
  const statusCode = status === 'ok' ? 200 : status === 'degraded' ? 200 : 503;
  res.status(statusCode).json({
    ok: status !== 'error',
    status,
    version,
    checks,
    timestamp: new Date().toISOString(),
  });
};
