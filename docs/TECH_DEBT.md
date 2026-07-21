# Technical Debt Register

## Overview

This document tracks known technical debt items that should be addressed in future sprints.

## High Priority

### TD-001: Refactor Large Components

**File:** `src/pages/WritingPage.tsx`
**Issue:** Component exceeds 500 lines
**Impact:** Maintainability, testability
**Effort:** 2-3 days
**Action:** Split into smaller components

### TD-002: Extract Business Logic

**File:** `src/features/billing/billing-flow.test.tsx`
**Issue:** Business logic mixed with UI
**Impact:** Testability, reusability
**Effort:** 1-2 days
**Action:** Extract to custom hooks

### TD-003: Add Error Boundaries

**File:** Multiple components
**Issue:** Missing error boundaries
**Impact:** User experience on errors
**Effort:** 1 day
**Action:** Add error boundaries to key routes

## Medium Priority

### TD-004: Optimize Bundle Size

**Issue:** Main bundle 372KB, sentry 351KB
**Impact:** Performance, load time
**Effort:** Resolved
**Action:** Routes already use React.lazy() for code splitting. Manual chunks configured in vite.config.ts. Main bundle contains app code + shared dependencies. Sentry is loaded on-demand. Bundle size is acceptable for a full-featured SPA.

### TD-005: Add Integration Tests

**Issue:** Limited integration test coverage
**Impact:** Regression risk
**Effort:** 3-4 days
**Action:** Add API integration tests

### TD-006: Update Dependencies

**Issue:** Some dependencies outdated
**Impact:** Security, features
**Effort:** 1-2 days
**Action:** Update and test

### TD-007: Improve Type Safety

**File:** `backend/src/` (all TypeScript files)
**Issue:** Previously had `any` types, now resolved
**Impact:** Type safety
**Effort:** Resolved
**Action:** All `any` types have been removed from backend code. Backend uses strict TypeScript.

### TD-016: CEFR Type Unification (Not Needed)

**Files:** `level-system.types.ts`, `profile.types.ts`
**Issue:** CefrBand and CefrLevel appear duplicated
**Impact:** None - intentionally different types
**Effort:** N/A
**Action:** CefrBand includes + variants (A1+, A2+, etc.) while CefrLevel is basic CEFR levels. They serve different purposes and should NOT be merged.

### TD-008: Add API Documentation

**Issue:** Missing OpenAPI/Swagger docs
**Impact:** Developer experience
**Effort:** 2-3 days
**Action:** Generate from code

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

### TD-011: Clean Up Dead Code

**Issue:** Unused imports and variables
**Impact:** Code clarity
**Effort:** 0.5 days
**Action:** Remove dead code

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

## Tracking

| ID     | Priority | Status | Assigned | Due Date |
| ------ | -------- | ------ | -------- | -------- |
| TD-001 | High     | Open   | TBD      | TBD      |
| TD-002 | High     | Open   | TBD      | TBD      |
| TD-003 | High     | Open   | TBD      | TBD      |
| TD-004 | Medium   | Open   | TBD      | TBD      |
| TD-005 | Medium   | Open   | TBD      | TBD      |
| TD-006 | Medium   | Open   | TBD      | TBD      |
| TD-007 | Medium   | Open   | TBD      | TBD      |
| TD-008 | Medium   | Open   | TBD      | TBD      |
| TD-009 | Low      | Open   | TBD      | TBD      |
| TD-010 | Low      | Open   | TBD      | TBD      |
| TD-011 | Low      | Open   | TBD      | TBD      |
| TD-012 | Low      | Open   | TBD      | TBD      |
| TD-013 | Low      | Open   | TBD      | TBD      |
| TD-014 | Low      | Open   | TBD      | TBD      |
| TD-015 | Low      | Open   | TBD      | TBD      |

## Last Updated

- **Date:** 2026-07-12
- **Total Items:** 15
