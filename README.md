# EngVox — Engineering English Platform

> Discipline-specific English learning platform for 10 engineering verticals.
> Free plan, no credit card required.

## Quick Start

### Prerequisites

- Node.js ≥ 22
- npm ≥ 10
- Supabase account (optional, memory fallback available)
- Clerk account (for authentication)

### Installation

```bash
# Clone
git clone https://github.com/libyaelectric-ctrl/englishengineer.git
cd englishengineer

# Install dependencies
npm install
npm --prefix backend install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)
```

### Environment Variables

| Variable                     | Required | Description                                                                    |
| ---------------------------- | -------- | ------------------------------------------------------------------------------ |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅       | Clerk publishable key (`pk_test_...`)                                          |
| `CLERK_SECRET_KEY`           | ✅       | Clerk secret key (backend)                                                     |
| `CLERK_ISSUER`               | ✅       | Clerk issuer URL (e.g., `https://xxx.clerk.accounts.dev`)                      |
| `VITE_BILLING_API_URL`       | ⚠️       | Backend URL for billing (e.g., `https://englishengineer-backend.onrender.com`) |
| `ANTHROPIC_API_KEY`          | ⚠️       | For AI coach (optional, mock mode if missing)                                  |
| `SUPABASE_URL`               | ⚠️       | Supabase project URL (optional, memory fallback)                               |
| `SUPABASE_SERVICE_ROLE_KEY`  | ⚠️       | Supabase service role key (optional)                                           |
| `DODO_PAYMENTS_API_KEY`      | ⚠️       | Dodo Payments API key (test mode)                                              |
| `DODO_PAYMENTS_WEBHOOK_KEY`  | ⚠️       | Dodo Payments webhook secret                                                   |
| `METRICS_TOKEN`              | \-       | Optional: bearer token protecting `/api/metrics` (recommended in production)   |

### Development

```bash
# Frontend + backend together
npm run dev:all

# Or separately
npm run dev                    # Frontend (port 3000)
npm --prefix backend run dev   # Backend (port 8787)
```

### Testing

```bash
npm test                       # Unit tests (vitest)
npm run test:coverage          # Coverage report
npm run backend:test           # Backend tests
npm run e2e:browser            # E2E tests (Playwright)
npm run typecheck              # TypeScript check
npm run lint                   # ESLint
```

### Production Build

```bash
npm run build
```

## Project Structure

```
src/
├── features/           # Domain modules (auth, billing, vocabulary, speaking, grammar, ...)
├── core/               # Shared kernel (errors, events, ids, learning)
├── providers/          # React context providers
├── shared/             # Shared components & utilities
├── config/             # App configuration
├── pages/              # Route pages (lazy-loaded)
├── routes/             # React Router configuration
└── store/              # Global state

backend/
├── src/                # Express API routes & services
├── dist/               # Compiled output
└── test/               # Backend tests

tests/
├── browser/            # Browser E2E specs (Playwright)
├── e2e/                # E2E flow specs
└── helpers/            # Test utilities (Clerk sign-in, auth setup)
```

## Tech Stack

| Layer          | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Frontend**   | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Zustand, TanStack Query |
| **Backend**    | Express 5, TypeScript, Node 22, Winston (logging), Zod (validation)       |
| **Auth**       | Clerk (JWT + JWKS verification)                                           |
| **Billing**    | Dodo Payments (checkout + webhooks) / Stripe (legacy)                     |
| **Database**   | Supabase (PostgreSQL) with memory fallback                                |
| **AI**         | Anthropic Claude / OpenAI / Gemini (configurable)                         |
| **Testing**    | Vitest 4, Playwright, Testing Library                                     |
| **CI/CD**      | GitHub Actions (secret-scan → quality → test → build → e2e)               |
| **Deploy**     | Vercel (frontend) + Render (backend)                                      |
| **Monitoring** | Sentry (error tracking), Prometheus (metrics)                             |

## Features

- **10 Engineering Disciplines:** Architecture, Chemical, Civil, Electrical, Electronics, HSE, Industrial, Mechanical, Mechatronics, Software
- **Vocabulary:** 14,199+ technical terms with translations
- **Grammar:** Discipline-specific grammar modules
- **Reading:** Technical text comprehension
- **Writing:** Professional correspondence & reports
- **Speaking:** Voice practice & pronunciation
- **Listening:** Audio comprehension exercises
- **AI Coach:** Personalized learning guidance
- **Placement Test:** Level assessment
- **Progress Tracking:** Analytics & gamification
- **Subscription Plans:** Free → Junior → Senior → Specialist → Master

## Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (Render)

Auto-deploys on push to `main`. Manual deploy:

```bash
vercel --prod --yes
```

### Environment Sync

```bash
# Pull Clerk env vars
clerk env pull

# Sync Vercel env
vercel env pull .env.vercel
```

## Contributing

1. Create feature branch from `main`
2. Make changes with conventional commits
3. Run `npm test` and `npm run typecheck`
4. Open PR

## License

MIT
