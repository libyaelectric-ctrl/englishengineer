# EngineerOS Architecture — C4 Model

## System Context Diagram (Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EngineerOS System                                │
│                                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│  │   Learner    │      │   Learner    │      │   Team       │             │
│  │   (Web)      │◄────►│   (Mobile)   │      │   Admin      │             │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘             │
│         │                     │                     │                       │
│         └─────────────────────┼─────────────────────┘                       │
│                               │                                             │
│                    ┌──────────┴──────────┐                                │
│                    │   EngineerOS API     │                                │
│                    │   (Express + Node)   │                                │
│                    └──────────┬──────────┘                                │
│                               │                                             │
│         ┌─────────────────────┼─────────────────────┐                     │
│         │                     │                     │                       │
│  ┌──────┴──────┐    ┌────────┴────────┐   ┌──────┴──────┐              │
│  │  Supabase   │    │  AI Providers     │   │   Stripe    │              │
│  │  (Auth+DB)  │    │  (Claude/OpenAI/  │   │  (Billing)  │              │
│  │             │    │   Gemini)         │   │             │              │
│  └─────────────┘    └───────────────────┘   └─────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Container Diagram (Level 2)

### Frontend Container (React + Vite)
```
┌─────────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Pages      │ │   Features   │ │   Shared     │        │
│  │   (Router)   │ │   (6 skills) │ │   (UI/Utils) │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴───────┐         │
│  │              Core Layer                        │         │
│  │  (Events, IDs, Observability, Result)        │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  Storage: IndexedDB + localStorage (Offline-first)          │
└─────────────────────────────────────────────────────────────┘
```

### Backend Container (Express + Node)
```
┌─────────────────────────────────────────────────────────────┐
│                  Express API Server                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Auth       │ │   AI         │ │   Billing    │        │
│  │   (JWT)      │ │   (Proxy)    │ │   (Stripe)   │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴───────┐         │
│  │              Middleware Layer                  │         │
│  │  (Helmet, CSRF, Rate Limit, Validation)        │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  Queue: BullMQ (Redis)  |  Cache: Upstash Redis (future)  │
└─────────────────────────────────────────────────────────────┘
```

## Component Diagram (Level 3) — Feature Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Feature Module Pattern                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  components/ │ │   hooks/     │ │   services/  │        │
│  │  (UI)        │ │   (Logic)    │ │   (API)      │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴───────┐         │
│  │              store/ (Zustand)                  │         │
│  │              types/ (Contracts)                │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → Feature Hook → Service → API → Backend → DB/AI
     │            │           │        │       │       │
     ▼            ▼           ▼        ▼       ▼       ▼
  UI Update   State Update   Error   Offline  Auth   Response
                              Handling Queue   Check
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19 |
| Build | Vite | 6 |
| Styling | Tailwind CSS | 4 |
| State | Zustand | 5 |
| Server State | TanStack Query | 5 |
| Backend | Express | 5 |
| Validation | Zod | 4 |
| Auth | Supabase | 2 |
| AI | Anthropic/OpenAI/Google | Latest |
| Queue | BullMQ | 5 |
| Monitoring | Sentry | 10 |

## Last Updated
- **Date:** 2026-07-27
- **Version:** 4.0.1
