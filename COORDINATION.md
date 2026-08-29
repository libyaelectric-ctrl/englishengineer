# Agent Coordination Protocol

Two AI agent sessions work in the SAME working tree and share one `.git`:

| Session | Scope |
| --- | --- |
| **Codebuff** | data/migration/content work (vocabulary seeds, translations, Supabase moves), feature UI |
| **Refactor/Cleanup session** | refactors, dependency/tooling work, CI fixes, debt-bookkeeping, security hardening |

## Rules (both sessions)

1. **Pull before you start.** `git pull --rebase origin main` + read `git status`. Never work on a dirty tree you did not create — ask or wait instead of resetting it.
2. **Never run `git add -A` / `git add .`.** Always stage explicit paths. The tree may contain the other session's work-in-progress.
3. **Never `git restore` / `git checkout --` a file you did not modify yourself.** This silently deletes the other session's uncommitted work (this already happened once on 2026-08-29 ~10:05 — a TD-019 backend change set was lost and had to be re-implemented).
4. **Small, frequent commits.** The pre-commit hook runs the full frontend suite; long-running commits block the other session.
5. **Never `git push --force`.** If the push is rejected, `git pull --rebase --autostash` and retry.
6. **`npm --prefix backend install` re-adds a ghost dependency** (`"engvox-frontend": "file:.."`) and intermittently breaks `backend/package.json`. Run backend npm commands from the `backend/` directory instead, and re-check `backend/package.json` after any install.
7. **PowerShell text round-trips corrupt UTF-8** (em-dashes in comments became mojibake once). Prefer Node scripts for bulk file edits.
8. **Long data operations (npm ci, builds, full test suites) collide** on `node_modules` and CPU — coordinate timing or run them when the other session is idle.
9. If a conflict is unavoidable: commit your own work first (`--no-verify` is acceptable with documented manual gates), then let the other session rebase — never discard theirs.

## Current data layout (post-migration)

- Runtime data lives in `public/data/` (vocabulary seeds + shards, translation corpora, grammar seeds) — fetched at runtime, cached in IndexedDB.
- `src/data/` must stay minimal (loaders only). Do not re-add data JSONs under `src/`.
- Optional next step: move `public/data/` to Supabase Storage / a CDN origin — see `scripts/upload-data-to-storage.mjs` and the `VITE_DATA_CDN_URL` loader support.
