# Contributing to EngineerOS / EngVox

Thanks for your interest in contributing! This project is MIT licensed and
welcomes code, docs, translations, and feature requests.

## Getting started

1. Fork the repo and clone your fork.
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
3. Copy the environment templates and fill in the values you need locally:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Making a change

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your changes.
3. Before opening a PR, make sure the project is clean:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
   For backend changes, also run the backend's own checks:
   ```bash
   cd backend && npx tsc --noEmit && npm test
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
   — this is enforced by commitlint via a Husky `commit-msg` hook. Allowed
   types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`,
   `perf`, `ci`, `build`, `revert`.
   ```
   fix(billing): correct Stripe webhook signature verification
   ```
5. Push your branch and open a pull request against `main`.

## Code ownership and review

See [`.github/CODEOWNERS`](.github/CODEOWNERS) for which paths require
review from specific owners (e.g. `/backend/`, `/src/features/auth/`,
`.env*`, and other security-sensitive areas).

## Reporting bugs / requesting features

Please open a GitHub issue with as much detail as you can — steps to
reproduce, expected vs. actual behavior, and environment details for bugs;
motivation and proposed behavior for feature requests.

## Code of conduct

Be respectful and constructive. This is a small project maintained by a
small team — patience and clear communication go a long way.
