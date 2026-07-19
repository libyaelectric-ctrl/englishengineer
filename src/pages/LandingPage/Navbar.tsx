import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { APP_VERSION } from './constants';
import { useAppStore } from '@/store/app.store';

export function Navbar() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-border-soft bg-surface/80 py-4 backdrop-blur-xl">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-black uppercase text-foreground/70 tracking-tight"
        >
          EngVox
          <span className="text-[9px] font-medium text-foreground/40">
            v{APP_VERSION}
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-wider text-muted-copy md:flex">
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-border-soft bg-surface text-muted-copy transition hover:bg-surface-hover cursor-pointer"
          >
            {theme === 'dark' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          <Link
            to="/login"
            className="rounded-[4px] border border-border-soft px-5 py-2.5 text-xs font-bold uppercase text-muted-copy transition hover:bg-surface-hover"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
