# EngineerOS Foundation Lock

This document is the permanent architecture contract for all future EngineerOS development. Every future sprint must preserve these rules.

## 1. Project Mission

EngineerOS is an AI-powered Engineering English learning platform for engineers, site teams, technical professionals, and project stakeholders who need stronger English for real engineering work.

The long-term platform pillars are:

- Reading
- Writing
- Listening
- Speaking
- Vocabulary
- AI Coach
- Learning Engine
- Analytics
- Gamification
- Authentication
- Subscription
- Administration

No future sprint may change this vision. New capabilities must extend this platform mission, not replace it.

## 2. Locked Architecture

EngineerOS is organized around clear layers with separated responsibilities.

### Core Layer

The Core Layer owns reusable domain infrastructure:

- learning state and scoring
- achievements
- events
- IDs
- result helpers
- validation
- errors
- time helpers
- base service and repository contracts

Future modules must use the Core Layer instead of creating separate scoring, achievement, event, ID, or validation systems.

### Shared

The Shared layer owns reusable UI and platform utilities:

- layout components
- common UI components
- storage wrapper
- logger
- utility helpers

Future screens must reuse shared components and utilities before creating new patterns.

### Feature Modules

Feature modules own domain-specific learning behavior. Current canonical feature modules include:

- Auth
- AI
- Reading
- Writing
- Listening
- Speaking
- Vocabulary

Each feature should keep its own types, helpers, services, stores, evaluators, data, providers, and exports inside its feature folder.

### Providers

Providers encapsulate external or swappable implementations. Examples:

- AI provider implementations
- Auth provider implementations
- future subscription or backend adapters

Provider selection must be configuration-driven and safe by default.

### Stores

Stores own reactive local state through the existing state approach. Stores must be typed and scoped to their domain.

Global learning state belongs to the Learning Engine. Feature stores may reference learning state, but must not duplicate XP, ELO, achievements, learning history, or vocabulary progress.

### Pages

Pages are UI composition surfaces. Pages should orchestrate components, stores, and services, but should not contain large business logic, dataset definitions, or duplicated evaluators.

### Routes

Routes define navigation only. Future features must integrate with existing route structure unless a sprint explicitly authorizes route additions.

No future sprint may remove existing routes without explicit approval.

### Persistence

Persistence must use the existing storage wrapper. Direct `localStorage` access is forbidden outside the storage layer.

Feature persistence must be canonical, typed, and minimal. Do not create duplicate storage keys for the same state.

### Integration Rule

Future features must integrate with the existing layers instead of creating parallel systems.

## 3. Feature Standard

Every new feature must follow this folder standard:

```text
feature/
  types.ts
  helpers.ts
  service.ts
  store.ts
  index.ts
```

Optional files may be added when the feature requires them:

```text
feature/
  provider.ts
  evaluator.ts
  data.ts
```

Existing feature naming conventions may use a feature prefix, such as `reading.types.ts` or `speaking.service.ts`. Future work must follow the local convention already used in EngineerOS.

Never bypass this standard. Never place durable feature logic directly inside pages when it belongs in a feature folder.

## 4. AI Rules

EngineerOS must never call OpenAI, Anthropic, Gemini, or any other vendor AI API directly from the frontend.

AI work must always use the existing provider pattern:

- `MockAIProvider`
- `BackendProxyAIProvider`
- `AIService`

The frontend may call only a configured backend proxy endpoint. Real AI vendor keys must live on the server, never in browser code, localStorage, or frontend environment variables.

Mock AI remains the safe local fallback. Backend proxy mode must be optional, typed, timeout-protected, and graceful on failure.

## 5. State Rules

Never duplicate these canonical learning values:

- XP
- ELO
- achievements
- learning history
- vocabulary progress

Use the existing Learning Engine and Vocabulary Engine. Feature modules may read, summarize, or reference this state, but they must not create competing systems.

## 6. Storage Rules

All persistence must use the existing storage wrapper.

Direct `localStorage` access is forbidden except inside the storage layer. Storage keys must be typed, stable, and documented by the owning feature when they become durable product state.

## 7. UI Rules

EngineerOS uses a dark engineering command center style.

Future work must not introduce random redesigns, inconsistent component libraries, or unrelated visual systems. Reuse shared components, layout primitives, icons, spacing, and established page structure.

UI changes should support the sprint goal without replacing the product identity.

## 8. Code Rules

All code must follow these rules:

- TypeScript strict
- no `any`
- no duplicated business logic
- no broken imports
- no unused imports
- prefer composition
- prefer helper functions for reusable logic
- prefer typed interfaces
- keep edits scoped to the sprint

Business rules belong in services, evaluators, helpers, or stores. Pages should remain clean composition layers.

## 9. Sprint Rules

Future work must be clearly classified as one sprint type:

- Feature Sprint
- Hardening Sprint
- Content Sprint
- Production Sprint

Never mix sprint types without explicit approval. Each sprint must preserve the current architecture and product foundations.

## 10. Hardening Rules

Hardening may:

- fix bugs
- improve performance
- improve typing
- improve maintainability
- clarify documentation
- remove duplicate or unsafe implementation details

Hardening must not:

- dramatically change UX
- redesign architecture
- replace modules
- remove established routes
- change product direction

## 11. Content Rules

Content must remain separate from engine implementation. Content packs may include:

- vocabulary datasets
- reading passages
- listening scripts
- speaking prompts
- writing/email templates
- AI prompt templates

Never mix large content generation with engine implementation unless the sprint is explicitly a Content Sprint.

## 12. Production Rules

Production tasks belong to Production Sprint only:

- Stripe
- Supabase
- deployment
- monitoring
- CI/CD
- testing infrastructure
- security reviews
- backend proxy productionization

Production integrations must be optional, environment-driven, and safe in local mode.

## 13. Documentation Rules

Every feature must include or update one markdown document explaining:

- purpose
- architecture
- integration
- persistence
- future work

Hardening and production changes must update relevant documents when they change contracts, environment variables, storage behavior, or integration boundaries.

## 14. Final Lock

Future development must preserve this architecture.

New capabilities should extend EngineerOS, never replace its foundations.
