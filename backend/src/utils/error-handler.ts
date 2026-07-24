import { ApiError } from '../errors.js';
import { logger } from '../logger.js';
import type { Request, Response, NextFunction } from 'express';
import type { BackendConfig } from '../../types.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export const toErrorResponse = (
  error: unknown,
  requestId?: string
): ErrorResponse => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(requestId && { requestId }),
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'internal_error',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred.'
            : error.message,
        ...(requestId && { requestId }),
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'internal_error',
      message: 'An unexpected error occurred.',
      ...(requestId && { requestId }),
    },
  };
};

export const createErrorHandler =
  (_config: BackendConfig) =>
  (
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction
  ): void => {
    const requestId = request.headers['x-request-id'] as string | undefined;

    logger.error(
      'Unhandled API error',
      {
        path: request.path,
        method: request.method,
        requestId,
        userId: (request as unknown as { auth?: { userId?: string } })?.auth
          ?.userId,
        timestamp: new Date().toISOString(),
      },
      error instanceof Error ? error : undefined
    );

    const mapped = toErrorResponse(error, requestId);
    const statusCode = error instanceof ApiError ? error.status : 500;

    response.status(statusCode).json(mapped);
  };
