# playwright-cli (browser automation)

Project-level skill for automating the browser with `playwright-cli` — opening pages, taking snapshots/screenshots, inspecting the rendered UI, and interacting with it.

## Provenance

| Field       | Value                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill       | `playwright-cli` from [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) (`skills/playwright-cli`), author: Microsoft         |
| CLI version | `@playwright/cli` `^0.1.19` (installed as a devDependency in this repo, so `playwright-cli` / `npx playwright-cli` works without a global install) |
| Installed   | 2026-09-07, mirroring upstream `main` at that date                                                                                                 |
| License     | Apache-2.0 (see `LICENSE` in this folder)                                                                                                          |

`SKILL.md` and `references/*` are upstream files verbatim. Session snapshots are written to `.playwright-cli/` (gitignored).

## Usage

`playwright-cli open <url>` → `playwright-cli snapshot` (get element refs) → `playwright-cli click/type/fill ...` → `playwright-cli screenshot --filename=...`. See `references/` for deep guides (tests, request mocking, sessions, storage, tracing, video).

### Mandated loop for UI changes (see root AGENTS.md)

After every page/UI change: open the page in a browser, take a screenshot, actually look at the rendered image, fix anything broken before reporting back, then show the user a before/after screenshot.
