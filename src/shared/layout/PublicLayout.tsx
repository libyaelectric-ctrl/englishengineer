import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useAppStore } from '@/store/app.store';

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Teams', href: '/business' },
];

import { EngVoxMascotCompanion } from '@/shared/components/EngVoxMascot';

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <div className="public-shell min-h-screen bg-transparent text-foreground">
      <a
        href="#public-content"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-[10px] bg-foreground px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Hide nav on landing page - landing has its own glass morphism nav */}
      {!isLanding && (
        <header className="sticky top-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-[10px] py-1 pr-2 transition-colors hover:bg-surface-hover"
              aria-label="EngVox home"
            >
              <img
                src="/brand/logo.webp"
                alt="EngVox"
                className="h-9 w-9 rounded-lg"
              />
              <span>
                <strong className="block text-sm text-foreground">
                  EngVox
                </strong>
                <span className="hidden text-[10px] font-semibold uppercase text-muted-copy sm:block">
                  Your Engineering Voice
                </span>
              </span>
            </Link>
            <nav
              className="hidden items-center gap-7 md:flex"
              aria-label="Public navigation"
            >
              {links.map((item) =>
                item.href.startsWith('/#') ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-[10px] px-2 py-2 text-sm font-semibold text-muted-copy transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    {item.label}
                  </a>
                ) : (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'rounded-[10px] px-2 py-2 text-sm font-semibold text-muted-copy transition-colors hover:bg-primary/5 hover:text-primary',
                        isActive && 'bg-primary/5 text-primary'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-soft bg-surface text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
                aria-label={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center rounded-[10px] px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
              >
                Log in
              </Link>
              <Link
                to="/start"
                className="public-primary-action min-h-10 px-4 py-2"
              >
                Start free
              </Link>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-border-soft bg-surface text-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
          {mobileOpen && (
            <nav
              className="border-t border-border-soft bg-background px-4 py-4 md:hidden"
              aria-label="Mobile public navigation"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-[10px] px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border-soft pt-4">
                  <Link
                    to="/login"
                    className="public-secondary-action px-4 py-3"
                  >
                    Log in
                  </Link>
                  <Link to="/start" className="public-primary-action px-4 py-3">
                    Start free
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </header>
      )}

      {/* Hide footer on landing page */}
      {!isLanding && (
        <footer className="border-t border-border-soft bg-surface/80">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-muted-copy">&copy; 2026 EngVox</p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-copy">
                <Link className="hover:text-foreground" to="/pricing">
                  Pricing
                </Link>
                <Link className="hover:text-foreground" to="/business">
                  Teams
                </Link>
                <Link className="hover:text-foreground" to="/legal/privacy">
                  Privacy
                </Link>
                <Link className="hover:text-foreground" to="/legal/terms">
                  Terms
                </Link>
                <Link className="hover:text-foreground" to="/legal/cookies">
                  Cookies
                </Link>
                <Link className="hover:text-foreground" to="/legal/refund">
                  Refunds
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      <div id="public-content" tabIndex={-1}>
        <Outlet />
      </div>
      <EngVoxMascotCompanion />
    </div>
  );
};
