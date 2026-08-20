import { Moon, Sun } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

import { ClerkAuthControls } from '@/features/auth/ClerkAuthControls';
import { useLocalizationStore } from '@/features/localization';
import { useTheme } from '@/features/theme/ThemeProvider';

interface NavbarProps {
  onOpenProofreader?: () => void;
}

export function Navbar({ onOpenProofreader: _ }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { translate } = useLocalizationStore();

  const navItems = [
    { label: translate('landing.navLogin'), href: '/login' },
    { label: translate('landing.tryDemo'), href: '/signup', primary: true },
    { label: translate('landing.navPricing'), href: '/pricing' },
  ];

  return (
    <nav className="fixed top-10 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-2" />
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-card)] border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  item.primary
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                    : 'border-border-soft bg-surface text-foreground hover:bg-surface-hover hover:border-primary/40'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="hidden md:block h-4 w-px bg-border-soft mx-1" />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
            {!isAuthPage && <ClerkAuthControls />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
