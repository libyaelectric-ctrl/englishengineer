# EngineerOS v4.0.1 Security Hardening Notes

## Protected backend routes

All `/api/ai/*` and `/api/billing/*` routes require backend authentication outside the explicitly enabled development bypass. `/api/health` remains public. `/api/webhooks/stripe` remains outside normal bearer authentication because Stripe signature verification is its trust boundary.

Production authentication supports a trusted server-to-server bearer secret through `ENGINEEROS_INTERNAL_API_SECRET`, together with `X-EngineerOS-User-Id`, or a Supabase access token validated against the configured Supabase Auth endpoint.

The internal secret must never be placed in a `VITE_*` variable or browser bundle. `ALLOW_INSECURE_DEV_AUTH=true` is only for local development; test mode enables the same bypass automatically.

## Required backend environment

- `ENGINEEROS_INTERNAL_API_SECRET`: required for trusted internal callers when Supabase bearer tokens are not used.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: required for Supabase bearer validation.
- `ALLOW_INSECURE_DEV_AUTH=true`: local development only.
- `AI_RATE_LIMIT_WINDOW_MS` and `AI_RATE_LIMIT_MAX`: AI request limits.
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`: billing request limits.
- `VOCABULARY_LOOKUP_RATE_LIMIT_MAX`: external vocabulary lookup limit.

## AI provider configuration

`AI_PROVIDER=mock` is the safe default. OpenAI uses Chat Completions at `/v1/chat/completions`, sends a user message, and parses `choices[0].message.content`. Anthropic uses the Messages API and requires an explicit non-empty `AI_MODEL`. Provider keys remain backend-only.

Set `VITE_AI_PROXY_URL` to the backend AI base, normally `/api/ai`. The provider maps each operation to a route-controlled endpoint. A client cannot override an endpoint with an unrelated operation.

## Billing repository and Stripe

The bundled repository is bounded in memory and is intended only for development and tests. Production startup rejects it unless `ALLOW_MEMORY_BILLING_REPOSITORY=true` is explicitly set. That override does not make memory storage production-safe.

The Supabase repository implements subscription get/upsert plus durable Stripe event idempotency get/mark operations. Enable it with `BILLING_REPOSITORY=supabase`, `SUPABASE_URL`, and backend-only `SUPABASE_SERVICE_ROLE_KEY`. The migration must be applied before startup.

Webhook signatures are verified against the raw request `Buffer`. In memory mode, processed event identifiers use configurable TTL and maximum-size pruning. Durable idempotency is still required for multi-instance production deployment.

## Frontend authentication

Local authentication is demo/development-only and is blocked in production unless `VITE_ALLOW_LOCAL_AUTH=true` is deliberately set. Production should use `VITE_AUTH_PROVIDER=supabase` with valid Supabase configuration. The login page labels local mode as local-only and not secure.

## Remaining launch blockers

- Apply and stage-test the persistent Supabase billing repository migration.
- Validate real Supabase JWT and Stripe webhook flows in the deployment environment.
- Replace in-memory rate limiting with a shared store for multi-instance deployment.
- Add deployment monitoring and secret rotation procedures.
- Collect staging evidence before claiming public paid SaaS readiness.
