import { describe, expect, it } from 'vitest';
import {
  BACKEND_CONTRACT_VERSION,
  BACKEND_ENDPOINTS,
  createStripeWebhookIdempotencyKey,
  getBackendEndpoint,
  mapStripeWebhookState,
  validateBackendRequest,
  validateBackendResponse,
} from './index';

describe('backend SaaS contract', () => {
  it('defines all required Sprint C backend endpoints', () => {
    expect(BACKEND_ENDPOINTS.map((endpoint) => endpoint.path)).toEqual(
      expect.arrayContaining([
        '/api/ai/coach',
        '/api/ai/writing-review',
        '/api/ai/assessment-feedback',
        '/api/ai/roleplay',
        '/api/billing/create-checkout-session',
        '/api/billing/create-customer-portal-session',
        '/api/billing/subscription-status',
        '/api/webhooks/stripe',
        '/api/health',
      ])
    );
  });

  it('keeps webhook validation server-side', () => {
    expect(
      getBackendEndpoint('billing.stripeWebhook')?.requiresServerSignature
    ).toBe(true);
  });

  it('rejects incomplete AI requests', () => {
    const result = validateBackendRequest('ai.coach', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      operation: 'coach',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['modeId is required', 'prompt is required'])
    );
  });

  it('accepts a valid AI response contract', () => {
    const result = validateBackendResponse('ai.coach', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      requestId: 'ai_req_1',
      operation: 'coach',
      success: true,
      text: 'Backend AI response.',
      metadata: {
        durationMs: 320,
        provider: 'openai-server',
        environment: 'staging',
        retryCount: 0,
      },
    });

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('rejects successful AI responses without result content', () => {
    const result = validateBackendResponse('ai.coach', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      requestId: 'ai_req_1',
      operation: 'coach',
      success: true,
      metadata: {
        durationMs: 100,
        provider: 'server',
        environment: 'production',
        retryCount: 0,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'successful AI response requires structuredResult or text'
    );
  });

  it('validates checkout request requirements', () => {
    const result = validateBackendRequest('billing.createCheckoutSession', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      userId: 'user_1',
      email: 'engineer@example.com',
      planId: 'pro',
      successUrl: 'https://app.engineeros.com/profile?billing=success',
      cancelUrl: 'https://app.engineeros.com/profile?billing=cancel',
    });

    expect(result.valid).toBe(true);
  });

  it('bounds retry policy for production backend calls', () => {
    BACKEND_ENDPOINTS.forEach((endpoint) => {
      expect(endpoint.retry.maxAttempts).toBeLessThanOrEqual(2);
      expect(endpoint.timeoutMs).toBeLessThanOrEqual(20_000);
    });
  });

  it('requires Stripe webhook signature verification before processing', () => {
    const result = validateBackendRequest('billing.stripeWebhook', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      eventId: 'evt_123',
      eventType: 'checkout.session.completed',
      signatureVerified: false,
      idempotencyKey: 'checkout.session.completed:evt_123',
      receivedAt: '2026-06-26T00:00:00.000Z',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'signatureVerified must be true before webhook processing'
    );
  });

  it('maps supported Stripe webhook states for backend processing', () => {
    expect(mapStripeWebhookState('checkout.session.completed')).toBe(
      'checkout_completed'
    );
    expect(mapStripeWebhookState('invoice.payment_failed')).toBe(
      'payment_failed'
    );
    expect(mapStripeWebhookState('customer.subscription.created')).toBe(
      'subscription_active'
    );
    expect(mapStripeWebhookState('customer.subscription.deleted')).toBe(
      'subscription_cancelled'
    );
    expect(mapStripeWebhookState('customer.subscription.trial_will_end')).toBe(
      'grace_period'
    );
    expect(mapStripeWebhookState('unknown.event')).toBe('unsupported_event');
  });

  it('creates stable Stripe webhook idempotency keys', () => {
    expect(
      createStripeWebhookIdempotencyKey('evt_123', 'checkout.session.completed')
    ).toBe('checkout.session.completed:evt_123');
  });

  it('validates health response without exposing secrets', () => {
    const result = validateBackendResponse('health.status', {
      contractVersion: BACKEND_CONTRACT_VERSION,
      appVersion: '2.5.6',
      status: 'ready',
      environment: 'production',
      checks: {
        aiBackendConfigured: true,
        billingBackendConfigured: true,
        supabaseConfigured: true,
      },
      timestamp: '2026-06-26T00:00:00.000Z',
    });

    expect(result.valid).toBe(true);
  });
});
// @vitest-environment node
