# Analytics Pro

Analytics Pro turns existing EngineerOS learning data into a professional progress dashboard.

## PRC Kademe 6 Product Funnel Analytics

Learning analytics and anonymous product funnel analytics remain separate. The
learning dashboard derives user progress from canonical learning state;
`ProductAnalyticsService` records only typed product events needed to evaluate
the beta funnel.

The centralized catalog includes signup, onboarding, first task, Vocabulary,
Grammar, Speaking, Writing, review queue, paywall, checkout and subscription
cancellation lifecycle events. Existing beta adoption events remain typed for
backward compatibility.

Provider modes:

- `local`: stores at most 500 privacy-safe events through the shared storage
  wrapper for local beta summaries.
- `console`: emits the sanitized event envelope through the project logger for
  development inspection.
- `custom`: a production analytics provider can be registered behind the
  provider interface without changing pages.
- `disabled`: no event is emitted when
  `VITE_PRODUCT_ANALYTICS_ENABLED=false`.

Configuration:

```env
VITE_PRODUCT_ANALYTICS_ENABLED=true
VITE_PRODUCT_ANALYTICS_PROVIDER=local
```

Only skill, mission identifier, plan, subscription status, event source and a
1–5 rating are accepted as metadata. Mission identifiers must match a strict
identifier pattern. Raw writing answers, speaking transcripts, email addresses,
names and arbitrary metadata keys are discarded by the runtime privacy guard.
No analytics provider receives authentication tokens or billing secrets.

Raw writing answers, speaking transcripts, AI prompts, names and email
addresses are outside the product analytics contract. Unknown metadata keys are
discarded by the runtime sanitizer. Set
`VITE_PRODUCT_ANALYTICS_ENABLED=false` to disable product event collection.

## Purpose

Analytics Pro helps learners and future AI Coach workflows understand progress across:

- Reading
- Writing
- Listening
- Speaking
- Vocabulary
- AI Coach
- Learning Engine
- Achievements
- XP, ELO, and streaks

It does not create a new learning state system. It reads existing state and derives analytics snapshots.

## Architecture

Analytics follows the standard EngineerOS feature structure:

```text
src/features/analytics/
  analytics.types.ts
  analytics.helpers.ts
  analytics.service.ts
  analytics.store.ts
  analytics.calculations.ts
  index.ts
```

Responsibilities:

- `analytics.types.ts`: typed dashboard, chart, skill, AI-context, and summary models.
- `analytics.calculations.ts`: reusable metric calculations such as CEFR estimate, skill radar, growth, heatmap, study consistency, and improvement velocity.
- `analytics.helpers.ts`: recent sessions, recent achievements, next-study recommendation, and AI-context summary helpers.
- `analytics.service.ts`: central read model that composes Learning Engine, Vocabulary Engine, and AI Coach usage into one `AnalyticsSummary`.
- `analytics.store.ts`: UI-only analytics view state. It does not persist or duplicate learning data.
- `AnalyticsPage.tsx`: page composition and lightweight chart rendering.

## Data Flow

Analytics reads from existing canonical sources:

- Learning Engine: missions, study sessions, XP history, ELO history, score history, achievements, streak, level, XP, coins, and ELO.
- Vocabulary Engine: words learned, reviews due, retention, category mastery, difficult words, and review calendar.
- AI Coach: locally persisted coach session summary through the existing AI store helper.

The flow is:

```text
Learning/Vocabulary/AI state
  -> AnalyticsService.getSummary()
  -> AnalyticsSummary
  -> AnalyticsPage and AI Coach reusable context
```

## Metrics

Analytics Pro currently calculates:

- Overall progress
- Estimated CEFR level
- Skill radar by module
- XP timeline
- ELO timeline
- Weekly activity
- Study heatmap
- Recent sessions
- Recent achievements
- Weak skills
- Strong skills
- Vocabulary retention
- AI Coach usage
- Next recommended study
- XP growth
- ELO growth
- Study consistency
- Average session length
- Retention
- Improvement velocity

## AI Coach Integration

`AnalyticsService.getAIContextSummary()` exposes a compact analytics object for AI Coach or future backend proxy prompts.

This avoids duplicated calculations in AI features. AI Coach should consume this analytics summary when it needs higher-level progress signals.

## Charts

No heavy chart dependency is used. The Analytics page renders lightweight local chart components:

- SVG line chart
- bar chart
- skill radar
- study heatmap
- progress bars

These components are page-level display helpers and do not own business logic.

## Persistence

Analytics does not persist duplicated learning data. The only analytics store state is the active chart tab. All learning and usage values are derived from existing persisted stores/services.

## Future Expansion

Future Analytics Pro improvements may include:

- module-specific drill-down pages
- cohort or class analytics for Administration
- subscription-tier analytics exports
- backend-backed long-term history
- richer chart components if the project adopts a shared chart layer
- AI-generated progress summaries using the backend proxy only
