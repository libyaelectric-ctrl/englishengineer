# Technical Debt Register

## Overview

This document tracks known technical debt items that should be addressed in future sprints.

## Recently Resolved (v4.0.1)

### TD-001: Refactor Large Components ✅

**File:** `src/pages/WritingPage.tsx`
**Issue:** Component exceeds 500 lines
**Impact:** Maintainability, testability
**Status:** Resolved — WritingPage.tsx is now 333 lines, within acceptable range.

### TD-002: Extract Business Logic ✅

**File:** `src/features/billing/billing-flow.test.tsx`
**Issue:** Business logic mixed with UI
**Impact:** Testability, reusability
**Status:** Resolved — Billing logic extracted to billing.service.ts.

### TD-003: Add Error Boundaries ✅

**File:** Multiple components
**Issue:** Missing error boundaries
**Impact:** User experience on errors
**Status:** Resolved — ErrorBoundaryProvider wraps the entire app.

### TD-004: Optimize Bundle Size ✅

**Issue:** Main bundle 372KB, sentry 351KB
**Impact:** Performance, load time
**Status:** Resolved — React.lazy() code splitting + manual chunks configured.
**Note:** Bundle size budget tightened to 1MB JS / 200KB CSS in CI.

### TD-006: Update Dependencies ✅ (Partial)

**Issue:** Some dependencies outdated
**Impact:** Security, features
**Status:** Partially Resolved — 7 patch/minor updates merged. Major versions (eslint 10, vite 8, typescript 7, stripe 22) require dedicated upgrade sprint.

### TD-007: Improve Type Safety ✅

**File:** `backend/src/` (all TypeScript files)
**Issue:** Previously had `any` types
**Impact:** Type safety
**Status:** Resolved — All `any` types removed from backend. Strict TypeScript enforced.

### TD-011: Clean Up Dead Code ✅

**Issue:** Unused imports and variables
**Impact:** Code clarity
**Status:** Resolved — `noUnusedLocals` and `noUnusedParameters` enabled in tsconfig.

## High Priority

### TD-005: Add Integration Tests

**Issue:** Limited integration test coverage
**Impact:** Regression risk
**Effort:** 3-4 days
**Action:** Add API integration tests

## Medium Priority

### TD-008: Add API Documentation

**Issue:** Missing OpenAPI/Swagger docs
**Impact:** Developer experience
**Effort:** 2-3 days
**Action:** Generate from code

### TD-016: CEFR Type Unification (Not Needed)

**Files:** `level-system.types.ts`, `profile.types.ts`
**Issue:** CefrBand and CefrLevel appear duplicated
**Impact:** None - intentionally different types
**Effort:** N/A
**Action:** CefrBand includes + variants (A1+, A2+, etc.) while CefrLevel is basic CEFR levels. They serve different purposes and should NOT be merged.

## Low Priority

### TD-009: Implement Caching

**Issue:** No response caching
**Impact:** Performance
**Effort:** 2-3 days
**Action:** Add Redis caching layer

### TD-010: Add Monitoring

**Issue:** Limited observability
**Impact:** Debugging, performance
**Effort:** 1-2 days
**Action:** Add structured logging

### TD-012: Standardize Error Messages

**Issue:** Inconsistent error formats
**Impact:** User experience
**Effort:** 1 day
**Action:** Standardize error responses

**Resolution (2026-08-29):** the backend was already standardized (ApiError +
toErrorResponse + i18n error-code translation). The remaining frontend raw
throws (grammar seed loaders, schema validation, pronunciation capability
check) were converted to AppError with proper codes. 14 -> 0 raw throws in
non-test source.

### TD-013: Add Performance Tests

**Issue:** No performance benchmarks
**Impact:** Performance regression
**Effort:** 2-3 days
**Action:** Add k6 performance tests

**Resolution (2026-08-29):** k6 scripts with thresholds already existed under
tests/load (normal p95<500, soak p95<400, spike p95<1000) but the Load Test
workflow pointed at a non-existent script path and targeted the frontend host.
Fixed: the workflow now runs tests/load/normal-load.js against the backend API
(BASE_URL env, default: the Render backend).

### TD-014: Implement Feature Flags

**Issue:** No feature flag system
**Impact:** Deployment flexibility
**Effort:** 2-3 days
**Action:** Add LaunchDarkly or similar

**Resolution (2026-08-29):** implemented exactly as ADR-006 prescribed:
config-based flags at src/shared/feature-flags (env override
VITE_FLAG_<KEY>, deterministic rollout bucketing), no external vendor.

### TD-015: Add A/B Testing

**Issue:** No A/B testing capability
**Impact:** Product optimization
**Effort:** 3-4 days
**Action:** Implement A/B testing framework

**Resolution (2026-08-29):** lightweight deterministic A/B assignments at
src/shared/experiments/abTesting (hash bucketing shared with the flag system,
control/treatment variants, rollout percentage). Exposure analytics can hook
into the existing event bus when needed.

### TD-016: Slow test — `profile.engine.test.ts` 🟡

**File:** `src/features/profile/profile.engine.test.ts`
**Issue:** The `generates skill-specific daily missions` test takes ~13-15s to run
(and a related test in the same file is similarly slow). In isolation the test
passes, but under the full parallel `vitest run` suite it sometimes exceeds the
timeout and gets reported as FAIL, which incorrectly looks like a real
regression. Suspected cause: the large vocabulary dataset (`data/*.json`) is
being loaded/parsed synchronously on every test run instead of once in a
shared `beforeAll`.
**Impact:** False negatives in CI, slows down the whole test suite, makes
`npm test` results unreliable as a release gate.
**Effort:** 0.5-1 day
**Action:** Profile the test to confirm the vocabulary-load bottleneck; move
expensive setup into `beforeAll`; consider a trimmed/mock vocabulary fixture
for unit tests instead of the full production dataset.
**Found during:** 2026-08-10 repo audit (see `DENETIM_RAPORU.md`).

**Root cause identified (2026-08-29):** the underlying bottleneck is ~72 MB of
learning content shipped inside the repo/bundle (49.8 MB translation JSON +
22.0 MB vocabulary seed TS). Moving content to Supabase/CDN and fetching it at
runtime (same pattern as `public/data/grammar/*.json`) closes this item for good.

### TD-017: `navigation.e2e.test.tsx` `/dashboard renders` — Resolved ✅

**File:** `src/e2e/navigation.e2e.test.tsx`, `src/pages/DashboardPage/index.tsx`
**Root cause (two layers):**

1. `DashboardPage/index.tsx` was redesigned into a "Command Center" style
   layout (hero + 4 stat cards). The old `ProgressCockpit.tsx` and
   `DashboardSkeleton.tsx` components (which contained the "Progress
   Cockpit" text the test was looking for) are **no longer imported
   anywhere** — dead code left over from the redesign, same pattern as the
   earlier landing-page test-rot fixes in this audit.
2. Separately, the test never authenticated a user or completed onboarding,
   so `DashboardPage` was stuck on its `isLoading` guard (`useAuthStore`
   defaults to `isLoading: true`) and rendered "Loading..." forever — the
   test would have failed even after fixing (1) alone.
   **Fix:** Test now seeds `useAuthStore` with a fully authenticated,
   onboarded user via `LearningProfileRepository.saveProfile(...)` before
   rendering, and asserts on the real "EngVox Command Center" heading instead
   of the removed "Progress Cockpit" copy. 17/17 tests in the file now pass.
   **Follow-up (not done here):** `ProgressCockpit.tsx` and
   `DashboardSkeleton.tsx` are dead code — either wire them back in if the
   "cockpit" UI is still wanted somewhere, or delete them.
   **Found during / resolved during:** 2026-08-10 repo audit (see `DENETIM_RAPORU.md`).

### TD-018: No shared store-reset helper between E2E test files ✅

**Files:** `src/e2e/*.e2e.test.tsx`
**Issue:** Zustand stores (`useAuthStore`, `useBillingStore`, and likely
others) are module-level singletons. No E2E test file resets them in an
`afterEach`/`afterAll`, so state set by one test file can leak into the
next file in the same worker. This was invisible while `canAccessFeature()`
was a no-op (TD from the 2026-08-10 billing audit) and while `DashboardPage`
tests didn't authenticate a user, but is now exposed: running
`navigation.e2e.test.tsx` and `new-features.e2e.test.tsx` together causes 2
of 17 `new-features` tests to intermittently fail (tab click on a
lazy-loaded `InterviewSimulator` doesn't register), even though **both
files pass 100% when run individually**. Root cause not fully isolated —
likely `useAuthStore.setState(...)` in `navigation.e2e.test.tsx` (added in
this audit pass) interacting with something in `SpeakingPage`'s tab
rendering, but could not be pinned down further without a real browser
debugger.
**Impact:** Full-suite (`npx vitest run`, no path filter) test results may
show 1-2 false failures depending on file execution order, even though
every file is internally correct. Reduces trust in "green CI" as a signal.
**Effort:** 0.5-1 day.
**Action:** Add a shared test helper (e.g. `src/e2e/test-utils/resetStores.ts`)
that resets every Zustand store to its initial state, call it in a global
`afterEach` (e.g. via `vitest.setup.ts` if one exists, or per-file). This
removes an entire class of order-dependent flakiness at once, rather than
patching one interaction at a time.
**Found during:** 2026-08-10 repo audit (see `DENETIM_RAPORU.md`).

**Resolution (2026-08-29):** shared reset helper added at
`src/e2e/test-utils/resetStores.ts` and wired into all 6 E2E suites
(command-palette, critical-flows, landing-page, navigation, new-features,
release-candidate) via top-level `afterEach` calls.

### TD-019: Deduplicate /api + /api/v1 route registration ✅

**File:** `backend/src/app.ts`
**Issue:** `v1RouterAdapter` registers every route on both `/api/*` and
`/api/v1/*`, while a separate legacy-redirect middleware already forwards
`/api/*` to `/api/v1/*` (307 + Deprecation headers). Three overlapping
mechanisms for the same goal; in production the app-level registrations are
unreachable because the redirect middleware fires first, and they mainly exist
so tests can call `/api/...` directly.
**Impact:** Maintenance risk, confusing route table.
**Effort:** 1-2 days (test callers must move to `/api/v1/*`).
**Action:** Removed the dual registration, removed the redirect middleware,
migrated all route source files and test callers to `/api/v1/*`.
**Resolved:** 2026-08-29.

### TD-020: Pre-commit hook swallows vitest exit code (pipe to tail)

**File:** `.husky/pre-commit`
**Issue:** The vitest run is piped through `tail -5` and the hook checks `$?`,
which reflects the exit code of `tail`, not vitest. A failing suite therefore
passes the pre-commit gate. Observed live on 2026-08-29: 1 test failed | 1081
passed and the hook still printed "Tests passed". The failing test name was
lost to the same pipe (tail -5), which also makes diagnosis impossible.
**Impact:** False green light at commit time; flaky failures (see TD-018)
become invisible instead of actionable.
**Effort:** 0.2 days.
**Action:** Redirect vitest output to a temp log, check the real exit code,
then tail the log. Implemented on 2026-08-29.
**Found during:** 2026-08-29 commit run.

## Tracking

| ID     | Priority | Status      | Assigned | Due Date   |
| ------ | -------- | ----------- | -------- | ---------- |
| TD-001 | High     | ✅ Resolved | TBD      | TBD        |
| TD-002 | High     | ✅ Resolved | TBD      | TBD        |
| TD-003 | High     | ✅ Resolved | TBD      | TBD        |
| TD-004 | Medium   | ✅ Resolved | TBD      | TBD        |
| TD-005 | Medium   | 🟡 Open     | TBD      | TBD        |
| TD-006 | Medium   | 🟡 Partial  | TBD      | TBD        |
| TD-007 | Medium   | ✅ Resolved | TBD      | TBD        |
| TD-008 | Medium   | 🟡 Open     | TBD      | TBD        |
| TD-009 | Low      | 🟡 Open     | TBD      | TBD        |
| TD-010 | Low      | 🟡 Open     | TBD      | TBD        |
| TD-011 | Low      | ✅ Resolved | TBD      | TBD        |
| TD-012 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-013 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-014 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-015 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-016 | Medium   | 🟡 Open     | TBD      | TBD        |
| TD-017 | Low      | ✅ Resolved | TBD      | TBD        |
| TD-018 | Medium   | Resolved    | TBD      | TBD        |
| TD-019 | Medium   | ✅ Resolved | TBD      | 2026-08-29 |
| TD-020 | Medium   | Resolved    | TBD      | TBD        |

## Stats

- **Total Items:** 20
- **Resolved:** 14 (70%)
- **Partially Resolved:** 1 (5%)
- **Open:** 5 (25%)

## Last Updated

- **Date:** 2026-08-29
