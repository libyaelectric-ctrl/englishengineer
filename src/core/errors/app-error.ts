import { ErrorCode, ErrorSeverity } from './error-codes';

export interface AppErrorParams {
  code: ErrorCode;
  message: string;
  /**
   * The backend's own code from its error envelope (e.g. `audit_log_unavailable`).
   *
   * Kept next to the coarse `code` so callers can act on what actually failed
   * instead of matching the message sentence.
   */
  apiCode?: string;
  /** The HTTP status, when the failure came from a response. */
  httpStatus?: number;
  severity?: ErrorSeverity;
  cause?: Error;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly apiCode: string | undefined;
  public readonly httpStatus: number | undefined;
  public readonly severity: ErrorSeverity;
  public override readonly cause: Error | undefined;
  public readonly metadata: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(params: AppErrorParams) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.apiCode = params.apiCode;
    this.httpStatus = params.httpStatus;
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
      apiCode: this.apiCode,
      httpStatus: this.httpStatus,
      message: this.message,
      severity: this.severity,
      cause: this.cause ? this.cause.message : undefined,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
