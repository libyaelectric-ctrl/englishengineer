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

### Install scripts (`allowScripts`)

npm will not run a dependency's install script until this project has recorded a decision about
it, and those decisions live in the `allowScripts` field of `package.json` — one in the root, one
in `backend/`. An unreviewed script is **skipped with a warning**, and a warning is easy to miss:
that is how an approved package quietly stops running the step a build relies on after a version
bump.

```bash
npm approve-scripts --allow-scripts-pending   # list what has no decision yet
npm approve-scripts <pkg>                     # allow it
npm deny-scripts <pkg>                        # refuse it
```

Approvals are pinned to the version that was reviewed, so upgrading that dependency puts it back
in the queue for a fresh look. After a dependency upgrade, run the two commands above and commit
the updated `allowScripts` — the warning in the build log is that prompt.

Denied here, and why: `@scarf/scarf` (pulled in by `swagger-ui-dist`) reports each install to a
third party, which is telemetry this project does not opt into; and `protobufjs`,
`@firebase/util` and `canvas` need nothing at install time — the canvas suite mocks it instead
(`src/test/setup.ts`).

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
