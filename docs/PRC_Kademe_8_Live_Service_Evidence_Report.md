# PRC Kademe 8 Live Service Evidence Report

## Evidence Decision

**PARTIAL**

At least one real staging or quality check was not verified. No failed check is reported as passed.

## Locally Verified Evidence

- The verifier loads supported environment files and process variables without printing values.
- Required modes and Stripe test-mode configuration are validated before any live request.
- Secret-pattern scan: **PASS (0 high-confidence findings)**.
- Environment ignore coverage: **PASS**.
- Static Supabase RLS and local service behavior remain covered by the project quality scripts.

## Browser Verified Evidence

- Browser quality gate: **NOT RUN IN THIS VERIFICATION**.

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
- Stripe verifier-event cleanup: **PASS**
- Stripe test-customer cleanup: **PASS**
- Backend-only real AI provider request: **PASS**
- AI proxy invalid-token handling: **PASS**
- AI provider-failure and malformed-provider live injection: **NOT RUN (unsafe to alter staging credentials)**
- AI provider key exposure to frontend: **PASS (no key in response)**
- Upstash REST availability: **PASS**
- Upstash shared counter behavior: **PASS**
- Upstash verifier-key cleanup: **PASS**
- Upstash dashboard evidence: **NOT VERIFIED (REST verification only)**

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
| `VITE_BILLING_API_URL`      | frontend | required    | OK           |
| `VITE_AI_PROVIDER`          | frontend | required    | OK           |
| `VITE_AI_PROXY_URL`         | frontend | required    | OK           |
| `SUPABASE_URL`              | backend  | required    | OK           |
| `SUPABASE_ANON_KEY`         | backend  | required    | OK           |
| `SUPABASE_SERVICE_ROLE_KEY` | backend  | required    | OK           |
| `BILLING_REPOSITORY`        | backend  | required    | OK           |
| `STRIPE_SECRET_KEY`         | backend  | required    | OK           |
| `STRIPE_WEBHOOK_SECRET`     | backend  | required    | OK           |
| `STRIPE_PRICE_JUNIOR_MONTHLY`  | backend  | required    | OK           |
| `AI_PROVIDER`               | backend  | required    | OK           |
| `OPENAI_API_KEY`            | backend  | optional    | MISSING      |
| `ANTHROPIC_API_KEY`         | backend  | optional    | MISSING      |
| `GEMINI_API_KEY`            | backend  | required    | OK           |
| `RATE_LIMIT_STORE`          | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_URL`    | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_TOKEN`  | backend  | required    | OK           |

Only availability is shown. No value, token, key or secret is written to this report.

## Commands Run

| Command             | Exit code | Result |
| ------------------- | --------: | ------ |
| `npm run typecheck` |         0 | PASS   |
| `npm test`          |         1 | FAIL   |

The external invocation required for this report is `npm run kademe8:verify`.

## Security Check

- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.
- No high-confidence committed secret pattern was found.
- Secret values were not printed to terminal output or markdown.
- Live checks accept only Stripe test-mode credentials.

## Remaining Blockers

- npm test exited with code 1.

## Next Decision

**Kademe 9 live release: FORBIDDEN until Kademe 8 has real passing staging evidence.**

- Production launch: **NOT ALLOWED.**
- Live billing: **NOT ALLOWED.**
- Kademe 9-13 code-only implementation: **ALLOWED; this does not create live evidence.**

---

## Update — 2026-08-10 (root cause of `npm test` FAIL, and fix)

An independent audit (see `DENETIM_RAPORU.md`) traced the `npm test` exit code 1
above to three isolated causes, none of which were product regressions:

1. **Stale E2E copy** — `src/e2e/critical-flows.e2e.test.tsx` and
   `src/e2e/landing-page.e2e.test.tsx` asserted on landing-page copy
   ("Built for Engineers", "Writing desk", "Speaking room", ...) that no
   longer exists after a landing-page redesign. Fixed: assertions now match
   the current rendered copy.
2. **Slow corpus load causing test-runner timeouts** — several tests
   (`profile.engine.test.ts`, `vocabulary-translation.service.test.ts`) call
   into the large vocabulary dataset loader and can exceed the default 15s
   `vitest` timeout under parallel load, surfacing as a false FAIL. Tracked
   as `TECH_DEBT.md` TD-016. One test's explicit timeout was raised to 30s as
   an interim mitigation; the real fix (shared `beforeAll` load / trimmed
   fixture) is still open.
3. **One genuine, now-resolved test/behavior mismatch** — the translation
   fallback test suite expected `turkishMeaning` to be used as a fallback for
   _every_ interface language. This was **incorrect for a multi-language
   product**: `turkishMeaning` should only be used when the selected
   interface language is Turkish, otherwise it leaks Turkish text into
   non-Turkish UIs. **Decision: the implementation
   (`src/shared/services/vocabulary-translation.service.ts`) was correct and
   was left unchanged; the tests were corrected to match it.**

**Result:** `npx vitest run` on the four previously-failing files now passes
23/23. `npm run typecheck` passes with 0 errors (verified with an increased
Node heap; this sandbox's default heap was insufficient to run `tsc` on the
full codebase — not a code issue). The full 127-file suite was not run
start-to-finish in this pass because of sandbox memory limits (`Killed` /
OOM) rather than any test failure; re-running the full suite on a
less-constrained machine (or in CI) is recommended before flipping
`Production launch` / `Live billing` to ALLOWED.

Also fixed in this pass (unrelated to `npm test`, but part of the same
audit): a stale live URL in `docs/AI1_TASK_NEXT.md`, and pricing
inconsistencies across `docs/FAQ.md`, `docs/BUSINESS_MODEL.md` and
`docs/PRODUCT.md` (now aligned to `sonhal.md`, which matches the pricing
already implemented in `LandingPage/index.tsx`).

---

## Update — 2026-08-10 (2): entitlement gating is a no-op — needs a product decision

While verifying that `TeamPage`'s `EntitlementGate` actually blocks
non-paying users, we traced the check down to
`src/features/billing/billing.entitlements.ts` and found that
**`canAccessFeature()` — the function `EntitlementGate` actually calls —
unconditionally returns `{ allowed: true }` regardless of subscription or
feature**. The same is true of `canUseAICoach`, `canCreateMission`,
`canViewAdvancedAnalytics`, `canAccessProjectWorkspace`,
`canAccessPersistentMemory`, `canAccessCustomScenario`,
`canAccessLinkedInOptimization`, `canAccessPersistentAIAgent`, and
`canAccessRealVoiceSpeaking` — every entitlement check in this file grants
access "to all users" once a subscription is merely _active_ (including the
free `junior` tier).

This is confirmed intentional and covered by tests (e.g.
`billing.entitlements.test.ts` → `'allows all features for all users'`), so
it is **not a bug to silently "fix"** — it reads like a deliberate
launch/beta decision to keep every feature open while billing enforcement is
built out. However, it means the "Locked" / "Upgrade required" screens
rendered by `EntitlementGate` (e.g. on `/team`, with text like _"Team
management requires the Team plan"_) currently **never actually appear** for
any active subscriber, paid or free — the UI implies a paywall that isn't
enforced. Also renamed a stale `"Project plan"` label to `"Team plan"` in
`TeamDashboard.tsx` and `LegalPage.tsx` to match the current `sonhal.md`
tier names, independent of this gating issue.

**Decision needed from the product owner before Kademe 9:** either (a)
implement real per-plan entitlement checks in `billing.entitlements.ts`
before launch, or (b) if "everything open" is intentional for this phase,
update the UI copy (lock screens, `docs/FAQ.md`, `docs/BUSINESS_MODEL.md`)
to stop implying features are plan-gated when they currently are not.
