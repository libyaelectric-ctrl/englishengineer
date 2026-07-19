import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppStore } from '@/store/app.store';

export const ThemeToggle = () => {
  const theme = useAppStore((s) => s.theme);
  const autoTheme = useAppStore((s) => s.autoTheme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setAutoTheme = useAppStore((s) => s.setAutoTheme);

  const cycleTheme = () => {
    if (autoTheme) {
      setAutoTheme(false);
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setAutoTheme(true);
    }
  };

  const getIcon = () => {
    if (autoTheme) return <Monitor className="h-4 w-4" />;
    if (theme === 'dark') return <Sun className="h-4 w-4" />;
    return <Moon className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (autoTheme) return 'Auto (based on time)';
    if (theme === 'dark') return 'Switch to light mode';
    return 'Switch to dark mode';
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover transition-colors"
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
};
