import { logger } from '../logger.js';

export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly cooldownMs = 30000
  ) {}

  getState(): 'CLOSED' | 'OPEN' | 'HALF-OPEN' {
    return this.state;
  }

  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF-OPEN';
        logger.warn(
          `[CircuitBreaker] [${this.name}] Transitioned to HALF-OPEN. Testing next request.`
        );
      } else {
        logger.error(`[CircuitBreaker] [${this.name}] Circuit is OPEN. Blocking request.`);
        throw new Error(`Circuit breaker [${this.name}] is OPEN. Request blocked.`);
      }
    }

    try {
      const result = await requestFn();

      if (this.state === 'HALF-OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        logger.info(`[CircuitBreaker] [${this.name}] Transitioned to CLOSED. Circuit restored.`);
      }

      return result;
    } catch (error: unknown) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      const errObj = error instanceof Error ? error : new Error(String(error));

      if ((this.state as string) !== 'OPEN' && this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.error(
          `[CircuitBreaker] [${this.name}] Failure threshold (${this.failureThreshold}) reached. Circuit opened.`,
          undefined,
          errObj
        );
      } else {
        logger.warn(
          `[CircuitBreaker] [${this.name}] Failure recorded (${this.failureCount}/${this.failureThreshold}).`,
          { error: errObj.message }
        );
      }

      throw error;
    }
  }
}
