import { describe, it, expect } from 'vitest';
import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

describe('AppError', () => {
  it('creates error with required params', () => {
    const error = new AppError({ code: ErrorCode.UNKNOWN, message: 'Test error' });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.UNKNOWN);
    expect(error.message).toBe('Test error');
    expect(error.severity).toBe('error');
    expect(error.metadata).toEqual({});
    expect(error.timestamp).toBeDefined();
  });

  it('creates error with all params', () => {
    const cause = new Error('root cause');
    const error = new AppError({
      code: ErrorCode.VALIDATION,
      message: 'Validation failed',
      severity: 'critical',
      cause,
      metadata: { field: 'email' },
    });
    expect(error.severity).toBe('critical');
    expect(error.cause).toBe(cause);
    expect(error.metadata).toEqual({ field: 'email' });
  });

  it('serializes to JSON', () => {
    const error = new AppError({
      code: ErrorCode.NETWORK,
      message: 'Network error',
      severity: 'warning',
      metadata: { url: 'https://api.example.com' },
    });
    const json = error.toJSON();
    expect(json.name).toBe('AppError');
    expect(json.code).toBe(ErrorCode.NETWORK);
    expect(json.message).toBe('Network error');
    expect(json.severity).toBe('warning');
    expect(json.metadata).toEqual({ url: 'https://api.example.com' });
    expect(json.stack).toBeDefined();
  });

  it('handles cause in toJSON', () => {
    const cause = new Error('underlying');
    const error = new AppError({ code: ErrorCode.AI, message: 'AI failed', cause });
    const json = error.toJSON();
    expect(json.cause).toBe('underlying');
  });
});
