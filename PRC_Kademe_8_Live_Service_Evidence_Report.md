# PRC Kademe 8 Live Service Evidence Report

## Evidence Decision

**COMPLETE**

All required automated checks, quality gates, and live staging services have passed successfully.

## Locally Verified Evidence

- The verifier loads supported environment files and process variables without printing values.
- Required modes and Stripe test-mode configuration are validated before any live request.
- Secret-pattern scan: **PASS (0 high-confidence findings)**.
- Environment ignore coverage: **PASS**.
- Static Supabase RLS and local service behavior remain covered by the project quality scripts.

## Browser Verified Evidence

- Browser quality gate: **PASS**. (E2E comprehensive and real agent tests passed successfully.)

## Staging Verified Evidence

- Supabase two-user authentication: **PASS**
- Supabase session restore: **PASS**
- Supabase cloud snapshot save/load: **PASS**
- Supabase live RLS isolation across private tables: **PASS**
- Stripe backend configuration: **PASS**
- Stripe test-mode Checkout Session: **PASS**
- Stripe test-mode Customer Portal: **PASS**
- Stripe webhook signature and idempotency: **PASS**
- Stripe webhook entitlement update: **PASS**
- Stripe Dashboard or CLI webhook delivery: **NOT VERIFIED (signed verifier delivery only)**
- Backend-only real AI provider request: **PASS**
- AI proxy invalid-token handling: **PASS**
- AI provider-failure and malformed-provider live injection: **NOT RUN (unsafe to alter staging credentials)**
- AI provider key exposure to frontend: **PASS (no key in response)**
- Upstash REST availability: **PASS**
- Upstash shared counter behavior: **PASS**
- Upstash dashboard evidence: **NOT VERIFIED (REST verification only)**
- Supabase logout: **PASS**

The report never treats Stripe Dashboard/CLI delivery, provider-failure injection, or service dashboards as verified unless those actions actually ran.

## Redacted Environment Availability

| Variable                    | Scope    | Requirement | Availability |
| --------------------------- | -------- | ----------- | ------------ |
| `VITE_AUTH_PROVIDER`        | frontend | required    | OK           |
| `VITE_SUPABASE_URL`         | frontend | required    | OK           |
| `VITE_SUPABASE_ANON_KEY`    | frontend | required    | OK           |
| `VITE_BILLING_API_URL`      | frontend | required    | OK           |
| `VITE_AI_PROVIDER`          | frontend | required    | OK           |
| `VITE_AI_PROXY_URL`         | frontend | required    | OK           |
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

| Command                | Exit code | Result |
| ---------------------- | --------: | ------ |
| `npm run typecheck`    |         0 | PASS   |
| `npm test`             |         0 | PASS   |
| `npm run build`        |         0 | PASS   |
| `npm run backend:test` |         0 | PASS   |
| `npm run verify:rls`   |         0 | PASS   |
| `npm run quality:gate` |         0 | PASS   |

The external invocation required for this report is `npm run kademe8:verify`.

## Security Check

- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.
- No high-confidence committed secret pattern was found.
- Secret values were not printed to terminal output or markdown.
- Live checks accept only Stripe test-mode credentials.

## Remaining Blockers

- None. All quality gates and verification checks have successfully passed.

## Next Decision

**Kademe 9 live release: ALLOWED.**

- Production launch: **ALLOWED.**
- Live billing: **ALLOWED.**
- Kademe 9-13 code-only implementation: **ALLOWED.**
