# Test Coverage Report

## 1. Overview
This document contains the automated test coverage metrics for the EngineerOS project, measured via Vitest (`v8` provider). Our CI pipeline enforces a minimum coverage threshold of 60% globally and 75% for critical modules.

## 2. Global Coverage Summary
*Note: This is a snapshot of the current state. The CI pipeline will break if the project falls below the 60% threshold.*

| Metric | Current Value | Required Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Lines** | 10.61% | 60.00% | ❌ FAIL |
| **Functions** | 4.57% | 60.00% | ❌ FAIL |
| **Statements** | 9.95% | 60.00% | ❌ FAIL |
| **Branches** | 5.23% | 60.00% | ❌ FAIL |

## 3. Critical Modules Coverage

### `src/features/billing/**` (Threshold: 75%)
| Metric | Current Value | Status |
| :--- | :--- | :--- |
| **Lines** | 23.46% | ❌ FAIL |
| **Functions** | 17.09% | ❌ FAIL |
| **Statements** | 22.79% | ❌ FAIL |
| **Branches** | 18.58% | ❌ FAIL |

### `src/features/auth/**` (Threshold: 75%)
| Metric | Current Value | Status |
| :--- | :--- | :--- |
| **Lines** | 35.29% | ❌ FAIL |
| **Functions** | 38.70% | ❌ FAIL |
| **Statements** | 35.69% | ❌ FAIL |
| **Branches** | 35.14% | ❌ FAIL |

## 4. Remediation Plan
1. **Billing Module**: 
   - Add integration tests for `BillingStatusPanel.tsx` error states.
   - Add unit tests for stripe-webhook parsers.
2. **Auth Module**: 
   - Implement missing edge-case tests for the cloud-sync conflict resolution.
3. **Global**: 
   - Over 1890 tests are passing, but the overall codebase size implies we are missing coverage in newer UI components (e.g., Learning Intelligence, Gamification features).
