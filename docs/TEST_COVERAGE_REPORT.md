# Test Coverage Report

Snapshot of the automated test suite and the critical product flows it
protects. Numbers are taken from a full green run of the suite.

| Scope                                 | Runner          | Files  | Tests                | Result                                            |
| ------------------------------------- | --------------- | ------ | -------------------- | ------------------------------------------------- |
| Frontend unit suite (`npm test`)      | Vitest (jsdom)  | 168    | **981**              | ✅ 0 failures                                     |
| Frontend e2e (Vitest)                 | Vitest          | 6      | —                    | excluded from `npm test` (runs via `npm run e2e`) |
| Backend (`npm --prefix backend test`) | node:test + tsx | 36     | —                    | separate pipeline step                            |
| Browser smoke (`npm run e2e:browser`) | Playwright      | 1 spec | 3 tests × 2 projects | ✅ 6/6                                            |

Run everything: `npm test && npm --prefix backend test && npx playwright test tests/e2e/lock-system.spec.ts`

---

## 1. Subscription lock system (newest coverage)

The free/junior/senior/specialist/master plan matrix, its menu locks, route
guards and free-tier preview limits are covered end to end:

| Flow                                                                                            | Test file                                                                                 | Cases                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Plan hierarchy + cumulative entitlements, min-plan reporting, downgrade impact                  | `src/features/billing/billing.entitlements.test.ts`                                       | free/junior matrix, legacy `junior+none` = free, Senior/Specialist/Master tiers, canceled-plan degradation, **free-tier preview limits** |
| Route guards — placement, learning hub, translator, tools, speaking, listening + preview routes | `src/features/billing/SubscriptionRouteGuard.test.tsx`                                    | **19** (placement 2, learning hub 4, translator 2, tools 3, speaking 3, listening 3, grammar preview 1, vocabulary preview 1)            |
| Menu locks + plan-requirement modal + "See plans"                                               | `src/layouts/Navigation.test.tsx`                                                         | 7 (locked rendering, modal plan text, Team "coming soon", See-plans navigation)                                                          |
| Grammar free-tier gate (first module free → `/pricing`)                                         | `src/pages/GrammarPage/hooks/useGrammarPage.test.ts`                                      | 4                                                                                                                                        |
| Vocabulary free-tier gate (one page → `/pricing`)                                               | `src/pages/VocabularyPage/hooks/useVocabularyPage.test.ts`                                | 3                                                                                                                                        |
| Pricing/checkout/status/workspace behaviors                                                     | `src/features/billing/*` (pricing page, checkout flow, status panel, workspace, currency) | 12 (rest of the 53-test billing directory)                                                                                               |

**End-to-end (real browser + real Clerk free-tier user):**
`tests/e2e/lock-system.spec.ts` — signs in via email+password+OTP (fixed code
424242 for `+clerk_test`), seeds onboarding, then verifies menu locks, the
upgrade modal, "See plans" → `/pricing`, URL protection (8 locked routes →
pricing) and open preview routes. Skips cleanly without `CLERK_SECRET_KEY`.
Runs in CI (`ci.yml` → e2e job) with the Clerk secrets injected.

---

## 2. Auth (Clerk)

- `src/features/auth/*` — ClerkBridge store seeding, AuthGuard race-condition
  fix (no `/login` ↔ `/dashboard` loop while Clerk restores the session),
  profile sync to Clerk, sign-out wiring — **36 auth tests**.
- Backend: `backend/test/*` — Clerk token verification against JWKS,
  auth-bypass headers, middleware protections (`backend/test/middleware`).

## 3. Learning core

| Area                                            | Test files                              | Critical flows                                                                                                 |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Vocabulary                                      | ~20 across `src/features/vocabulary/**` | menu state machine, spaced repetition (due/review), word selection, search, per-user progress, engine reducers |
| Grammar                                         | 7 (`src/features/grammar/**`)           | rule repository, lesson status/unlock chain, level counts, gate logic                                          |
| Speaking                                        | 8 (core, audio-upload, pronunciation)   | roleplay flows, audio upload validation, pronunciation analysis                                                |
| Listening                                       | 2                                       | transcript practice state                                                                                      |
| Writing                                         | 5                                       | composition feedback state                                                                                     |
| Placement                                       | 2                                       | test flow + level assignment                                                                                   |
| Level system                                    | 2                                       | ELO → CEFR band mapping, `getBaseCefrLevel`                                                                    |
| Learning path                                   | 2                                       | path gating                                                                                                    |
| Progress / learning intelligence / orchestrator | 4 + 4 + 4                               | next-steps, review queues, mission orchestration                                                               |
| Gamification                                    | 4                                       | hearts, streaks, rewards                                                                                       |

## 4. AI & analytics

- `src/features/ai/*` (4) + `src/features/analytics/*` (4) — AI service
  orchestration, analytics ledger/events, `PersonalAIPanel`.
- Backend `backend/test/ai*.test.ts` — provider fallback (mock), prompt
  loading, rate limits, ledger.

## 5. Billing providers (backend)

- Stripe / Dodo / Paddle provider adapters, checkout + customer portal +
  webhook signature verification (incl. the Dodo base64 `whsec_` regression
  test), event cache — **28 billing tests** in `backend/test/`.

## 6. Platform & shared

| Area                                                    | Test files                                            | Covers                                                               |
| ------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Pages                                                   | 9 (`src/pages/**`) + VocabularyPage 2 + ProfilePage 2 | pricing, dashboard, onboarding, profile sections                     |
| Layouts                                                 | 4                                                     | AppShell, Navigation (locks), Sidebar, mobile bottom nav             |
| Shared components                                       | 9                                                     | Button, Toast, Modal patterns, LoadingState, ScoreFeedbackOverlay    |
| Shared services / hooks / utils / storage               | 5 + 3 + 2 + 2                                         | profile repository, storage namespacing, sound, cn                   |
| Core learning store                                     | 4 (`src/core/learning`)                               | hearts, pool selection                                               |
| Config                                                  | 3                                                     | environment validation (incl. invalid-URL WARN path), product config |
| Feature flags / team / work-tools / localization / beta | 2 each                                                | flags gating, team roles, tool routing, translations                 |

---

## 7. Coverage thresholds vs. measured reality

Configured in `vitest.config.ts`: **global 75%** for all `src/**`, and **80%**
for every feature area (`billing`, `auth`, `ai`, `vocabulary`, `grammar`,
`reading`, `writing`, `speaking`, `listening`, `core`, `shared`).

Measured on the same green 981-test run (`npm run test:coverage`, v8):

| Area (threshold 80%)               | Lines    | Functions | Statements | Branches | Status     |
| ---------------------------------- | -------- | --------- | ---------- | -------- | ---------- |
| `src/core/**`                      | 76.5     | 69.0      | 74.6       | 60.5     | ❌ closest |
| `src/features/grammar/**`          | 67.3     | 66.2      | 67.7       | 57.1     | ❌         |
| `src/features/vocabulary/**`       | 66.3     | 63.0      | 65.2       | 54.8     | ❌         |
| `src/shared/**`                    | 57.5     | 54.3      | 55.8       | 51.4     | ❌         |
| `src/features/writing/**`          | 56.4     | 46.6      | 56.1       | 36.8     | ❌         |
| `src/features/ai/**`               | 49.7     | 41.8      | 48.2       | 32.0     | ❌         |
| `src/features/speaking/**`         | 48.3     | 44.3      | 48.4       | 32.6     | ❌         |
| `src/features/billing/**`          | 36.4     | 29.4      | 35.2       | 31.2     | ❌         |
| `src/features/auth/**`             | 26.1     | 35.7      | 24.7       | 18.0     | ❌         |
| `src/features/listening/**`        | 21.3     | 24.8      | 19.8       | 14.1     | ❌         |
| `src/features/reading/**`          | 3.4      | 8.3       | 3.4        | 1.6      | ❌ lowest  |
| **Total `src/**` (threshold 75%)** | **46.9** | **42.0**  | **46.0**   | **34.9** | ❌         |

**Finding:** every configured threshold is currently unmet, so
`npm run test:coverage` exits non-zero and the CI `Test Coverage` step fails
as of the run above. The tests themselves all pass (981/981) — the gap is
untested source (e.g. `reading` at ~3% lines, `listening` at ~21%). Two
options, or both: (a) raise unit-test coverage in the low areas, or (b) align
the thresholds in `vitest.config.ts` with reality and re-raise them as
coverage improves. The weaker CI enforcement step (`ci.yml`, mins
38/28/34 lines/branches/functions) still passes at current levels.

CI (`ci.yml`) additionally runs: typecheck, ESLint, dependency-cruiser,
bundle-size budget, backend typecheck + tests, and the Playwright smoke test
with `CLERK_SECRET_KEY` / `VITE_CLERK_PUBLISHABLE_KEY` secrets.

---

## 8. Known gaps / notes

- `tests/browser/**` and most `tests/e2e/**` specs predate the Clerk
  migration (they log in via a "demo" button that no longer exists) and are
  **not** CI-gated — kept for local reference until ported to the Clerk
  sign-in helper in `lock-system.spec.ts`.
- Frontend Vitest excludes `src/e2e/**` and
  `src/shared/tests/integration/**` by design (`npm run e2e` /
  `test:integration` run those separately).

_Keep the numbers in this file in sync with the actual suite after large test
changes — re-run `npm test` and update Section 1 / the summary table._
