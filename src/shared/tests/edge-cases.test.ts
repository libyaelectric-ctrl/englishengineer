import { describe, expect, it } from 'vitest';

import { AppError, ErrorCode } from '@/core/errors';

describe('AppError Edge Cases', () => {
  it('should handle empty message', () => {
    const error = new AppError({
      code: ErrorCode.UNKNOWN,
      message: '',
    });
    expect(error.message).toBe('');
    expect(error.code).toBe('error.unknown');
  });

  it('should handle very long message', () => {
    const longMessage = 'a'.repeat(10000);
    const error = new AppError({
      code: ErrorCode.AI,
      message: longMessage,
    });
    expect(error.message).toBe(longMessage);
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Error: <script>alert("xss")</script>';
    const error = new AppError({
      code: ErrorCode.VALIDATION,
      message: specialMessage,
    });
    expect(error.message).toBe(specialMessage);
  });

  it('should handle nested cause errors', () => {
    const innerError = new Error('Inner');
    const middleError = new AppError({
      code: ErrorCode.NETWORK,
      message: 'Middle',
      cause: innerError,
    });
    const outerError = new AppError({
      code: ErrorCode.AI,
      message: 'Outer',
      cause: middleError,
    });
    expect(outerError.cause).toBe(middleError);
    expect((outerError as any).cause?.cause).toBe(innerError);
  });

  it('should handle metadata', () => {
    const metadata = { key: 'value' };
    const error = new AppError({
      code: ErrorCode.UNKNOWN,
      message: 'Metadata test',
      metadata,
    });
    expect(error.metadata).toBeDefined();
    expect(error.metadata.key).toBe('value');
  });

  it('should handle severity levels', () => {
    const errorInfo = new AppError({ code: ErrorCode.UNKNOWN, message: 'x', severity: 'info' });
    const errorCritical = new AppError({
      code: ErrorCode.UNKNOWN,
      message: 'x',
      severity: 'critical',
    });
    expect(errorInfo.severity).toBe('info');
    expect(errorCritical.severity).toBe('critical');
  });
});

// Feature flags module was moved to A/B Testing backend service.
// Frontend feature checks are now handled via API responses.
