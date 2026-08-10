import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/features/theme/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-background/80 text-foreground transition hover:bg-surface-hover hover:border-primary/40 cursor-pointer shadow-sm"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4.5 w-4.5 text-warning" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-primary" />
      )}
    </button>
  );
};
