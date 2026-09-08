# EngVox — Engineering English Platform

> Discipline-specific English learning platform for 10 engineering verticals.
> Free plan, no credit card required.

## Quick Start

### Prerequisites

- Node.js ≥ 22
- npm ≥ 10
- Supabase account (optional, memory fallback available)
- Firebase project with Email/Password authentication enabled

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

| Variable                         | Required                          | Description                                                                    |
| -------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `VITE_AUTH_PROVIDER`             | ✅                                | `firebase` (currently only supported provider)                                 |
| `VITE_FIREBASE_API_KEY`          | ✅                                | Firebase web API key (public by design, from Console → Web app)                |
| `VITE_FIREBASE_PROJECT_ID`       | ✅                                | Firebase project ID (e.g., `elemental-outlet-pnn32`)                           |
| `VITE_FIREBASE_AUTH_DOMAIN`      | ✅                                | Firebase auth domain (`<projectId>.firebaseapp.com`)                           |
| `VITE_FIREBASE_APP_ID`           | ⚠️                                | Firebase app ID (optional, for Analytics)                                      |
| `FIREBASE_PROJECT_ID`            | ✅                                | Backend: Firebase project ID for ID token verification                         |
| `VITE_BILLING_API_URL`           | ⚠️                                | Backend URL for billing (e.g., `https://englishengineer-backend.onrender.com`) |
| `ANTHROPIC_API_KEY`              | ⚠️                                | For AI coach (optional, mock mode if missing)                                  |
| `SUPABASE_URL`                   | ✅ backend                        | Supabase project URL for persistent learning, tenant, audit and export data    |
| `SUPABASE_SERVICE_ROLE_KEY`      | ✅ backend                        | Server-only key for persistent repositories; never expose to the browser       |
| `DODO_PAYMENTS_API_KEY`          | ⚠️                                | Dodo Payments API key (test mode)                                              |
| `DODO_PAYMENTS_WEBHOOK_KEY`      | ⚠️                                | Dodo Payments webhook secret                                                   |
| `METRICS_TOKEN`                  | ✅ backend                        | Production Bearer token for `/api/metrics` and `/api/diagnostics`              |
| `ENGINEEROS_INTERNAL_SERVICE_ID` | If internal secret is set         | Fixed service identity bound to internal authentication                        |
| `SUPABASE_JWT_ISSUER`            | If local JWT verification is used | Exact accepted Supabase JWT issuer                                             |
| `SUPABASE_JWT_AUDIENCE`          | If local JWT verification is used | Exact accepted audience (normally `authenticated`)                             |

### Mobile (Android APK / iOS)

Google OAuth on the native apps uses **@capacitor-firebase/authentication** — it performs a **native Google Sign-In** via Play Services / Credential Manager (no embedded WebView, no custom scheme deep link). The ID token is handed to the Firebase Web SDK via `signInWithCredential()`. Email/password sign-in runs entirely in-app and is unaffected.

The full runbook — Firebase Console settings (Android app package + SHA-1/256 + `google-services.json`), the `cap sync` workflow, and the emulator test procedure — lives in [MOBILE.md](./MOBILE.md).

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
└── helpers/            # Test utilities (Firebase sign-in, auth setup)
```

## Tech Stack

| Layer          | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Frontend**   | React 19, TypeScript 6.0, Vite 8, Tailwind CSS 4, Zustand, TanStack Query |
| **Backend**    | Express 5, TypeScript, Node 22, Winston (logging), Zod (validation)       |
| **Auth**       | Firebase Auth (ID token verification in the backend)                      |
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

Auto-deploys on push to `main`. For manual trigger, use Render Dashboard or API.

### Environment Sync

```bash
# Pull the currently configured Vercel environment
vercel env pull .env.vercel

# Firebase web values come from Firebase Console → Project settings → Web app.
# Keep backend service credentials only in the deployment platform's secret store.
```

## Contributing

1. Create feature branch from `main`
2. Make changes with conventional commits
3. Run `npm test` and `npm run typecheck`
4. Open PR

## License

MIT
