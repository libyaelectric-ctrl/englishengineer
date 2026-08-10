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

### TD-013: Add Performance Tests

**Issue:** No performance benchmarks
**Impact:** Performance regression
**Effort:** 2-3 days
**Action:** Add k6 performance tests

### TD-014: Implement Feature Flags

**Issue:** No feature flag system
**Impact:** Deployment flexibility
**Effort:** 2-3 days
**Action:** Add LaunchDarkly or similar

### TD-015: Add A/B Testing

**Issue:** No A/B testing capability
**Impact:** Product optimization
**Effort:** 3-4 days
**Action:** Implement A/B testing framework

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

## Tracking

| ID     | Priority | Status      | Assigned | Due Date |
| ------ | -------- | ----------- | -------- | -------- |
| TD-001 | High     | ✅ Resolved | TBD      | TBD      |
| TD-002 | High     | ✅ Resolved | TBD      | TBD      |
| TD-003 | High     | ✅ Resolved | TBD      | TBD      |
| TD-004 | Medium   | ✅ Resolved | TBD      | TBD      |
| TD-005 | Medium   | 🟡 Open     | TBD      | TBD      |
| TD-006 | Medium   | 🟡 Partial  | TBD      | TBD      |
| TD-007 | Medium   | ✅ Resolved | TBD      | TBD      |
| TD-008 | Medium   | 🟡 Open     | TBD      | TBD      |
| TD-009 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-010 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-011 | Low      | ✅ Resolved | TBD      | TBD      |
| TD-012 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-013 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-014 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-015 | Low      | 🟡 Open     | TBD      | TBD      |
| TD-016 | Medium   | 🟡 Open     | TBD      | TBD      |

## Stats

- **Total Items:** 15
- **Resolved:** 7 (47%)
- **Partially Resolved:** 1 (7%)
- **Open:** 7 (47%)

## Last Updated

- **Date:** 2026-07-27
