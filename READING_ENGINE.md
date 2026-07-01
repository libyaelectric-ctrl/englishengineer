# EngineerOS Reading Comprehension Engine (Pro)

The **Reading Comprehension Engine** is a professional-grade learning module designed for systems and electrical engineers to master advanced technical documentation, specifications, commissioning notes, and architectural reports.

---

## 1. Reading Mission Model

The engine is built around a robust, type-safe data structure defined in `/src/features/reading/reading.types.ts`. Each mission comprises:

- **Metadata**: `id`, `title`, `description`, `discipline`, `cefrLevel` (B1-C2), `difficulty`, `estimatedMinutes`.
- **Passage**: A highly realistic, technical report or specification (e.g., HVAC coordination, dry-type transformers, serial BMS protocols).
- **Active Vocabulary**: A set of key terms with exact definitions and textual contexts.
- **Comprehension Checkpoint**: Four distinct verification questions, spanning four core question formats:
  - **Multiple Choice**: Evaluates broad-strokes structural understanding.
  - **True/False**: Verifies factual details and compliance flags.
  - **Keyword Fill-In**: Tests exact numerical values, calibration frequencies, or codes (e.g., `45` Nm, `120` mm², `IEEE 519`).
  - **Short Answer**: Assesses professional technical communication.

---

## 2. Evaluation & Scoring Engine

Reading performance is graded in real time using a deterministic, rule-based evaluator (`/src/features/reading/reading.evaluator.ts`). Rather than using a generic score, the evaluator decomposes performance into three specialized core sub-scores:

$$\text{Final Score} = (\text{Comprehension} \times 0.40) + (\text{Vocabulary} \times 0.30) + (\text{Technical Precision} \times 0.30)$$

### Sub-Score Metrics

1.  **Comprehension Rate (40% Weight)**: Derived from Multiple Choice and True/False questions. Correct answers score 100%, incorrect answers score 0%.
2.  **Jargon / Vocabulary (30% Weight)**: Measures both answer performance on short explanations (using a keywords-match ratio) and interactive exploration behavior. Users receive telemetry bonus points (up to 30%) for clicking and inspecting highlighted glossary terms in the active passage.
3.  **Technical Precision (30% Weight)**: Evaluates the exact match of numbers, metrics, or physical standards in the Keyword Fill-In questions (e.g., verifying torque ratings or conductor diameters).

### Reward Calculation

Upon evaluation, the engine hands over the performance metrics to the central `ScoringService` to calculate experience points, coin rewards, and ELO ratings based on difficulty multipliers:

- **Beginner**: `1.0x` multiplier
- **Intermediate**: `1.5x` multiplier
- **Advanced**: `2.0x` multiplier

---

## 3. Persistence & State Syncing

The Reading Pro system implements a dual-layered local-first persistence model:

1.  **Reading-Specific Persistence (`engineeros_reading_state`)**:
    - Stores detailed reading submission history and evaluation results.
    - Tracks the best-achieved score per individual mission.
    - Remembers the last-viewed mission ID to ensure session continuation.
2.  **Global Learning Core Syncing (`learning_state`)**:
    - Synchronizes mission completion states, earned XP, acquired coins, and ELO changes with the global `useLearningStore`.
    - Automatically runs achievement verification cycles to unlock badges and ranks globally.
    - Integrates dynamic bootstrapping: upon application startup, any new reading missions or achievements are seamlessly merged into the user's existing local profile.

---

## 4. Dashboard & Achievement Integration

Completed reading missions are natively reflected throughout the EngineerOS environment:

- **Core Telemetry Summary**: Completion statistics, average reading assessment scores, and ELO power are fed directly into the Dashboard.
- **Dynamic Recommendations**: Active or available reading missions automatically register as active protocols or recommended next steps in the dashboard feed.
- **System Notice Logs**: Weak sectors (e.g., if vocabulary or technical accuracy sub-scores dip below 75%) are logged as active development gaps in the system notice sidebar.
- **Reading Achievements**: Unlocks unique achievements, including:
  - **Reading Beginner**: Completing 1 reading module.
  - **Technical Reader** (`ach_reading_tech`): Completing 3 reading modules with high accuracy.
  - **Perfect Reading Score** (`ach_reading_perfect`): Scoring 100% on a technical reading assessment.

---

## 5. Future AI Upgrade Path

The current architecture is specifically engineered to make a transition to an AI-powered system (e.g., utilizing the `@google/genai` SDK and Gemini models) seamless and straightforward:

```
                  ┌────────────────────────────────────────┐
                  │          Future AI Upgrade Path        │
                  └────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                               ┌───────────────────────┐
│   Dynamic Passages    │                               │  Semantic Evaluation  │
├───────────────────────┤                               ├───────────────────────┤
│ Gemini API generates  │                               │ Gemini API evaluates  │
│ custom documentation  │                               │ free-text short       │
│ on chosen topics.     │                               │ answers semantically. │
└───────────────────────┘                               └───────────────────────┘
```

1.  **Dynamic Passage Generation**:
    - Instead of relying on the static `/src/features/reading/reading.data.ts`, an API route can call `gemini-2.5` with a prompt specifying the engineering discipline and CEFR level.
    - The model returns a JSON payload matching the `ReadingMission` schema, generating a brand-new passage, glossary, and questions on-the-fly.
2.  **Semantic Short Answer Grading**:
    - The current keyword-matching system for short answers is robust but literal. In the future, the user's raw input can be sent to Gemini via `/api/evaluate-reading` alongside the target question.
    - The model evaluates the semantic intent, technical accuracy, and professional gravity of the explanation, returning a nuanced score and written feedback.
3.  **Interactive AI Tutor (Inline Q&A)**:
    - A floating "AI Assistant" side-drawer can be introduced next to the passage. Using chat history, the user can ask questions about the document (e.g., _"Why does a dry-type transformer require IP23?"_), with Gemini answering based solely on the text.
