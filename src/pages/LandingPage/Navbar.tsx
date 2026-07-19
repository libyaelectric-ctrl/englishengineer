import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { APP_VERSION } from './constants';
import { useAppStore } from '@/store/app.store';

export function Navbar() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <nav className="dark:bg-[#0B0E14]/80 fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[#E9ECEF] bg-white/80 py-4 backdrop-blur-xl dark:border-[#2a2d35]">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-black uppercase text-[#1c1d22]/70 tracking-tight dark:text-[#E2E4E7]"
        >
          EngVox
          <span className="text-[9px] font-medium text-[#1c1d22]/40 dark:text-[#949BA4]">
            v{APP_VERSION}
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-wider md:flex">
          <Link to="/pricing" className="text-[#5b5d72] transition-colors hover:text-[#1c1d22] dark:text-[#949BA4] dark:hover:text-[#E2E4E7]">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#E9ECEF] bg-white text-[#5b5d72] transition hover:bg-[#F1F3F5] dark:border-[#2a2d35] dark:bg-[#1C1F26] dark:text-[#949BA4] dark:hover:bg-[#252830] cursor-pointer"
          >
            {theme === 'dark' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          <Link
            to="/login"
            className="rounded-[4px] border border-[#E9ECEF] px-5 py-2.5 text-xs font-bold uppercase text-[#5b5d72] transition hover:bg-[#F1F3F5] dark:border-[#2a2d35] dark:text-[#949BA4] dark:hover:bg-[#252830]"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
