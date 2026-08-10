import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowRight, ChevronDown, Moon, Sun } from 'lucide-react';

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
  const otherLanguages = INTERFACE_LANGUAGES.filter((l) => l.id !== 'en');

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

          {/* ── Language Flags: inline raised row (md+), compact popover on small screens ── */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0 mx-3 lg:mx-6">
            {otherLanguages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                title={lang.nativeLabel}
                aria-label={`Switch to ${lang.label}`}
                onClick={() => setLanguage(lang.id as SupportedInterfaceLanguage)}
                className={`flex items-center justify-center rounded-[var(--radius-card)] w-7 h-7 text-base leading-none border transition-all cursor-pointer select-none ${
                  language === lang.id
                    ? 'bg-primary/15 border-primary ring-1 ring-primary/60 -translate-y-0.5 shadow-md'
                    : 'bg-surface border-border-soft opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md shadow-[var(--shadow-card)]'
                }`}
              >
                {lang.flag}
              </button>
            ))}
            <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
            {englishLanguage && (
              <div
                title="English"
                aria-label="English (EN), fixed target language"
                className="flex h-7 shrink-0 items-center gap-1 rounded-[var(--radius-card)] border border-primary bg-primary/15 px-1.5 text-[10px] font-bold leading-none ring-1 ring-primary/60 select-none"
              >
                <span className="text-base">{englishLanguage.flag}</span>
                <span>EN</span>
              </div>
            )}
          </div>

          {/* Mobile fallback: compact language popover */}
          <div className="relative shrink-0 md:hidden">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-label="Change interface language"
              className="flex items-center gap-1 rounded border border-border-soft bg-surface px-1.5 py-1 text-base leading-none transition-colors hover:border-primary/40 cursor-pointer"
            >
              <span>{currentLang?.flag ?? '🌐'}</span>
              {currentLang?.id === 'en' && <span className="text-[8px] font-bold">EN</span>}
              <ChevronDown className="h-3 w-3 text-muted-copy" />
            </button>
            {langOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 grid grid-cols-5 gap-0.5 rounded-[var(--radius-card)] border border-border-soft bg-background p-1.5 shadow-xl">
                {otherLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    title={lang.nativeLabel}
                    aria-label={`Switch to ${lang.label}`}
                    onClick={() => {
                      setLanguage(lang.id as SupportedInterfaceLanguage);
                      setLangOpen(false);
                    }}
                    className={`flex items-center justify-center rounded w-7 h-7 text-base leading-none transition-all cursor-pointer select-none ${
                      language === lang.id
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'opacity-50 hover:opacity-100 hover:bg-surface'
                    }`}
                  >
                    <span className="flex flex-col items-center gap-0.5">
                      <span>{lang.flag}</span>
                      <span className="text-[8px] font-bold uppercase leading-none">{lang.id}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
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
