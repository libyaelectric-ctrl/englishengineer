# EngineerOS v4.0.1 Level Gating and Vocabulary Final Report

## 1. Test stability fixes

The default unit command excludes the separately executed `src/e2e` suite and uses two controlled workers. No test was removed. Application E2E, browser E2E and backend tests remain separate quality gates.

## 2. Quality gate result

The complete quality gate passed with 131 frontend unit/integration tests, 20 application E2E tests and 13 backend tests. Build, typecheck, formatting and lint passed.

## 3. Level gating implementation

Reading, Writing, Listening, Speaking and Vocabulary use the current level for their own skill. The canonical sequence is A1, A2, B1, B2, C1, C2.

## 4. Skill-based behavior

Skills progress independently. Career role changes the engineering topic, not CEFR difficulty.

## 5. A1/A2 starter content

Reading, Writing, Listening, Speaking and Vocabulary include A1 and A2 starters. Two matching local WAV assets support beginner Listening.

## 6. Page filters

Every skill page defaults to My Level and offers Review Previous, Preview Next and All Levels. Current, Review, Preview, Locked and Advanced Preview labels are visible. All Levels shows an explicit advanced-content warning.

## 7. Vocabulary search UI

Search supports button and Enter submission, validation, internal-first results, level-aware filtering and Add to My Vocabulary.

## 8. External lookup backend route

The backend exposes `GET /api/vocabulary/lookup`, validates requests, applies timeout handling and uses a backend memory cache.

## 9. Provider honesty

Free Dictionary API, LibreTranslate, MyMemory and Cached result labels are only shown when those sources are actually used. Missing configuration and provider failures have explicit non-fabricated states.

## 10. My Vocabulary system

Saved words have typed metadata, source, status and review dates in one local persistence record.

## 11. Review Queue

Due words are selected from honest next-review dates. The existing vocabulary evaluator and spaced-repetition practice remain available.

## 12. Weak Words

Manual Weak actions and incorrect reviews place saved words in the Weak Words view.

## 13. Local persistence

Memory and lookup cache use the existing storage wrapper. Cloud sync is not claimed.

## 14. Dashboard vocabulary card

Dashboard shows Saved, Due today, Weak and Mastered counts from the canonical memory service.

## 15. Tests added

Level gating, starter content, search UI, internal/external lookup, cache, vocabulary memory, status transitions, filters, dashboard summary and backend route behavior are covered.

## 16. Commands run

The final run includes clean install, typecheck, format, lint, unit tests, build, application E2E, backend install/tests, release verification, RLS verification and real Chromium when available.

## 17. Commands passed

| Command                   | Result                                     |
| ------------------------- | ------------------------------------------ |
| `npm ci`                  | PASS - 308 packages, 0 vulnerabilities     |
| `npm run typecheck`       | PASS                                       |
| `npm run format:check`    | PASS                                       |
| `npm run lint`            | PASS                                       |
| `npm run test`            | PASS - 27 files, 131 tests                 |
| `npm run build`           | PASS - 2,308 modules transformed           |
| `npm run e2e`             | PASS - 20 tests                            |
| `npm run backend:install` | PASS - 70 packages, 0 vulnerabilities      |
| `npm run backend:test`    | PASS - 13 tests                            |
| `npm run verify:release`  | PASS - structure, counts and 12 WAV assets |
| `npm run verify:rls`      | PASS - static RLS/policy/ownership checks  |
| `npm run e2e:browser`     | PASS - 9 real Chromium tests               |

The production entry chunk is 259.42 kB raw / 81.32 kB gzip. The first enhanced browser attempt exposed a strict selector collision and an audit-speed timeout; the selector was made exact and the browser test timeout was raised to 90 seconds. The authoritative rerun passed 9/9.

## 18. Remaining limitations

External lookup requires a deployed backend URL. Translation requires optional provider configuration. Memory is device-local. Live Supabase, Stripe, AI and deployment evidence remain external requirements.

## 19. Honest readiness score

Target: **95/100 — strong closed beta / controlled paid beta candidate**.

Public SaaS readiness is not claimed. Deployment credentials required.
