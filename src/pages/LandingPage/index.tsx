import { PRODUCT_VERSION } from '@/config/product.config';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  Gauge,
  Globe,
  Headphones,
  Layers3,
  Mic2,
  Pause,
  PenTool,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getLandingTranslations } from '@/shared/i18n/landing-i18n';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { Navbar } from './Navbar';

const HeroScene = lazy(() => import('./HeroScene'));

const FEATURES = [
  { icon: BookOpen, key: 'vocabulary', accent: 'from-sky-400 to-cyan-300' },
  { icon: BookOpen, key: 'reading', accent: 'from-violet-400 to-fuchsia-300' },
  { icon: PenTool, key: 'writing', accent: 'from-amber-300 to-orange-400' },
  { icon: Volume2, key: 'speaking', accent: 'from-emerald-300 to-teal-400' },
  { icon: Headphones, key: 'listening', accent: 'from-blue-300 to-indigo-400' },
  { icon: Sparkles, key: 'grammar', accent: 'from-rose-300 to-pink-400' },
] as const;

const METRICS = [
  { label: 'AI Coach', value: '24/7', icon: Cpu },
  { label: 'CEFR Radar', value: 'A1-C2', icon: Gauge },
  { label: 'Engineer Mode', value: '15+', icon: CircuitBoard },
] as const;

const SLIDE_INTERVAL = 7000;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.98, filter: 'blur(10px)' }),
  center: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.98, filter: 'blur(10px)' }),
};

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);

  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setSceneReady(true), { timeout: 180 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timeout = window.setTimeout(() => setSceneReady(true), 40);
    return () => window.clearTimeout(timeout);
  }, []);

  const totalSlides = 3;

  const goTo = useCallback(
    (nextSlide: number) => {
      setDirection(nextSlide > slide ? 1 : -1);
      setSlide(nextSlide);
    },
    [slide]
  );

  const next = useCallback(() => goTo((slide + 1) % totalSlides), [goTo, slide]);
  const prev = useCallback(() => goTo((slide - 1 + totalSlides) % totalSlides), [goTo, slide]);

  useEffect(() => {
    if (prefersReduced || paused) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused, prefersReduced]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const slideLabels = useMemo(() => [t.slideHero, t.slideDisciplines, t.slideFeatures], [t]);

  return (
    <div className="relative h-dvh w-full max-w-full overflow-hidden bg-[#040611] text-white overscroll-none">
      <Navbar />

      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>{sceneReady && <HeroScene />}</Suspense>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,210,255,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(151,71,255,0.25),transparent_30%),linear-gradient(180deg,rgba(4,6,17,0.08),rgba(4,6,17,0.92))]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#040611] to-transparent" />
      </div>

      <main
        id="main-content"
        ref={rootRef}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative z-10 h-full w-full"
      >
        <AnimatePresence custom={direction} mode="wait">
          {slide === 0 && (
            <motion.section
              key="hero"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 grid place-items-center overflow-y-auto px-4 pb-28 pt-20 md:pb-20"
            >
              <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    {t.heroBadge}
                  </div>

                  <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                    <span className="block">{t.heroTitle1}</span>
                    <span className="block bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_34px_rgba(125,211,252,0.35)]">
                      {t.heroTitleHighlight}
                    </span>
                    <span className="block text-white/72">{t.heroTitle2}</span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0">
                    {t.heroSubtitle}
                  </p>

                  <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
                    <Link
                      to="/dashboard"
                      className="group relative overflow-hidden rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-[#07111f] shadow-[0_0_60px_rgba(103,232,249,0.24)] transition-transform hover:-translate-y-1 sm:text-base"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative inline-flex items-center justify-center gap-2">
                        {t.ctaSelectBranch}
                        <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-4 text-center text-sm font-black text-cyan-100 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-cyan-300/16 sm:text-base"
                    >
                      {t.ctaTryDemo}
                    </Link>
                    <Link
                      to="/pricing"
                      className="rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 text-center text-sm font-black text-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/10 sm:text-base"
                    >
                      {t.ctaViewPlans}
                    </Link>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-300 lg:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {t.badgeNoCard}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-2">
                      <Globe className="h-4 w-4 text-blue-300" /> {t.badgeLanguages}
                    </span>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl">
                  <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-cyan-400/25 via-fuchsia-500/20 to-amber-300/10 blur-3xl" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Live cockpit</p>
                        <p className="text-sm font-bold text-white/70">Engineering English OS</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200">ONLINE</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {METRICS.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <Icon className="mb-3 h-5 w-5 text-cyan-200" />
                          <p className="text-2xl font-black tracking-tight text-white">{value}</p>
                          <p className="text-xs font-bold text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-3xl border border-white/10 bg-[#050916]/75 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-black text-white">Skill neural map</span>
                        <Zap className="h-5 w-5 text-amber-200" />
                      </div>
                      <div className="space-y-3">
                        {FEATURES.slice(0, 4).map(({ key, accent }, index) => (
                          <div key={key} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-xs font-bold text-slate-300">
                            <span>{translate(`nav.${key}`)}</span>
                            <span className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.span
                                className={`block h-full rounded-full bg-gradient-to-r ${accent}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${78 + index * 5}%` }}
                                transition={{ duration: 1.1, delay: 0.25 + index * 0.12 }}
                              />
                            </span>
                            <span className="text-right text-cyan-100">{78 + index * 5}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {slide === 1 && (
            <motion.section
              key="disciplines"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 grid place-items-center overflow-y-auto px-4 pb-28 pt-20 md:pb-20"
            >
              <div className="w-full max-w-7xl">
                <div className="mx-auto mb-8 max-w-3xl text-center">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Choose your cockpit</p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">{t.disciplinesTitle}</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {ENGINEERING_DISCIPLINES.map((id, index) => {
                    const DisciplineIcon = getDisciplineIcon(id);
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 24, rotateX: -20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: index * 0.035, duration: 0.45 }}
                        className="group relative perspective-1000"
                      >
                        <div className="absolute inset-0 rounded-3xl bg-cyan-300/20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                        <div className="relative min-h-32 rounded-3xl border border-white/12 bg-white/[0.075] p-4 text-center shadow-2xl backdrop-blur-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-cyan-200/50 group-hover:bg-white/[0.12]">
                          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/20 to-fuchsia-300/10 ring-1 ring-white/12">
                            <DisciplineIcon className="h-7 w-7 text-cyan-100 transition-transform group-hover:scale-125 group-hover:rotate-6" />
                          </div>
                          <span className="text-xs font-black text-white/90">{translate(`discipline.${id}`)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {slide === 2 && (
            <motion.section
              key="features"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 grid place-items-center overflow-y-auto px-4 pb-28 pt-20 md:pb-20"
            >
              <div className="w-full max-w-7xl">
                <div className="mx-auto mb-8 max-w-3xl text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-fuchsia-100">
                    <Layers3 className="h-4 w-4" /> {t.featuresHeaderBadge}
                  </span>
                  <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">{t.featuresTitle}</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">{t.featuresSubtitle}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {FEATURES.map(({ icon: Icon, key, accent }, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.45 }}
                      className="group relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.075] p-5 backdrop-blur-2xl transition-all hover:-translate-y-2 hover:bg-white/[0.115]"
                    >
                      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
                      <div className="relative flex items-start gap-4">
                        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-[#06101f] shadow-xl`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black capitalize tracking-tight text-white">{translate(`nav.${key}`)}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">AI destekli, mühendislik bağlamlı, pratik odaklı mikro deneyim.</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <button type="button" onClick={prev} className="hidden md:flex absolute left-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] text-white backdrop-blur-xl transition-all hover:-translate-x-1 hover:bg-white/12" aria-label="Previous slide">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={next} className="hidden md:flex absolute right-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] text-white backdrop-blur-xl transition-all hover:translate-x-1 hover:bg-white/12" aria-label="Next slide">
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full border border-white/12 bg-black/25 px-2 backdrop-blur-2xl md:bottom-16">
          {slideLabels.map((label, i) => (
            <button key={label} type="button" onClick={() => goTo(i)} className="grid h-12 w-12 place-items-center" aria-label={`Go to ${label}`} aria-current={i === slide ? 'true' : undefined}>
              <span className={`block rounded-full transition-all duration-300 ${i === slide ? 'h-2.5 w-8 bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.8)]' : 'h-2.5 w-2.5 bg-white/35 hover:bg-white/60'}`} />
            </button>
          ))}
          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? t.carouselPlay : t.carouselPause} aria-pressed={paused} className="grid h-12 w-12 place-items-center text-white/70 transition-colors hover:text-white">
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
        </div>
      </main>

      <div translate="no" className="fixed bottom-20 right-3 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-2 py-1 text-white/50 backdrop-blur-xl md:bottom-3">
        <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />
        <span className="text-[10px] font-black tracking-wide">EngVox</span>
        <span className="text-[9px] font-mono font-black text-cyan-200">v{PRODUCT_VERSION}</span>
      </div>

      <Footer className="fixed bottom-0 inset-x-0 z-40 border-white/10 bg-[#040611]/78 text-white backdrop-blur-2xl" />
    </div>
  );
};

export default LandingPage;
