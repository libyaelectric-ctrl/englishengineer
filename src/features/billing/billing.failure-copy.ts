import { AppError } from '@/core/errors/app-error';

import { logger } from '@/shared/logger';

import type { BillingSurfaceErrorCode } from './billing.error-codes';

/**
 * The one place a billing failure becomes a sentence a customer should read.
 *
 * Every surface that renders a billing failure resolves through this — the billing
 * panel and the profile alert through `billingFailureCopy`, and the pages that run
 * their own checkout through `resolveBillingError` — so one failure reads the same
 * everywhere and no internal English reaches a paying user, however the failure
 * travelled.
 *
 * Resolution is total, and that is what makes it safe:
 *
 * - a code the contract classifies keeps the sentence the backend wrote for it, which
 *   is a recorded decision, not an oversight: `KEPT_SENTENCE_CODES` names the reason
 *   for each one, and some of those sentences name a provider or a component;
 * - a code carrying copy here is replaced by it;
 * - **everything else** — an unknown code, a code the contract files under another
 *   surface, or a failure that arrived with no code at all — resolves to the generic
 *   billing copy below, and development reports it so the contract can still grow.
 *
 * The last branch is the one that used to leak. A failure with no code took an early
 * return and printed the backend's own sentence — "Backend response does not match the
 * versioned success envelope.", a JSON parse error, `API 502: ` — silently, in
 * production and in development alike. Resolving it to billing copy is what makes a
 * missing code, a runtime-synthesised code and a wrong contract label all harmless to
 * the customer.
 *
 * Keyed by code, not by wording: the backend sends `error.code`, and matching its
 * sentences instead meant a copy change on the server silently changed what the
 * customer read here — or stopped matching altogether.
 *
 * Classification is exhaustive by construction. `BillingFailureCode` below is derived
 * from the backend's own contract (`backend/src/contracts/error-codes.ts`), so the
 * `Record<Exclude<...>>` on `KEPT_SENTENCE_CODES` fails the typecheck until every code
 * a billing surface can receive is either rewritten here or given a named reason to
 * keep the backend's sentence. Nothing walks the backend's source to discover codes.
 *
 * This must never return nothing. Dropping the message entirely is what made a failed
 * checkout look like a dead button: the request failed, nothing rendered, and the user
 * had no way to tell what went wrong.
 */

/**
 * Codes this client writes itself, for failures that never reach the backend. They
 * carry the backend's shape but not its contract, so they are declared here.
 */
export type BillingTransportCode =
  | 'billing_backend_request_failed'
  | 'billing_backend_timeout'
  | 'billing_backend_unreachable'
  | 'billing_client_sentence';

/**
 * The code for the one channel that shows a sentence the client itself wrote, for a
 * precondition the customer can act on — the store's `setBillingError` (sign in first,
 * demo profiles cannot buy, no email on file). Without a code of its own such a
 * sentence would be indistinguishable from a failure that lost its code.
 */
export const CLIENT_SENTENCE_CODE: BillingTransportCode = 'billing_client_sentence';

/** Every code a billing surface can be asked to explain. */
export type BillingFailureCode = BillingSurfaceErrorCode | BillingTransportCode;

/**
 * What a customer reads when the failure cannot be tied to copy of its own.
 *
 * It reuses the existing wording for an unavailable billing service rather than adding
 * new copy, and it is the reason an unmapped, unclassified or code-less failure cannot
 * reach a paying user as the backend's own sentence.
 */
const BILLING_UNAVAILABLE_COPY =
  'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.';

/** Codes whose backend sentence a customer should not read; the map replaces it. */
const BILLING_FAILURE_COPY = {
  BILLING_INVOICES_UNAVAILABLE: 'Invoice history is temporarily unavailable. Please try again.',
  STRIPE_PRICE_NOT_CONFIGURED:
    'This plan is temporarily unavailable for purchase. Please contact support.',
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
export type KeptSentenceReason =
  /** The backend already writes this sentence for a customer. */
  | 'customer-facing-sentence'
  /** The sentence names a provider, a token or an internal mechanism. */
  | 'names-provider-or-component'
  /** The sentence is written on the client, in `stripe.provider.ts`, not by the backend. */
  | 'transport'
  /** The sentence is written on the client for a precondition the user can act on. */
  | 'client-authored-sentence';

/**
 * Every remaining code, and why it keeps its sentence.
 *
 * `Exclude` is the enforcement: adding a code to the backend contract, or to
 * `BillingTransportCode`, does not compile until it is classified — here or in
 * `BILLING_FAILURE_COPY`.
 */
const KEPT_SENTENCE_CODES: Record<
  Exclude<BillingFailureCode, RewrittenCode>,
  KeptSentenceReason
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
  billing_client_sentence: 'client-authored-sentence',
};

const warnUnclassified = (errorCode: string | null | undefined): void => {
  if (!import.meta.env.DEV) return;
  logger.w(
    errorCode
      ? `Unclassified billing failure code "${errorCode}" reached a customer surface: the generic billing copy is being shown instead of the backend's sentence. Add it to BILLING_FAILURE_COPY or KEPT_SENTENCE_CODES in billing.failure-copy.ts to decide its wording.`
      : "A billing failure reached a customer surface without a code: the generic billing copy is being shown instead of its sentence. Whatever threw it must carry a code — see the store's setBillingError for sentences the client writes itself."
  );
};

/** Resolves a billing failure to the copy a customer should see for it. */
export const billingFailureCopy = (
  errorCode: string | null | undefined,
  message: string
): string => {
  const copy = errorCode
    ? (BILLING_FAILURE_COPY as Record<string, string | undefined>)[errorCode]
    : undefined;
  if (copy) return copy;

  // A code the contract classifies keeps the sentence written for it.
  if (errorCode && errorCode in KEPT_SENTENCE_CODES) return message;

  // Everything else is out of contract — a runtime-synthesised code, a code from a
  // newer backend, one the contract files under another surface, or no code at all.
  // The customer gets billing copy, and development keeps the warning as the signal
  // that the contract, or the caller, has to grow.
  warnUnclassified(errorCode);

  return BILLING_UNAVAILABLE_COPY;
};

/**
 * Resolves a *thrown* billing failure, so no surface has to re-derive the rule from the
 * error's shape. The code lives on `AppError.apiCode`, which is where the provider and
 * the store put it; a thrower that is not an `AppError` carries no code, which is
 * exactly the case the generic copy exists for.
 */
export const resolveBillingError = (error: unknown): string =>
  billingFailureCopy(
    error instanceof AppError ? error.apiCode : null,
    error instanceof Error ? error.message : ''
  );
