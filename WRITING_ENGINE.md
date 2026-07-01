# Writing Engine

## Purpose

The Writing Engine helps engineers improve professional written communication for technical reports, consultant responses, emails, method statements and project coordination notes.

## Architecture

The Writing module follows the EngineerOS feature architecture:

- `writing.types.ts` defines mission and evaluation contracts
- `writing.data.ts` contains writing mission content
- `writing.helpers.ts` provides reusable text helpers
- `writing.evaluator.ts` evaluates writing output
- `writing.service.ts` exposes module operations
- `writing.store.ts` owns page state
- `WritingPage.tsx` presents the UI

## v2.5.3 Content Pack

Helios Sprint B expands Writing to 25 professional engineering missions covering daily and weekly reports, consultant replies, submittals, NCRs, MIR/ITP notes, FAT/SAT reports, commissioning, safety, procurement, meeting minutes, punch lists, and handover reports.

Each mission keeps the existing evaluator-compatible fields and adds educational metadata: scenario, task, expected structure, target vocabulary, grammar focus, assessment rubric, sample excellent answer, sample weak answer, and feedback hints.

## Integration

Writing integrates with:

- Learning Engine for XP, coins, ELO and mission completion
- Dashboard for progress visibility
- Analytics for score and session trends
- Achievements for writing milestones
- AI Coach for future writing review context

## Quality Rules

- Evaluation logic remains separate from UI
- Business scoring is handled through the shared ScoringService
- UI changes must not alter evaluator behavior
- Local persistence remains under the existing storage architecture

## Future Work

- Add more discipline-specific writing packs
- Add technical email templates
- Add formal report and submittal response drills
- Add backend AI-assisted rewrite suggestions through the existing AI provider layer
