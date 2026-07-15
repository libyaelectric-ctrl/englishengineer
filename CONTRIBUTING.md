# Contributing to EngineerOS

Thank you for your interest in contributing to EngineerOS! This document explains the development workflow, quality gates, and coding standards.

## Prerequisites

- Node.js 22+
- npm (comes with Node)

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Development Workflow

### Before Every Commit

Run the full quality gate locally:

```bash
npm run quality:gate
```

This runs (in order):

1. `typecheck` — TypeScript compilation check
2. `format:check` — Prettier formatting verification
3. `lint` — ESLint static analysis
4. `content:validate` — Professional content integrity check
5. `vitest run` — Unit tests (373+ tests)
6. `verify:build-exit` — Production build verification
7. `e2e` — Vitest E2E smoke tests
8. `backend:install` + `backend:test` — Backend tests
9. `verify:release` — Release readiness check
10. `verify:rls` — Row-level security verification

**All 10 steps must pass before committing.**

### Quick Commands

```bash
# Type checking only
npm run typecheck

# Run tests only
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint only
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Test Coverage

Coverage thresholds are enforced in CI. Current minimums:

| Scope | Branches | Functions | Lines | Statements |
|-------|----------|-----------|-------|------------|
| Global | 75% | 75% | 75% | 75% |
| `src/features/billing/**` | 85% | 85% | 85% | 85% |
| `src/features/auth/**` | 85% | 85% | 85% | 85% |
| `src/features/ai/**` | 80% | 80% | 80% | 80% |
| `src/features/vocabulary/**` | 80% | 80% | 80% | 80% |
| `src/core/**` | 80% | 80% | 80% | 80% |

Run `npm run test:coverage` locally to see the full report. The HTML report is generated in `coverage/`.

If a PR drops coverage below the threshold, the CI pipeline will fail.

## CI/CD Pipeline

### On Every Push to `main` or `develop`

The CI pipeline (`.github/workflows/ci.yml`) automatically runs:

- Content validation
- Type checking
- Format checking
- Linting
- Unit tests
- Production build
- Backend tests
- RLS verification
- Kademe 8 environment check

**All checks must pass before merge.**

### On Pull Requests

Same as above, plus the PR must be approved by a maintainer.

### Deployment

- **Frontend**: Deployed to Vercel on merge to `main`
- **Backend**: Deployed to Railway on merge to `main`

## Code Standards

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types allowed
- All props must be typed
- Use `interface` for object shapes, `type` for unions/aliases

### React

- Functional components only (no class components)
- Use hooks for state management
- Keep components small and focused
- Extract reusable logic into custom hooks

### State Management

- Zustand for global state
- Keep stores focused on a single domain
- Use selectors to minimize re-renders

### Testing

- Write tests for new features
- Tests should be deterministic (no flaky tests)
- Use `beforeAll` for expensive setup (e.g., data loading)
- Mock external services (APIs, storage)

### File Structure

- Components: `src/shared/components/`
- Feature modules: `src/features/<feature>/`
- Pages: `src/pages/`
- Backend: `backend/src/`

## Quality Thresholds

| Check            | Threshold    |
| ---------------- | ------------ |
| TypeScript       | 0 errors     |
| ESLint           | 0 errors     |
| Unit tests       | 100% pass    |
| Production build | Must succeed |
| Backend tests    | 100% pass    |

## Commit Discipline

Her commit tek bir mantıksal değişikliği temsil etmelidir. Commit mesajı, o commit'te GERÇEKTEN değişen her şeyi yansıtmalı — büyük bir refactor'un yanına küçük, alakasız bir düzeltme sığıştırılmamalı, ayrı commit'e konulmalıdır.

### Commit Message Format

Bu proje [Conventional Commits](https://www.conventionalcommits.org/) formatını kullanır:

```
<type>(<scope>): <description>
```

Geçerli type'lar: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`, `revert`

Örnekler:

- `feat(vocabulary): add spaced repetition algorithm`
- `fix(auth): resolve JWT token refresh race condition`
- `refactor(ai): extract prompt templates to separate files`
- `docs(readme): update deployment instructions`

### Pre-commit Checks

- Commitlint her commit mesajını doğrular
- Karışık commit (kod + veri dosyaları) tespit edilirse uyarı verilir

## Branching Strategy

- `main` — Production-ready code. All deployments originate from here.
- `develop` — Integration branch for ongoing work. PRs merge here first.
- `feat/<name>` — Feature branches. Branch from `develop`, merge back via PR.
- `fix/<name>` — Bug fix branches. Branch from `develop` or `main` (hotfix).
- `refactor/<name>` — Refactoring branches. Branch from `develop`.

### Branch Naming Convention

```
feat/vocabulary-spaced-repetition
fix/auth-jwt-refresh-race
refactor/billing-modularization
docs/api-reference-update
test/backend-validation-schemas
```

## Testing Standards

### Frontend Tests (Vitest)

- Unit tests: `src/**/*.test.ts(x)` — Test individual functions and components
- E2E tests: `src/e2e/**/*.test.tsx` — Test critical user flows
- Store tests: Test state transitions, actions, and derived state
- Run: `npx vitest run`

### Backend Tests (Node.js test runner)

- Unit tests: `backend/test/*.test.js` — Test services, validation, auth
- Run: `node --test backend/test/*.test.js`

### Test Quality Requirements

- Every new feature must include tests
- Tests must be deterministic (no random data, no timing dependencies)
- Mock external services (Supabase, Stripe, dictionary APIs)
- Test both happy path and error cases
- Edge cases: empty inputs, boundary values, concurrent operations

## Architecture Overview

### Frontend (React/Vite)

```
src/
├── config/          # App configuration
├── contracts/       # API contract definitions
├── core/            # Domain-agnostic modules (learning, events, repos)
├── data/            # Seed data (grammar, vocabulary by CEFR level)
├── features/        # Feature modules (23 modules, each with store/service/types)
├── pages/           # Route-level page components
├── providers/       # React context providers
├── routes/          # Router configuration
├── shared/          # Reusable UI components and utilities
└── store/           # Global app store
```

### Backend (Express/Node.js)

```
backend/src/
├── ai.js            # AI route registration
├── ai-core/         # AI service and provider integrations
├── ai-ledger.js     # AI request counting/ledger
├── app.js           # Express app factory and middleware
├── auth.js          # Authentication middleware
├── billing-helpers.js   # Billing utility functions
├── billing-routes.js    # Billing route definitions
├── billing-service.js   # Billing business logic
├── config.js        # Configuration factory
├── errors.js        # Error classes and formatting
├── i18n.js          # Internationalization middleware
├── rate-limit.js    # Rate limiting
├── subscription-repository.js  # Subscription data access
├── supabase-billing-repository.js  # Supabase billing adapter
├── supabase-audit-log-repository.js  # Supabase audit adapter
├── validation.js    # Zod schemas and middleware
├── vocabulary-routes.js   # Vocabulary route definitions
├── vocabulary-service.js  # Vocabulary lookup service
├── workspace-repository.js  # Supabase workspace adapter
└── workspace.js     # Workspace route definitions
```

### Database (Supabase/PostgreSQL)

- 18 tables with RLS enabled
- Migrations in `supabase/migrations/`
- Security-definer functions for admin checks
- Service role for backend operations, anon key for frontend

## Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Include browser/OS information
- For security issues, contact maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
