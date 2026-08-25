import { describe, expect, it } from 'vitest';

import {
  billingIntervalSchema,
  billingPlanIdSchema,
  checkoutSessionSchema,
  customerPortalSchema,
  topupCheckoutSchema,
} from './billing.schema';

describe('billingPlanIdSchema', () => {
  it('accepts valid plan IDs', () => {
    expect(billingPlanIdSchema.parse('free')).toBe('free');
    expect(billingPlanIdSchema.parse('junior')).toBe('junior');
    expect(billingPlanIdSchema.parse('senior')).toBe('senior');
    expect(billingPlanIdSchema.parse('specialist')).toBe('specialist');
    expect(billingPlanIdSchema.parse('master')).toBe('master');
    expect(billingPlanIdSchema.parse('team')).toBe('team');
  });

  it('rejects invalid plan IDs', () => {
    expect(() => billingPlanIdSchema.parse('premium')).toThrow();
    expect(() => billingPlanIdSchema.parse('')).toThrow();
    expect(() => billingPlanIdSchema.parse('JUNIOR')).toThrow();
  });
});

describe('billingIntervalSchema', () => {
  it('accepts month and year', () => {
    expect(billingIntervalSchema.parse('month')).toBe('month');
    expect(billingIntervalSchema.parse('year')).toBe('year');
  });

  it('rejects invalid intervals', () => {
    expect(() => billingIntervalSchema.parse('weekly')).toThrow();
    expect(() => billingIntervalSchema.parse('day')).toThrow();
  });
});

describe('checkoutSessionSchema', () => {
  const validInput = {
    userId: 'user_123',
    email: 'test@example.com',
    planId: 'junior',
    billingInterval: 'month',
    successUrl: 'https://engvox.com/billing?billing=success',
    cancelUrl: 'https://engvox.com/billing?billing=cancelled',
  };

  it('accepts valid checkout session', () => {
    const result = checkoutSessionSchema.parse(validInput);
    expect(result.userId).toBe('user_123');
    expect(result.planId).toBe('junior');
    expect(result.billingInterval).toBe('month');
  });

  it('defaults billingInterval to month', () => {
    const { billingInterval, ...input } = validInput;
    const result = checkoutSessionSchema.parse(input);
    expect(result.billingInterval).toBe('month');
  });

  it('rejects empty userId', () => {
    expect(() => checkoutSessionSchema.parse({ ...validInput, userId: '' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => checkoutSessionSchema.parse({ ...validInput, email: 'not-an-email' })).toThrow();
  });

  it('rejects invalid planId', () => {
    expect(() => checkoutSessionSchema.parse({ ...validInput, planId: 'premium' })).toThrow();
  });

  it('rejects invalid successUrl', () => {
    expect(() => checkoutSessionSchema.parse({ ...validInput, successUrl: 'not-a-url' })).toThrow();
  });
});

describe('customerPortalSchema', () => {
  it('accepts valid portal request', () => {
    const result = customerPortalSchema.parse({
      userId: 'user_456',
      returnUrl: 'https://engvox.com/billing',
    });
    expect(result.userId).toBe('user_456');
  });

  it('rejects empty userId', () => {
    expect(() =>
      customerPortalSchema.parse({ userId: '', returnUrl: 'https://engvox.com' })
    ).toThrow();
  });

  it('rejects invalid returnUrl', () => {
    expect(() =>
      customerPortalSchema.parse({ userId: 'user_1', returnUrl: 'not-a-url' })
    ).toThrow();
  });
});

describe('topupCheckoutSchema', () => {
  it('accepts valid topup request', () => {
    const result = topupCheckoutSchema.parse({
      userId: 'user_789',
      email: 'topup@example.com',
      successUrl: 'https://engvox.com/billing?topup=success',
      cancelUrl: 'https://engvox.com/billing?topup=cancelled',
    });
    expect(result.userId).toBe('user_789');
    expect(result.email).toBe('topup@example.com');
  });

  it('rejects missing email', () => {
    expect(() =>
      topupCheckoutSchema.parse({
        userId: 'user_1',
        email: '',
        successUrl: 'https://engvox.com',
        cancelUrl: 'https://engvox.com',
      })
    ).toThrow();
  });
});
