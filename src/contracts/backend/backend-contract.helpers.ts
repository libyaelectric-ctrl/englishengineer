import {
  BackendAIRequest,
  BackendAIResponse,
  BackendCheckoutSessionRequest,
  BackendContractValidationResult,
  BackendContractVersion,
  BackendCustomerPortalRequest,
  BackendEndpointContract,
  BackendEndpointId,
  BackendHealthResponse,
  BackendRedirectResponse,
  BackendStripeWebhookRequest,
  BackendSubscriptionStatusResponse,
} from './backend-contract.types';

import {
  AI_BACKEND_ENDPOINTS,
  validateBackendAIRequest as validateAIRequest,
  validateBackendAIResponse as validateAIResponse,
} from './ai-contract';

import {
  BILLING_BACKEND_ENDPOINTS,
  validateCheckoutSessionRequest,
  validateCustomerPortalRequest,
  validateBillingRedirectResponse,
  validateSubscriptionStatusResponse,
  validateStripeWebhookRequest,
  STRIPE_WEBHOOK_EVENT_STATES,
  mapStripeWebhookState,
  createStripeWebhookIdempotencyKey,
} from './billing-contract';

import {
  HEALTH_BACKEND_ENDPOINTS,
  validateHealthResponse,
} from './health-contract';

export const BACKEND_CONTRACT_VERSION: BackendContractVersion =
  '2026-06-26.saas.v1';

export const BACKEND_ENDPOINTS: BackendEndpointContract[] = [
  ...AI_BACKEND_ENDPOINTS,
  ...BILLING_BACKEND_ENDPOINTS,
  ...HEALTH_BACKEND_ENDPOINTS,
];

export const getBackendEndpoint = (
  endpointId: BackendEndpointId
): BackendEndpointContract | null =>
  BACKEND_ENDPOINTS.find((endpoint) => endpoint.id === endpointId) || null;

export const validateBackendAIRequest = (
  payload: unknown
): BackendContractValidationResult =>
  validateAIRequest(payload, BACKEND_CONTRACT_VERSION);

export const validateBackendAIResponse = (
  payload: unknown
): BackendContractValidationResult =>
  validateAIResponse(payload, BACKEND_CONTRACT_VERSION);

export const validateBackendRequest = (
  endpointId: BackendEndpointId,
  payload: unknown
): BackendContractValidationResult => {
  if (endpointId.startsWith('ai.')) return validateBackendAIRequest(payload);
  if (endpointId === 'billing.createCheckoutSession') {
    return validateCheckoutSessionRequest(payload, BACKEND_CONTRACT_VERSION);
  }
  if (endpointId === 'billing.customerPortal') {
    return validateCustomerPortalRequest(payload, BACKEND_CONTRACT_VERSION);
  }
  if (endpointId === 'billing.stripeWebhook') {
    return validateStripeWebhookRequest(payload, BACKEND_CONTRACT_VERSION);
  }
  return { valid: true, errors: [] };
};

export const validateBackendResponse = (
  endpointId: BackendEndpointId,
  payload: unknown
): BackendContractValidationResult => {
  if (endpointId.startsWith('ai.')) return validateBackendAIResponse(payload);
  if (
    endpointId === 'billing.createCheckoutSession' ||
    endpointId === 'billing.customerPortal'
  ) {
    return validateBillingRedirectResponse(payload, BACKEND_CONTRACT_VERSION);
  }
  if (endpointId === 'billing.subscriptionStatus') {
    return validateSubscriptionStatusResponse(
      payload,
      BACKEND_CONTRACT_VERSION
    );
  }
  if (endpointId === 'health.status') {
    return validateHealthResponse(payload, BACKEND_CONTRACT_VERSION);
  }
  return { valid: true, errors: [] };
};

export const mapBackendHttpStatus = (
  status: number
): 'ready' | 'backend-unavailable' | 'rate-limited' | 'validation-error' => {
  if (status === 429) return 'rate-limited';
  if (status >= 500 || status === 408) return 'backend-unavailable';
  if (status >= 400) return 'validation-error';
  return 'ready';
};

export {
  AI_BACKEND_ENDPOINTS,
  BILLING_BACKEND_ENDPOINTS,
  HEALTH_BACKEND_ENDPOINTS,
  STRIPE_WEBHOOK_EVENT_STATES,
  mapStripeWebhookState,
  createStripeWebhookIdempotencyKey,
  validateCheckoutSessionRequest,
  validateCustomerPortalRequest,
  validateBillingRedirectResponse,
  validateSubscriptionStatusResponse,
  validateStripeWebhookRequest,
  validateHealthResponse,
};

export type {
  BackendAIRequest,
  BackendAIResponse,
  BackendCheckoutSessionRequest,
  BackendCustomerPortalRequest,
  BackendHealthResponse,
  BackendRedirectResponse,
  BackendStripeWebhookRequest,
  BackendSubscriptionStatusResponse,
};
