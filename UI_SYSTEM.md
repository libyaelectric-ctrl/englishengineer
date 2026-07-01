# EngineerOS v4.0.1 UI System

## Direction

EngineerOS uses a calm, light, professional engineering SaaS interface. The product should feel serious, grounded and trustworthy rather than playful, cyberpunk, gaming-oriented or developer-tool oriented.

The visual system is inspired by Linear, Cursor, Stripe Dashboard, Raycast and Apple HIG, without copying any single product.

## Color Philosophy

- Background: off-white and soft blue-gray
- Surfaces: white or very pale blue with thin slate borders
- Card hover: pale blue tint, blue border refinement and a soft shadow
- Primary accent: engineering blue
- Secondary accent: light cyan
- Success: emerald
- Warning: amber
- Danger: red only for real risk/error states

Avoid black hover panels, muddy gray surfaces, purple-heavy palettes, crypto dashboards, gaming colors and excessive glow.

## Radius Rules

- Buttons: 12px
- Inputs: 12px
- Cards: 16px
- Dialogs: 20px

The interface should feel engineered and precise. Avoid toy-like rounded UI.

## Component Style

Shared components carry the premium system:

- `Button`: restrained 12px radius, consistent primary/secondary/outline/ghost/danger/success states, stronger focus state, subtle press feedback
- `Card`: white panel, 16px radius, thin border, soft shadow and restrained glass
- `MetricCard`: executive metric hierarchy with strong numbers
- `SectionCard`: structured enterprise sections with icon header
- `ProgressBar`: solid, low-noise progress with restrained motion
- `EmptyState`: honest informative state without fake confidence
- `LoadingState` / `Skeleton`: premium shimmer placeholders instead of blank route fallbacks
- `StatusBadge`: unified trust labels for mock, offline, backend, billing and browser-mode states
- `Sidebar` / `Topbar`: professional command workspace framing
- `Topbar` status panel: functional learning and local-progress destinations;
  no decorative notification control

The primary product shell keeps five top-level destinations: Home, Learning
Hub, Skills, Tools and Profile. Skill links stay collapsed until requested so a
new learner is not confronted with the whole platform at once.

## Learning Experience

- Every skill starts at A1 and advances independently.
- Home presents one primary next lesson before secondary metrics.
- Learning Hub connects the six skill paths without forcing equal progress.
- Learning Memory summarizes real vocabulary, grammar, repeated mistakes and
  achievements without creating a second state store.
- Grammar exposes named lessons in a visible previous/current/next sequence.
- Tools are grouped by intent: templates and email, fast help and AI Copilot.
- Pricing states who each plan is for, why it costs more and what it excludes.

## Spacing

- Page stacks use 32px rhythm for major sections.
- Cards use 24px inner padding by default.
- Compact controls use 8px to 12px gaps.
- Icon tiles use 12px radius and 16px to 20px visual size depending on hierarchy.
- Section headers keep a clear bottom divider so dense learning pages remain scannable.

## Motion

- Hover states use a pale blue tint, restrained lift, border refinement and soft shadow only. Cards never turn black on hover.
- Button press feedback uses a tiny vertical press instead of playful scaling.
- Loading uses a subtle shimmer and fade-in.
- Scrolling is smooth while the main shell remains visually fixed and stable.
- Tabs, dropdowns, side panels and dialogs use 200ms color, border and transform transitions where movement aids comprehension.
- `prefers-reduced-motion` is respected globally.
- Letter spacing remains neutral so compact labels stay legible on mobile.

## Responsive Integrity

- Shared buttons use safe wrapping and never exceed their parent width.
- Metric values may wrap at a word boundary instead of crossing a card edge.
- Score dialogs use a viewport-bounded scroll area and stack actions on small
  screens.
- The mobile learning navigation reserves safe-area space and the desktop shell
  keeps left, center and right boundaries visible.

## Legacy Surface Policy

Learning pages must use explicit light surface classes in their own source.
EngineerOS does not rely on a broad CSS override to disguise dark legacy
panels. Dark overlays are reserved for modal backdrops and intentional brand
marks; content and evaluation panels remain white, slate or pale blue.

## Trust Indicators

EngineerOS should never pretend. UI should clearly indicate:

- Mock AI mode
- Backend unavailable state
- Local auth mode
- Supabase mode
- Browser speech recognition mode
- Simulated listening mode
- Offline sync pending
- Billing backend not connected

Trust is part of the product quality.

Trust labels should be short, factual and visually consistent. Prefer `StatusBadge` tones:

- `success`: configured, active, synced
- `info`: browser-supported or informational
- `warning`: mock, local, simulation, offline, fallback
- `danger`: backend unavailable, failed, critical
- `neutral`: passive metadata

## Copywriting

Use engineering-focused language:

- engineering English
- site coordination
- commissioning
- inspection
- consultant response
- project communication
- technical report

Avoid unnecessary software jargon such as kernel, neural, protocol, developer profile or distributed systems when it weakens trust.

## Future UI Opportunities

- Replace the last low-risk page-local card styles with shared
  `Card`/`SectionCard` as those pages are touched.
- Add polished upgrade dialog component
- Continue splitting large CEFR seed data below each level boundary without
  duplicating repository state.
- Continue converting older page-local badges to `StatusBadge`
