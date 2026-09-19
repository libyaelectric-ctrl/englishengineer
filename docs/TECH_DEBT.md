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

### TD-006: Update Dependencies ✅

**Issue:** Some dependencies outdated
**Impact:** Security, features
**Status:** Resolved — All Dependabot PRs merged (15 total including stripe 18→22, storybook 8→10). Major upgrades completed: vite 6→8, @vitejs/plugin-react 5→6, eslint 9→10, typescript 5→6, lucide-react, concurrently, jsdom, @testing-library/jest-dom/dom. All ESLint 10 `no-useless-assignment` errors fixed. 77/77 tests pass.

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

### TD-005: Add Integration Tests ✅

**Issue:** Limited integration test coverage
**Impact:** Regression risk
**Effort:** 3-4 days
**Action:** Add API integration tests

**Resolution (2026-08-29):** api.integration.test.ts (6 tests: health,
AI, CSRF, 404 handling, API docs) + api.extended.integration.test.ts
(31 tests: vocabulary, reading, writing, listening, speaking, grammar,
billing, progress, webhooks). Backend suite: 414/414 pass (also verified: vocabulary + translation seed files served correctly in production with ETag revalidation + edge cache).

## Medium Priority

### TD-008: Add API Documentation ✅

**Issue:** Missing OpenAPI/Swagger docs
**Impact:** Developer experience
**Effort:** 2-3 days
**Action:** Generate from code

**Resolution (2026-08-29):** OpenAPI spec generated from code at
backend/src/swagger.ts. Swagger UI self-hosted via swagger-ui-dist
(no CDN dependency). Served at /api-docs with /api-docs.json spec
endpoint. CSP configured with scriptSrc: 'self'.

### TD-016: CEFR Type Unification (Not Needed)

**Files:** `level-system.types.ts`, `profile.types.ts`
**Issue:** CefrBand and CefrLevel appear duplicated
**Impact:** None - intentionally different types
**Effort:** N/A
**Action:** CefrBand includes + variants (A1+, A2+, etc.) while CefrLevel is basic CEFR levels. They serve different purposes and should NOT be merged.

## Low Priority

### TD-009: Implement Caching ✅

**Issue:** No response caching
**Impact:** Performance
**Effort:** 2-3 days
**Action:** Add Redis caching layer

**Resolution (2026-08-29):** Upstash Redis caching implemented at
backend/src/cache/redis-cache.service.ts with in-memory fallback.
getOrSet/invalidateCache/invalidateByPrefix APIs. Used in AI routes
for response caching (TTL 3600s). Connection pool management at
connection-pool.ts. Cache stats exposed via /api/v1/admin/cache-stats.

### TD-010: Add Monitoring ✅

**Issue:** Limited observability
**Impact:** Debugging, performance
**Effort:** 1-2 days
**Action:** Add structured logging

**Resolution (2026-08-29):** structured logging already implemented via
winston at backend/src/logger.ts (JSON format, file transports for
error.log + combined.log, configurable LOG_LEVEL). Zero console.*
calls in backend source — all routes use the structured logger.

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

**Follow-up (2026-08-29):** the duplicate feature-level schema twins
(src/features/grammar/grammar.schema.ts and
src/features/vocabulary/types/vocabulary.schema.ts) were deleted; the shared
twins now carry the AppError validation throws.

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
The legacy src/shared/feature-flags.ts module was removed in the same pass;
its two flags (teamBeta, unifiedDifficultyScoring) were migrated into the
registry with legacy VITE_FEATURE_FLAG_* env aliases.

### TD-015: Add A/B Testing

**Issue:** No A/B testing capability
**Impact:** Product optimization
**Effort:** 3-4 days
**Action:** Implement A/B testing framework

**Resolution (2026-08-29):** lightweight deterministic A/B assignments at
src/shared/experiments/abTesting (hash bucketing shared with the flag system,
control/treatment variants, rollout percentage). Exposure analytics can hook
into the existing event bus when needed.

### TD-021: Slow test — `profile.engine.test.ts` 🟡

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

**Verified (2026-08-29 21:41):** CI success on the deduplicated tree; the
frontend was confirmed to call /api/v1/* exclusively (zero non-v1 API
calls in src/), so dropping the redirect middleware is safe.

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

### TD-023: Every production deploy fails with "Resource provisioning failed" ✅

**File:** `.github/workflows/vercel-deploy.yml` (symptom site), cause is the Vercel **team** config
**Issue:** Since 2026-09-17 every deployment on the team fails during provisioning — builds (git/CLI), previews, `--prebuilt` uploads **and build-free `vercel redeploy` of old READY artifacts** alike, so no repo-side change can produce a deployment. Diagnosis (2026-09-18, via the owner's CLI token plus the Vercel-API probe workflow whose branch was deleted the same day): the team is on `plan: "hobby"` after a deliberately-cancelled Plus/Pro subscription (`expiredSubscriptions`), but the **team-level** `resourceConfig` still carries `buildMachine.default: "standard"` from the Pro era. Hobby cannot provision the standard pool, and the value is unfixable by the owner: PATCHing it returns `pro_plan_required`, and project-level `buildMachineSelection: "fixed"` likewise silently survives resets. Vercel's Pro-to-Hobby downgrade is the upstream bug — there is no payment due; the entitlement state was never cleaned up.
**Impact:** engvox.com was frozen on the 2026-09-13 build while main stayed green (101 commits since then).
**Effort:** N/A — upstream fix required; owner action outside the repo.
**Resolved 2026-09-19:** Provisioning works again with no repo-side change. A branch preview built from source and reached READY (`dpl_GUxVgmMh6Bm484aXMcbkw1LD24nB`), and a CLI production deploy of `fix/production-audit-remediation` built on Vercel (`Build Completed in /vercel/output [35s]`) and went READY in 2m as `dpl_F4jY9ZTz1ukAG2iufxccVCKbZgQD`, aliased to `engvox.com` + `www.engvox.com`. The live bundle carries the new chunks, so the alias serves the new build and not a cached one. What changed in the team's `resourceConfig` was not re-measured (the PATCH still returned `pro_plan_required` when the ticket was written), so the open question is only whether the entitlement state stays clean — the deploy workflow is the thing to watch, and the fallback below remains the plan if it regresses.
**Action (if it regresses):** Re-check the ticket with Vercel support. Fallback: create a fresh Hobby **personal** context project and move the `engvox.com` domain there (new project gets a clean `basic`-pool team config; CI secret + project-link update only).
**Ticket sent to vercel.com/support (kept for the record):**

> Team `engineer-os` is on the Hobby plan after our Pro (planIteration "plus") subscription expired/was cancelled intentionally — no payment is due. Since then **every** new deployment fails instantly with `BUILD_FAILED: Resource provisioning failed`, including `--prebuilt` static uploads and `redeploy` of previously-READY artifacts (e.g. dpl_F8f6iCB5n6H4y5SEBmHGeDT7Kysi, eng-vox project prj_sgbF8SlLw8pANE1BXQ9wBxMx8sYr; also affects our second project, so it is team-wide). The team's `resourceConfig` still reads `buildMachine: {"default": "standard"}` (the Pro build pool), and we cannot reset it: PATCH `/v9/teams/team_fqlw3Z1XiyBE5gxdVV12WDaM` → `400 pro_plan_required`. Project-level `resourceConfig` similarly keeps `buildMachineSelection: "fixed"` even after PATCH. Please reset the team's build-machine config to the free/Hobby pool so deployments can provision again.
> **Found during:** 2026-09-18 full-repo re-audit.

### TD-024: Production `VITE_AI_PROXY_URL` points at a namespace the backend does not serve

**File:** Vercel project env (symptom site: `src/shared/services/ai-proxy.config.ts`)
**Issue:** The production deployment was built with `VITE_AI_PROXY_URL=https://englishengineer-backend.onrender.com/api/ai`, read straight out of the deployed bundle. The backend registers every route through the v1 adapter (`backend/src/app.ts:452` mounts `/api/v1`, the AI routes are registered at `app.ts:629`), so `/api/ai/*` does not exist. Live proof: `GET /api/v1/ai/analytics` → 401 (route exists, auth required) while `GET /api/ai/analytics` → 404 `route_not_found`. The client asks for `/api/ai/coach`, `/api/ai/analytics`, … so every AI call failed and fell back to the mock provider, and the admin surfaces built on the same string (`/api/admin/stats`, `/api/admin/audit-logs`, `/api/ai/analytics/admin`) returned 404 as well.
**Impact:** AI coach, writing review, assessment feedback, role-play and AI analytics silently degraded in production; the admin dashboard never showed system stats or audit logs.
**Effort:** 0.2 days (repo side, done); owner action for the env value.
**Action:** `ai-proxy.config.ts` now normalises a legacy `/api/ai` base to `/api/v1/ai` and logs a warning, and the two admin fetches were corrected to `/api/v1/...`. **Owner:** set `VITE_AI_PROXY_URL=https://englishengineer-backend.onrender.com/api/v1/ai` in the Vercel project so the warning stops firing.
**Found during:** 2026-09-19 full-repo + live-surface audit (wrote it up while production was frozen on the 2026-09-13 build).

### TD-025: The onboarding wizard's panes overlapped below `lg`, so taps picked the wrong option

**File:** `src/features/profile/NeuralOrbPanel.tsx`
**Issue:** Each pane forced its tile grid to `h-[calc(100%-2.1rem)]` while the panel itself was a fixed `100dvh-7rem` box whose two sections split the leftover height. Below `lg` the sections stack, so each got roughly half of that height while its grid still declared the full pane height: the discipline grid's last rows spilled out of their section and the language section, later in DOM order and opaque, painted over them. Measured at the Freebuff Preview tab's own 439x672 viewport by asking `document.elementFromPoint` at each tile's centre: "Endüstri Mühendisliği" resolved to the Arabic language button, "Makine Mühendisliği" to Dutch, "Mekatronik / Robotik" to English and "Yazılım Mühendisliği" to **German**. Picking Software Engineering therefore switched the interface language to German and left the discipline unset (with the `İleri` button disabled). At 390x844 those tiles were unreachable, `elementFromPoint` returning null. Desktop (1280x800) was unaffected, which is why it survived review.
**Impact:** On any phone-sized viewport the onboarding gate could not be completed as intended: four of ten disciplines were untappable and the app language changed on the taps. It also poisoned DOM-driven preview and verification work: the click coordinates were correct, the element under them was not, which read as a tooling fault until it was measured here.
**Effort:** 0.3 days (found while root-causing a mis-targeted preview click).
**Action:** The shell is now a flex column whose `main` is the single scroll region (header and footer pinned with `shrink-0`), and both grids are content-sized with `content-between`, which keeps the old airy desktop rhythm without a fixed height, so no pane can paint over its sibling and every choice stays reachable and hit-testable. Guard: `node scripts/check-onboarding-layout.mjs [url] [viewports] [discipline]` hit-tests all 25 choices at their own centres and asserts that picking a discipline never moves the language selection; it fails on the pre-fix layout at 390x844 and 439x672, and passes after the fix at 390x844, 439x672 and 1280x800.
**Found during:** 2026-09-19 preview investigation (symptom first seen as a preview click that landed on a language button).

### TD-026: Below `lg` the onboarding wizard stacked both lists into one long page

**File:** `src/features/profile/NeuralOrbPanel.tsx`
**Issue:** With both panes stacked, the wizard rendered ten disciplines and fifteen languages as a single scrolling column. Measured with the extended wizard guard: at 390x844 the pane needed 119px of scroll and at the Freebuff Preview tab's own 439x672 viewport 291px, with only 21 of 25 choices on screen — the language list (a required field) began below the fold, behind a list the user had already answered. The compact 2-column tiles also cut names off (`Elektrik Mühendisliği`, `Mekatronik Mühendisliği` rendered as ellipses at 390px).
**Impact:** On a phone the second required choice stayed invisible until the user scrolled past the first, and the clipped labels made similar disciplines hard to tell apart. Desktop (1280x800) was unaffected.
**Effort:** 0.4 days.
**Action:** Below `lg` the two lists are now staged into two steps (`Adım 1 / 2` eyebrow, segmented step chips, compact two-column grids, `onboarding.continue` on step 1 and `onboarding.finish` on step 2), while `lg` and up keeps the two-pane layout and its single CTA unchanged. Compact tiles wrap their name to two lines instead of ellipsising it, and `useMediaQuery` (new, tested) drives the switch so the DOM itself changes rather than hiding halves with CSS. Guard: `node scripts/check-onboarding-layout.mjs` now walks the steps, hit-tests every choice, and reports scroll/clipping metrics; after the change 390x844 needs 0px of scroll on both steps and 439x672 needs 0px on step 1 and 89px on step 2, with 0 clipped labels and 0px horizontal overflow.
**Found during:** 2026-09-19 mobile usability pass on the preview worktree.

### TD-027: The grammar drill's action bar covers the entire mobile bottom navigation

**File:** `src/pages/GrammarPage/GrammarEnhancementPanel.tsx:635` (bar) vs `src/layouts/MobileBottomNavigation.tsx:20` (nav)
**Issue:** Both layers pin to the bottom of the viewport below their breakpoints — the drill bar is `fixed inset-x-0 bottom-0 z-40 … md:hidden` and the bottom navigation is `fixed inset-x-0 bottom-0 z-30 … lg:hidden` — so at 390–767px wide they occupy the same strip and the z-40 bar wins. Measured on `/grammar` at 390x844: all **five** navigation links (`Ana Sayfa`, `Öğrenme`, `Öğrenme Yolu`, `Araçlar`, `Profil`, all at y=815) resolve through `document.elementFromPoint` to the bar's `Correct` / `Review` buttons, and Playwright's own actionability check refuses to click every one of them ("intercepts pointer events").
**Impact:** During a grammar lesson on a phone the whole bottom navigation is dead, and a tap where a nav item appears to be silently records the current rule as _Correct_ or _Review_ (`recordUsage(true|false)`) — a mis-tap corrupts learning progress rather than doing nothing.
**Effort:** 0.2 days.
**Action:** The bar now _declares_ that it occupies the bottom strip and the navigation yields to it. `src/shared/stores/bottom-action-bar.store.ts` (new) holds a counter plus `useBottomActionBar(active)`; `GrammarEnhancementPanel` claims the strip while its own breakpoint (`BOTTOM_ACTION_BAR_QUERY = '(max-width: 767px)'`, kept beside the store so the claim and the `md:hidden` class cannot drift) matches, and `MobileBottomNavigation` returns `null` while any bar is claimed — so the two layers never share the strip. The nav returns as soon as the bar leaves, and between `md` and `lg` (bar hidden, nav visible) nothing changes.
**Guard:** `node scripts/check-grammar-drill-nav.mjs [url] [viewports]` (defaults `390x844,800x900`). It asserts the bar is on screen below `md` and that its own Correct/Review/Mic buttons stay hit-testable (the fix must not "win" by hiding the bar), and that any rendered nav link resolves to itself under both `document.elementFromPoint` and Playwright's own actionability check. Against the pre-fix tree it fails with exactly the measurement above — `overlap 56px` and 5/5 links resolving to `Correct`/`Review`, with Playwright refusing all five; after the fix it passes at both widths. Also covered by `src/layouts/MobileBottomNavigation.test.tsx` (5 links alone; 0 links while a bar is claimed; returns when it leaves; counter balanced with two bars).
**Found during:** 2026-09-19 generalised hit-target sweep (`node scripts/check-hit-targets.mjs`).

### TD-028: The vocabulary header clips 102px of itself, so a control sits off-screen on phones

**File:** `src/pages/VocabularyPage` header toolbar, masked by `src/index.css:138` (`html { overflow-x: hidden }`)
**Issue:** At 390x844 the page's scroll region (`main.custom-scrollbar.relative`) hides 102px of its own horizontal content, and the `Kelime Ara` search control measures `x=465` in a 390px-wide viewport — permanently outside the visible area. Because `html` sets `overflow-x: hidden`, `document.scrollingElement.scrollWidth − clientWidth` still reports **0**, so page-level overflow checks (including the first version of the sweep) cannot see it; only a per-element `scrollWidth > clientWidth` check does.
**Impact:** On a phone the vocabulary search entry point cannot be reached at all, and the hidden overflow never surfaces as a scrollbar or an error. Desktop is unaffected (the row fits).
**Effort:** 0.2 days.
**Action (proposed):** Let the header row wrap or scroll (`flex-wrap` / `overflow-x-auto`) instead of clipping, and add the `clippedX` detector to the sweep so the class is measurable.
**Found during:** 2026-09-19 generalised hit-target sweep (the first run reported "0px horizontal overflow", which was wrong because of the hidden overflow).

### TD-029: `Escape` opens the mobile drawer instead of closing the topmost layer

**File:** `src/layouts/AppShell.tsx:41` — `useKeyboardNavigation({ key: 'Escape', onKeyPress: () => toggleSidebar() })`
**Issue:** `Escape` is bound to _toggle_ the sidebar, so pressing it on a phone opens the drawer (and its `button.fixed.inset-0.z-30 … aria-label="Close"` scrim) rather than dismissing whatever is open. Reproduced with a Playwright probe on `/vocabulary` at 390x844: no fixed full-viewport layer exists on load or after scrolling every control into view, and pressing `Escape` once creates one. When a modal is open the same key both closes the modal and opens the drawer.
**Impact:** Breaks the platform-wide expectation that `Escape` dismisses the topmost layer (WCAG 2.1.2 territory for keyboard users), and it misled the new sweep: its first housekeeping step pressed `Escape` between stages, which opened the drawer and made every element behind the scrim read as "covered" — 371 phantom findings before the cause was found.
**Effort:** 0.2 days.
**Action (proposed):** Let the _open_ layer handle `Escape` (close it, then stop propagation), and keep `toggleSidebar` on its own accelerator; the sweep should dismiss layers through their close control, which it now does.
**Found during:** 2026-09-19 generalised hit-target sweep (its own false-positive flood).

### TD-030: The beta launcher floats over app controls (the mascot half is gone)

**File:** `src/features/beta/BetaFeedbackWidget.tsx` (launcher)
**Issue:** A fixed overlay floats over content without reserving space. The beta launcher is `fixed top-16 right-3 z-40 h-10 w-10` below `lg` (and `lg:bottom-5 lg:right-5` above it); at 390x844 its box is `(341,60)–(379,98)` and the vocabulary filter tab row sits at y=86, so the `Hakim` tab's centre and the `Kelime Ara` button resolve to it there. The original entry described a second overlay, the mascot: at 1280x800 its bubble and mini toolbar covered the right rail (the sidebar's `İşlemler` and the vocabulary panel's `0 kelimeyi tekrarla` / `Özel kelime ekle` / `0 tekrar kuralını çalış` resolved to `div.engmascot-bubble` / `div.flex.items-end` at x≈1153, and the beta launcher at (1240,760) resolved to the mascot avatar), and 10 mascot `mini-btn` controls per page were clipped by their own `overflow: hidden` container (24 clipped hits across the sweep).
**Impact:** Controls under the launcher ignore taps — the tap opens the widget instead — so on a phone the affected controls cannot be reached at all. The mascot's overlap and its clipped toolbar went away with the feature: `src/features/mascot/**`, its translation file, its feature flag and its public-asset handling were removed on 2026-09-19, which also removed the two-launchers-fighting-over-one-corner case at desktop width.
**Effort:** 0.3 days.
**Action (proposed):** Give the launcher a reserved corner that the content below it accounts for (or collapse it behind the shell's own controls), and cover that corner zone with the sweep.
**Found during:** 2026-09-19 generalised hit-target sweep.

### TD-031: Vocabulary flashcard blocks its own controls (needs a focused investigation)

**File:** `src/pages/VocabularyPage/components/WordCard.tsx:206` (`h-[430px] min-h-[430px] overflow-hidden`), `:213` and `:240` (3D faces), `components/WordCardDetails.tsx:32`
**Issue:** On `/vocabulary` at 390x844, controls inside the card fail both checks: the geometric sweep reports the front face's `Check Answer` covered by the back face's `form.mt-4`, `button.flex.h-7.w-7` covered by the back face's `h3.text-xl` ("height"), and the flip button (`aria-label="Kartın Ön Yüzü"`) covered by another button's `svg` icon; Playwright's actionability check agrees and refuses the trial click on `Check Answer`, the flip buttons and one unlabelled button (that one intercepted by the sticky page header at `div.sticky top-0 z-30`). At rest the faces themselves are fine — sampling a 5x5 grid inside the card resolves 25/25 points to the visible front face — so the trigger is the stack of fixed 430px height, `overflow: hidden`, `preserve-3d` faces, the face's inner `overflow-y-auto` region and the sticky header, not one obvious culprit.
**Impact:** Taps aimed at the flashcard's answer/flip controls can land on the hidden face's element instead, which is the same class of failure as TD-025 (wrong element under a correct coordinate). The measurement is not yet conclusive enough to name the fix, which is why this entry is open rather than resolved.
**Effort:** 0.5 days (investigation first: `pointer-events`/`backface-visibility` discipline per face, and confirming whether Chromium's hit-testing under `preserve-3d` is part of it).
**Action (proposed):** Make the inactive face `pointer-events: none` (and/or `inert`), keep the card's click-to-flip area behind its controls, then re-run the sweep plus a face-aware guard.
**Found during:** 2026-09-19 generalised hit-target sweep (this entry is deliberately unresolved: the evidence is real, the mechanism is not proven).

### TD-032: The billing suite waited on the store's `isLoading` with `waitFor`'s default 1s budget

**File:** `src/features/billing/billing.failure-surfaces.test.tsx` (8 sites, each `await waitFor(() => expect(useBillingStore.getState().isLoading).toBe(false)); await act(async () => undefined);`)
**Issue:** Those waits were deadlines, not synchronisation. The flag is raised by the store's mount refresh (`fetchSubscription`, `billing.store.ts:71`) and lowered when the backend answers, so every one of them gambled that the request would finish inside `waitFor`'s 1 s default — and the file's `beforeEach` never stubbed `fetch` at all, so the refresh left the process and, in CI, went to the production billing backend. Measured with a 1500 ms `…/billing/subscription-status` response: `isLoading` stays `true` for 1568 ms, and 5 of the 6 host tests fail in isolation with `expected true to be false`. That is CI's exact signature (`gives every upgrade control on the billing page one wording`, 1087 ms; and `is still offered to a paid plan that lapsed`).
**Impact:** Every merge in this session depended on the network answering within a second: the same job was red on the first attempt and green after `gh run rerun --failed`, three separate times, blocking PR #229, `main` and PR #230 in turn. No product code was involved.
**Effort:** 0.1 days.
**Action:** The wait hands the work over instead of guessing at it. `trackStoreRefreshes()` records the promises `initializeBilling` / `refreshBilling` return — the flag's only two producers in the app — and `settleBillingRefresh()` awaits them inside `act` with no polling and no timer, then asserts the flag is down, so a still-raised flag fails with a reason rather than a timeout. `beforeEach` now stubs `fetch` with the same audit-outage answer the tests seed, keeping the refresh on the microtask queue; re-issuing a refresh to have something to await was rejected because `fetchSubscription` clears `error`/`errorCode` on entry and would wipe the failure just seeded. `afterEach` drops promises a test never settled.
**Guard:** A/B on identical harnesses (one 1500 ms `subscription-status` responder, pre-fix file vs fixed file): pre-fix fails 5/6 host tests in isolation with `expected true to be false`; fixed passes 6/6 and its slowest case runs 1579 ms, i.e. it genuinely waits for the response. `npm run test:coverage` — the command CI runs — was executed 5 times: 181 files / 1169 tests, exit 0 every time (75–81 s).
**Found during:** 2026-09-19 CI triage while merging PR #229 and PR #230.

## Tracking

| ID     | Priority | Status      | Assigned | Due Date   |
| ------ | -------- | ----------- | -------- | ---------- |
| TD-001 | High     | ✅ Resolved | TBD      | TBD        |
| TD-002 | High     | ✅ Resolved | TBD      | TBD        |
| TD-003 | High     | ✅ Resolved | TBD      | TBD        |
| TD-004 | Medium   | ✅ Resolved | TBD      | TBD        |
| TD-005 | Medium   | ✅ Resolved | TBD      | 2026-08-29 |
| TD-006 | Medium   | 🟡 Partial  | TBD      | TBD        |
| TD-007 | Medium   | ✅ Resolved | TBD      | TBD        |
| TD-008 | Medium   | ✅ Resolved | TBD      | 2026-08-29 |
| TD-009 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-010 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-011 | Low      | ✅ Resolved | TBD      | TBD        |
| TD-012 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-013 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-014 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-015 | Low      | ✅ Resolved | TBD      | 2026-08-29 |
| TD-016 | Medium   | ✅ Resolved | TBD      | 2026-08-29 |
| TD-017 | Low      | ✅ Resolved | TBD      | TBD        |
| TD-021 | Low      | Open        | TBD      | TBD        |
| TD-018 | Medium   | Resolved    | TBD      | TBD        |
| TD-019 | Medium   | ✅ Resolved | TBD      | 2026-08-29 |
| TD-020 | Medium   | Resolved    | TBD      | TBD        |
| TD-023 | High     | ✅ Resolved | TBD      | 2026-09-19 |
| TD-024 | High     | ✅ Resolved | TBD      | 2026-09-19 |
| TD-025 | High     | ✅ Resolved | TBD      | 2026-09-19 |
| TD-026 | High     | ✅ Resolved | TBD      | 2026-09-19 |
| TD-027 | High     | ✅ Resolved | TBD      | 2026-09-19 |
| TD-028 | Medium   | Open        | TBD      | TBD        |
| TD-029 | Medium   | Open        | TBD      | TBD        |
| TD-030 | Low      | Open        | TBD      | TBD        |
| TD-031 | Medium   | Open        | TBD      | TBD        |
| TD-032 | Medium   | ✅ Resolved | TBD      | 2026-09-19 |

## Stats

- **Total Items:** 31
- **Resolved:** 25 (81%)
- **Partially Resolved:** 1 (3%)
- **Open:** 5 (16%)
- **Blocked (external):** 0 (0%)

## Last Updated

- **Date:** 2026-09-19
