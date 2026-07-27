import { describe, it, expect } from 'vitest';
import { AppError } from './AppError';
import { ErrorCodes } from './error-codes';

describe('AppError', () => {
  it('should create an error with code and message', () => {
    const error = new AppError({
      code: ErrorCodes.AUTH_UNAUTHORIZED,
      message: 'User is not authenticated',
    });

    expect(error.code).toBe('AUTH_UNAUTHORIZED');
    expect(error.message).toBe('User is not authenticated');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
  });

  it('should accept custom status code', () => {
    const error = new AppError({
      code: ErrorCodes.API_NOT_FOUND,
      message: 'Resource not found',
      statusCode: 404,
    });

    expect(error.statusCode).toBe(404);
  });

  it('should include context', () => {
    const error = new AppError({
      code: ErrorCodes.DATA_VALIDATION_FAILED,
      message: 'Validation failed',
      context: { field: 'email', value: 'invalid' },
    });

    expect(error.context).toEqual({ field: 'email', value: 'invalid' });
  });

  it('should include timestamp', () => {
    const before = new Date().toISOString();
    const error = new AppError({
      code: ErrorCodes.UNKNOWN_ERROR,
      message: 'Something went wrong',
    });
    const after = new Date().toISOString();

    expect(error.timestamp).toBeDefined();
    expect(error.timestamp >= before).toBe(true);
    expect(error.timestamp <= after).toBe(true);
  });

  it('should serialize to JSON', () => {
    const error = new AppError({
      code: ErrorCodes.API_RATE_LIMITED,
      message: 'Too many requests',
      statusCode: 429,
      context: { retryAfter: 60 },
    });

    const json = error.toJSON();
    expect(json.code).toBe('API_RATE_LIMITED');
    expect(json.statusCode).toBe(429);
    expect(json.context).toEqual({ retryAfter: 60 });
    expect(json.stack).toBeDefined();
  });

  it('should capture stack trace', () => {
    const error = new AppError({
      code: ErrorCodes.NETWORK_TIMEOUT,
      message: 'Request timed out',
    });

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });

  it('should accept cause error', () => {
    const cause = new Error('Network failure');
    const error = new AppError({
      code: ErrorCodes.NETWORK_REQUEST_FAILED,
      message: 'Request failed',
      cause,
    });

    expect(error.cause).toBe(cause);
  });
});

describe('ErrorCodes', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCodes.AUTH_UNAUTHORIZED).toBe('AUTH_UNAUTHORIZED');
    expect(ErrorCodes.API_BAD_REQUEST).toBe('API_BAD_REQUEST');
    expect(ErrorCodes.AI_PROVIDER_UNAVAILABLE).toBe('AI_PROVIDER_UNAVAILABLE');
    expect(ErrorCodes.BILLING_PAYMENT_FAILED).toBe('BILLING_PAYMENT_FAILED');
    expect(ErrorCodes.DATA_NOT_FOUND).toBe('DATA_NOT_FOUND');
    expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});
