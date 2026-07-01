import { ErrorCode, ErrorSeverity } from './error-codes';

export interface AppErrorParams {
  code: ErrorCode;
  message: string;
  severity?: ErrorSeverity;
  cause?: Error;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public override readonly cause: Error | undefined;
  public readonly metadata: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(params: AppErrorParams) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.severity = params.severity ?? 'error';
    this.cause = params.cause;
    this.metadata = params.metadata ?? {};
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace (only available on V8 engines, like Node/Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      cause: this.cause ? this.cause.message : undefined,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
