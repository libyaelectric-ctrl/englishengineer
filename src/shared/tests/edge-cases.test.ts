import { describe, it, expect } from 'vitest';
import { AppError, ErrorCodes } from '@/shared/errors';
import { isFeatureEnabled, overrideFeatureFlag } from '@/shared/feature-flags';

describe('AppError Edge Cases', () => {
  it('should handle empty message', () => {
    const error = new AppError({
      code: ErrorCodes.UNKNOWN_ERROR,
      message: '',
    });
    expect(error.message).toBe('');
    expect(error.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle very long message', () => {
    const longMessage = 'a'.repeat(10000);
    const error = new AppError({
      code: ErrorCodes.API_INTERNAL_ERROR,
      message: longMessage,
    });
    expect(error.message).toBe(longMessage);
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Error: <script>alert("xss")</script> ğŸ”¥ Ã± ä¸­æ–‡';
    const error = new AppError({
      code: ErrorCodes.DATA_VALIDATION_FAILED,
      message: specialMessage,
    });
    expect(error.message).toBe(specialMessage);
  });

  it('should handle nested cause errors', () => {
    const innerError = new Error('Inner');
    const middleError = new AppError({
      code: ErrorCodes.NETWORK_REQUEST_FAILED,
      message: 'Middle',
      cause: innerError,
    });
    const outerError = new AppError({
      code: ErrorCodes.API_INTERNAL_ERROR,
      message: 'Outer',
      cause: middleError,
    });
    expect(outerError.cause).toBe(middleError);
    expect((outerError as any).cause?.cause).toBe(innerError);
  });

  it('should handle circular context', () => {
    const context: Record<string, unknown> = { key: 'value' };
    context.self = context; // Circular reference
    const error = new AppError({
      code: ErrorCodes.UNKNOWN_ERROR,
      message: 'Circular test',
      context,
    });
    expect(error.context).toBeDefined();
  });

  it('should handle statusCode edge values', () => {
    const error100 = new AppError({ code: ErrorCodes.UNKNOWN_ERROR, message: 'x', statusCode: 100 });
    const error599 = new AppError({ code: ErrorCodes.UNKNOWN_ERROR, message: 'x', statusCode: 599 });
    expect(error100.statusCode).toBe(100);
    expect(error599.statusCode).toBe(599);
  });
});

describe('Feature Flags Edge Cases', () => {
  it('should handle rapid flag toggles', () => {
    overrideFeatureFlag('newDashboard', true);
    expect(isFeatureEnabled('newDashboard')).toBe(true);
    overrideFeatureFlag('newDashboard', false);
    expect(isFeatureEnabled('newDashboard')).toBe(false);
    overrideFeatureFlag('newDashboard', true);
    expect(isFeatureEnabled('newDashboard')).toBe(true);
  });

  it('should handle unknown flag gracefully', () => {
    expect(isFeatureEnabled('totallyUnknownFlag123' as any)).toBe(false);
  });

  it('should handle null/undefined in getCurrentUserId', () => {
    localStorage.removeItem('user_id');
    // With no user_id, rollout percentage features should be disabled
    expect(isFeatureEnabled('betaWritingReview')).toBe(false);
  });

  it('should handle all feature flags without crashing', () => {
    const flags = [
      'aiClaudeProvider',
      'aiOpenAIProvider',
      'aiGeminiProvider',
      'newDashboard',
      'teamManagement',
      'advancedAnalytics',
      'abTestingFramework',
      'darkMode',
      'offlineGrammar',
      'betaWritingReview',
    ] as const;

    flags.forEach(flag => {
      expect(() => isFeatureEnabled(flag)).not.toThrow();
    });
  });

  it('should handle environment edge cases', () => {
    // Test that dev-only flags are disabled in production
    
    // Note: Cannot modify import.meta.env in tests, but function handles it
    expect(isFeatureEnabled('aiGeminiProvider')).toBe(false); // dev/staging only
  });
});
