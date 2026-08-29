import { ArrowLeft, Menu, Moon, Sun, X } from 'lucide-react';

import { useState } from 'react';

import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/shared/utils/cn';

import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';
import { useTheme } from '@/features/theme/ThemeProvider';

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Teams', href: '/business' },
];

const FloatingBackToHome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show on landing page or dashboard routes
  if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) return null;

  const handleBackToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleBackToHome}
      type="button"
      className="fixed bottom-16 right-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/95 text-primary-foreground px-4 py-2 text-xs font-bold shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-primary cursor-pointer group"
      title="Back to top of Landing Page"
      aria-label="Back to top of Landing Page"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span>Back to Home</span>
    </button>
  );
};

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isPricing = location.pathname === '/pricing';
  const isOnboard = location.pathname === '/onboard';
  const hideNav = isLanding || isPricing || isOnboard;
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="public-shell min-h-screen bg-transparent text-foreground relative pb-16">
      {/* Hide nav on landing and pricing pages - they have their own glass morphism nav */}
      {!hideNav && (
        <header className="sticky top-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-[10px] py-1 pr-2 transition-colors hover:bg-surface-hover"
              aria-label="EngVox home"
            >
              <img
                src="/brand/logo.svg"
                alt="EngVox"
                className="h-9 w-9 rounded-[var(--radius-card)]"
              />
              <span>
                <strong className="block text-sm text-foreground">EngVox</strong>
                <span className="hidden text-[10px] font-semibold uppercase text-muted-copy sm:block">
                  Your Engineering Voice
                </span>
              </span>
            </Link>
            <nav className="hidden items-center gap-7 md:flex" aria-label="Public navigation">
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
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-soft bg-surface text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                to={CLERK_SIGN_IN_URL}
                className="inline-flex items-center rounded border border-border-soft bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors shadow-sm"
              >
                Log in
              </Link>
              <Link to="/start" className="public-primary-action min-h-10 px-4 py-2">
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
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  <Link to={CLERK_SIGN_IN_URL} className="public-secondary-action px-4 py-3">
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

      <div id="public-content" tabIndex={-1}>
        <Outlet />
      </div>

      {/* Fixed Floating Back to Home Button on All Public Subpages */}
      <FloatingBackToHome />
    </div>
  );
};
