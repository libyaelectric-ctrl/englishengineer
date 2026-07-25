# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React SPA  │  │  Zustand    │  │  React Query │        │
│  │   (Vite)     │  │  (Store)    │  │  (Cache)     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         └────────────────┼────────────────┘                 │
│                          │ HTTPS                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    API Gateway (Vercel)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Edge Functions (CDN)                    │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    Backend (Railway)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Express    │  │   Auth      │  │   Rate      │        │
│  │   Routes     │  │   Middleware│  │   Limiter   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                 │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │
│  │  Services   │  │  Billing    │  │   AI        │        │
│  │  (Business) │  │  (Stripe)   │  │   (LLM)     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         └────────────────┼────────────────┘                 │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    Data Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Supabase   │  │   Upstash   │  │   Stripe    │        │
│  │  (Postgres) │  │   (Redis)   │  │   (Payments)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **State**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Auth**: Supabase Auth + OAuth
- **Payments**: Stripe
- **AI**: Anthropic/Gemini/OpenAI

### Data
- **Database**: Supabase PostgreSQL
- **Cache**: Upstash Redis
- **Storage**: Supabase Storage

## Data Flow

1. **User Action** → React component
2. **API Call** → React Query → Express route
3. **Auth Check** → Supabase JWT validation
4. **Business Logic** → Service layer
5. **Data Access** → Repository pattern
6. **Response** → JSON → React Query cache
7. **UI Update** → Zustand store → Component re-render

## Security Layers

1. **Network**: HTTPS, CORS, CSP
2. **Auth**: JWT, OAuth, Session management
3. **API**: Rate limiting, Input validation
4. **Data**: RLS, Encryption at rest
5. **Infrastructure**: WAF, DDoS protection

## Scalability Strategy

1. **Horizontal**: Multiple backend instances
2. **Vertical**: Auto-scaling on Railway
3. **Caching**: Redis for hot data
4. **CDN**: Vercel edge network
5. **Database**: Connection pooling, Read replicas
