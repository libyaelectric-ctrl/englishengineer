import { logger } from '@/shared/logger';

/**
 * The one place a billing failure becomes a sentence a customer should read.
 *
 * Both surfaces that render a billing failure — the billing panel and the profile
 * alert — resolve through this, so the same failure reads the same everywhere and the
 * backend's own wording never reaches a paying user. Before, the panel had this map
 * and the profile page printed the failure raw, so one failure produced two sentences
 * depending on which page the customer happened to be on.
 *
 * Keyed by code, not by wording: the backend sends `error.code`, and matching its
 * sentences instead meant a copy change on the server silently changed what the
 * customer read here — or stopped matching altogether.
 *
 * Every code the billing surface can emit is classified here, in one of two records:
 * `BILLING_FAILURE_COPY` rewrites the backend's wording, and `BACKEND_SENTENCE_CODES`
 * names why a code may keep it. A code in neither is the failure this module exists to
 * prevent — the customer reads the server's own sentence — so the resolver warns about
 * it in development, and `billing.failure-copy.coverage.test.ts` derives the codes the
 * billing route can really emit and fails when one of them is unclassified. The check
 * reads literals out of the backend's billing modules and the client's transport codes;
 * codes the error mapper synthesises at runtime (an `http-errors` `type` on a malformed
 * body, `request_error`) are not literals and are covered only by the dev warning.
 *
 * This must never return nothing. Dropping the message entirely is what made a failed
 * checkout look like a dead button: the request failed, nothing rendered, and the user
 * had no way to tell what went wrong.
 */

/** Codes whose backend sentence a customer should not read; the map replaces it. */
export const BILLING_FAILURE_COPY: Record<string, string> = {
  audit_log_unavailable:
    'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.',
  idempotency_store_unavailable:
    'A previous billing attempt is still being processed. Please wait a moment and try again.',
};

/**
 * Why a code may skip the rewrite. A closed list, so classifying a code is a choice
 * between named reasons rather than free text that can be made to say anything.
 */
export type BackendSentenceReason =
  /** The backend already writes this sentence for a customer. */
  | 'customer-facing-sentence'
  /** The sentence names a provider, a token or an internal mechanism. */
  | 'names-provider-or-component'
  /** Only the webhook endpoint emits it, and the browser never calls that endpoint. */
  | 'webhook-only'
  /** The sentence is written on the client, in `stripe.provider.ts`, not by the backend. */
  | 'transport';

/** Every remaining code the billing surface can emit, and why it keeps its sentence. */
export const BACKEND_SENTENCE_CODES: Record<string, BackendSentenceReason> = {
  BILLING_STATUS_UNAVAILABLE: 'customer-facing-sentence',
  FORBIDDEN_DEMO_ACTION: 'customer-facing-sentence',
  INVALID_PLAN: 'customer-facing-sentence',
  billing_customer_not_found: 'customer-facing-sentence',
  billing_user_mismatch: 'customer-facing-sentence',
  idempotency_key_reused: 'customer-facing-sentence',
  internal_error: 'customer-facing-sentence',
  invalid_idempotency_key: 'customer-facing-sentence',
  invalid_pagination: 'customer-facing-sentence',
  invalid_request: 'customer-facing-sentence',
  invalid_return_url: 'customer-facing-sentence',
  rate_limit_exceeded: 'customer-facing-sentence',
  rate_limit_store_unavailable: 'customer-facing-sentence',
  validation_error: 'customer-facing-sentence',

  STRIPE_NOT_CONFIGURED: 'names-provider-or-component',
  auth_provider_unavailable: 'names-provider-or-component',
  authentication_required: 'names-provider-or-component',
  csrf_token_invalid: 'names-provider-or-component',
  csrf_token_missing: 'names-provider-or-component',
  dodo_api_error: 'names-provider-or-component',
  dodo_invalid_response: 'names-provider-or-component',
  dodo_not_configured: 'names-provider-or-component',
  internal_service_identity_unavailable: 'names-provider-or-component',
  stripe_invalid_response: 'names-provider-or-component',

  dodo_webhook_not_configured: 'webhook-only',
  invalid_webhook_signature: 'webhook-only',
  stripe_webhook_not_configured: 'webhook-only',

  billing_backend_request_failed: 'transport',
  billing_backend_timeout: 'transport',
  billing_backend_unreachable: 'transport',
};

const warnUnclassified = (errorCode: string): void => {
  if (!import.meta.env.DEV) return;
  logger.w(
    `Unclassified billing failure code "${errorCode}" reached a customer surface: the backend's own sentence is being shown. Add it to BILLING_FAILURE_COPY or BACKEND_SENTENCE_CODES in billing.failure-copy.ts.`
  );
};

/** Resolves a billing failure to the copy a customer should see for it. */
export const billingFailureCopy = (
  errorCode: string | null | undefined,
  message: string
): string => {
  if (!errorCode) return message;

  const copy = BILLING_FAILURE_COPY[errorCode];
  if (copy) return copy;

  if (!BACKEND_SENTENCE_CODES[errorCode]) warnUnclassified(errorCode);

  return message;
};
