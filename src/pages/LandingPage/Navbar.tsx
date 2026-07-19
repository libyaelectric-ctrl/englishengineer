import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { APP_VERSION } from './constants';
import { useAppStore } from '@/store/app.store';

export function Navbar() {
  const theme = useAppStore((s) => s.theme);
  const autoTheme = useAppStore((s) => s.autoTheme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setAutoTheme = useAppStore((s) => s.setAutoTheme);

  return (
    <nav className="dark:bg-[#0B0E14]/80 fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[#d9d9e3] bg-[#faf8ff]/80 py-4 backdrop-blur-xl dark:border-[#2a2d35]">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-black uppercase text-black/70 tracking-tight dark:text-[#E2E4E7]"
        >
          EngVox
          <span className="text-[9px] font-medium text-black/40 dark:text-[#949BA4]">
            v{APP_VERSION}
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-wider text-muted-copy md:flex">
          <Link to="/pricing" className="transition-colors hover:text-black dark:hover:text-[#E2E4E7]">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              if (autoTheme) {
                setAutoTheme(false);
                setTheme(theme === 'dark' ? 'light' : 'dark');
              } else {
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }
            }}
            title={autoTheme ? `Auto (${theme === 'dark' ? 'Night' : 'Day'}) — Click to manual` : `Manual — Click to auto`}
            className="relative flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#d9d9e3] bg-white/60 text-black/60 transition hover:bg-black/[0.04] dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#949BA4] dark:hover:bg-[#252830] cursor-pointer"
          >
            {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            {autoTheme && (
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#0047bb] dark:bg-[#3b82f6]" />
            )}
          </button>
          <Link
            to="/login"
            className="rounded-[4px] border border-black/10 px-5 py-2.5 text-xs font-bold uppercase text-black/60 transition hover:bg-black/[0.04] dark:border-[#2a2d35] dark:text-[#949BA4] dark:hover:bg-[#252830]"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
