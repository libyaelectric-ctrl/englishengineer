## Summary

<!-- Briefly describe what this PR does and why -->

## Changes

<!-- List the key changes made -->

-

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Test update
- [ ] CI/CD or tooling change

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] `npm run check-languages` passes
- [ ] `npm run verify:release` passes
- [ ] Android web bundle refreshed with `npm run build:mobile && npx cap sync android`
- [ ] Light/dark/auto theme checked on touched pages
- [ ] Mobile viewport checked on touched pages
- [ ] Manual testing performed (describe below)

## Screenshots (if applicable)

<!-- Add screenshots to illustrate visual changes -->

## Release Checklist

- [ ] Version number updated where needed (`package.json`, lockfiles, backend, Android, product config, env examples)
- [ ] `package-lock.json` and `backend/package-lock.json` match their package manifests
- [ ] Vercel/deployment status checked after merge
- [ ] Android build uses fresh `dist` assets, not stale WebView files
- [ ] User-visible copy is localized or intentionally language-neutral
- [ ] No new secrets, tokens, debug logs, or localhost-only URLs were introduced

## CI Notes

<!-- If a deploy-only check is skipped because secrets are unavailable, document that the build check still passed. Do not merge required test/type/lint failures. -->

-

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged and published
