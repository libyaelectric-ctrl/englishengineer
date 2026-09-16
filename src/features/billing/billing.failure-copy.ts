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
 * This must never return nothing. Dropping the message entirely is what made a failed
 * checkout look like a dead button: the request failed, nothing rendered, and the user
 * had no way to tell what went wrong. An unrecognised code falls through to the message
 * itself — including the transport codes (`billing_backend_unreachable`,
 * `billing_backend_timeout`), whose sentences are already written for a customer.
 */
const KNOWN_INTERNAL_ERRORS: Record<string, string> = {
  audit_log_unavailable:
    'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.',
  idempotency_store_unavailable:
    'A previous billing attempt is still being processed. Please wait a moment and try again.',
};

/** Resolves a billing failure to the copy a customer should see for it. */
export const billingFailureCopy = (errorCode: string | null | undefined, message: string): string =>
  (errorCode ? KNOWN_INTERNAL_ERRORS[errorCode] : undefined) ?? message;
