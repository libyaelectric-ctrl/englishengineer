# EngineerOS Vocabulary Engine Pro

Vocabulary Engine Pro is a first-class learning module integrated with the existing EngineerOS Learning Engine, Achievement Engine, Dashboard, Analytics, and local persistence systems.

## Architecture

```text
src/features/vocabulary/
├── vocabulary.types.ts
├── vocabulary.data.ts
├── vocabulary.helpers.ts
├── vocabulary.evaluator.ts
├── vocabulary.service.ts
├── vocabulary.store.ts
├── vocabulary.spaced-repetition.ts
└── index.ts
```

The module follows the same feature shape used by Reading, Writing, Listening, and Speaking.

## Content Philosophy

Vocabulary Content Pack Pro replaces generated placeholder vocabulary with Engineering English used in reports, meetings, inspections, commissioning, procurement, QA/QC, design reviews, construction coordination, and technical handover.

The dataset prioritizes useful professional language over artificial volume. Entries are written so learners can recognize terms in real project communication and reuse them in their own speaking and writing.

## Dataset

`VOCABULARY_ENTRIES` contains 600+ engineering vocabulary entries after the v2.5.3 Helios Sprint B expansion. The first content pack remains hand-authored; the expansion pack uses discipline-specific engineering term sets while preserving the same `VocabularyEntry` shape.

Disciplines:

- Electrical Engineering
- Mechanical Engineering
- Civil Engineering
- Architecture
- Construction
- Health & Safety
- Commissioning
- Testing
- Data Centers
- Procurement
- QA/QC
- HSE
- Hospital Projects
- Oil & Gas
- Testing & Commissioning
- Professional Communication
- Project Management
- Construction Site
- Meetings
- Safety
- General Professional English

Each entry includes:

- `id`
- `word`
- `partOfSpeech`
- `meaning`
- `definition`
- `example`
- `synonyms`
- `collocations`
- `difficulty`
- `discipline`
- `CEFR`
- `tags`

Definitions are written in clear English. Example sentences are natural engineering sentences, not repeated templates. Collocations help learners use the word in realistic phrases such as `submit an inspection request`, `perform load bank test`, or `resolve coordination clash`.

## Discipline Organization

The dataset is organized by discipline so the Vocabulary Engine can support targeted study and category mastery:

- Electrical terms cover power distribution, protection, cabling, panels, and safety.
- Mechanical terms cover HVAC, pumps, valves, pressure, testing, and maintenance.
- Civil terms cover concrete, foundations, structures, soil, and movement.
- Architecture terms cover envelope, interiors, egress, accessibility, and design coordination.
- Construction terms cover site execution, submittals, inspections, drawings, and handover records.
- Health & Safety terms cover permits, hazards, LOTO, PPE, incidents, and controlled work.
- Commissioning and Testing terms cover readiness, scripts, certificates, FAT/SAT, functional tests, and acceptance criteria.
- Data Centers terms cover racks, cooling, redundancy, cabling, uptime, and network operations.
- Project Management terms cover schedule, risk, procurement, commercial changes, and interfaces.
- General Professional English and Meetings terms cover the language used to clarify, confirm, escalate, assign actions, and close issues.

## Training Modes

The store and page support:

- Flashcards
- Multiple Choice
- Typing Practice
- Meaning Match
- Sentence Completion
- Synonym Challenge

Flashcards mark viewed words as correct. Other modes evaluate typed responses against word, meaning, and synonym matches.

## Spaced Repetition

`vocabulary.spaced-repetition.ts` implements a lightweight SM-2 style review update:

- `interval`
- `easeFactor`
- `repetitions`
- `nextReview`
- `lastReview`

Review state persists locally under `eos_engineeros_vocabulary_state`.

## Evaluation

`VocabularyEvaluator` calculates:

- Accuracy
- Speed
- Retention
- XP
- Coins
- Vocabulary ELO
- Weak words
- Strong words

Rewards are calculated through the shared `ScoringService` using module `Vocabulary`.

## Integration

Vocabulary integrates with:

- Learning Engine through `completeGenericPractice('Vocabulary', ...)`
- Dashboard through `VocabularyService.getSummary()`
- Analytics through category mastery and retention metrics
- Achievement Engine through vocabulary-specific achievements
- Reading, Writing, Listening, and Speaking through `VocabularyService.addDiscoveredTerms(...)`

When vocabulary is encountered in other engines, matching entries are added to the Vocabulary review queue.

## Achievements

Vocabulary-specific achievements:

- First Word
- 100 Words
- 500 Words
- Vocabulary Master
- Perfect Review
- 30 Day Retention

## Future Improvements

## Future Expansion Strategy

Future vocabulary packs should be added as content packs without changing Vocabulary Engine logic. Recommended packs:

- Electrical Protection & Power Quality Pack
- HVAC Commissioning Pack
- Civil QA/QC and Concrete Pack
- Data Center Operations Pack
- Contract, Claims, and Commercial English Pack
- Safety Leadership and Incident Reporting Pack
- Architecture and Fit-Out Coordination Pack
- Procurement and Vendor Communication Pack

Future improvements:

- Add richer distractor generation for multiple-choice mode.
- Add per-user custom vocabulary creation.
- Add semantic similarity once backend AI proxy is connected.
- Add audio pronunciation for vocabulary entries.
- Add discipline-specific downloadable content packs.
