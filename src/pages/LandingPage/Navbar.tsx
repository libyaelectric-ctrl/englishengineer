import { PRODUCT_VERSION } from '@/config/product.config';
import { ChevronDown, Globe, Moon, Sun } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { AuthControls } from '@/features/auth/AuthControls';
import { useFirebaseAuth } from '@/features/auth/FirebaseAuth';
import { AUTH_SIGN_IN_URL, AUTH_SIGN_UP_URL } from '@/features/auth/firebase.config';
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

  useEffect(() => {
    if (isSignedIn && location.pathname !== '/pricing') navigate('/dashboard', { replace: true });
  }, [isSignedIn, navigate, location.pathname]);
  const currentLang = INTERFACE_LANGUAGES.find((l) => l.id === language) || INTERFACE_LANGUAGES[0];

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node) &&
        langBtnRef.current &&
        !langBtnRef.current.contains(event.target as Node)
      )
        setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen]);

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
      const typed = event.key.toLowerCase();
      const match = options.findIndex((l) => l.label.toLowerCase().startsWith(typed));
      if (match !== -1) nextIndex = match;
    } else return;
    event.preventDefault();
    setActiveLangId(options[nextIndex].id);
    const activeOption = langListRef.current?.querySelector<HTMLElement>(
      `#${optionId(options[nextIndex].id)}`
    );
    if (activeOption && typeof activeOption.scrollIntoView === 'function')
      activeOption.scrollIntoView({ block: 'nearest' });
  };

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b border-slate-900/10 bg-white/74 text-slate-950 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#040611]/72 dark:text-white dark:shadow-[0_18px_70px_rgba(0,0,0,0.22)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 items-center gap-2">
          <Link to="/" className="group flex shrink-0 items-center gap-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl ring-1 ring-slate-900/10 transition-transform duration-200 group-hover:scale-105 dark:ring-white/15">
              <img
                src="/brand/logo.svg"
                alt="EngVox"
                className="h-full w-full object-cover"
                width="48"
                height="48"
              />
            </div>
            <div className="hidden leading-none sm:block">
              <span className="text-sm font-black tracking-tight">EngVox</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">
                v{PRODUCT_VERSION}
              </span>
            </div>
          </Link>
          <div className="relative" ref={langRef}>
            <button
              ref={langBtnRef}
              type="button"
              onClick={() => (langOpen ? closeListbox() : openListbox())}
              className="flex h-10 items-center gap-1 rounded-xl border border-slate-900/10 bg-white/70 px-2 text-sm transition-colors cursor-pointer hover:bg-white dark:border-white/12 dark:bg-white/[0.07] dark:hover:bg-white/12"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-controls={langOpen ? listboxId : undefined}
              aria-label={translate('common.selectLanguage')}
            >
              <Globe className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-200" />
              <span className="text-base leading-none">{currentLang?.flag || '🌐'}</span>
              <span className="hidden text-xs font-black text-slate-700 dark:text-white/70 sm:inline">
                {currentLang?.id ? currentLang.id.toUpperCase() : 'EN'}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-slate-500 transition-transform dark:text-white/55 ${langOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {langOpen && (
              <div className="absolute left-0 mt-2 w-48 origin-top-left rounded-2xl border border-border-soft bg-surface/95 p-1 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95">
                <ul
                  ref={langListRef}
                  id={listboxId}
                  role="listbox"
                  tabIndex={-1}
                  aria-label={translate('common.selectLanguage')}
                  aria-activedescendant={activeLangId ? optionId(activeLangId) : undefined}
                  onKeyDown={onListboxKeyDown}
                  className="focus:outline-none"
                >
                  {INTERFACE_LANGUAGES.map((lang) => (
                    <li
                      key={lang.id}
                      id={optionId(lang.id)}
                      role="option"
                      aria-selected={language === lang.id}
                      onMouseEnter={() => setActiveLangId(lang.id)}
                      onClick={() => selectLanguage(lang.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') selectLanguage(lang.id);
                      }}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${activeLangId === lang.id ? 'bg-cyan-500/12 text-cyan-700 font-black dark:text-cyan-100' : 'text-slate-700 hover:bg-slate-900/5 dark:text-white/78 dark:hover:bg-white/8'}`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-bold">{lang.nativeLabel}</span>
                      <span className="ml-auto text-[10px] opacity-55">{lang.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                useAuthStore.getState().enterDemoUser();
                navigate('/onboarding');
              }}
              className="hidden h-10 items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 text-[11px] font-black text-cyan-800 transition-colors cursor-pointer hover:bg-cyan-500/16 dark:text-cyan-100 sm:inline-flex"
            >
              {translate('landing.tryDemo')}
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 text-slate-700 transition-colors cursor-pointer hover:bg-white dark:border-white/12 dark:bg-white/[0.07] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/12"
              aria-label={translate('common.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-cyan-700" />
              )}
            </button>
            {!isAuthPage && <AuthControls />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
