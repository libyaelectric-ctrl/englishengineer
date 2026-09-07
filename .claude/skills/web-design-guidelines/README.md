# web-design-guidelines (Vercel Web Interface Guidelines)

Project-level skill that audits UI code against Vercel's **Web Interface Guidelines** — accessibility, focus states, forms, animation, typography, touch & interaction, layout, theming, i18n, hydration safety and performance.

## Provenance

| Field        | Value                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill        | `web-design-guidelines` from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`skills/web-design-guidelines`), author: Vercel    |
| Rules source | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) — also published at https://vercel.com/design/guidelines |
| Installed    | 2026-09-07, mirroring upstream `main` at that date                                                                                                       |
| License      | No license file in upstream repo at install time; content © Vercel, used for project-internal review                                                     |

`SKILL.md` is the upstream file verbatim — it instructs the agent to fetch fresh rules from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` before each review. Agents without web access should use the pinned copy in `references/web-interface-guidelines.md` instead.

## Usage

Ask the agent to audit a page/file against the Web Interface Guidelines. Findings must be grouped by file with `file:line` locations. When the user requests it, present findings as a 3-column table — `sorun | neden sorun | düzeltilmiş hali` — and apply no fixes until the user approves.
