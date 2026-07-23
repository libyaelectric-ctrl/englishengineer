# Changelog

## [4.1.0] - 2025-07-23

### Added
- Frontend contract layer for API response type safety
- Cross-feature event handlers (vocabulary → learning, speaking → gamification)
- ServiceRegistry for dependency injection
- PageErrorBoundary for per-page error handling
- Feature flag activation in ProgressCockpit
- Error boundary unit tests (5 tests)
- Service worker with stale-while-revalidate cache strategy
- Sentry Lite wrapper (357KB → 0.04KB)
- 26 accessibility tests (axe-core + component tests)
- CSP meta tag in index.html
- Security audit script in CI
- Lighthouse CI workflow
- CODEOWNERS file
- CONTRIBUTING.md with development guidelines
- Swagger API docs for missing endpoints

### Fixed
- Memory leaks in main.tsx, Toast, sync-queue
- Accessibility warnings (jsx-a11y) in 4 files
- Navigation config test updated for Team entry
- Bundle splitting circular dependency (core/shared)

### Changed
- VocabSidebar polling interval: 1s → 5s
- Sentry init: immediate → requestIdleCallback
- Vocabulary data: static import → lazy import
- Font loading: preload removed, weights optimized
- Bundle budget: 500KB → JS 2MB / CSS 200KB

### Removed
- 2,500+ lines of dead code (hooks, components, utilities)
- Redundant deploy workflow (Vercel auto-deploys)
- Unused EngVoxMascot directory
- Unused feature hooks barrels
- Superseded feature-flags module

## [4.0.1] - 2025-07-01

### Added
- Express API with health endpoints
- Server-side AI provider adapters
- Stripe billing integration
- Supabase authentication
- Mobile bottom navigation
- Offline learning mode

### Fixed
- Initial release stability issues
- Audio file format conversion (WAV → MP3)
