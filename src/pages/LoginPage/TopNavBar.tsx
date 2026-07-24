import { Moon, Sun, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/app.store';

export const TopNavBar = () => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-border-soft/80 bg-surface/90 backdrop-blur-2xl py-3.5 shadow-md">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        {/* Crisp High-Contrast Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-cyan-500 p-0.5 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors font-sans">
              EngVox
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary font-mono shadow-inner">
              v1.4.1
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-soft bg-background/80 text-foreground transition hover:bg-surface-hover hover:border-primary/40 cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-warning" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-primary" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
