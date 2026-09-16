# Design System

## Overview

EngineerOS uses a consistent design system built with Tailwind CSS, React components, and Storybook.

## Brand Colors

### Primary Colors

The primary color palette uses a distinctive deep engineering blue (`#0047bb`) that differentiates EngineerOS from generic SaaS platforms. This color was chosen to reflect the engineering/construction domain identity.

| Color         | Hex       | Usage                            |
| ------------- | --------- | -------------------------------- |
| Primary       | `#0047bb` | Buttons, links, active states    |
| Primary Dark  | `#003bb3` | Hover states                     |
| Primary Light | `#4d8bf5` | Backgrounds, accents (dark mode) |

### Neutral Colors

| Color    | Hex       | Usage            |
| -------- | --------- | ---------------- |
| Gray 50  | `#F9FAFB` | Background       |
| Gray 100 | `#F3F4F6` | Card backgrounds |
| Gray 200 | `#E5E7EB` | Borders          |
| Gray 500 | `#6B7280` | Secondary text   |
| Gray 900 | `#111827` | Primary text     |

### Semantic Colors

| Color   | Hex       | Usage                       |
| ------- | --------- | --------------------------- |
| Success | `#16a34a` | Success messages, completed |
| Warning | `#ea580c` | Warnings, pending           |
| Error   | `#dc2626` | Errors, destructive actions |
| Info    | `#0047bb` | Informational messages      |

## Typography

### Font Family

```css
font-family: 'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif;
```

Monospace: `'JetBrains Mono'`

### Type Scale

| Name  | Size     | Weight | Usage              |
| ----- | -------- | ------ | ------------------ |
| H1    | 2.25rem  | 700    | Page titles        |
| H2    | 1.875rem | 600    | Section headers    |
| H3    | 1.5rem   | 600    | Subsection headers |
| Body  | 1rem     | 400    | Default text       |
| Small | 0.875rem | 400    | Captions, labels   |
| Tiny  | 0.75rem  | 400    | Helper text        |

## Spacing

Based on Tailwind's default scale:

| Name | Value         |
| ---- | ------------- |
| xs   | 0.25rem (4px) |
| sm   | 0.5rem (8px)  |
| md   | 1rem (16px)   |
| lg   | 1.5rem (24px) |
| xl   | 2rem (32px)   |
| 2xl  | 3rem (48px)   |

## Components

### Buttons

```tsx
import { Button } from '@/shared/components/Button';

// Primary Button
<Button variant="primary">Click me</Button>

// Secondary Button
<Button variant="secondary">Secondary</Button>

// Outline Button
<Button variant="outline">Outline</Button>

// Danger Button
<Button variant="danger">Delete</Button>
```

### Cards

```tsx
import { Card } from '@/shared/components/Card';

<Card>
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted-copy">Card content goes here.</p>
</Card>;
```

### Forms

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-border-soft rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:ring-focus"
  placeholder="Enter text..."
/>
```

## Accessibility

### Color Contrast

All text meets WCAG 2.1 AA contrast requirements:

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum

### Focus States

All interactive elements have visible focus indicators using the `focus` semantic token:

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### ARIA Labels

All interactive elements have appropriate ARIA labels:

```tsx
<button aria-label="Close dialog">×</button>
<nav aria-label="Main navigation">...</nav>
```

## Dark Mode

### Implementation

Uses CSS custom properties with `data-theme` attribute and class-based toggling. Theme state is owned by `ThemeProvider`: `auto` follows the OS `prefers-color-scheme` (live, via a `matchMedia` listener) and a stored `light`/`dark` override under `engvox-theme-mode` wins over it:

```tsx
// Theme is toggled via data-theme attribute on <html>
<html data-theme="dark" class="dark">

// Use semantic color tokens — they auto-adapt to theme
<div className="bg-surface text-foreground border-border-soft">
  <p className="text-muted-copy">Content</p>
</div>
```

### Theme Tokens

All colors are defined as CSS custom properties in `index.css` and mapped to Tailwind via `@theme`. Use the semantic token names, not hardcoded colors:

| Token           | Light     | Dark                    |
| --------------- | --------- | ----------------------- |
| `background`    | `#faf8ff` | `#0a0a1a`               |
| `foreground`    | `#0a0a1a` | `#e2e4e7`               |
| `surface`       | `#f3f3fd` | `#1c1f26`               |
| `surface-hover` | `#e8e8f5` | `#252830`               |
| `border-soft`   | `#d9d9e3` | `rgba(51,102,204,0.24)` |
| `primary`       | `#0047bb` | `#3366cc`               |
| `success`       | `#16a34a` | `#22c55e`               |
| `error`         | `#dc2626` | `#ef4444`               |

### Role tokens

A few roles have no surface or accent equivalent, so they get their own token rather than a raw
Tailwind class. Reach for one of these instead of `text-white`, `bg-black`, or a hardcoded hex:

| Token       | Value     | Use for                                                 |
| ----------- | --------- | ------------------------------------------------------- |
| `on-solid`  | `#ffffff` | ink or decoration on a saturated fill (buttons, chips)  |
| `on-bright` | `#020617` | ink on a bright/pastel fill, where white would not read |
| `scrim`     | `#000000` | modal, drawer and overlay backdrops                     |
| `track`     | `#d9d9e3` | the neutral rail behind a coloured indicator            |

### Enforcing the palette

The local ESLint rule `local/no-raw-palette` (`eslint-rules/no-raw-palette.js`) is run by
`npm run lint` and by CI's Code Quality job. It rejects, inside `src/`:

- raw **neutral / achromatic** utilities — `slate`, `gray`, `zinc`, `neutral`, `stone` — plus
  `cyan`, `white` and `black`, across the colour utilities (`bg`, `text`, `border`, `ring`,
  `divide`, `from`, `to`, `via`, `fill`, `stroke`, `placeholder`, `decoration`, `outline`,
  `accent`, `caret`, `shadow`); and
- hardcoded colour literals in those utilities, whether written as hex (`bg-[#d9d9e3]`) or as a
  colour function (`bg-[rgba(0,0,0,.5)]`).

### What the rule does not cover

Stated plainly, so the guarantee is not overstated:

1. **Chromatic accent families.** `emerald`, `amber`, `green`, `red`, `blue`, `teal`, `violet`,
   `orange`, `sky` and friends are out of scope. They do have semantic equivalents (`success`,
   `warning`, `error`, `primary`), and the codebase still paints roughly 200 raw usages of them,
   so policing them today would need a mass migration first.
2. **Inline styles** — `style={{ color: '#fff' }}` is not a class.
3. **Runtime-composed class names** — `'bg-' + shade` cannot be seen statically.

### Exemptions

Where a raw class is genuinely correct — a per-discipline identity gradient, say — annotate that
line and state why:

```ts
// src/features/learning-path/discipline-palette.ts
{ id: 'verfahrenstechnik', gradient: 'from-amber-700/90 to-stone-800' }, // palette-exempt: discipline identity gradient
```

- The comment must sit on **the same line as the class**. A comment on a neighbouring line exempts
  nothing, so an exemption can never cover a line it was not written for.
- The reason must be at least 12 characters. A missing or too-short reason is reported and does
  **not** suppress the violation.
- A directive that exempts nothing is reported as unused, so an exemption cannot rot into a silent
  no-op after the class it annotated has been migrated.
- There is no file-level switch, by design.

Behaviour is pinned by `eslint-rules/no-raw-palette.test.js` (run by `npm test`), including the
per-line scope, the reason rules and the boundaries listed above.

### Border Radius Tokens

Defined as CSS custom properties and mapped to Tailwind:

| Token             | Value |
| ----------------- | ----- |
| `--radius-button` | 4px   |
| `--radius-input`  | 4px   |
| `--radius-card`   | 4px   |
| `--radius-dialog` | 4px   |

## Responsive Breakpoints

| Name | Width  | Usage            |
| ---- | ------ | ---------------- |
| sm   | 640px  | Mobile landscape |
| md   | 768px  | Tablet           |
| lg   | 1024px | Desktop          |
| xl   | 1280px | Large desktop    |
| 2xl  | 1536px | Extra large      |

## Storybook

### Running Storybook

```bash
npm run storybook
```

### Adding a Story

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};
```

## Iconography

Using Lucide React icons:

```tsx
import { Home, Settings, User } from 'lucide-react';

<Home className="w-5 h-5 text-foreground" />
<Settings className="w-6 h-6 text-muted-copy" />
<User className="w-4 h-4 text-primary" />
```

## Animations

Using Framer Motion (motion package):

```tsx
import { motion } from 'motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>;
```

## Last Updated

- **Date:** 2026-08-02
- **Version:** 2.0
