import { Clock3, Moon, Sun } from 'lucide-react';

import { useThemeToggle } from './CommandPalette/useThemeToggle';

export const ThemeToggle = () => {
  const { currentTheme: theme, isAuto, toggleTheme, resetToAuto } = useThemeToggle();
  const label = isAuto
    ? `Auto theme is using ${theme} mode. Click to switch manually.`
    : theme === 'dark'
      ? 'Dark mode active. Click to switch to light mode.'
      : 'Light mode active. Click to switch to dark mode.';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onDoubleClick={resetToAuto}
      title={`${label} Double click: Auto.`}
      className="group inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-border-soft bg-surface-solid px-2.5 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
      aria-label={label}
    >
      {isAuto && <Clock3 className="h-3.5 w-3.5 text-muted-copy" aria-hidden="true" />}
      {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-warning" /> : <Moon className="h-4.5 w-4.5 text-primary" />}
    </button>
  );
};
