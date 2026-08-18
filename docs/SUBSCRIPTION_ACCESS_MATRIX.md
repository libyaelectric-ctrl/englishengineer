# Subscription Access Matrix

Single source of truth for how the subscription lock system gates access:
plan → feature mappings, menu locks, URL protection, and free-tier limits.

Source modules (keep this doc in sync when they change):

| Concern                 | Source                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Plans & features        | `src/features/billing/billing.helpers.ts`                                                                                     |
| Feature keys & plan ids | `src/features/billing/billing.types.ts`                                                                                       |
| Entitlement logic       | `src/features/billing/billing.entitlements.ts`                                                                                |
| Menu items & locks      | `src/config/navigation.config.ts`, `src/layouts/Navigation.tsx`                                                               |
| Route guards            | `src/routes/router.tsx`, `src/features/billing/SubscriptionRouteGuard.tsx`, `src/features/billing/CurriculumSectionGuard.tsx` |
| Page-level limits       | `src/pages/VocabularyPage/hooks/useVocabularyPage.ts`, `src/pages/GrammarPage/hooks/useGrammarPage.ts`                        |

---

## 1. Plans and their features

Each plan includes all features of the plans below it (hierarchy:

`free < junior < senior < specialist < master < team`).

| Plan           | Includes (cumulative)                                                                                                                                                                                                                                                                                          | Notes                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Free**       | `vocabulary`, `grammar`, `analytics`, `gamification`                                                                                                                                                                                                                                                           | $0; no credit card                                                  |
| **Junior**     | + `placementTest`, `learningHub`                                                                                                                                                                                                                                                                               | Placement Test + full Learning Hub                                  |
| **Senior**     | + `translator`, `reading`, `writing`                                                                                                                                                                                                                                                                           |                                                                     |
| **Specialist** | + `speaking`, `listening`, `realVoiceSpeaking`, `pronunciationAnalysis`, `voiceMeetingSimulator`                                                                                                                                                                                                               |                                                                     |
| **Master**     | + `tool`, `advancedTasks`, `aiCoach`, `futureAI`, `persistentAIAgent`, `customScenarioGeneration`, `linkedinOptimization`, `unlimitedAIFeedback`, `advancedAnalytics`, `fullGamification`, `missionCreation`, `projectWorkspace`, `persistentProjectMemory`, `cloudSync`, `voiceMinuteWallet`, `aiCreditAddon` |                                                                     |
| **Team**       | Master features + enterprise extras                                                                                                                                                                                                                                                                            | **Not purchasable yet** — "coming soon"; menu item is always locked |

### Usage limits per plan

| Limit                     | Free      | Junior    | Senior    | Specialist | Master    | Team      |
| ------------------------- | --------- | --------- | --------- | ---------- | --------- | --------- |
| `dailyAICoachRequests`    | 0         | 0         | 0         | 0          | unlimited | unlimited |
| `moduleAttemptsPerDay`    | unlimited | unlimited | unlimited | unlimited  | unlimited | unlimited |
| `vocabularyReviewsPerDay` | unlimited | unlimited | unlimited | unlimited  | unlimited | unlimited |
| `documentUploadsPerMonth` | 0         | 0         | 5         | 15         | unlimited | unlimited |

---

## 2. Menu locks (sidebar)

Locked items show a lock icon; clicking opens `LockedFeatureModal` naming the
required plan ("…is included in the **Senior** plan") with **See plans** →
`/pricing`. Free-tier items navigate normally.

| Menu item            | Path                          | Required feature | Minimum plan                    |
| -------------------- | ----------------------------- | ---------------- | ------------------------------- |
| Home                 | `/dashboard`                  | —                | Free                            |
| Learning Path        | `/learning-path`              | —                | Free                            |
| **Skills**           |                               |                  |                                 |
| Vocabulary           | `/vocabulary`                 | `vocabulary`     | Free                            |
| Grammar              | `/grammar`                    | `grammar`        | Free                            |
| Reading              | `/reading`                    | `reading`        | Senior                          |
| Writing              | `/writing`                    | `writing`        | Senior                          |
| Listening            | `/listening`                  | `listening`      | Specialist                      |
| Speaking             | `/speaking`                   | `speaking`       | Specialist                      |
| **Progress**         | `/progress/*`                 | —                | Free                            |
| **Learning Hub**     |                               |                  |                                 |
| Today                | `/curriculum/today`           | —                | Free                            |
| Curriculum           | `/curriculum/full`            | `learningHub`    | Junior                          |
| Learning Memory      | `/curriculum/memory`          | `learningHub`    | Junior                          |
| Placement Test       | `/placement`                  | `placementTest`  | Junior                          |
| **Tools**            |                               |                  |                                 |
| Work Tools           | `/tools/work`                 | `tool`           | Master                          |
| Quick Tools          | `/tools/quick`                | `tool`           | Master                          |
| AI Copilot           | `/tools/ai`                   | `aiCoach`        | Master                          |
| AI Analytics         | AI widget (kişisel panel)     | `aiAnalytics`    | Free (kendi kullanımı)          |
| AI Analytics (admin) | `GET /api/ai/analytics/admin` | `aiAnalytics`    | admin rolü                      |
| Translator           | `/translator`                 | `translator`     | Senior                          |
| Team                 | `/team`                       | —                | **always locked** (coming soon) |
| Profile              | `/profile/*`                  | —                | Free                            |

---

## 3. URL protection (route guards)

Directly opening a protected URL redirects to `/pricing` (`Navigate replace`)
when the subscription lacks the required feature. Route guard placement:

| Route                                                  | Guard                                                  |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `/placement`                                           | `SubscriptionRouteGuard feature="placementTest"`       |
| `/translator`                                          | `feature="translator"`                                 |
| `/speaking`                                            | `feature="speaking"`                                   |
| `/vocabulary`                                          | `feature="vocabulary"` (free)                          |
| `/grammar`                                             | `feature="grammar"` (free)                             |
| `/reading`                                             | `feature="reading"`                                    |
| `/writing`                                             | `feature="writing"`                                    |
| `/listening`                                           | `feature="listening"`                                  |
| `/tools/:section`                                      | `feature="tool"`                                       |
| `/curriculum/today`                                    | **no guard** (free Learning Hub entry)                 |
| `/curriculum/full`, `/curriculum/memory`               | `feature="learningHub"` (via `CurriculumSectionGuard`) |
| `/ai`, `/analytics`, `/gamification`, `/learning-plan` | redirect shorthands to their guarded targets           |

Guard logic: `canAccessFeature(subscription, feature)` — a plan is allowed
when its `features` list contains the feature, otherwise the _minimum_ plan in
the hierarchy that includes it is reported as `requiredPlan`.

---

## 4. Free-tier limits (page level)

| Area                                                          | Free-tier behavior                                                                         | Where enforced                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- |
| **Placement Test**                                            | Fully closed — menu locked + `/placement` → `/pricing`                                     | menu + route guard                |
| **Vocabulary**                                                | One page (15 terms) previewed; pressing **Next** → `/pricing` (batch not built)            | `useVocabularyPage.loadNextBatch` |
| **Grammar**                                                   | First module only; selecting a rule in any other module → `/pricing` (selection unchanged) | `useGrammarPage.selectRule`       |
| **Learning Hub**                                              | Only **Today** is free; Curriculum & Learning Memory → `/pricing`                          | `CurriculumSectionGuard`          |
| Reading / Writing / Listening / Speaking / Translator / Tools | Fully closed for free tier                                                                 | menu + route guard                |

### Legacy free fallback

A subscription with `planId: 'junior'` and `status: 'none'` is treated as
free tier (`isFreeTier`). The backend sends `planId: 'free'` for
no-subscription users; the frontend maps it to the real Free plan
(`BILLING_PLANS['free']`).

---

## 5. Test coverage

| Suite                    | File                                                       | Cases                                                                                                                     |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Navigation locks + modal | `src/layouts/Navigation.test.tsx`                          | 7                                                                                                                         |     | Entitlement matrix | `src/features/billing/billing.entitlements.test.ts` | incl. free/junior placement & learning hub + free-tier preview limits |
| Grammar gate             | `src/pages/GrammarPage/hooks/useGrammarPage.test.ts`       | 4                                                                                                                         |
| Vocabulary gate          | `src/pages/VocabularyPage/hooks/useVocabularyPage.test.ts` | 3                                                                                                                         |
| Route guards             | `src/features/billing/SubscriptionRouteGuard.test.tsx`     | 19 (placement 2, learning hub 4, translator 2, tools 3, speaking 3, listening 3, grammar preview 1, vocabulary preview 1) |
