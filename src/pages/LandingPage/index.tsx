import { PRODUCT_VERSION } from '@/config/product.config';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe,
  Headphones,
  PenTool,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { GlowingOrb } from '@/shared/components/GlowingOrb';
import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getLandingTranslations } from '@/shared/i18n/landing-i18n';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { Navbar } from './Navbar';

const HeroScene = lazy(() => import('./HeroScene'));

const FEATURES = [
  {
    icon: BookOpen,
    key: 'vocabulary',
    color: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/25',
  },
  {
    icon: BookOpen,
    key: 'reading',
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/25',
  },
  {
    icon: PenTool,
    key: 'writing',
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/25',
  },
  {
    icon: Volume2,
    key: 'speaking',
    color: 'from-orange-500 to-amber-400',
    glow: 'shadow-orange-500/25',
  },
  {
    icon: Headphones,
    key: 'listening',
    color: 'from-cyan-500 to-sky-400',
    glow: 'shadow-cyan-500/25',
  },
  {
    icon: Sparkles,
    key: 'grammar',
    color: 'from-pink-500 to-rose-400',
    glow: 'shadow-pink-500/25',
  },
] as const;

const SLIDE_INTERVAL = 6000;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.96,
  }),
};

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);

  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const prefersReduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Defer the 3D hero scene until first idle: the interactive shell paints
  // first, then the three.js chunk loads in the background.
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setSceneReady(true), { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setSceneReady(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  // Block middle-click auto-scroll pan
  useEffect(() => {
    const prevent = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };
    window.addEventListener('mousedown', prevent);
    return () => window.removeEventListener('mousedown', prevent);
  }, []);

  const totalSlides = 3;

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > slide ? 1 : -1);
      setSlide(next);
    },
    [slide]
  );

  const next = useCallback(() => {
    goTo((slide + 1) % totalSlides);
  }, [slide, goTo]);

  const prev = useCallback(() => {
    goTo((slide - 1 + totalSlides) % totalSlides);
  }, [slide, goTo]);

  // Auto-advance
  useEffect(() => {
    if (prefersReduced) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, prefersReduced]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const slideLabels = useMemo(() => [t.slideHero, t.slideDisciplines, t.slideFeatures], [t]);

  return (
    <div
      className="h-dvh w-full max-w-full bg-background text-foreground overflow-hidden overscroll-none relative select-none"
      translate="no"
    >
      <Navbar />

      {/* 3D scene stays as fixed background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>{sceneReady && <HeroScene />}</Suspense>
        {/* Aurora blobs */}
        <div className="absolute -top-32 -left-32 w-[44rem] h-[44rem] rounded-full bg-primary/20 blur-3xl animate-ambient-glow" />
        <div
          className="absolute top-1/4 -right-40 w-[38rem] h-[38rem] rounded-full bg-fuchsia-600/20 blur-3xl animate-ambient-glow"
          style={{ animationDelay: '1.4s' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[34rem] h-[34rem] rounded-full bg-cyan-800/15 blur-3xl animate-ambient-glow"
          style={{ animationDelay: '2.6s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      {/* Slide content */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        <AnimatePresence custom={direction} mode="wait">
          {/* ── SLIDE 0: HERO ── */}
          {slide === 0 && (
            <motion.div
              key="hero"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center text-center px-4"
            >
              <div className="max-w-6xl mx-auto">
                <div
                  data-hero="badge"
                  className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/60 backdrop-blur-md px-6 py-3 text-sm font-semibold text-foreground/90"
                >
                  <Sparkles className="h-5 w-5 text-primary animate-spin-slow" />
                  {t.heroBadge}
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight mt-6 sm:mt-8 mb-6 sm:mb-8">
                  <span data-hero="line" className="block text-foreground">
                    {t.heroTitle1}
                  </span>
                  <span
                    data-hero="line"
                    className="block bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent"
                  >
                    {t.heroTitleHighlight}
                  </span>
                  <span data-hero="line" className="block text-foreground/80">
                    {t.heroTitle2}
                  </span>
                </h1>

                <p
                  data-hero="subtitle"
                  className="text-sm sm:text-base md:text-xl text-muted-copy max-w-3xl mx-auto mb-8 sm:mb-10 px-2"
                >
                  {t.heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link
                    data-hero="cta"
                    to="/dashboard"
                    className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {t.ctaSelectBranch}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </Link>
                  <Link
                    data-hero="cta-demo"
                    to="/dashboard"
                    className="group px-8 py-4 rounded-full border-2 border-dashed border-primary/40 text-primary font-bold text-lg backdrop-blur-md hover:bg-primary/10 hover:border-primary/60 transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      {t.ctaTryDemo}
                    </span>
                  </Link>
                  <a
                    data-hero="cta"
                    href="#pricing"
                    className="px-8 py-4 rounded-full border border-border-soft text-foreground font-bold text-lg backdrop-blur-md hover:bg-surface-hover hover:border-primary/40 transition-all"
                  >
                    {t.ctaViewPlans}
                  </a>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-copy">
                  <span data-hero="trust" className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    {t.badgeNoCard}
                  </span>
                  <span data-hero="trust" className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    {t.badgeLanguages}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SLIDE 1: DISCIPLINES ── */}
          {slide === 1 && (
            <motion.div
              key="disciplines"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center px-4"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <GlowingOrb size="lg" />
              </div>
              <div className="max-w-6xl w-full max-h-[calc(100dvh-10rem)] overflow-y-auto relative z-10">
                <h2 className="text-center text-4xl md:text-5xl font-black text-foreground mb-12">
                  {t.disciplinesTitle}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {ENGINEERING_DISCIPLINES.map((id, index) => {
                    const DisciplineIcon = getDisciplineIcon(id);
                    return (
                      <motion.div
                        key={id}
                        className="group relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                        <div className="relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-soft bg-surface/80 backdrop-blur-xl hover:bg-surface-hover transition-all duration-300">
                          <DisciplineIcon className="h-9 w-9 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                          <span className="text-xs font-semibold text-foreground text-center">
                            {translate(`discipline.${id}`)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SLIDE 2: FEATURES ── */}
          {slide === 2 && (
            <motion.div
              key="features"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center px-4"
            >
              <div className="max-w-6xl w-full max-h-[calc(100dvh-10rem)] overflow-y-auto">
                <div className="text-center mb-12">
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-2">
                    {t.featuresHeaderBadge}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-foreground mt-4 mb-4">
                    {t.featuresTitle}
                  </h2>
                  <p className="text-lg text-muted-copy max-w-2xl mx-auto">{t.featuresSubtitle}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {FEATURES.map(({ icon: Icon, key, color, glow }, index) => (
                    <motion.div
                      key={key}
                      className="group relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.4 }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                      />
                      <div className="relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-border-soft bg-surface/80 backdrop-blur-xl hover:bg-surface-hover transition-all duration-300">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-foreground text-center capitalize">
                          {translate(`nav.${key}`)}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation arrows - hidden on mobile to prevent overlap */}
      <button
        type="button"
        onClick={prev}
        className="hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 items-center h-12 w-12 justify-center rounded-full border border-border-soft bg-surface/60 backdrop-blur-md text-muted-copy hover:text-foreground hover:bg-surface-hover transition-all"
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 items-center h-12 w-12 justify-center rounded-full border border-border-soft bg-surface/60 backdrop-blur-md text-muted-copy hover:text-foreground hover:bg-surface-hover transition-all"
        aria-label="Next slide"
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slideLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => goTo(i)}
            className={`relative h-2.5 rounded-full transition-all duration-300 ${
              i === slide ? 'w-8 bg-primary' : 'w-2.5 bg-muted-copy/40 hover:bg-muted-copy/60'
            }`}
            aria-label={`Go to ${label}`}
          />
        ))}
      </div>

      {/* Watermark */}
      <div className="fixed bottom-20 md:bottom-3 right-3 z-50 flex items-center gap-1 pointer-events-none select-none opacity-25 hover:opacity-50 transition-opacity duration-500">
        <img src="/brand/logo.svg" alt="" className="h-4 w-4" width="16" height="16" />
        <span className="text-[10px] font-bold text-foreground tracking-wide">EngVox</span>
        <span className="text-[9px] font-mono font-bold text-primary">v{PRODUCT_VERSION}</span>
      </div>

      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </div>
  );
};

export default LandingPage;
