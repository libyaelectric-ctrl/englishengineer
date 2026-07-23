# Contributing to EngVox

## Development Setup

```bash
# Install dependencies
npm ci
npm --prefix backend ci

# Start dev servers
npm run dev          # Frontend on :3000
npm run backend:dev  # Backend on :8080

# Run all tests
npm test             # Frontend (Vitest)
npm run backend:test # Backend
```

## Code Quality

Before pushing, ensure:

```bash
npm run typecheck    # TypeScript errors
npm run lint         # ESLint warnings
npm test             # All tests pass
npm run build        # Production build succeeds
```

## Security Rules

1. **Never commit `.env` files** — they are gitignored
2. **Never hardcode secrets** — use environment variables
3. **Run security audit before PR**: `node scripts/security-audit.mjs`
4. **All API keys must be in GitHub Secrets** — not in code
5. **User input must be validated** — use Zod schemas

## PR Requirements

- CI must pass (typecheck + lint + test + build + security audit)
- Bundle size must stay under 500KB
- All new features need tests
- Security-sensitive files require explicit review (see CODEOWNERS)
