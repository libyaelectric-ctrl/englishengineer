# EngineerOS Security Notes

EngineerOS v4.0.1 defines hardened integration boundaries but does not include production credentials or claim public SaaS deployment readiness.

## v4.0.1 P0 backend controls

AI and billing routes require authenticated backend context outside explicit local development bypass. Billing ownership comes from that context, not caller-controlled query values. Stripe webhook signatures use the raw request body, memory idempotency is bounded, and memory billing storage is blocked by default in production. See `SECURITY_HARDENING_NOTES.md` for configuration and remaining launch blockers.

## PRC Kademe 4 abuse protection

AI, vocabulary and billing routes share one configured rate-limit store while
retaining separate scopes, windows and limits. Local development and tests use
the existing bounded in-memory limiter. Production defaults to the external
Upstash/Redis REST adapter and refuses to start without its backend-only URL and
token.

The external adapter uses one atomic Redis script to increment the scoped
identity counter and set its expiry. It has a three-second default timeout.
Malformed responses, timeouts and store outages fail closed with HTTP 503;
normal quota exhaustion returns HTTP 429. No request payload is written to the
rate-limit store.

Production memory mode is available only through the explicit
`ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION=true` exception. It is intended for a
temporary single-instance recovery and is not safe for multi-instance abuse
protection.

## Secrets

Frontend environment variables must not contain:

- AI vendor API keys
- Stripe secret keys
- Stripe webhook secrets
- Supabase service-role keys
- private backend tokens

The environment validator flags secret-like frontend keys when they appear.

## AI Boundary

The browser talks only to the configured backend proxy. The backend owns vendor selection, prompt protection, rate limiting, logging policy and API keys.

## Billing Boundary

The frontend does not validate payment state. Stripe Checkout, Customer Portal, subscription status and webhook processing are backend responsibilities.

## Supabase Boundary

Supabase anon keys are allowed in the frontend. Service-role keys stay server-side. Row Level Security is enabled in the Sprint C migration for user-owned learning data.

## Local Storage

EngineerOS keeps offline-first local progress. Local data is not a security boundary and must not be used as the production source of truth for billing or privileged access.

## Assumptions

- Production deployments run behind HTTPS.
- Backend endpoints authenticate users before processing private data.
- Stripe webhook signature validation happens server-side.
- AI logs avoid sensitive payload storage unless explicit product consent is added later.

## Team Data Boundary

The Team migration separates organization membership from learner progress.
Members can read their own summary; owners and managers can read organization
summaries. Raw writing answers, speaking transcripts and private attempt
payloads are not copied into team summary tables. Live two-user RLS proof is
still required before Team deployment.

## Telemetry Restrictions

Product analytics accepts a controlled event catalog and a narrow metadata
allowlist. Raw writing, speaking, email, names, prompts and arbitrary metadata
must not be sent. Analytics can be disabled with
`VITE_PRODUCT_ANALYTICS_ENABLED=false`.

## Webhooks And Vulnerability Reporting

Stripe webhooks must use HTTPS, raw request bodies, signature verification and
persistent idempotency. Never trust a browser-provided entitlement.

Before public launch, publish a monitored security contact and response policy.
Until then, security findings must be handled through the private project owner
channel; no public vulnerability intake is claimed.
