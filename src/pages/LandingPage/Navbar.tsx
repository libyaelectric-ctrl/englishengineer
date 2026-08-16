import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowRight, ChevronLeft, ChevronRight, Moon, Play, Sun } from 'lucide-react';

import { useRef } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDemoClick = async () => {
    if (onDemoClick) {
      onDemoClick();
      return;
    }
    try {
      useLearningStore.getState().resetAll();
      await demoLogin();
      const loggedUser = useAuthStore.getState().currentUser;
      if (loggedUser) {
        LearningProfileRepository.updatePreferences(loggedUser.id, {
          discipline: (loggedUser.engineeringDiscipline ||
            ENGINEERING_DISCIPLINES[0]) as EngineeringDiscipline,
          onboardingCompleted: true,
          interfaceLanguage: language,
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Demo login failed', err);
    }
  };

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = dir === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-soft bg-background/95 backdrop-blur-md shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3 h-16 md:h-[68px]">
          {/* ── Left: Logo ── */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105 shrink-0">
              <img src="/brand/logo.svg" alt="EngVox" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                EngVox
              </span>
              <span className="hidden sm:inline-flex rounded bg-soft px-1.5 sm:px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary font-mono border border-border-soft items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                v{PRODUCT_VERSION}
              </span>
            </div>
          </Link>

          {/* ── Language Carousel Slider: fluid flex-1 with left/right arrows ── */}
          <div className="flex-1 min-w-0 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex items-center gap-1 relative mx-1 sm:mx-2 overflow-hidden">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll languages left"
              className="flex h-8 w-7 sm:h-9 sm:w-8 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover hover:border-primary/50 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div
              ref={scrollRef}
              className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1"
            >
              {AVAILABLE_INTERFACE_LANGUAGES.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    title={lang.label}
                    onClick={() => setLanguage(lang.id)}
                    className={`flex items-center gap-1.5 shrink-0 rounded-[var(--radius-card)] border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition-all cursor-pointer select-none whitespace-nowrap ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm font-semibold'
                        : 'border-border-soft bg-surface text-foreground hover:border-primary/50 hover:bg-surface-hover shadow-xs'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-none">
                      {lang.id === 'en' ? 'EN' : lang.flag}
                    </span>
                    <span className="font-medium leading-none">
                      {lang.nativeLabel || lang.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll languages right"
              className="flex h-8 w-7 sm:h-9 sm:w-8 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover hover:border-primary/50 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* ── Right: Nav Links + Theme + Auth ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!isAuthPage && (
              <>
                <a
                  href="#disciplines"
                  className="hidden xl:inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs lg:text-sm font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navDisciplines')}
                </a>
                <a
                  href="#features"
                  className="hidden lg:inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs lg:text-sm font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navFeatures')}
                </a>
                <Link
                  to="/pricing"
                  className="hidden lg:inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs lg:text-sm font-bold uppercase tracking-wide text-foreground/70 hover:text-primary hover:bg-surface transition-colors"
                >
                  {translate('landing.navPricing')}
                </Link>

                {/* Separator before theme toggle */}
                <div className="hidden lg:block h-5 w-px bg-border-soft mx-0.5" />
              </>
            )}

            {/* Try Demo Button: Directly log in as demo engineer & bypass login page */}
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary" />
              <span>{translate('landing.tryDemo')}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-lg border border-border-soft bg-background text-muted-copy hover:text-foreground transition-colors cursor-pointer"
              aria-label={
                theme === 'dark'
                  ? translate('landing.switchLightMode')
                  : translate('landing.switchDarkMode')
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            {!isAuthPage && (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center rounded-lg border border-border-soft bg-surface px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors"
                >
                  {translate('common.login') || 'Log in'}
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
                >
                  <span className="whitespace-nowrap">{translate('landing.startFree')}</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
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
