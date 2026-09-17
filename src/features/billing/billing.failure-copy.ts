import { logger } from '@/shared/logger';

import type { BillingSurfaceErrorCode } from './billing.error-codes';

/**
 * The one place a billing failure becomes a sentence a customer should read.
 *
 * Both surfaces that render a billing failure — the billing panel and the profile
 * alert — resolve through this, so the same failure reads the same everywhere and no
 * code outside the contract can reach a paying user as the backend's own sentence.
 * Before, the panel had this map and the profile page printed the failure raw, so one
 * failure produced two sentences depending on which page the customer happened to be on.
 *
 * A classified code that keeps its backend sentence is a recorded decision, not an
 * oversight: `BACKEND_SENTENCE_CODES` names the reason for each one, and some of those
 * sentences name a provider or a component ("Dodo Payments request failed (502).").
 * Rewriting them is a copy decision for a change of its own, not this resolver's.
 *
 * Keyed by code, not by wording: the backend sends `error.code`, and matching its
 * sentences instead meant a copy change on the server silently changed what the
 * customer read here — or stopped matching altogether.
 *
 * Classification is exhaustive by construction. `BillingFailureCode` below is derived
 * from the backend's own contract (`backend/src/contracts/error-codes.ts`), so the
 * `Record<Exclude<...>>` on `BACKEND_SENTENCE_CODES` fails the typecheck until every
 * code the billing surface can receive is either rewritten here or given a named reason
 * to keep the backend's sentence. A code the contract does not know at all — one the
 * backend synthesises at runtime, such as a `http-errors` `type` on a malformed body,
 * or a code from a newer backend — cannot be classified ahead of time. It resolves to
 * the generic billing copy below, never to the backend's own sentence, and the resolver
 * warns about it in development so the contract can still grow.
 *
 * That fallback is what keeps a wrong contract label from reaching a customer: a code
 * the backend emits but the contract files under `other-routes` is simply unknown here,
 * so the customer reads billing copy either way. The label decides which sentence the
 * customer gets only for codes this client can actually classify.
 *
 * This must never return nothing when it has copy for the code. Dropping the message
 * entirely is what made a failed checkout look like a dead button: the request failed,
 * nothing rendered, and the user had no way to tell what went wrong.
 */

/**
 * Codes this client writes itself, for failures that never reach the backend. They carry
 * the backend's shape but not its contract, so they are declared here.
 */
export type BillingTransportCode =
  'billing_backend_request_failed' | 'billing_backend_timeout' | 'billing_backend_unreachable';

/** Every code a billing surface can be asked to explain. */
export type BillingFailureCode = BillingSurfaceErrorCode | BillingTransportCode;

/**
 * What a customer reads when the failure cannot be tied to copy of its own.
 *
 * It reuses the existing wording for an unavailable billing service rather than adding
 * new copy, and it is the reason an unmapped or out-of-contract code cannot reach a
 * paying user as the backend's own sentence.
 */
const BILLING_UNAVAILABLE_COPY =
  'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.';

/** Codes whose backend sentence a customer should not read; the map replaces it. */
const BILLING_FAILURE_COPY = {
  audit_log_unavailable: BILLING_UNAVAILABLE_COPY,
  idempotency_store_unavailable:
    'A previous billing attempt is still being processed. Please wait a moment and try again.',
  origin_not_allowed:
    'Billing could not be started from this address. Please open the app on its usual domain and try again.',
  route_not_found:
    'This billing action is not available right now. Please refresh the page and try again.',
} as const satisfies Partial<Record<BillingFailureCode, string>>;

type RewrittenCode = keyof typeof BILLING_FAILURE_COPY;

/**
 * Why a code may skip the rewrite. A closed list, so classifying a code is a choice
 * between named reasons rather than free text that can be made to say anything.
 */
export type BackendSentenceReason =
  /** The backend already writes this sentence for a customer. */
  | 'customer-facing-sentence'
  /** The sentence names a provider, a token or an internal mechanism. */
  | 'names-provider-or-component'
  /** The sentence is written on the client, in `stripe.provider.ts`, not by the backend. */
  | 'transport';

/**
 * Every remaining code, and why it keeps its sentence.
 *
 * `Exclude` is the enforcement: adding a code to the backend contract, or to
 * `BillingTransportCode`, does not compile until it is classified — here or in
 * `BILLING_FAILURE_COPY`. Nothing walks the backend's source to discover codes.
 */
const BACKEND_SENTENCE_CODES: Record<
  Exclude<BillingFailureCode, RewrittenCode>,
  BackendSentenceReason
> = {
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

  billing_backend_request_failed: 'transport',
  billing_backend_timeout: 'transport',
  billing_backend_unreachable: 'transport',
};

const warnUnclassified = (errorCode: string): void => {
  if (!import.meta.env.DEV) return;
  logger.w(
    `Unclassified billing failure code "${errorCode}" reached a customer surface: the generic billing copy is being shown instead of the backend's sentence. Add it to BILLING_FAILURE_COPY or BACKEND_SENTENCE_CODES in billing.failure-copy.ts to decide its wording.`
  );
};

/** Resolves a billing failure to the copy a customer should see for it. */
export const billingFailureCopy = (
  errorCode: string | null | undefined,
  message: string
): string => {
  if (!errorCode) return message;

  const copy = (BILLING_FAILURE_COPY as Record<string, string | undefined>)[errorCode];
  if (copy) return copy;

  // A code the contract classifies keeps the sentence the backend wrote for it.
  if (errorCode in BACKEND_SENTENCE_CODES) return message;

  // Everything else is out of contract — a runtime-synthesised code, a code from a newer
  // backend, or one the contract files under another surface. The customer gets billing
  // copy, and development keeps the warning as the signal that the contract has to grow.
  warnUnclassified(errorCode);

  return BILLING_UNAVAILABLE_COPY;
};
