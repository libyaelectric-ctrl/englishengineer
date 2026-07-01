# Gamification Pro

Gamification Pro turns existing EngineerOS learning progress into a long-term motivation layer.

## Purpose

Gamification Pro supports sustained Engineering English practice through:

- daily missions
- weekly missions
- monthly goals
- learning challenges
- XP multipliers
- reward coins
- level progression
- skill milestones
- combo, perfect session, consistency, and comeback bonuses
- mission chains
- daily login rewards
- session completion rewards

It does not replace the Learning Engine. XP, ELO, coins, streaks, achievements, and analytics remain owned by their canonical systems.

## Architecture

Gamification follows the locked EngineerOS feature pattern:

```text
src/features/gamification/
  gamification.types.ts
  gamification.helpers.ts
  gamification.service.ts
  gamification.store.ts
  gamification.rules.ts
  gamification.rewards.ts
  index.ts
```

Responsibilities:

- `gamification.types.ts`: typed levels, missions, rewards, bonuses, persistence, and summaries.
- `gamification.rules.ts`: reusable mission templates and title thresholds.
- `gamification.rewards.ts`: reusable reward definitions.
- `gamification.helpers.ts`: level math, date windows, mission progress, and reward history helpers.
- `gamification.service.ts`: derives Gamification Pro summaries from Learning Engine and Analytics Pro.
- `gamification.store.ts`: persists only gamification-owned UI/reward history data.
- `GamificationPage.tsx`: page composition using shared components.

## Reward System

Current rewards include:

- coins from the canonical Learning Engine
- XP progress from the canonical Learning Engine
- level rewards
- learner titles
- daily login reward history
- session completion reward definitions
- perfect session reward definitions
- achievement feed from the existing Achievement Engine

Gamification does not duplicate canonical XP or coins. It displays those values from the Learning Engine and stores only reward history items that belong to Gamification Pro.

## Mission System

Mission templates support:

- Reading missions
- Writing missions
- Listening missions
- Speaking missions
- Vocabulary missions
- Mixed missions
- AI Coach missions
- Analytics review missions

Mission progress is derived from existing study sessions, Analytics Pro, Vocabulary Engine, and AI Coach usage. Mission progress is not a replacement learning state.

## Analytics Integration

Gamification consumes `AnalyticsService.getSummary()` for:

- study consistency
- recent sessions
- AI Coach usage
- recommended focus signals
- retention

Gamification must not duplicate analytics calculations.

## AI Coach Integration

AI Coach may recommend missions using Analytics Pro summaries and Gamification Pro mission templates. Real AI recommendations must still use the safe AI provider architecture and backend proxy rules.

## Persistence

Gamification uses the existing storage wrapper and stores only:

- reward history
- claimed daily login date
- challenge progress metadata

Canonical values such as XP, ELO, level, coins, streak, achievements, and vocabulary progress are read from existing systems.

## Future Extensions

Future Production or Feature sprints may add:

- reward claim integration with Learning Engine scoring
- subscription-tier challenge packs
- team/admin leaderboards
- seasonal challenge calendars
- richer celebration animations
- backend-backed reward validation
- AI-generated mission recommendations through backend proxy only
