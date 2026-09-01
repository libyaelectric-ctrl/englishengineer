import { PRODUCT_VERSION } from '@/config/product.config';
import { useAuth } from '@clerk/clerk-react';
import { ChevronDown, Globe, Moon, Sun } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { ClerkAuthControls } from '@/features/auth/ClerkAuthControls';
import { useAuthStore } from '@/features/auth/auth.store';
import { CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '@/features/auth/clerk.config';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import { useTheme } from '@/features/theme/ThemeProvider';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const isAuthPage =
    location.pathname === CLERK_SIGN_IN_URL || location.pathname === CLERK_SIGN_UP_URL;
  const { language, setLanguage, translate } = useLocalizationStore();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);

  // Redirect signed-in users away from landing page, but NOT from /pricing
  // — authenticated users need /pricing to upgrade their plan.
  useEffect(() => {
    if (isSignedIn && location.pathname !== '/pricing') {
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, navigate, location.pathname]);

  const currentLang = INTERFACE_LANGUAGES.find((l) => l.id === language) || INTERFACE_LANGUAGES[0];

  const enterDemo = () => {
    const demoId = `demo_engineer_${Date.now()}`;
    storage.setUserId(demoId);
    useAuthStore.setState({
      currentUser: {
        id: demoId,
        displayName: 'Demo Engineer',
        email: 'demo@engvox.com',
        role: 'engineer',
        isSuperUser: false,
        engineeringDiscipline: '',
        targetLevel: '',
        location: '',
        avatarInitials: 'DE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useBillingStore.getState().setSubscription({
      planId: 'free',
      status: 'none',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      updatedAt: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node) &&
        langBtnRef.current &&
        !langBtnRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2 h-11">
          {/* ── Left: Logo ── */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <img
                src="/brand/logo.svg"
                alt="EngVox"
                className="h-full w-full object-cover"
                width="48"
                height="48"
              />
            </div>
            <span className="hidden sm:inline text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              EngVox
            </span>
            <span className="hidden sm:inline rounded bg-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              v{PRODUCT_VERSION}
            </span>
          </Link>

          {/* ── Language Selector ── */}
          <div className="relative" ref={langRef}>
            <button
              ref={langBtnRef}
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface px-2.5 py-1.5 sm:px-2 sm:py-1 text-sm transition-colors cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Select language"
            >
              <Globe className="h-4 w-4 text-muted-copy" />
              <span className="text-base sm:text-sm">{currentLang?.flag || '🌐'}</span>
              <span className="hidden sm:inline text-sm font-medium">
                {currentLang?.id ? currentLang.id.toUpperCase() : 'EN'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-copy transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langOpen && (
              <div className="absolute left-0 mt-1 w-44 origin-top-left rounded-[var(--radius-card)] border border-border-soft bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
                <ul className="py-1" role="listbox">
                  {INTERFACE_LANGUAGES.map((lang) => (
                    <li key={lang.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={language === lang.id}
                        onClick={() => {
                          setLanguage(lang.id);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          language === lang.id
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-foreground hover:bg-surface'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="font-medium">{lang.nativeLabel}</span>
                        <span className="ml-auto text-[10px] text-muted-copy">{lang.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Nav Links + Theme + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Try Demo Button */}
            <button
              type="button"
              onClick={enterDemo}
              className="inline-flex items-center rounded border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs sm:text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {translate('landing.tryDemo')}
            </button>

            {/* Theme Toggle - shows both states with active highlighted */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1 h-8 sm:h-7 px-2 sm:px-1.5 rounded-[var(--radius-card)] border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span
                className={`flex items-center justify-center h-5 w-5 rounded transition-colors ${
                  theme === 'dark' ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </span>
              <span
                className={`flex items-center justify-center h-5 w-5 rounded transition-colors ${
                  theme === 'light' ? 'text-slate-600' : 'text-muted-foreground'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </span>
              <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </button>

            {!isAuthPage && <ClerkAuthControls />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
