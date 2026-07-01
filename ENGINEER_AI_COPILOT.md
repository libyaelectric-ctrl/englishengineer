# EngineerOS v2.4 Engineer AI Copilot

## Purpose

Engineer AI Copilot upgrades the existing AI Coach into a practical engineering communication assistant. It helps engineers draft, review, explain, and practice real workplace English without changing the existing AI provider architecture.

The frontend still never calls OpenAI, Anthropic, Gemini, or any vendor directly. Live AI requires the configured backend proxy. Mock mode remains available and clearly labeled.

## AI Modes

The Copilot includes 12 modes:

1. Site Report Writer
2. Consultant Reply Assistant
3. Technical Email Assistant
4. NCR Response Assistant
5. Delay Explanation Assistant
6. Meeting Preparation Coach
7. Vocabulary Explainer
8. Grammar Explainer
9. Roleplay Simulator
10. Daily Learning Planner
11. Career Mentor
12. Writing Reviewer

Each mode maps to an existing provider operation such as `rewriteText`, `analyzeText`, `generatePractice`, `evaluateEngineeringEnglish`, `generateStudyPlan`, or `analyzeProgress`.

## Prompt Templates

Professional templates are included for:

- Hospital electrical site report
- LV panel issue
- Cable tray delay
- Consultant inspection comment
- Material submittal reply
- Generator testing issue
- Fire alarm integration issue
- FAT preparation
- Commissioning update
- QA/QC NCR response

Templates are mode-specific and populate the input box. They do not call AI automatically.

## Structured Output

Copilot responses support:

- Summary
- Professional version
- Simplified version
- Strengths
- Weaknesses
- Corrections
- Key vocabulary
- Grammar notes
- Tone feedback
- Suggested next practice
- CEFR estimate
- Engineer ELO impact estimate

Older backend responses remain compatible because new fields are optional.

## Provider Behavior

EngineerOS uses the existing provider pattern:

- `AIService`
- `MockAIProvider`
- `BackendProxyAIProvider`

When `VITE_AI_PROVIDER=backend` and `VITE_AI_PROXY_URL` are configured, requests go to the backend proxy. If backend AI is unavailable or not configured, EngineerOS falls back safely to mock mode where supported.

## Mock And Fallback Behavior

Mock output is intentionally labeled:

- Mock AI active
- Backend unavailable
- Local fallback mode
- Mock fallback response

Mock responses are useful for development and UI testing, but they must never be presented as verified production AI.

## Session Storage

AI sessions are stored locally using the existing storage layer.

Stored fields:

- mode
- user input
- structured result
- provider status
- timestamp
- operation log
- success/failure state

Secrets and API keys are never stored in the browser.

## UI Capabilities

The AI page now supports:

- 12-mode selector
- Professional prompt templates
- Structured result cards
- Provider/fallback status
- Copy result
- Export result as text
- Regenerate last request
- Clear session history
- Reset coach state
- Local session history

## Future Backend Requirements

Production AI backend should support:

- Streaming responses
- User-safe AI memory
- Backend-side prompt governance
- Rate limiting
- Audit logs
- Model routing
- Structured v1 response contract
- Workspace-aware recommendations
- No vendor secrets in frontend
