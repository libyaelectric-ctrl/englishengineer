# EngineerOS Speaking Engine Pro

The Speaking Engine Pro module provides local-first engineering speech practice for realistic site, safety, client, consultant, commissioning, factory, and design-coordination briefings.

## Architecture

The module follows the canonical feature architecture used by Reading, Writing, and Listening:

```text
src/features/speaking/
├── speaking.types.ts
├── speaking.data.ts
├── speaking.helpers.ts
├── speaking.evaluator.ts
├── speaking.service.ts
├── speaking.store.ts
└── index.ts
```

## Mission Set

The engine includes 10 engineering speaking missions:

- Site Meeting Alignment Brief
- Daily Toolbox Talk
- Consultant Comment Discussion
- Client Presentation Summary
- Progress Meeting Update
- Commissioning Meeting Handover
- Factory Acceptance Test Brief
- Technical Explanation Drill
- Safety Briefing Escalation
- Design Coordination Resolution

Each mission defines a prompt, scenario type, CEFR level, discipline, expected keywords, grammar targets, confidence markers, syllabic targets, target WPM, and reward metadata.

## Evaluation Model

`SpeakingEvaluator` evaluates each submission locally with deterministic scoring:

- Fluency: pacing and transcript length against mission target WPM.
- Clarity: coverage of prompt terms.
- Grammar: presence of required grammar structures.
- Technical vocabulary: coverage of engineering terms.
- Confidence: use of assertive professional markers and recording mode signal.

The final score is weighted and passed through the shared `ScoringService` to calculate XP, coins, and speaking ELO.

## Persistence

`SpeakingService` persists:

- Speaking history
- Completed speaking missions
- Best score per mission
- Last selected speaking mission

Storage key: `eos_engineeros_speaking_state`.

## Learning Integration

Speaking results sync into the global `useLearningStore` using the same path as Reading, Writing, and Listening:

- Known mission IDs call `submitMissionResult`.
- Unknown practice paths fall back to `completeGenericPractice`.
- XP, coins, ELO, streaks, score history, and achievements are updated centrally.

The global Learning Engine now includes 10 Speaking missions and 5 Speaking achievements:

- First Speaking Brief
- Meeting Speaker
- Perfect Speaking Score
- Technical Speaker
- Speaking Master

## Browser Speech Support

`SpeakingPage.tsx` keeps browser-specific Web Speech API handling in the UI layer:

- Uses `SpeechRecognition` or `webkitSpeechRecognition` when supported.
- Keeps typed transcript fallback at all times.
- Supports start/stop recording.
- Displays support status without requiring microphone availability.

The evaluator remains independent of browser APIs and accepts plain transcript data.

## Revision Notes

Speaking scoring now uses actual transcript text. If Web Speech API provides a transcript, that text is scored. If not, the typed fallback transcript is scored.

The evaluator considers:

- Word count
- Sentence count
- Technical vocabulary matches
- Filler words
- Clarity keywords
- Mission-specific target terms

The on-screen activity bars are labeled as a visual activity indicator. They are not presented as a real microphone audio waveform unless a real audio analyser is added in a future sprint.
