import { ChevronDown, Globe, Moon, Sun } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { AuthControls } from '@/features/auth/AuthControls';
import { useFirebaseAuth } from '@/features/auth/FirebaseAuth';
import { useAuthStore } from '@/features/auth/auth.store';
import { AUTH_SIGN_IN_URL, AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';
import { useBillingStore } from '@/features/billing';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import { useTheme } from '@/features/theme/ThemeProvider';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useFirebaseAuth();
  const isAuthPage =
    location.pathname === AUTH_SIGN_IN_URL || location.pathname === AUTH_SIGN_UP_URL;
  const { language, setLanguage, translate } = useLocalizationStore();
  const [langOpen, setLangOpen] = useState(false);
  const [activeLangId, setActiveLangId] = useState<string>(language);
  const langRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const langListRef = useRef<HTMLUListElement>(null);
  const listboxId = 'navbar-language-listbox';
  const optionId = (id: string) => `navbar-language-option-${id}`;

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

  // Move DOM focus into the listbox when it opens; keep the current
  // language as the initial active option (WAI-ARIA listbox popup pattern).
  useEffect(() => {
    if (langOpen) {
      setActiveLangId(language);
      langListRef.current?.focus();
    }
  }, [langOpen, language]);

  const openListbox = () => {
    setActiveLangId(language);
    setLangOpen(true);
  };

  const closeListbox = (focusTrigger = true) => {
    setLangOpen(false);
    if (focusTrigger) langBtnRef.current?.focus();
  };

  const selectLanguage = (id: string) => {
    setLanguage(id as (typeof INTERFACE_LANGUAGES)[number]['id']);
    closeListbox();
  };

  // Keyboard interaction per WAI-ARIA APG "Listbox Popup": the listbox
  // holds focus; aria-activedescendant names the active option.
  const onListboxKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const options = INTERFACE_LANGUAGES;
    const currentIndex = options.findIndex((l) => l.id === activeLangId);
    let nextIndex = -1;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeListbox();
      return;
    }
    if (event.key === 'Tab') {
      // Let focus leave the popup naturally; close it first.
      setLangOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (activeLangId) selectLanguage(activeLangId);
      return;
    }
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.length;
    else if (event.key === 'ArrowUp')
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else if (/^[a-zA-Z]$/.test(event.key)) {
      // Type-ahead: jump to the first option whose label starts with the key
      const typed = event.key.toLowerCase();
      const match = options.findIndex((l) => l.label.toLowerCase().startsWith(typed));
      if (match !== -1) nextIndex = match;
    } else return;

    event.preventDefault();
    setActiveLangId(options[nextIndex].id);
    // Keep the active option visible if the popup ever scrolls (jsdom
    // test environments don't implement scrollIntoView).
    const activeOption = langListRef.current?.querySelector<HTMLElement>(
      `#${optionId(options[nextIndex].id)}`
    );
    if (activeOption && typeof activeOption.scrollIntoView === 'function') {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        {/* Duolingo-style compact bar */}
        <div className="flex items-center gap-2 py-1.5 h-11 sm:h-12">
          {/* â”€â”€ Left: Logo + Language â”€â”€ */}
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

          {/* â”€â”€ Language Selector (compact) â”€â”€ */}
          <div className="relative" ref={langRef}>
            <button
              ref={langBtnRef}
              type="button"
              onClick={() => (langOpen ? closeListbox() : openListbox())}
              className="flex items-center gap-1 rounded-lg border border-border-soft bg-surface px-2 py-2 sm:px-2.5 sm:py-2 text-sm transition-colors cursor-pointer hover:bg-surface-hover"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-controls={langOpen ? listboxId : undefined}
              aria-label={translate('common.selectLanguage')}
            >
              <Globe className="h-3.5 w-3.5 text-muted-copy" />
              <span className="text-sm sm:text-base leading-none">
                {currentLang?.flag || 'ğŸŒ'}
              </span>
              <span className="hidden sm:inline text-xs font-medium text-muted-copy">
                {currentLang?.id ? currentLang.id.toUpperCase() : 'EN'}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-muted-copy transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {langOpen && (
              <div className="absolute left-0 mt-1 w-44 origin-top-left rounded-lg border border-border-soft bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
                <ul
                  ref={langListRef}
                  id={listboxId}
                  role="listbox"
                  tabIndex={-1}
                  aria-label={translate('common.selectLanguage')}
                  aria-activedescendant={activeLangId ? optionId(activeLangId) : undefined}
                  onKeyDown={onListboxKeyDown}
                  className="py-1 focus:outline-none"
                >
                  {/* Keyboard support lives on the listbox (APG "Listbox Popup"): options
                      are not focusable; the container handles all keys. */}
                  {INTERFACE_LANGUAGES.map((lang) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <li
                      key={lang.id}
                      id={optionId(lang.id)}
                      role="option"
                      aria-selected={language === lang.id}
                      onMouseEnter={() => setActiveLangId(lang.id)}
                      onClick={() => selectLanguage(lang.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer ${
                        activeLangId === lang.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-surface'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-medium">{lang.nativeLabel}</span>
                      <span className="ml-auto text-[10px] text-muted-copy">{lang.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* â”€â”€ Right: Demo + Theme + Auth (compact) â”€â”€ */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Try Demo Button */}
            <button
              type="button"
              onClick={enterDemo}
              className="hidden sm:inline-flex items-center rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-2 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {translate('landing.tryDemo')}
            </button>

            {/* Theme Toggle - compact */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center h-10 w-10 justify-center rounded-lg border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={translate('common.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-600" />
              )}
            </button>

            {/* Auth Controls */}
            {!isAuthPage && <AuthControls />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
