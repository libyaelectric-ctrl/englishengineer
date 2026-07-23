# Test Coverage Report

_Son güncelleme: 2026-07-20, gerçek CI coverage adımı continue-on-error ile çalışıyor, bu rapor bilgilendirme amaçlıdır._

## 1. Overview

This document contains the automated test coverage metrics for the EngineerOS project, measured via Vitest (`v8` provider). Coverage thresholds are advisory / non-blocking — CI does not fail when coverage drops.

## 2. Global Coverage Summary

| Metric         | Current Value | Target Threshold | Status          |
| :------------- | :------------ | :--------------- | :-------------- |
| **Lines**      | ~10%          | 60%              | ❌ Below target |
| **Functions**  | ~5%           | 60%              | ❌ Below target |
| **Statements** | ~10%          | 60%              | ❌ Below target |
| **Branches**   | ~5%           | 60%              | ❌ Below target |

## 3. Current State

- 755+ unit tests are passing (frontend + backend)
- Coverage is low because many UI components and feature modules lack dedicated unit tests
- The test suite focuses on critical paths: auth, billing, vocabulary, AI, core utilities
- Newer features (Learning Intelligence, Gamification, Team) have minimal coverage

## 4. Remediation Plan

1. **Billing Module**: Add integration tests for webhook handlers and billing routes
2. **Auth Module**: Add edge-case tests for cloud-sync conflict resolution
3. **Global**: Incrementally add tests for newer UI components
4. **Coverage Gate**: Consider enabling blocking coverage gate once global coverage exceeds 40%

## 5. How to Run Coverage

```bash
npm run test:coverage
```

HTML report is generated in `coverage/` directory.
