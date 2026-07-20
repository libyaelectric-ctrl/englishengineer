# EngineerOS | Engineering Communication Operating System

An offline-first Engineering English and career communication platform for professional engineers working in international project environments.

**Master the English you actually use on site.** Built for engineers who write
reports, attend meetings and solve technical problems in English.

## Project Overview

**EngineerOS** helps engineers practice the communication they need for real work: technical reports, site coordination, consultant responses, meetings, speaking practice, vocabulary review, analytics, AI-assisted coaching, and career-oriented learning.

The current product is local-first and beta-ready. Production AI, cloud sync, and verified billing require backend configuration.

Product ownership and author attribution: **Özcan ERENSAYIN**.

> **Katkıda bulunmak veya geliştirme ortamı kurmak istiyorsanız önce [docs/ONBOARDING.md](docs/ONBOARDING.md) dosyasına bakın.**

See [ENGINEEROS_ROADMAP.md](ENGINEEROS_ROADMAP.md) for the official v2.0 to v4.0 development roadmap.

## Current Milestone

Current source version: **EngineerOS v4.0.1**. Historical
release notes below are retained for traceability and do not override the
current package version.

EngineerOS v4.0.1 extends the proven closed-beta foundation with practical
engineering communication and learning-intelligence tools:

- Express API with safe `GET /api/health` readiness flags
- Server-only AI provider adapters (Anthropic, OpenAI, Gemini) with explicit mock mode
- Stripe Checkout, Customer Portal, subscription-status and signed-webhook contracts
- Separate backend dependency lock and Node test suite
- Light, calm engineering SaaS visual system with soft hover and motion states
- Engineering and email templates with Turkish guidance
- Phrase Library, Meeting Phrasebook, Site Dictionary and Quick AI actions
- Role-based daily tasks, mistake log and seven-day progress report
- Honest offline capability map and closed-beta adoption metrics

External deployment credentials are still required. Stripe test credentials
are required for live billing verification, and Supabase credentials are
required for live RLS verification. This source package is not evidence of a
deployed production SaaS.

PRC code-readiness additions include:

- Public landing, pricing, Team and legal-template routes
- Start Free choice, five-step onboarding and a local Reading/Vocabulary/Grammar placement MVP
- Independent skill progression with Writing, Listening and Speaking evidence kept separate
- Mobile bottom navigation, safe-area feedback positioning and EN/TR interface preference foundation
- Central Free, Pro and Team entitlement configuration
- Team manager and member-summary routes with explicit demo-data labels
- Supabase organization and team-summary RLS migration
- 30 listening scripts, 30 roleplays and 30 writing tasks validated by
  `npm run content:validate`
- Secret-free CI plus a safe Kademe 8 environment-check mode

### Current learner experience

- A new learner can enter at A1 without being placed into advanced content.
- Reading, Writing, Listening, Speaking, Vocabulary and Grammar advance at
  their own pace; progress in one skill does not force the others forward.
- Home presents one clear next lesson and makes weaker skills visible without
  turning the dashboard into a dense control panel.
- Learning Memory connects real vocabulary progress, named grammar topics,
  repeated mistakes and earned achievements using the existing stores.
- Grammar follows a visible lesson sequence with previous and next topic
  controls.
- Tools are grouped by purpose, and pricing explains who each plan serves,
  what is included and why higher plans cost more.
- Vocabulary and Grammar explain why an item has returned to the review queue.
- Profile can export namespaced local learning data and clear local-mode data
  with explicit confirmation; cloud account deletion is not overclaimed.

The light visual system is intentionally calm and mobile-first: white and pale
blue surfaces, restrained engineering blue, stable navigation and no dark
content-panel hover states.

Kademe 8 remains the live-service gate. While it is `BLOCKED`, production
launch and live customer billing are not allowed even when code-only readiness
checks pass. See `DEPLOYMENT.md` for staging and rollback instructions.

EngineerOS v2.6.0 was the Project Olympus production verification evidence sprint:

- Full quality gate automation with format, lint, unit tests, Vitest E2E smoke tests, real Playwright browser E2E tests, and build
- 20 release-candidate smoke scenarios plus 11 real Chromium browser scenarios covering auth, learning modules, AI fallback, billing fallback, profile update, local persistence, viewport checks, keyboard focus, resilience and browser refresh behavior
- Safe observability readiness with frontend health/status flags and optional Sentry-compatible configuration
- Backend contracts for AI, billing, Stripe webhooks, and health status
- Release documentation, known limitations, deployment guidance, and changelog aligned to the current package
- No production overclaiming: real AI, Stripe, Supabase cloud sync, and monitoring still require deployed backend credentials

EngineerOS v2.5.6 was the Project Titan Hardening release candidate gate for closed beta and staging integration.

EngineerOS v2.5.3 expanded the professional content pack and hardened the Assessment Engine:

- 25 engineering writing missions across reports, replies, NCRs, inspections, commissioning, safety, procurement, and handover
- 600+ engineering vocabulary entries across electrical, mechanical, civil, architecture, construction, QA/QC, HSE, procurement, hospital, data center, oil and gas, testing, and professional communication
- Assessment confidence scoring, richer internal CEFR bands, and a clear non-certificate disclaimer

EngineerOS v2.5 introduced the Engineer Assessment Engine:

- 17 professional engineering communication dimensions
- Local assessment profile derived from existing Learning Engine evidence
- Engineer CEFR and Engineer ELO presentation without duplicating state
- Analytics skill matrix, readiness signals, strengths, and improvement areas
- Clear trust labels for limited local data and non-AI assessment mode

See [ASSESSMENT_ENGINE.md](ASSESSMENT_ENGINE.md) for implementation details.

EngineerOS v2.4 introduced the Engineer AI Copilot:

- 12 practical engineering AI modes
- Professional prompt templates
- Structured output for reports, replies, NCRs, delays, meetings, vocabulary, grammar, roleplay, daily planning, career mentoring, and writing review
- Copy, export, regenerate, and clear-session controls
- Clear mock/backend/fallback trust labels

See [ENGINEER_AI_COPILOT.md](ENGINEER_AI_COPILOT.md) for implementation details.

EngineerOS v2.3 introduced the Real Audio Engine for Listening:

- Browser audio playback with shipped WAV support
- Local fallback audio assets for development
- Replay, pause, resume, seek, skip, and speed controls
- Transcript reveal with sentence highlighting
- Favorite missions and resume-later playback
- Local listening analytics and audio cache support

See [LISTENING_ENGINE.md](LISTENING_ENGINE.md) for implementation details.

---

## Technical Stack

The foundation of EngineerOS is built on a modern, robust, and highly optimized frontend stack:

- **Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org) for strict type safety.
- **Build System**: [Vite 6](https://vite.dev) for super-fast bundling and local development.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) utilizing modern CSS-based configurations and custom utility metrics.
- **State Engine**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, high-performance global store management.
- **Router**: [React Router v7](https://reactrouter.com) for declarative client-side route layouts.
- **Iconography**: [Lucide React](https://lucide.dev) for system-wide technical and vector-oriented icons.
- **Backend boundary**: optional Express package with official Stripe SDK and server-side AI provider adapters.

### Backend verification

```bash
npm --prefix backend ci
npm --prefix backend test
npm --prefix backend start
```

The backend uses TypeScript for core modules. Type-check with:

```bash
npm --prefix backend run typecheck
```

Copy `backend/.env.example` to `backend/.env` only in the deployment
environment. Never put vendor, Stripe, or Supabase service-role secrets in
frontend `VITE_` variables.

---

## Setup & Execution

Follow these steps to configure, run, and compile the EngineerOS application:

### 1. Installation

Install the project dependencies locally:

```bash
npm install
```

### 2. Local Development

Boot the rapid development server with instant workspace rendering:

```bash
npm run dev
```

_The dev server binds automatically to `0.0.0.0:3000` to support containerised runtimes and network ingress proxies._

### 3. Build & Compilations

Compile the application with full TypeScript verification checks and static bundle output:

```bash
npm run build
```

### Quality Gate

Run the complete release gate:

```bash
npm run quality:gate
npm run typecheck
```

Run E2E smoke fallback tests:

```bash
npm run e2e
```

EngineerOS keeps both layers: 20 fast Vitest/jsdom release smoke scenarios and
11 real Playwright Chromium scenarios. Chromium installation and execution are
documented in `TESTING.md` and CI.

## Commercial & Product Information

See [docs/PRODUCT.md](docs/PRODUCT.md) for commercial beta positioning, pricing details, and product handoff documentation.

### 4. Code Quality & Typechecking

Ensure system-wide logic safety and clear interface declarations:

```bash
npm run typecheck
```

### How to export a clean source ZIP

Clean source exports should exclude generated and local-only folders such as `node_modules/`, `dist/`, `.npm-cache/`, `.vite/`, `.git/`, local env files, logs, and previous ZIP files.

Before packaging, run:

```bash
npm run clean
```

Then follow `PROJECT_PACKAGE_GUIDE.md` to create `engineeros-clean-source.zip` from source files only.

---

## Folder Structure

The EngineerOS workspace follows a modular, clean, and highly predictable structure separating shared utilities from individual modules:

```text
/
├── public/                 # Static asset directories
├── src/
│   ├── config/             # Navigation and static platform layouts
│   │   └── navigation.config.ts
│   ├── shared/             # Atomic components, layout shells, and utilities
│   │   ├── components/     # Reusable design components (Card, PageHeader, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── SectionCard.tsx
│   │   ├── layout/         # Core layout shells (Sidebar, Topbar, etc.)
│   │   │   ├── AppShell.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── logger/         # System diagnostic reporting
│   │   ├── storage/        # Highly guarded, type-safe local persistence
│   │   └── utils/          # Core utilities (cn.ts)
│   ├── store/              # Centralized Zustand state engines
│   ├── routes/             # Unified browser routing maps
│   ├── pages/              # Platform feature modules
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SpeakingPage.tsx
│   │   ├── ReadingPage.tsx
│   │   ├── WritingPage.tsx
│   │   ├── ListeningPage.tsx
│   │   ├── AIPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── GamificationPage.tsx
│   │   ├── CurriculumPage.tsx
│   │   ├── OfflinePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── main.tsx            # App entry point
│   └── index.css           # Global Tailwind and font layout configs
├── package.json            # Configuration and workspace targets
├── tsconfig.json           # Compiler rules and absolute import aliases
└── README.md               # System operating manual
```

---

## Architectural Principles

1. **Strict Type Safety**: All data structures, interface models, and local storage state entries must be strictly typed using TypeScript.
2. **Offline-First Resilience**: All storage configurations are safely wrapped and catch-guarded to prevent application failures in restricted iframe or sandbox environments.
3. **Local-first continuity**: The product remains usable locally while optional Supabase, backend AI and billing adapters are enabled only through validated environment configuration.
4. **Responsive Precision**: Polished with consistent spacing, a calm light engineering palette, and restrained feedback suitable for desktop and mobile use.
5. **Decoupled Architecture**: Navigation rails, topbar metrics, and sidebars are separated from the `AppShell` container, facilitating easy future system extensions.

---

## Foundation Hardening Status

- [x] **Modular Layout Separation**: Decoupled layout components into independent files (`Sidebar.tsx`, `Topbar.tsx`, `Navigation.tsx`).
- [x] **Type-safe Storage**: Eliminated all occurrences of `any` in `localStorage` helpers and fully protected execution against blocked cross-origin constraints.
- [x] **Dependency Cleansing**: Pruned unused server-side modules and kept only frontend dependencies required by the app. `motion` is intentionally retained because the Listening Engine uses `motion/react` transitions.
- [x] **Build Verification**: Updated the compilation flow to strictly run typecheck checks alongside static output generation.
- [x] **Registry & Page Verification**: Fully indexed and compiled all 11 core sub-pages.

---
