import { AppError } from './app-error';
import { ErrorCode, ErrorSeverity } from './error-codes';

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(
  error: unknown,
  fallbackCode: ErrorCode = ErrorCode.UNKNOWN,
  fallbackMessage = 'An unexpected system exception occurred'
): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      code: fallbackCode,
      message: error.message,
      cause: error,
    });
  }

  return new AppError({
    code: fallbackCode,
    message: fallbackMessage,
    metadata: { rawError: String(error) },
  });
}

export function createValidationError(
  message: string,
  metadata?: Record<string, unknown>
): AppError {
  return new AppError({
    code: ErrorCode.VALIDATION,
    message,
    severity: 'warning',
    metadata,
  });
}

export function createStorageError(
  message: string,
  cause?: Error,
  metadata?: Record<string, unknown>
): AppError {
  return new AppError({
    code: ErrorCode.STORAGE,
    message,
    severity: 'error',
    cause,
    metadata,
  });
}

export function createSystemError(
  code: ErrorCode,
  message: string,
  severity: ErrorSeverity = 'error',
  cause?: Error,
  metadata?: Record<string, unknown>
): AppError {
  return new AppError({
    code,
    message,
    severity,
    cause,
    metadata,
  });
}
