# AGENTS.md — EngVox (engvox-frontend)

React 19 + Vite + TypeScript + Tailwind CSS 4 web app for engineering English learning ("EngVox"), with an Express backend in `backend/`. UI source lives in `src/` (pages under `src/pages/`, components under `src/shared/`, `src/features/`). Commands: `npm run dev` (port 3000), `npm run typecheck`, `npm test`, `npm run e2e:browser` (Playwright).

## Agent skills installed in this project

Project-level skills live under `.claude/skills/` (Claude Code / Copilot skill format). Read the matching skill(s) before the relevant work — do not skip them:

- `.claude/skills/design-taste/` — design taste for building/polishing UI: typography, color, spacing, layout, motion, component states, accessibility, anti-"AI-slop" rules, pre-flight checklist (read `SKILL.md`, then the `reference/` file relevant to the task).
- `.claude/skills/web-design-guidelines/` — Vercel Web Interface Guidelines audit skill. Rules pinned in `references/web-interface-guidelines.md` (refresh from the live URL when web access exists).
- `.claude/skills/playwright-cli/` — browser automation through `playwright-cli` (installed locally as `@playwright/cli`).

## UI & design work — mandatory flow

1. **Read the brief first.** Before touching code, state a one-line Design Read (page kind, audience, vibe, design system family) and set the three dials (design variance, motion intensity, visual density) per design-taste.
2. **Design with the rules on.** Apply the design-taste core rules plus the Vercel Web Interface Guidelines (accessibility, visible focus, forms, animation, typography, touch targets, performance).
3. **Never ship the first version.** Critique your own output with fresh eyes and refine before reporting done; run the design-taste pre-flight checklist before declaring a UI task finished.
4. **UI audits.** When asked to audit/denetle a page or file, list every finding in a 3-column table — `sorun | neden sorun | düzeltilmiş hali` — with `file:line` locations. **Do not apply fixes until the user approves them.**

## After every page/UI change — visual verification loop

1. Start the app (`npm run dev`) and open the changed page in a browser (playwright-cli or the environment's browser tooling).
2. Take a screenshot and actually look at the rendered page — layout, overlaps, spacing, broken states.
3. If anything is broken or off, fix it first. Do not tell the user a visual change is done without having seen the rendered result.
4. Show the user before/after screenshots of the page.

Never claim a UI change works without visually verifying the rendered page.
