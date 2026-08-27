# PRC Kademe 8 Live Service Evidence Report

## Evidence Decision

**BLOCKED**

Deployment credentials required. Live service verification was not run and no evidence was fabricated.

## Locally Verified Evidence

- The verifier loads supported environment files and process variables without printing values.
- Required modes and Stripe test-mode configuration are validated before any live request.
- Secret-pattern scan: **PASS (0 high-confidence findings)**.
- Environment ignore coverage: **PASS**.
- Static Supabase RLS and local service behavior remain covered by the project quality scripts.

## Browser Verified Evidence

- Browser quality gate: **NOT RUN IN THIS VERIFICATION**.

## Staging Verified Evidence

- Live verification: **NOT RUN**

The report never treats Stripe Dashboard/CLI delivery, provider-failure injection, or service dashboards as verified unless those actions actually ran.

## Not Yet Verified Evidence

- Supabase staging signup/login/session/logout and two-user RLS isolation.
- Cloud snapshot save/load against staging.
- Cloud-to-local restore against a real staging account.
- Live offline/failure recovery against staging.
- Stripe test-mode Checkout, Customer Portal, webhook and entitlement update.
- Real AI request through the deployed backend proxy.
- Upstash REST availability and shared counter behavior.

## Redacted Environment Availability

| Variable                      | Scope    | Requirement | Availability |
| ----------------------------- | -------- | ----------- | ------------ |
| `VITE_AUTH_PROVIDER`          | frontend | required    | OK           |
| `VITE_SUPABASE_URL`           | frontend | required    | OK           |
| `VITE_SUPABASE_ANON_KEY`      | frontend | required    | OK           |
| `VITE_BILLING_API_URL`        | frontend | required    | PLACEHOLDER  |
| `VITE_AI_PROVIDER`            | frontend | required    | OK           |
| `VITE_AI_PROXY_URL`           | frontend | required    | PLACEHOLDER  |
| `SUPABASE_URL`                | backend  | required    | PLACEHOLDER  |
| `SUPABASE_ANON_KEY`           | backend  | required    | PLACEHOLDER  |
| `SUPABASE_SERVICE_ROLE_KEY`   | backend  | required    | PLACEHOLDER  |
| `BILLING_REPOSITORY`          | backend  | required    | OK           |
| `STRIPE_SECRET_KEY`           | backend  | required    | PLACEHOLDER  |
| `STRIPE_WEBHOOK_SECRET`       | backend  | required    | PLACEHOLDER  |
| `STRIPE_PRICE_JUNIOR_MONTHLY` | backend  | required    | PLACEHOLDER  |
| `AI_PROVIDER`                 | backend  | required    | OK           |
| `OPENAI_API_KEY`              | backend  | optional    | MISSING      |
| `ANTHROPIC_API_KEY`           | backend  | optional    | MISSING      |
| `GEMINI_API_KEY`              | backend  | required    | PLACEHOLDER  |
| `RATE_LIMIT_STORE`            | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_URL`      | backend  | required    | PLACEHOLDER  |
| `UPSTASH_REDIS_REST_TOKEN`    | backend  | required    | PLACEHOLDER  |

Only availability is shown. No value, token, key or secret is written to this report.

## Commands Run

| Command                                                 | Exit code | Result            |
| ------------------------------------------------------- | --------: | ----------------- |
| `node scripts/prc-kademe-8-live-verify.mjs --env-check` |         0 | BLOCKED_ENV_CHECK |

The external invocation required for this report is `npm run kademe8:verify`.

## Security Check

- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.
- No high-confidence committed secret pattern was found.
- Secret values were not printed to terminal output or markdown.
- Live checks accept only Stripe test-mode credentials.

## Remaining Blockers

- Placeholder required variable: `VITE_BILLING_API_URL`
- Placeholder required variable: `VITE_AI_PROXY_URL`
- Placeholder required variable: `SUPABASE_URL`
- Placeholder required variable: `SUPABASE_ANON_KEY`
- Placeholder required variable: `SUPABASE_SERVICE_ROLE_KEY`
- Placeholder required variable: `STRIPE_SECRET_KEY`
- Placeholder required variable: `STRIPE_WEBHOOK_SECRET`
- Placeholder required variable: `STRIPE_PRICE_JUNIOR_MONTHLY`
- Placeholder required variable: `GEMINI_API_KEY`
- Placeholder required variable: `UPSTASH_REDIS_REST_URL`
- Placeholder required variable: `UPSTASH_REDIS_REST_TOKEN`

## Next Decision

**Kademe 9 live release: FORBIDDEN until Kademe 8 has real passing staging evidence.**

- Production launch: **NOT ALLOWED.**
- Live billing: **NOT ALLOWED.**
- Kademe 9-13 code-only implementation: **ALLOWED; this does not create live evidence.**
