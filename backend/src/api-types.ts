/**
 * Standardized API response types.
 * All API responses should follow these formats.
 */

// Base response types
export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    duration?: number;
  };
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string; // Only in development
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiListResponse<T> extends ApiSuccessResponse<T[]> {
  count: number;
}

// Response builders
export const createSuccessResponse = <T>(
  data: T,
  meta?: { requestId?: string; timestamp?: string; duration?: number }
): ApiSuccessResponse<T> => ({
  ok: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createErrorResponse = (
  code: string,
  message: string,
  details?: unknown,
  stack?: string
): ApiErrorResponse => ({
  ok: false,
  error: {
    code,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' ? { stack } : {}),
  },
  meta: {
    timestamp: new Date().toISOString(),
  },
});

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  meta?: { requestId?: string; timestamp?: string }
): ApiPaginatedResponse<T> => ({
  ok: true,
  data,
  pagination: {
    ...pagination,
    totalPages: Math.ceil(pagination.total / pagination.limit),
    hasNext: pagination.page * pagination.limit < pagination.total,
    hasPrev: pagination.page > 1,
  },
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

// Common error codes
export const ErrorCodes = {
  // Auth errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_TOO_SHORT: 'VALIDATION_TOO_SHORT',
  VALIDATION_TOO_LONG: 'VALIDATION_TOO_LONG',

  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // AI errors
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',

  // Billing errors
  BILLING_PAYMENT_FAILED: 'BILLING_PAYMENT_FAILED',
  BILLING_SUBSCRIPTION_REQUIRED: 'BILLING_SUBSCRIPTION_REQUIRED',

  // Internal errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
