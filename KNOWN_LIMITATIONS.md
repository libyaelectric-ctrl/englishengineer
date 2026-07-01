# EngineerOS Closed Beta Known Limitations

## Closed Beta Limitations

- Closed beta metrics are local-first and device-scoped.
- Public production readiness is not claimed.
- Real AI requires a backend proxy and server-side vendor credentials.
- Stripe checkout and webhooks require deployed backend endpoints.
- Supabase cloud sync requires a real project, RLS verification and production credentials.
- Data export and account deletion are documented but not yet fully surfaced as beta UI workflows.
- Screenshot upload is intentionally unavailable until a secure backend upload
  contract exists; feedback remains text-only.
- Chromium is the only automated browser project currently configured.

## Operational Limitations

- Closed beta requires manual cohort management.
- Support workflow is not yet integrated with email/helpdesk tooling.
- Analytics aggregation across users requires a backend.
- Legal review is required before public terms, privacy and compliance claims.

## Recommended Next Step

Close Kademe 8 with Railway, Vercel, Stripe, Supabase and AI proxy staging
evidence before public production activation.
