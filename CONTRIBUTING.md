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

| Check | Threshold |
|-------|-----------|
| TypeScript | 0 errors |
| ESLint | 0 errors |
| Unit tests | 100% pass |
| Production build | Must succeed |
| Backend tests | 100% pass |

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

## Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Include browser/OS information
- For security issues, contact maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
