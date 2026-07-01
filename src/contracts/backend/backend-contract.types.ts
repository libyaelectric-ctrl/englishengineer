export type BackendContractVersion = '2026-06-26.saas.v1';

export type BackendProviderMode = 'mock' | 'real';

export type BackendEnvironmentMode =
  | 'local'
  | 'development'
  | 'staging'
  | 'production';

export type BackendAvailabilityState =
  | 'ready'
  | 'backend-unavailable'
  | 'misconfigured'
  | 'rate-limited'
  | 'validation-error';

export type BackendHttpMethod = 'GET' | 'POST';

export type BackendEndpointId =
  | 'ai.coach'
  | 'ai.writingReview'
  | 'ai.assessmentFeedback'
  | 'ai.roleplay'
  | 'billing.createCheckoutSession'
  | 'billing.customerPortal'
  | 'billing.subscriptionStatus'
  | 'billing.stripeWebhook'
  | 'health.status';

export type BackendAIOperation =
  | 'coach'
  | 'writing-review'
  | 'assessment-feedback'
  | 'roleplay';

export type BackendBillingOperation =
  | 'create-checkout-session'
  | 'create-customer-portal-session'
  | 'subscription-status'
  | 'stripe-webhook';

export type BackendStripeWebhookEventType =
  | 'checkout.session.completed'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end';

export type BackendStripeWebhookState =
  | 'checkout_completed'
  | 'payment_failed'
  | 'subscription_active'
  | 'subscription_cancelled'
  | 'grace_period'
  | 'subscription_updated'
  | 'unsupported_event';

export interface BackendRetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryableStatusCodes: number[];
}

export interface BackendRateLimitHook {
  scope: 'user' | 'ip' | 'subscription' | 'webhook';
  limitKey: string;
}

export interface BackendSchemaDescription {
  requiredFields: string[];
  optionalFields: string[];
  notes: string;
}

export interface BackendEndpointContract {
  id: BackendEndpointId;
  method: BackendHttpMethod;
  path: string;
  requiresAuth: boolean;
  timeoutMs: number;
  providerMode: BackendProviderMode;
  retry: BackendRetryPolicy;
  rateLimitHook: BackendRateLimitHook;
  requestSchema: BackendSchemaDescription;
  responseSchema: BackendSchemaDescription;
  requiresServerSignature: boolean;
}

export interface BackendAIRequest {
  contractVersion: BackendContractVersion;
  operation: BackendAIOperation;
  modeId: string;
  prompt: string;
  context?: Record<string, unknown>;
  metadata: {
    requestId: string;
    userId?: string;
    client: 'engineeros-web';
    sentAt: string;
  };
}

export interface BackendAIResponse {
  contractVersion: BackendContractVersion;
  requestId: string;
  operation: BackendAIOperation;
  success: boolean;
  structuredResult?: Record<string, unknown>;
  text?: string;
  error?: BackendErrorPayload;
  metadata: BackendResponseMetadata;
}

export interface BackendCheckoutSessionRequest {
  contractVersion: BackendContractVersion;
  userId: string;
  email: string;
  planId: 'free' | 'pro' | 'enterprise';
  successUrl: string;
  cancelUrl: string;
}

export interface BackendCustomerPortalRequest {
  contractVersion: BackendContractVersion;
  userId: string;
  returnUrl: string;
}

export interface BackendSubscriptionStatusResponse {
  contractVersion: BackendContractVersion;
  userId: string;
  planId: 'free' | 'pro' | 'enterprise';
  status:
    | 'none'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'enterprise_pending';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  source: 'stripe' | 'local-development';
  updatedAt: string;
}

export interface BackendRedirectResponse {
  contractVersion: BackendContractVersion;
  url: string;
  metadata: BackendResponseMetadata;
}

export interface BackendStripeWebhookRequest {
  contractVersion: BackendContractVersion;
  eventId: string;
  eventType: BackendStripeWebhookEventType;
  signatureVerified: boolean;
  idempotencyKey: string;
  receivedAt: string;
}

export interface BackendHealthResponse {
  contractVersion: BackendContractVersion;
  appVersion: string;
  status: BackendAvailabilityState;
  environment: BackendEnvironmentMode;
  checks: {
    aiBackendConfigured: boolean;
    billingBackendConfigured: boolean;
    supabaseConfigured: boolean;
  };
  timestamp: string;
}

export interface BackendResponseMetadata {
  durationMs: number;
  provider: string;
  environment: BackendEnvironmentMode;
  retryCount: number;
}

export interface BackendErrorPayload {
  code:
    | 'backend_unavailable'
    | 'timeout'
    | 'rate_limited'
    | 'validation_error'
    | 'unauthorized'
    | 'forbidden'
    | 'malformed_response'
    | 'stripe_webhook_invalid'
    | 'unknown_error';
  message: string;
  retryable: boolean;
}

export interface BackendContractValidationResult {
  valid: boolean;
  errors: string[];
}
