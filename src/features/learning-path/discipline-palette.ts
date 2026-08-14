import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

/**
 * Original discipline palettes for the Learning Path.
 *
 * Every engineering branch gets its own "industrial" color identity, derived
 * from real-world domain associations (construction amber, terminal green,
 * circuit violet...) rather than a single brand green/blue/yellow set. This
 * keeps the design system legally and visually distinct from other apps.
 */
export interface DisciplinePalette {
  /** Primary accent hex used for interactive elements. */
  primary: string;
  /** Secondary hex used for fills / soft surfaces. */
  secondary: string;
  /** Tailwind gradient classes for stage backgrounds and hero headers. */
  gradient: string;
}

export const DISCIPLINE_PALETTES: Record<EngineeringDiscipline, DisciplinePalette> = {
  architecture: {
    primary: '#B45309', // burnt amber (concrete & timber)
    secondary: '#57534E', // stone gray
    gradient: 'from-amber-700/90 to-stone-800',
  },
  chemical: {
    primary: '#0F766E', // teal (process piping)
    secondary: '#334155', // slate
    gradient: 'from-teal-700 to-slate-800',
  },
  civil: {
    primary: '#C2410C', // safety orange (hard hats / barriers)
    secondary: '#44403C', // asphalt
    gradient: 'from-orange-700 to-stone-900',
  },
  electrical: {
    primary: '#CA8A04', // warning amber (LV/HV signage)
    secondary: '#1C1917', // near black
    gradient: 'from-amber-600 to-zinc-900',
  },
  electronics: {
    primary: '#7C3AED', // circuit violet (PCB silkscreen)
    secondary: '#0F172A', // deep navy
    gradient: 'from-violet-700 to-slate-900',
  },
  hse: {
    primary: '#047857', // emerald (safety / egress)
    secondary: '#F8FAFC', // white
    gradient: 'from-emerald-700 to-slate-800',
  },
  industrial: {
    primary: '#B91C1C', // machinery red
    secondary: '#475569', // machine steel
    gradient: 'from-red-700 to-slate-800',
  },
  mechanical: {
    primary: '#2563EB', // workshop steel blue
    secondary: '#64748B', // chrome gray
    gradient: 'from-blue-700 to-slate-800',
  },
  mechatronics: {
    primary: '#0891B2', // cyan (control signals)
    secondary: '#0F172A', // deep navy
    gradient: 'from-cyan-700 to-slate-900',
  },
  software: {
    primary: '#16A34A', // terminal green on dark
    secondary: '#1E293B', // dark terminal
    gradient: 'from-green-700 to-slate-950',
  },
};

export const getDisciplinePalette = (
  discipline: EngineeringDiscipline
): DisciplinePalette => DISCIPLINE_PALETTES[discipline];

/** Status color mapping for path level nodes (generic progress semantics). */
export const STATUS_COLORS: Record<'locked' | 'available' | 'in-progress' | 'completed', string> = {
  locked: '#57534E',
  available: '#64748B',
  'in-progress': '#D97706',
  completed: '#16A34A',
};
