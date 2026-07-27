/**
 * Standardized application error class.
 * All errors in EngineerOS should extend this class.
 *
 * @example
 * throw new AppError({
 *   code: 'AUTH_UNAUTHORIZED',
 *   message: 'User is not authenticated',
 *   statusCode: 401,
 * });
 */
export interface AppErrorOptions {
  /** Unique error code (UPPER_SNAKE_CASE) */
  code: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Additional context for debugging */
  context?: Record<string, unknown>;
  /** Original error that caused this */
  cause?: Error;
}

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context: Record<string, unknown>;
  readonly timestamp: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.context = options.context ?? {};
    this.timestamp = new Date().toISOString();
    this.cause = options.cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
