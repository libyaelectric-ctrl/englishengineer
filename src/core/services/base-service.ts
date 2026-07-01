import { logger } from '@/shared/logger';
import { eventBus, AppEvent } from '../events';
import { AppError, ErrorCode, createSystemError } from '../errors';
import { Result, ok, fail } from '../result';
import { IdService } from '../ids/id.service';

export abstract class BaseService {
  protected abstract readonly serviceName: string;
  protected readonly logger = logger;

  /**
   * Publishes an event through the core EventBus.
   */
  protected emitEvent(
    type: AppEvent['type'],
    payload: AppEvent extends { type: infer T; payload: infer P }
      ? T extends AppEvent['type']
        ? P
        : never
      : never
  ): void {
    const event = {
      id: IdService.createId('evt'),
      type,
      timestamp: new Date().toISOString(),
      payload,
    } as unknown as AppEvent;

    eventBus.publish(event);
  }

  /**
   * Creates an AppError tied to this service.
   */
  protected createError(
    code: ErrorCode,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
    cause?: Error,
    metadata?: Record<string, unknown>
  ): AppError {
    const resolvedMetadata = {
      ...metadata,
      service: this.serviceName,
    };
    const err = createSystemError(
      code,
      message,
      severity,
      cause,
      resolvedMetadata
    );

    // Auto-emit an app.error event
    this.emitEvent('app.error', { error: err } as unknown as never);

    return err;
  }

  /**
   * Safely executes an operation, catching any thrown exceptions and returning a Result.
   */
  protected async safeExecute<T>(
    operationName: string,
    fn: () => Promise<T> | T
  ): Promise<Result<T, AppError>> {
    try {
      this.logger.i(`[${this.serviceName}] Executing: ${operationName}`);
      const value = await fn();
      return ok(value);
    } catch (error) {
      const parsedError =
        error instanceof AppError
          ? error
          : this.createError(
              ErrorCode.UNKNOWN,
              `Operation "${operationName}" failed inside ${this.serviceName}`,
              'error',
              error instanceof Error ? error : new Error(String(error))
            );

      this.logger.e(
        `[${this.serviceName}] Execution failed: ${operationName}`,
        parsedError
      );
      return fail(parsedError);
    }
  }
}
