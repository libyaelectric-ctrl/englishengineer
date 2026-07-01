# PRC Kademe 15 Mobile UX and Unified Learning System Report

**Owner / author:** Özcan ERENSAYIN  
**Source contract version:** EngineerOS v4.0.1  
**Working package folder:** `4.8`  
**Verdict:** **PASS WITH LIVE-SERVICE BLOCKERS**

## Executive Verdict

Kademe 15 is complete as a local-first, closed-beta code milestone. The new
entry, onboarding, placement, learning, vocabulary and mobile flows use the
existing profile, learning, vocabulary and storage layers. No production
deployment, live billing or live cloud proof is claimed.

- Production launch: **NO**
- Live billing: **NO**
- Legal review required: **YES**
- Kademe 8 live-service status: **BLOCKED**
- Public SaaS claim: **NO**

## Decision-by-Decision Result

| Decision                        | Result   | Implementation                                                                                                                                                                                                            |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15.1 Start Free / Try Lite      | PASS     | `/start` offers Try Lite, Create Account and Login. Lite is local-only, uses `Demo Engineer`, needs no email and stays separate from cloud sync. Disabled account states explain why.                                     |
| 15.2 Global onboarding          | PASS     | Added professional track, role, sector, communication goals, optional experience, career outcome, 15-180 minute goal, country, timezone detection/correction and language. Future tracks are disabled as Coming Soon.     |
| 15.3 Placement MVP              | PASS     | Eight Reading/Vocabulary/Grammar questions produce A1-C2 recommendation, confidence and priority areas. Only assessed skills are updated; Writing, Listening and Speaking remain independent.                             |
| 15.4 Metric cleanup             | PASS     | Primary WPM/ELO labels were replaced by CEFR, current level, completion and internal progress wording. Underlying scoring remains unchanged.                                                                              |
| 15.5 Learning Hub               | PASS     | Added Continue Learning, Today's Best Task, Current Level, Weak Area and Due Review action cards above existing modules.                                                                                                  |
| 15.6 Unified learning state     | PASS     | Reading discoveries enter Vocabulary review, unresolved Writing corrections enter Mistake Log, placement updates the canonical profile, and Hub recommendations consume those stores. No fake cloud sync was added.       |
| 15.7 Vocabulary UX              | PASS     | Search is read-only, default tab is New, Learned uses Remembered/Review Again, Mastered has no action, batches are deterministic groups of 10, and recommended sessions use up to 8 new + 2 review items.                 |
| 15.8 Reading                    | PASS     | Added previous/next/count/Hub navigation, light mission and passage surfaces, Writing follow-up, original-content metadata and a versioned catalog contract with capacity for 200 lessons. Content was not bulk-expanded. |
| 15.9 Writing                    | PASS     | Added scenario-first brief, required structure, previous/next/Hub navigation, local evaluation continuity, Vocabulary discovery and Mistake Log integration.                                                              |
| 15.10 Multilingual foundation   | MODIFIED | EN/TR preference and key navigation translations are implemented. Arabic, Spanish, French and Portuguese remain future packs. Full-page translation is intentionally not claimed.                                         |
| 15.11 Plan / profile            | PASS     | Existing backend-trusted billing remains intact; profile exposes essential name/language controls and existing plan controls. Pricing remains indicative, not legally approved.                                           |
| 15.12 Team                      | PASS     | Roles are `admin`, `manager`, `learner`; manager views expose summaries only. Demo data, pending invites and missing email delivery remain clearly labelled.                                                              |
| 15.13 Feedback mobile P1        | PASS     | Feedback can close by Cancel, Escape, close button or backdrop and now sits above mobile navigation with safe-area spacing.                                                                                               |
| 15.14 Mobile navigation         | PASS     | A shared bottom navigation covers app pages on mobile while the desktop sidebar remains unchanged.                                                                                                                        |
| 15.15 Listening / Speaking hold | PASS     | No engine redesign. Existing labels, level gating and global navigation were preserved.                                                                                                                                   |
| 15.16 Backlog                   | DEFERRED | Real email delivery, exports, deletion/export workflows, screenshot upload backend, additional language packs and live service proof remain backlog.                                                                      |
| 15.17 Tests / package           | PASS     | All local quality gates and Chromium browser tests pass. A clean source ZIP is generated separately.                                                                                                                      |

## Architecture Decisions

- Extended `UserLearningProfile`; did not create a competing learner profile.
- Placement stores its result locally and writes assessed skill bands through
  `LearningProfileRepository`.
- The old beta onboarding overlay was unmounted to remove duplicate profile
  collection; its files remain for compatibility.
- Localization uses the shared storage wrapper and a small Zustand adapter.
- Lite auth uses the existing local adapter even when Supabase is configured;
  local demo users are excluded from cloud sync.
- Reading source metadata attributes original EngineerOS content to
  **Özcan ERENSAYIN**.

## Quality Evidence

| Command                        |     Exit | Evidence                                                               |
| ------------------------------ | -------: | ---------------------------------------------------------------------- |
| `npm ci`                       |        0 | 326 packages, 0 vulnerabilities                                        |
| `npm run content:validate`     |        0 | 30 Listening, 30 Speaking roleplay, 30 Writing definitions             |
| `npm run typecheck`            |        0 | TypeScript strict check passed                                         |
| `npm run format:check`         |        0 | All files match Prettier                                               |
| `npm run lint`                 |        0 | ESLint passed                                                          |
| `npm run test`                 |        0 | 56 files, 226 tests passed                                             |
| `npm run build`                |        0 | 1,999 modules transformed; build completed                             |
| `npm run e2e`                  |        0 | 20 smoke scenarios passed                                              |
| `npm run backend:install`      |        0 | 0 vulnerabilities                                                      |
| `npm run backend:test`         |        0 | 38 tests passed                                                        |
| `npm run verify:release`       |        0 | Structure, version and required content counts passed                  |
| `npm run verify:rls`           |        0 | Static RLS ownership/privacy checks passed                             |
| `npm run quality:gate`         |        0 | Full non-browser chain passed in 118.2 seconds                         |
| `npm run e2e:browser`          |        0 | 11 Chromium scenarios passed                                           |
| `npm run quality:gate:browser` |        0 | Full chain plus Chromium passed in 189.6 seconds                       |
| `npm run kademe8:check`        |        0 | Preflight correctly reported BLOCKED; no live request                  |
| `npm run kademe8:verify`       | non-zero | npm wrapper failed by design; verifier report records exit 2 / BLOCKED |

## Build and Runtime Notes

- Main application chunk: **412.60 kB** minified / **126.60 kB** gzip.
- CSS: **93.81 kB** minified / **15.31 kB** gzip.
- Large level seed chunks remain above 500 kB minified; they are split from the
  main application but should move to streamed/static content delivery later.
- `npm ci` initially hit a Windows file lock from stale Vite preview processes.
  After those verified project-local processes were stopped, clean install and
  both quality chains passed naturally.

## Files Added

- `src/features/placement/*` including service, store and tests
- `src/features/localization/*` including service, store and test
- `src/pages/StartPage.tsx`
- `src/pages/PlacementPage.tsx`
- `src/shared/layout/MobileBottomNavigation.tsx`
- `PRC_Kademe_15_Mobile_UX_Learning_System_Report.md`

## Main Files Updated

- Auth: `auth.adapter.ts`, `auth.service.ts`, `LoginPage.tsx`
- Profile/onboarding: profile types, repository, preferences, utilities,
  `OnboardingPage.tsx`, `ProfilePage.tsx`
- Learning: `CurriculumPage.tsx`, Reading/Writing/Vocabulary services and pages
- Mobile/UI: `AppShell.tsx`, `Navigation.tsx`, `BetaFeedbackWidget.tsx`
- Team: team types, provider/store data and `TeamPage.tsx`
- Validation: environment/observability tests, smoke E2E and browser E2E
- Metadata/docs: `package.json`, `metadata.json`, `README.md`

## Remaining Blockers and Backlog

1. Kademe 8 verifier reports 11 missing required settings and two redacted
   secret-pattern findings requiring manual review.
2. Live Supabase two-user isolation, Stripe test-mode flow, AI proxy and Upstash
   evidence are not available.
3. Full multilingual copy, real email delivery, exports and account deletion
   are not implemented.
4. Placement does not test Listening, Speaking or free-form Writing; those
   skills remain evidence-driven from their own modules.
5. Large CEFR seed chunks should be moved to incremental content delivery.

## Repository Evidence

This extracted source package does not contain a `.git` directory. Therefore
`git status` and `git diff --stat` are **NOT AVAILABLE** and are not fabricated.

## Next Step

Recommended next milestone: **PRC Kademe 16 code-only hardening**, after user
approval. Any production launch or live commercial activation remains blocked
until Kademe 8 has real staging evidence and legal review is complete.
