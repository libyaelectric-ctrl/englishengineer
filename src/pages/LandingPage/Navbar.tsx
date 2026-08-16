import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowRight, Moon, Sun } from 'lucide-react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import { useTheme } from '@/features/theme/ThemeProvider';

interface NavbarProps {
  onDemoClick?: () => void;
  onOpenProofreader?: () => void;
}

export function Navbar({ onDemoClick, onOpenProofreader: _ }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { language, setLanguage, translate } = useLocalizationStore();
  const { demoLogin, isLoading } = useAuthStore();

  const handleDemoClick = async () => {
    if (onDemoClick) {
      onDemoClick();
      return;
    }
    try {
      await demoLogin();
      navigate('/welcome', { replace: true });
    } catch (err) {
      console.error('Demo login failed', err);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2 h-11">
          {/* ── Left: Logo ── */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <img
                src="/brand/logo.svg"
                alt="EngVox"
                className="h-full w-full object-cover"
                width="48"
                height="48"
              />
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

          {/* ── Language Flags: inline raised buttons (md+), compact scroll on small screens ── */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0 mx-1 lg:mx-3">
            {INTERFACE_LANGUAGES.filter((l) => l.id !== 'en').map((lang) => (
              <button
                key={lang.id}
                type="button"
                title={lang.nativeLabel}
                aria-label={`Switch to ${lang.label}`}
                onClick={() => setLanguage(lang.id)}
                className={`flex items-center justify-center rounded-[var(--radius-card)] w-7 h-7 text-base leading-none border transition-all cursor-pointer select-none ${
                  language === lang.id
                    ? 'bg-primary/15 border-primary ring-1 ring-primary/60 -translate-y-0.5 shadow-md'
                    : 'bg-surface border-border-soft opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md shadow-[var(--shadow-card)]'
                }`}
              >
                {lang.flag}
              </button>
            ))}
            <button
              type="button"
              title="English"
              aria-label="Switch to English"
              onClick={() => setLanguage('en')}
              className={`flex h-7 shrink-0 items-center justify-center rounded-[var(--radius-card)] border px-1.5 text-[10px] font-bold leading-none transition-all cursor-pointer select-none ${
                language === 'en'
                  ? 'bg-primary/15 border-primary ring-1 ring-primary/60 text-primary -translate-y-0.5 shadow-md'
                  : 'bg-surface border-border-soft opacity-60 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md text-foreground shadow-[var(--shadow-card)]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile: compact horizontally scrollable flags row (no dropdown) */}
          <div className="flex md:hidden items-center gap-1 shrink-0 max-w-[44vw] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {INTERFACE_LANGUAGES.map((lang) =>
              lang.id === 'en' ? (
                <button
                  key={lang.id}
                  type="button"
                  aria-label="Switch to English"
                  onClick={() => setLanguage('en')}
                  className={`flex h-6 shrink-0 items-center justify-center rounded border px-1 text-[9px] font-bold leading-none cursor-pointer select-none ${
                    language === 'en'
                      ? 'bg-primary/15 border-primary ring-1 ring-primary/60 text-primary'
                      : 'bg-surface border-border-soft opacity-60 hover:opacity-100'
                  }`}
                >
                  EN
                </button>
              ) : (
                <button
                  key={lang.id}
                  type="button"
                  title={lang.nativeLabel}
                  aria-label={`Switch to ${lang.label}`}
                  onClick={() => setLanguage(lang.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-sm leading-none cursor-pointer select-none ${
                    language === lang.id
                      ? 'bg-primary/15 border-primary ring-1 ring-primary/60'
                      : 'bg-surface border-border-soft opacity-60 hover:opacity-100'
                  }`}
                >
                  {lang.flag}
                </button>
              )
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

            {/* Try Demo Button: Instant demo login → discipline & language selection */}
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={isLoading}
              className="inline-flex items-center rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {translate('landing.tryDemo')}
            </button>

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
