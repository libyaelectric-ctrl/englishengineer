/**
 * Every error code this backend can put in an error envelope, and whether the billing
 * client can receive it.
 *
 * This table is the contract between the two sides, and it is enforced by the compiler
 * rather than by a scan of the source:
 *
 * - `ApiError` accepts only a code registered here, so a new code is a compile error at
 *   the line that throws it until it is declared — including the app-level guards in
 *   `app.ts`, which answer billing requests too.
 * - `BillingSurfaceErrorCode` below is derived from the `billing-surface` rows, so the
 *   frontend cannot classify an incomplete set: a newly declared billing code breaks the
 *   frontend typecheck until it has customer copy or a named reason to keep the backend's
 *   sentence (`src/features/billing/billing.failure-copy.ts`).
 *
 * The browsers never call the webhook endpoints, so the webhook-only codes stayed
 * `other-routes` even though they are written in the billing providers. If one ever
 * reached a billing client, the resolver's development warning is the signal — not a raw
 * internal sentence rendered to a paying user.
 */
export const ERROR_CODE_CONTRACT = {
  /* ---------- codes a billing-surface request can answer with ---------- */
  audit_log_unavailable: 'billing-surface',
  auth_provider_unavailable: 'billing-surface',
  authentication_required: 'billing-surface',
  BILLING_STATUS_UNAVAILABLE: 'billing-surface',
  BILLING_INVOICES_UNAVAILABLE: 'billing-surface',
  STRIPE_PRICE_NOT_CONFIGURED: 'billing-surface',
  billing_customer_not_found: 'billing-surface',
  billing_user_mismatch: 'billing-surface',
  csrf_token_invalid: 'billing-surface',
  csrf_token_missing: 'billing-surface',
  dodo_api_error: 'billing-surface',
  dodo_invalid_response: 'billing-surface',
  dodo_not_configured: 'billing-surface',
  FORBIDDEN_DEMO_ACTION: 'billing-surface',
  idempotency_key_reused: 'billing-surface',
  idempotency_store_unavailable: 'billing-surface',
  INVALID_PLAN: 'billing-surface',
  internal_error: 'billing-surface',
  internal_service_identity_unavailable: 'billing-surface',
  invalid_idempotency_key: 'billing-surface',
  invalid_pagination: 'billing-surface',
  invalid_request: 'billing-surface',
  invalid_return_url: 'billing-surface',
  origin_not_allowed: 'billing-surface',
  rate_limit_exceeded: 'billing-surface',
  rate_limit_store_unavailable: 'billing-surface',
  route_not_found: 'billing-surface',
  STRIPE_NOT_CONFIGURED: 'billing-surface',
  stripe_invalid_response: 'billing-surface',
  validation_error: 'billing-surface',

  /* ---------- codes only other routes answer with ---------- */
  ai_ledger_unavailable: 'other-routes',
  ai_provider_error: 'other-routes',
  ai_rate_limited: 'other-routes',
  ai_timeout: 'other-routes',
  audio_signature_mismatch: 'other-routes',
  audio_storage_failed: 'other-routes',
  audio_storage_unavailable: 'other-routes',
  audio_too_large: 'other-routes',
  audio_too_long: 'other-routes',
  audio_url_failed: 'other-routes',
  cannot_delete_last_workspace: 'other-routes',
  compliance_export_source_failed: 'other-routes',
  compliance_export_unavailable: 'other-routes',
  dodo_webhook_not_configured: 'other-routes',
  empty_audio: 'other-routes',
  forbidden_role: 'other-routes',
  free_ai_coach_limit_exceeded: 'other-routes',
  invalid_authenticated_user: 'other-routes',
  invalid_discipline: 'other-routes',
  invalid_export_format: 'other-routes',
  invalid_operation: 'other-routes',
  invalid_route_parameter: 'other-routes',
  invalid_tenant_id: 'other-routes',
  invalid_webhook_signature: 'other-routes',
  invalid_writing_assessment: 'other-routes',
  learning_repository_error: 'other-routes',
  learning_repository_unavailable: 'other-routes',
  malformed_ai_response: 'other-routes',
  malformed_vocabulary_response: 'other-routes',
  monthly_ai_credit_limit_exceeded: 'other-routes',
  operations_auth_unavailable: 'other-routes',
  operations_unauthorized: 'other-routes',
  prompt_injection_detected: 'other-routes',
  stripe_webhook_not_configured: 'other-routes',
  supabase_not_configured: 'other-routes',
  team_analytics_unavailable: 'other-routes',
  tenant_access_denied: 'other-routes',
  tenant_authorization_unavailable: 'other-routes',
  tenant_context_required: 'other-routes',
  topup_credit_unavailable: 'other-routes',
  unauthorized: 'other-routes',
  unsupported_media_type: 'other-routes',
  user_rate_limit_exceeded: 'other-routes',
  vocabulary_lookup_timeout: 'other-routes',
  vocabulary_not_found: 'other-routes',
  vocabulary_provider_unavailable: 'other-routes',
  workspace_db_error: 'other-routes',
  workspace_limit_reached: 'other-routes',
  workspace_not_found: 'other-routes',
  writing_assessment_unavailable: 'other-routes',
} as const satisfies Record<string, 'billing-surface' | 'other-routes'>;

/** Every code this backend can emit. */
export type BackendErrorCode = keyof typeof ERROR_CODE_CONTRACT;

/** The codes a billing-surface request can answer with, for the client to classify. */
export type BillingSurfaceErrorCode = {
  [K in BackendErrorCode]: (typeof ERROR_CODE_CONTRACT)[K] extends 'billing-surface' ? K : never;
}[BackendErrorCode];
