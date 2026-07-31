import { PRODUCT_VERSION } from '@/config/product.config';
import { useAppStore } from '@/store/app.store';
import { ArrowLeft, ArrowRight, Moon, Sparkles, Sun } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onDemoClick?: () => void;
}

export function Navbar({ onDemoClick }: NavbarProps) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-border-soft glass py-3 shadow-sm">
      <div className="flex w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <img src="/brand/logo.webp" alt="EngVox Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              EngVox
            </span>
            <div className="flex items-center gap-1.5 rounded bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>v{PRODUCT_VERSION}</span>
            </div>
          </div>
        </Link>

        {isAuthPage ? (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-copy hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        ) : (
          <div className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wider md:flex">
            <a
              href="#disciplines"
              className="text-foreground/90 hover:text-primary transition-colors font-bold"
            >
              Disciplines
            </a>
            <a
              href="#features"
              className="text-foreground/90 hover:text-primary transition-colors font-bold"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-foreground/90 hover:text-primary transition-colors font-bold"
            >
              Workflow
            </a>
            <Link
              to="/pricing"
              className="text-foreground/90 hover:text-primary transition-colors font-bold"
            >
              Pricing
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAuthPage && onDemoClick && (
            <button
              onClick={onDemoClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
              title="Launch Instant Demo Workspace"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Try Demo</span>
            </button>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          {!isAuthPage && (
            <>
              <Link
                to="/login"
                className="inline-flex items-center rounded border border-border-soft bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors shadow-sm"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
