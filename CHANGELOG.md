# Changelog

All notable changes to EngVox will be documented in this file.

## [4.1.0] - 2026-07-06

### Added

- Sidebar dropdown navigation for Skills, Learning Hub, Tools, and Profile
- Sub-route system: `/profile/:section`, `/curriculum/:section`, `/tools/:section`
- Video demo section on landing page
- Playwright E2E tests: landing page, health endpoint, Stripe billing, accessibility
- Global rate limiter on backend `/api` prefix
- PostHog analytics provider (`VITE_PRODUCT_ANALYTICS_PROVIDER=posthog`)
- Skip-to-content accessibility link on landing page
- axe-core accessibility testing integration

### Changed

- Internal pages (Profile, Curriculum, Tools) no longer show tab navigation — controlled via sidebar
- Background image (`arkaplan.png`) restricted to public pages only (landing, pricing, login)
- Opacity reduced to 5% for subtle texture
- Sidebar mascot: `h-28`, no opacity reduction, "Your AI Coach" label
- All hardcoded colors (`bg-white`, `text-slate-*`, `border-slate-*`) replaced with theme tokens
- `chunkSizeWarningLimit` raised to 3500KB for lazy-loaded seed data

### Fixed

- Background invisible due to `bg-slate-50` on body tag in `index.html`
- ToolsPage tabs removed — now route-based
- VocabularyPage and WritingPage color inconsistencies resolved

## [4.0.1] - 2026-07-05

### Added

- Gemini AI provider support
- Audio player for listening exercises
- Test coverage expansion

### Changed

- Rebranded from EngVox to EngVox
- Landing page redesigned with 3-plan pricing

## [4.0.0] - 2026-07-04

### Added

- Full billing integration (Stripe checkout, portal, webhooks)
- Team management features
- Learning intelligence module
- Gamification system (XP, ELO, achievements)
- PWA support
- Multi-language support (TR/EN)
