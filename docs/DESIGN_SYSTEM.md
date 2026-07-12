# Design System

## Overview

EngineerOS uses a consistent design system built with Tailwind CSS, React components, and Storybook.

## Brand Colors

### Primary Colors

| Color         | Hex       | Usage                         |
| ------------- | --------- | ----------------------------- |
| Primary       | `#3B82F6` | Buttons, links, active states |
| Primary Dark  | `#1D4ED8` | Hover states                  |
| Primary Light | `#93C5FD` | Backgrounds, accents          |

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
| Success | `#10B981` | Success messages, completed |
| Warning | `#F59E0B` | Warnings, pending           |
| Error   | `#EF4444` | Errors, destructive actions |
| Info    | `#3B82F6` | Informational messages      |

## Typography

### Font Family

```css
font-family:
  'Inter',
  system-ui,
  -apple-system,
  sans-serif;
```

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
// Primary Button
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
  Click me
</button>

// Secondary Button
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
  Secondary
</button>

// Danger Button
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
  Delete
</button>
```

### Cards

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here.</p>
</div>
```

### Forms

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text..."
/>
```

## Accessibility

### Color Contrast

All text meets WCAG 2.1 AA contrast requirements:

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid #3b82f6;
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

Uses Tailwind's dark mode with class strategy:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

### Color Overrides

| Element    | Light      | Dark       |
| ---------- | ---------- | ---------- |
| Background | `white`    | `gray-900` |
| Text       | `gray-900` | `white`    |
| Border     | `gray-200` | `gray-700` |
| Card       | `white`    | `gray-800` |

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

<Home className="w-5 h-5" />
<Settings className="w-6 h-6 text-gray-500" />
<User className="w-4 h-4 text-blue-500" />
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

- **Date:** 2026-07-12
- **Version:** 1.0
