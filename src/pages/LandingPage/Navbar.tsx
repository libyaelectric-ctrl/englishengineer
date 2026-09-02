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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        {/* Duolingo-style compact bar */}
        <div className="flex items-center gap-2 py-1.5 h-11 sm:h-12">
          {/* ── Left: Logo + Language ── */}
          <Link to="/" className="flex items-center gap-1.5 group cursor-pointer shrink-0">
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
          </Link>

          {/* ── Language Selector (compact) ── */}
          <div className="relative" ref={langRef}>
            <button
              ref={langBtnRef}
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-lg border border-border-soft bg-surface px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-sm transition-colors cursor-pointer hover:bg-surface-hover"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Select language"
            >
              <Globe className="h-3.5 w-3.5 text-muted-copy" />
              <span className="text-sm sm:text-base leading-none">{currentLang?.flag || '🌐'}</span>
              <span className="hidden sm:inline text-xs font-medium text-muted-copy">
                {currentLang?.id ? currentLang.id.toUpperCase() : 'EN'}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-muted-copy transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langOpen && (
              <div className="absolute left-0 mt-1 w-44 origin-top-left rounded-lg border border-border-soft bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
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

          {/* ── Right: Demo + Theme + Auth (compact) ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Try Demo Button */}
            <button
              type="button"
              onClick={enterDemo}
              className="hidden sm:inline-flex items-center rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {translate('landing.tryDemo')}
            </button>

            {/* Theme Toggle - compact */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center h-8 w-8 sm:h-7 sm:w-7 justify-center rounded-lg border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-600" />
              )}
            </button>

            {/* Auth Controls */}
            {!isAuthPage && <ClerkAuthControls />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
