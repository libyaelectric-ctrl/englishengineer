# EngineerOS | Engineering Communication Operating System

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/libyaelectric-ctrl/englishengineer/blob/main/LICENSE)
[![CI](https://github.com/libyaelectric-ctrl/englishengineer/actions/workflows/ci.yml/badge.svg)](https://github.com/libyaelectric-ctrl/englishengineer/actions)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://englishengineer.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

An offline-first Engineering English and career communication platform for professional engineers working in international project environments.

**Master the English you actually use on site.** Built for engineers who write
reports, attend meetings and solve technical problems in English.

## Project Overview

**EngineerOS** helps engineers practice the communication they need for real work: technical reports, site coordination, consultant responses, meetings, speaking practice, vocabulary review, analytics, AI-assisted coaching, and career-oriented learning.

The current product is local-first and beta-ready. Production AI, cloud sync, and verified billing require backend configuration.

Product ownership and author attribution: **Ozcan ERENSAYIN**.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase account (for production)
- Stripe account (for billing)

## Installation

```bash
# Clone the repository
git clone https://github.com/libyaelectric-ctrl/englishengineer.git
cd englishengineer

# Install frontend dependencies
npm install

# Install backend dependencies
npm --prefix backend install
```

## Environment Setup

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files with your API keys
# Frontend: .env (VITE_* variables)
# Backend: backend/.env (all backend secrets)
```

## Development

```bash
# Run frontend only (port 3000)
npm run dev

# Run frontend + backend concurrently
npm run dev:all
```

## Testing

```bash
# Run all frontend tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run backend tests
npm --prefix backend test

# Run integration tests
npm run test:integration

# Run E2E tests (Playwright)
npm run e2e:browser
```

## Quality Gates

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Full quality gate
npm run quality:gate

# Build verification
npm run build
```

## Deployment

The project deploys automatically on push to `main`:

- **Frontend**: Vercel (https://englishengineer.vercel.app)
- **Backend**: Railway (https://englishengineer-production.up.railway.app)

For manual deployment:

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging
```

## Project Structure

```
src/
  pages/          # Route-level components (index.tsx)
  features/       # Feature modules (vocabulary, speaking, etc.)
  shared/         # Shared components and utilities
  config/         # App configuration
  core/           # Core architecture rules
backend/
  src/            # Express.js API server
  test/           # Backend tests (20 test files)
```

## Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Vite, Tailwind CSS v4, Zustand
- **Backend**: Node.js, Express, TypeScript, Supabase, Stripe
- **Testing**: Vitest, Playwright
- **Deploy**: Vercel (frontend), Railway (backend)

## Contributing

1. Create a feature branch from `main`
2. Run `npm run quality:gate` before committing
3. Pre-commit hooks run lint-staged automatically
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.
