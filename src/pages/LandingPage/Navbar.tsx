import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowRight, Moon, Sun } from 'lucide-react';

import { useTheme } from '@/features/theme/ThemeProvider';

import { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

interface NavbarProps {
  onDemoClick?: () => void;
  onOpenProofreader?: () => void;
}

export function Navbar({ onDemoClick, onOpenProofreader: _ }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { language, setLanguage, translate } = useLocalizationStore();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = INTERFACE_LANGUAGES.find((l) => l.id === language);
  const englishLanguage = INTERFACE_LANGUAGES.find((l) => l.id === 'en');
  // Show only the currently-selected language (if not EN) + EN as two side-by-side buttons
  const nonEnglishLangs = INTERFACE_LANGUAGES.filter((l) => l.id !== 'en');
  const otherLanguages = language === 'en' ? [] : [currentLang!];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2 h-11">
          {/* ── Left: Logo ── */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <img src="/brand/logo.webp" alt="EngVox" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                EngVox
              </span>
              <span className="rounded bg-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary font-mono border border-border-soft flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                v{PRODUCT_VERSION}
              </span>
            </div>
          </Link>

          {/* ── Language Selector: side-by-side buttons (selected lang + EN) ── */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0 mx-3 lg:mx-6">
            {/* Non-English selected language button */}
            {otherLanguages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                title={lang.nativeLabel}
                aria-label={`Switch to ${lang.label}`}
                onClick={() => setLanguage(lang.id as SupportedInterfaceLanguage)}
                className={`flex items-center gap-1 rounded-[var(--radius-card)] h-7 px-2 text-[10px] font-bold leading-none border transition-all cursor-pointer select-none ${
                  language === lang.id
                    ? 'bg-primary/15 border-primary ring-1 ring-primary/60 -translate-y-0.5 shadow-md text-primary'
                    : 'bg-surface border-border-soft opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md shadow-[var(--shadow-card)] text-foreground'
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="uppercase tracking-wide">{lang.id.toUpperCase()}</span>
              </button>
            ))}
            {otherLanguages.length > 0 && (
              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
            )}
            {/* EN button — always visible, highlighted when EN is selected */}
            {englishLanguage && (
              <button
                type="button"
                title="English"
                aria-label="Switch to English"
                onClick={() => setLanguage('en' as SupportedInterfaceLanguage)}
                className={`flex h-7 shrink-0 items-center gap-1 rounded-[var(--radius-card)] border px-2 text-[10px] font-bold leading-none transition-all cursor-pointer select-none ${
                  language === 'en'
                    ? 'bg-primary/15 border-primary ring-1 ring-primary/60 text-primary -translate-y-0.5 shadow-md'
                    : 'bg-surface border-border-soft opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md text-foreground'
                }`}
              >
                <span className="uppercase tracking-wide">EN</span>
              </button>
            )}
          </div>

          {/* Mobile fallback: compact language buttons (current lang + EN) */}
          <div className="flex items-center gap-1 shrink-0 md:hidden">
            {language !== 'en' && currentLang && (
              <button
                type="button"
                title={currentLang.nativeLabel}
                aria-label={`Currently: ${currentLang.label}`}
                className="flex items-center gap-0.5 rounded border border-primary bg-primary/15 px-1.5 py-1 text-[9px] font-bold text-primary leading-none ring-1 ring-primary/60 cursor-default select-none"
              >
                <span className="text-sm leading-none">{currentLang.flag}</span>
                <span className="uppercase">{currentLang.id.toUpperCase()}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setLanguage('en' as SupportedInterfaceLanguage)}
              aria-label="Switch to English"
              className={`flex items-center gap-0.5 rounded border px-1.5 py-1 text-[9px] font-bold leading-none cursor-pointer select-none transition-all ${
                language === 'en'
                  ? 'bg-primary/15 border-primary ring-1 ring-primary/60 text-primary'
                  : 'bg-surface border-border-soft text-muted-copy hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span className="uppercase">EN</span>
            </button>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Right: Nav Links + Theme + Auth ── */}
          <div className="flex items-center gap-1 shrink-0">
            {!isAuthPage && (
              <>
                <a
                  href="#disciplines"
                  className="hidden md:inline-flex items-center rounded px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navDisciplines')}
                </a>
                <a
                  href="#features"
                  className="hidden md:inline-flex items-center rounded px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navFeatures')}
                </a>
                <Link
                  to="/pricing"
                  className="hidden md:inline-flex items-center rounded px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navPricing')}
                </Link>

                {/* Separator before theme toggle */}
                <div className="hidden md:block h-4 w-px bg-border-soft mx-1" />
              </>
            )}

            {/* Try Demo (auth pages only — wired by LoginPage) */}
            {onDemoClick && (
              <button
                type="button"
                onClick={onDemoClick}
                className="inline-flex items-center rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                {translate('landing.tryDemo')}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={
                theme === 'dark'
                  ? translate('landing.switchLightMode')
                  : translate('landing.switchDarkMode')
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>

            {!isAuthPage && (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center rounded border border-border-soft bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors ml-1"
                >
                  {translate('common.login') || 'Log in'}
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors ml-0.5"
                >
                  {translate('landing.startFree')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
