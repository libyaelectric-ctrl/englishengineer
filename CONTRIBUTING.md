# Contributing to EngineerOS

## Development Setup

```bash
# Clone the repository
git clone https://github.com/libyaelectric-ctrl/englishengineer.git
cd englishengineer

# Install dependencies
npm ci
npm --prefix backend ci

# Start development servers
npm run dev          # Frontend on :3000
npm run backend:dev  # Backend on :8080
```

## Code Quality Commands

```bash
npm run typecheck    # TypeScript errors
npm run lint         # ESLint warnings
npm test             # All unit tests
npm run build        # Production build
node scripts/security-audit.mjs  # Check for exposed secrets
```

## Branch Strategy

- `main` — production-ready code
- `feature/*` — new features
- `fix/*` — bug fixes
- `refactor/*` — code improvements

## PR Requirements

1. CI must pass (typecheck + lint + test + build + security audit)
2. Bundle size must stay under budget (JS: 2MB, CSS: 200KB)
3. All new features need tests
4. Security-sensitive files require explicit review (see CODEOWNERS)
5. Update documentation if adding new APIs or features

## Architecture Rules

- **Pages** → import from Features, Core, Shared
- **Features** → import from Core, Shared (NOT from other Features)
- **Core** → import from Shared only
- **Shared** → no imports from Core or Features

## Security Rules

1. Never commit `.env` files (they are gitignored)
2. Never hardcode secrets — use environment variables
3. Run `node scripts/security-audit.mjs` before PR
4. All API keys must be in GitHub Secrets
5. User input must be validated — use Zod schemas

## Testing

- Unit tests: `npm test` (Vitest)
- E2E tests: `npm run e2e:browser` (Playwright)
- Accessibility tests: `npm run test:a11y`
- Load tests: `npm run test:load` (k6)

## Commit Messages

Use conventional commits:

- `feat:` — new feature
- `fix:` — bug fix
- `perf:` — performance improvement
- `refactor:` — code restructuring
- `test:` — adding tests
- `docs:` — documentation
- `chore:` — maintenance tasks
