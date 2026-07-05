# Plan: Rewrite BusinessPage.tsx to TRAE Work Clean Minimal Style

## Objective
Rewrite BusinessPage.tsx to match the TRAE Work clean minimal style, replacing all hardcoded color classes with theme variables while keeping functionality identical.

## File to Modify
- `src/pages/BusinessPage.tsx`

## Color Replacement Mapping

### Slate Colors
| Current Class | Theme Variable | Usage |
|---------------|----------------|-------|
| `slate-50` | `surface-hover` | Backgrounds, light fills |
| `slate-100` | `surface-hover` | Progress bar backgrounds |
| `slate-200` | `border-soft` | Borders |
| `slate-300` | `border-hover` | Hover borders (if any) |
| `slate-400/500/600` | `muted-copy` | Secondary text |
| `slate-700/800/900/950` | `foreground` | Primary text |

### Blue/Sky Colors (→ primary)
| Current Class | Theme Variable |
|---------------|----------------|
| `sky-500` | `primary` |
| `sky-700` | `primary` |
| Any `blue-*` | `primary` |

### Amber Colors (→ warning)
| Current Class | Theme Variable |
|---------------|----------------|
| `amber-50` | `warning/10` (bg with opacity) |
| `amber-200` | `warning/30` (border with opacity) |
| `amber-800/900` | `warning` (text) |

### Other Colors
| Current Class | Theme Variable |
|---------------|----------------|
| `emerald-*` | `success` |

## Typography Changes
| Current | New |
|---------|-----|
| `font-black` | `font-medium` |
| `font-bold` | `font-medium` |

## Border Radius Changes
| Element | Current | New |
|---------|---------|-----|
| Cards (`.public-card`) | `rounded-[12px]` | `rounded-xl` |
| Buttons | varies | `rounded-lg` |
| Inputs | varies | `rounded-lg` |
| Inner metric boxes | `rounded-[12px]` | `rounded-xl` |

## Gradients & Shadows
- Remove any gradient backgrounds (none present in this file)
- Remove heavy shadows if any (none present)

## Section-by-Section Changes

### Hero Section (line 72-154)
1. `border-slate-200` → `border-border-soft`
2. `bg-slate-50` → `bg-surface-hover`
3. `text-slate-600` → `text-muted-copy`
4. `font-black` → `font-medium`
5. Demo data badge: `border-amber-200 bg-amber-50 text-amber-800` → `border-warning/30 bg-warning/10 text-warning`
6. Warning callout: `border-amber-200 bg-amber-50 text-amber-900` → `border-warning/30 bg-warning/10 text-warning`
7. Card border: `border-slate-200` → `border-border-soft`
8. Card inner bg: `bg-slate-50` → `bg-surface-hover`
9. `font-bold` → `font-medium`
10. `text-slate-500` → `text-muted-copy`
11. `rounded-[12px]` → `rounded-xl`
12. Progress bar: `bg-slate-100` → `bg-surface-hover`, `bg-sky-500` → `bg-primary`

### Use Cases Section (line 156-175)
1. `border-slate-200` → `border-border-soft`
2. `text-sky-700` → `text-primary`
3. `font-bold` → `font-medium`
4. `text-slate-600` → `text-muted-copy`
5. Cards already use `.public-card` class

### Benefits Section (line 177-193)
1. `bg-slate-50` → `bg-surface-hover`
2. `text-sky-700` → `text-primary`
3. `font-bold` → `font-medium`
4. `text-slate-600` → `text-muted-copy`

## Implementation Steps
1. Replace all color classes per mapping above
2. Replace all `font-black` and `font-bold` with `font-medium`
3. Replace `rounded-[12px]` with `rounded-xl`
4. Verify no gradients or heavy shadows remain
5. Keep all functionality, structure, and data arrays unchanged

## Verification
- Run TypeScript check to ensure no type errors
- Visually compare with other TRAE-styled pages (PlacementPage, BetaProgramPage, etc.)
- Ensure dark mode support works via CSS variables (no hardcoded colors)
