# EngineerOS | Foundation Lock Candidate

This document establishes the official architectural baseline and structural specification of the **EngineerOS** platform. All foundational systems, type contracts, storage safeguards, and modular layout rules are locked under this specification.

---

## 1. Status: Foundation Lock Candidate

The codebase has undergone **Foundation Hardening** and meets the following baseline criteria:

- **Zero Stray Dependencies**: Removed all unused SDKs (`@google/genai`, `express`, `dotenv`, `motion`) to maintain a lightweight frontend bundle.
- **Hermetic & Guarded Storage**: Enforced strict generics and fully try-catch guarded execution blocks inside `src/shared/storage` to prevent crashes in sandboxed and iframe environments.
- **Separation of Concerns**: Extracted layout modules (`Sidebar`, `Topbar`, `Navigation`) from the root `AppShell` container.
- **Provider Layer**: Unified state, error boundary, and custom thematic overrides under a root `<AppProvider>` layer.
- **Strict Typechecking**: Enforced absolute strict compiler compliance within `tsconfig.json`.

---

## 2. Architecture Overview

```text
       [ document.documentElement (Dark/Light Classes) ]
                             ▲
                             │ (Thematic Sync)
              [ src/providers/ThemeProvider.tsx ]
                             ▲
                             │
              [ src/providers/AppProvider.tsx ] ◄─── [ src/providers/ErrorBoundaryProvider.tsx ]
                             ▲
                             │
                      [ src/App.tsx ]
                             ▲
                             │
                    [ src/main.tsx ]
```

### Key Sub-systems:

1. **Core State Store (`src/store/app.store.ts`)**:
   - Standardized Zustand store managing navigation drawers, sidebar flags, and system theme modes (`dark` | `light`).
   - Theme configuration is reactively mirrored to `localStorage` through namespace-guarded write operations (`eos_theme`).

2. **Storage Sub-system (`src/shared/storage/index.ts`)**:
   - Robust generic interface `storage.get<T>(key)` and `storage.set<T>(key, value)`.
   - Complete try-catch coverage which handles browser-blocked storage permissions inside restricted iframes gracefully without failing.

3. **Core Layout Elements (`src/shared/layout/*`)**:
   - `Sidebar.tsx`: Handles vertical branding, mobile navigation overlays, and responsive side rails.
   - `Topbar.tsx`: Hosts profile links, global indices search inputs, and system diagnostic indicators.
   - `Navigation.tsx`: Renders reactive `NavLink` items grouped by functional areas ("Core", "Modules", "System", "Registry").
   - `AppShell.tsx`: High-fidelity container organizing layout segments and hosting standard Router viewports (`<Outlet />`).

---

## 3. Registered Client Routes

The system implements 11 standard browser routes mapped to modular UI layouts:

| Route Path      | Associated Page Component | Description / Function                                                        |
| :-------------- | :------------------------ | :---------------------------------------------------------------------------- |
| `/dashboard`    | `DashboardPage.tsx`       | Main command center showcasing cognitive benchmarks and calibration grids.    |
| `/profile`      | `ProfilePage.tsx`         | Developer identity center mapping neural parameters and vocabulary scores.    |
| `/speaking`     | `SpeakingPage.tsx`        | Linguistic sub-system for vocal calibration and microphone validation checks. |
| `/reading`      | `ReadingPage.tsx`         | Technical comprehension module for system architecture pitches & RFC checks.  |
| `/writing`      | `WritingPage.tsx`         | Code documentation analyzer and engineering write-up helper.                  |
| `/listening`    | `ListeningPage.tsx`       | Engineering vocabulary and syntax listener workspace.                         |
| `/ai`           | `AIPage.tsx`              | Interactive generative playground for neural language analysis.               |
| `/analytics`    | `AnalyticsPage.tsx`       | Data charts and progress analysis reports.                                    |
| `/gamification` | `GamificationPage.tsx`    | Milestones, streak indicators, and engineering achievement registries.        |
| `/curriculum`   | `CurriculumPage.tsx`      | Modular development maps and cognitive study tracks.                          |
| `/offline`      | `OfflinePage.tsx`         | Local asset status checks and persistent caching indicators.                  |

---

## 4. Shared Component Catalog

These atomic components reside under `src/shared/components` to enforce unified visual guidelines:

- `Button.tsx`: High-contrast actionable button styled with transition effects.
- `Card.tsx`: Deep slate container panels styled with responsive borders.
- `Container.tsx`: Standard structural grid container keeping desktop visual margins balanced.
- `EmptyState.tsx`: High-fidelity fallback display for uninitialized collections.
- `MetricCard.tsx`: Numeric indicator panel pairing a visual metric with trend progress.
- `PageHeader.tsx`: Title headings, subtitles, and contextual actions.
- `ProgressBar.tsx`: Visual feedback metric for user progress.
- `SectionCard.tsx`: Segmented sub-layout containers for visual rhythm.

---

## 5. Future Roadmap & Sprint Areas

Under subsequent iterations, the following areas will be expanded on top of this hardened foundation:

1. **Interactive Audio Calibration**: Upgrade speaking check panels with live analyzer grids.
2. **Cognitive Game Modes**: Integrate timed diagnostic tests for technical vocabulary comprehension.
3. **Drafting Playgrounds**: Create real-time side-by-side PR editors with linguistic score bars.
