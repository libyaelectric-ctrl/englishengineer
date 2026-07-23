# EngineerOS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │  Pages   │  │ Features │  │  Core   │  │  Shared  │ │
│  │ (routes) │→ │ (26 mod) │→ │ (events │→ │ (hooks,  │ │
│  │          │  │          │  │  errors) │  │  utils)  │ │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘ │
│       ↓              ↓             ↓            ↓       │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Providers (Query, Theme, Auth)          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                    HTTPS / REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Auth   │  │    AI    │  │ Billing  │  │ Routes │ │
│  │ (Supa-   │  │ (Gemini/ │  │ (Stripe) │  │ (REST) │ │
│  │  base)   │  │  OpenAI) │  │          │  │        │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────┴─────┐ ┌────┴────┐
              │ Supabase  │ │ Railway │
              │  (DB+Auth)│ │ (Host)  │
              └───────────┘ └─────────┘
```

## Module Dependency Rules

```
Pages → Features → Core → Shared
  ↓        ↓        ↓
Features → Core    Shared (no reverse)
  ↓
Features → Shared (allowed)
```

**Forbidden:**
- Features importing from other Features
- Core importing from Pages
- Shared importing from Core

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Zustand | Lightweight, no boilerplate |
| Server State | React Query | Caching, background refetch |
| Routing | React Router v7 | Lazy loading support |
| Styling | Tailwind CSS v4 | Utility-first, small CSS |
| Testing | Vitest + Playwright | Fast unit tests, real browser e2e |
| Error Monitoring | Sentry Lite | Minimal bundle (0.04KB) |
| Build | Vite 6 | Fast HMR, optimized chunks |
