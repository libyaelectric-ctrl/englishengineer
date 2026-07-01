# EngineerOS Assessment Engine

## v2.6.0 Verification Note

Project Olympus verifies the Assessment Profile in a real browser. When local evidence is insufficient, the UI correctly shows the limited-data state instead of overclaiming a reliable CEFR certificate.

## Purpose

The Assessment Engine adds a professional engineering communication layer on top of the existing EngineerOS learning data. It does not replace Reading, Writing, Listening, Speaking, Vocabulary, AI Copilot, Analytics, Gamification, XP, achievements, or ELO. It derives a communication profile from the existing Learning Engine state.

## Assessment Dimensions

EngineerOS v2.5 tracks these dimensions:

- Grammar Accuracy
- Vocabulary Range
- Technical Vocabulary
- Professional Tone
- Clarity
- Conciseness
- Meeting Readiness
- Site Communication
- QA/QC Communication
- Commissioning Communication
- Consultant Communication
- Report Writing
- Email Writing
- Listening Comprehension
- Speaking Confidence
- Engineering CEFR
- Engineer ELO

## Scoring Philosophy

Assessment scores are derived from existing module evidence:

- Writing contributes to grammar, tone, conciseness, report writing, email writing, QA/QC, and consultant communication.
- Listening contributes to listening comprehension, meeting readiness, commissioning communication, and site communication.
- Speaking contributes to speaking confidence, meeting readiness, site communication, and grammar signals.
- Reading contributes to technical vocabulary, QA/QC, commissioning, and consultant communication.
- Vocabulary contributes to vocabulary range and technical vocabulary.
- Engineer ELO is read from the existing Learning Engine and normalized for matrix display only.

The Assessment Engine intentionally avoids creating a second XP, ELO, achievement, streak, or progress system.

## CEFR Mapping

The current local CEFR estimate is a transparent internal heuristic:

- 95-100: C2
- 90-94: C1+
- 84-89: C1
- 78-83: C1-
- 73-77: B2+
- 68-72: B2
- 63-67: B2-
- 58-62: B1+
- 52-57: B1
- 46-51: B1-
- 32-45: A2
- 0-31: A1

This is an internal Engineering Communication estimate, not an official CEFR certificate.

## Engineer ELO Mapping

Engineer ELO remains owned by the Learning Engine. Assessment activity may estimate an ELO impact for display, but the permanent ELO value comes from the existing learning state.

The profile shows the current Learning Engine ELO and uses it as one signal in the skill matrix. Activity-level ELO estimates are bounded between 800 and 3000.

## Confidence

Assessment confidence is based on local evidence count and module coverage:

- Insufficient: no or very little completed activity
- Limited: a small local activity sample
- Sufficient: multiple completed activities across several modules

Confidence explains how much trust the learner should place in the internal estimate.

## Module Integration

The Assessment Engine provides:

- `AssessmentService.getProfile(state)` for Analytics and AI Copilot context.
- `AssessmentService.assessActivity(module, score, state)` for activity-level assessment summaries.
- `AssessmentService.wrapScoreResult(module, baseScore, state)` for safely attaching assessment output to existing evaluator results without mutating the original score payload.

Existing evaluators remain canonical. The assessment layer wraps or summarizes their output.

## Analytics Integration

Analytics consumes the assessment profile and shows:

- Overall assessment score
- Engineer CEFR
- Engineer ELO
- Strongest dimensions
- Weakest dimensions
- Readiness for meetings, reports, and consultant communication
- A full dimension matrix

If there is insufficient evidence, Analytics shows:

> Not enough assessment data yet.

## AI Copilot Integration

AI Copilot can read the local assessment profile as part of the user context. If the backend AI provider is unavailable, the UI must not claim AI-grade assessment. Mock/local mode remains clearly labelled.

## Trust Labels

The Assessment Engine uses explicit data trust states:

- `Not enough assessment data yet`
- `Limited local assessment data`
- `Based on local assessment history`
- `Wrapped existing module score`
- `Local AI Copilot metadata only`

These labels protect users from mistaking local heuristics for certified or AI-grade assessment.

## Limitations

Current assessment is local and heuristic. It is useful for learning direction, not certification, HR screening, or official language testing.

AI-grade assessment requires a backend AI assessment service through the existing BackendProxyAIProvider pattern. The frontend must never call OpenAI, Anthropic, Gemini, or other model vendors directly.

## Future AI Assessment Backend

Future production assessment can add:

- Backend rubric scoring
- Transcript-level speaking analysis
- Writing rubric calibration
- Human-reviewed benchmarks
- Field-level confidence scores
- Official test preparation mapping

These additions must extend the existing provider, service, storage, analytics, and Learning Engine patterns instead of creating parallel systems.
