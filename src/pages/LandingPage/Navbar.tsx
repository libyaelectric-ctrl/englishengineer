import { PRODUCT_VERSION } from '@/config/product.config';
import { useAppStore } from '@/store/app.store';
import { ArrowRight, ChevronDown, Moon, Sun, Zap } from 'lucide-react';

import { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

interface NavbarProps {
  onDemoClick?: () => void;
  onOpenProofreader?: () => void;
}

export function Navbar({ onDemoClick, onOpenProofreader: _ }: NavbarProps) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { language, setLanguage, translate } = useLocalizationStore();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = INTERFACE_LANGUAGES.find((l) => l.id === language) || INTERFACE_LANGUAGES[0];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border-soft)] bg-[var(--background)]/80 backdrop-blur-xl"
      data-testid="navbar"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* ── Left: Logo ── */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <Zap className="h-5 w-5 text-[var(--color-primary)] transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              EngVox
            </span>
            <span className="rounded-md bg-[var(--color-primary)]/10 border border-[var(--color-border-soft)] px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              v{PRODUCT_VERSION}
            </span>
          </div>
        </Link>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right: Language + Theme + Auth ── */}
        <div className="flex items-center gap-2 shrink-0">
          {!isAuthPage && (
            <>
              <a
                href="#disciplines"
                className="hidden md:inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {translate('landing.navDisciplines')}
              </a>
              <a
                href="#features"
                className="hidden md:inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {translate('landing.navFeatures')}
              </a>
              <Link
                to="/pricing"
                className="hidden md:inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {translate('landing.navPricing')}
              </Link>
              <div className="hidden md:block h-4 w-px bg-border-soft mx-1" />
            </>
          )}

          {/* Language selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-soft)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium hover:border-[var(--color-primary)] transition-colors cursor-pointer"
              aria-expanded={langOpen}
              aria-label="Change interface language"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline text-xs font-semibold text-foreground">
                {currentLang.nativeLabel}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-copy" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 max-h-64 w-48 overflow-y-auto rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface)] p-1 shadow-xl z-50">
                {INTERFACE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.id as SupportedInterfaceLanguage);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                      language === lang.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Try Demo (auth pages only — wired by LoginPage) */}
          {onDemoClick && (
            <button
              type="button"
              onClick={onDemoClick}
              className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
            >
              {translate('landing.tryDemo')}
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--surface)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
            aria-label={
              theme === 'dark'
                ? translate('landing.switchLightMode')
                : translate('landing.switchDarkMode')
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--color-primary)]" />
            )}
          </button>

          {!isAuthPage && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-foreground hover:border-[var(--color-primary)] transition-colors"
              >
                {translate('common.login') || 'Log in'}
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                {translate('landing.startFree')}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
