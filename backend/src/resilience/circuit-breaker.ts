import { logger } from '../logger.js';

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
}

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  halfOpenMaxAttempts: 3,
};

/**
 * Circuit Breaker pattern for fault tolerance.
 * Prevents cascading failures by stopping requests to failing services.
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Execute a function with circuit breaker protection.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs) {
        this.state = 'half-open';
        this.successCount = 0;
        logger.i(`Circuit breaker ${this.name} entering half-open state`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution.
   */
  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxAttempts) {
        this.state = 'closed';
        this.failureCount = 0;
        logger.i(`Circuit breaker ${this.name} closed after recovery`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution.
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.state = 'open';
      logger.w(`Circuit breaker ${this.name} reopened from half-open`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      logger.w(`Circuit breaker ${this.name} opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Get current state.
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get stats.
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Manually reset the circuit breaker.
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    logger.i(`Circuit breaker ${this.name} manually reset`);
  }
}
