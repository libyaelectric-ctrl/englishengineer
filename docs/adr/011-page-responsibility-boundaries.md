# ADR-011: Page Responsibility Boundaries (Dashboard / Curriculum / Progress)

## Status

Accepted

## Context

Users encountered confusion between Dashboard, Curriculum, and Progress pages because all three display overlapping data from `useLearningCockpit` / `DailyMission`. The same "today's task" concept appeared in multiple places with different semantics.

## Decision

Each page has a single, non-overlapping responsibility:

| Page           | Responsibility                         | Scope                                                                | User question answered        |
| -------------- | -------------------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| **Dashboard**  | Today's overview (summary)             | Greeting, stats, gamification (Daily Challenge), quick links         | "What's my status right now?" |
| **Curriculum** | Today's detailed plan (actionable)     | Personalized missions, learning memory, full roadmap, skill selector | "What should I do today?"     |
| **Progress**   | Historical performance (retrospective) | Past scores, trends, badges, long-term analytics                     | "How far have I come?"        |

### Rules for future features

1. A new feature showing **real-time status** → Dashboard
2. A new feature showing **actionable next steps** → Curriculum
3. A new feature showing **historical data/trends** → Progress
4. When in doubt, ask: "Does the user need to ACT or to REVIEW?" Act → Curriculum, Review → Progress

### Daily Challenge clarification

Daily Challenge is a **gamification layer**, not a learning plan. It appears on Dashboard for engagement purposes. The actual personalized daily plan lives in **Curriculum → Today**. A visual label ("Gamification") and clarifying banner have been added to prevent confusion.

## Consequences

- Future developers know exactly which page owns which data
- No new "today's task" widget should be added to Dashboard without considering whether it belongs in Curriculum instead
- Dashboard can link to Curriculum for actionable items, but should not duplicate them
