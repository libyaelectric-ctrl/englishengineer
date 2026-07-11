# PRC Kademe 8 Live Service Evidence Report

## Evidence Decision

**BLOCKED**

Deployment credentials required. Live service verification was not run and no evidence was fabricated.

## Locally Verified Evidence

- The verifier loads supported environment files and process variables without printing values.
- Required modes and Stripe test-mode configuration are validated before any live request.
- Secret-pattern scan: **FAIL (1 finding(s))**.
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

| Variable                    | Scope    | Requirement | Availability |
| --------------------------- | -------- | ----------- | ------------ |
| `VITE_AUTH_PROVIDER`        | frontend | required    | OK           |
| `VITE_SUPABASE_URL`         | frontend | required    | OK           |
| `VITE_SUPABASE_ANON_KEY`    | frontend | required    | OK           |
| `VITE_BILLING_API_URL`      | frontend | required    | PLACEHOLDER  |
| `VITE_AI_PROVIDER`          | frontend | required    | OK           |
| `VITE_AI_PROXY_URL`         | frontend | required    | PLACEHOLDER  |
| `SUPABASE_URL`              | backend  | required    | OK           |
| `SUPABASE_ANON_KEY`         | backend  | required    | OK           |
| `SUPABASE_SERVICE_ROLE_KEY` | backend  | required    | OK           |
| `BILLING_REPOSITORY`        | backend  | required    | OK           |
| `STRIPE_SECRET_KEY`         | backend  | required    | OK           |
| `STRIPE_WEBHOOK_SECRET`     | backend  | required    | OK           |
| `STRIPE_PRICE_PRO_MONTHLY`  | backend  | required    | OK           |
| `AI_PROVIDER`               | backend  | required    | OK           |
| `OPENAI_API_KEY`            | backend  | optional    | MISSING      |
| `ANTHROPIC_API_KEY`         | backend  | optional    | MISSING      |
| `GEMINI_API_KEY`            | backend  | required    | OK           |
| `RATE_LIMIT_STORE`          | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_URL`    | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_TOKEN`  | backend  | required    | OK           |

Only availability is shown. No value, token, key or secret is written to this report.

## Commands Run

| Command                                                 | Exit code | Result            |
| ------------------------------------------------------- | --------: | ----------------- |
| `node scripts/prc-kademe-8-live-verify.mjs --env-check` |         0 | BLOCKED_ENV_CHECK |

The external invocation required for this report is `npm run kademe8:verify`.

## Security Check

- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.
- 1 high-confidence secret-pattern finding(s) require manual review. Values are intentionally omitted.
- Secret values were not printed to terminal output or markdown.
- Live checks accept only Stripe test-mode credentials.

## Remaining Blockers

- Placeholder required variable: `VITE_BILLING_API_URL`
- Placeholder required variable: `VITE_AI_PROXY_URL`

## Next Decision

**Kademe 9 live release: FORBIDDEN until Kademe 8 has real passing staging evidence.**

- Production launch: **NOT ALLOWED.**
- Live billing: **NOT ALLOWED.**
- Kademe 9-13 code-only implementation: **ALLOWED; this does not create live evidence.**
