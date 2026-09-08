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

const SLIDE_INTERVAL = 7000;
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 96 : -96, opacity: 0, scale: 0.985, filter: 'blur(8px)' }),
  center: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? -96 : 96, opacity: 0, scale: 0.985, filter: 'blur(8px)' }),
};

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);
  const metrics = useMemo(
    () => [
      { label: t.metricCoach, value: '24/7', icon: Cpu },
      { label: t.metricCefr, value: 'A1-C2', icon: Gauge },
      { label: t.metricMode, value: '15+', icon: CircuitBoard },
    ],
    [t]
  );

  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setSceneReady(true), { timeout: 180 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timeout = window.setTimeout(() => setSceneReady(true), 40);
    return () => window.clearTimeout(timeout);
  }, []);

  const totalSlides = 3;
  const goTo = useCallback((nextSlide: number) => { setDirection(nextSlide > slide ? 1 : -1); setSlide(nextSlide); }, [slide]);
  const next = useCallback(() => goTo((slide + 1) % totalSlides), [goTo, slide]);
  const prev = useCallback(() => goTo((slide - 1 + totalSlides) % totalSlides), [goTo, slide]);

  useEffect(() => {
    if (prefersReduced || paused) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
    <div className="relative h-dvh w-full max-w-full overflow-hidden bg-slate-50 text-slate-950 overscroll-none dark:bg-[#040611] dark:text-white">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>{sceneReady && <HeroScene />}</Suspense>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.14),transparent_30%),linear-gradient(180deg,rgba(248,250,252,0.18),rgba(248,250,252,0.88))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(0,210,255,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(151,71,255,0.25),transparent_30%),linear-gradient(180deg,rgba(4,6,17,0.08),rgba(4,6,17,0.92))]" />
      </div>

      <main id="main-content" ref={rootRef} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative z-10 h-full w-full overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          {slide === 0 && (
            <motion.section key="hero" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 grid h-full place-items-center overflow-hidden px-4 pb-16 pt-14 sm:pb-16 sm:pt-14">
              <div className="mx-auto grid w-full max-w-7xl items-center gap-4 lg:grid-cols-[1fr_0.86fr] xl:gap-6">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-white/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-800 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.07] dark:text-cyan-100 sm:text-xs"><Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-300" />{t.heroBadge}</div>
                  <h1 className="mx-auto mt-3 max-w-5xl text-[clamp(2.1rem,6.1vw,5.25rem)] font-black leading-[0.88] tracking-[-0.075em] lg:mx-0"><span className="block">{t.heroTitle1}</span><span className="block bg-gradient-to-r from-cyan-600 via-slate-950 to-fuchsia-600 bg-clip-text py-1 text-transparent drop-shadow-[0_0_24px_rgba(6,182,212,0.18)] dark:from-cyan-200 dark:via-white dark:to-fuchsia-200">{t.heroTitleHighlight}</span><span className="block text-slate-600 dark:text-white/72">{t.heroTitle2}</span></h1>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-[15px] lg:mx-0 dark:text-slate-200">{t.heroSubtitle}</p>
                  <div className="mt-4 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row lg:justify-start">
                    <Link to="/dashboard" className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-300 via-white to-fuchsia-200 px-5 py-3 text-center text-sm font-black !text-slate-950 shadow-[0_0_46px_rgba(6,182,212,0.24)] ring-1 ring-cyan-200/70 transition-transform hover:-translate-y-1 dark:from-cyan-200 dark:via-white dark:to-fuchsia-200"><span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-700 group-hover:translate-x-full" /><span className="relative inline-flex items-center justify-center gap-2">{t.ctaSelectBranch}<Rocket className="h-4 w-4" /></span></Link>
                    <Link to="/dashboard" className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-3 text-center text-sm font-black text-cyan-900 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-cyan-500/16 dark:border-cyan-300/30 dark:text-cyan-100">{t.ctaTryDemo}</Link>
                    <Link to="/pricing" className="rounded-2xl border border-slate-900/10 bg-white/60 px-5 py-3 text-center text-sm font-black text-slate-900 backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white dark:border-white/15 dark:bg-white/[0.08] dark:text-white">{t.ctaViewPlans}</Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-700 lg:justify-start dark:text-slate-200"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-300" /> {t.badgeNoCard}</span><span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5"><Globe className="h-3.5 w-3.5 text-blue-500 dark:text-blue-300" /> {t.badgeLanguages}</span></div>
                </div>
                <div className="relative mx-auto hidden w-full max-w-lg lg:block"><div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-cyan-400/20 via-fuchsia-500/14 to-amber-300/10 blur-3xl" /><div className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/58 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.08]"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">{t.cockpitLabel}</p><p className="text-sm font-bold text-slate-700 dark:text-white/70">{t.cockpitTitle}</p></div><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-200">{t.cockpitStatus}</span></div><div className="grid gap-2.5 sm:grid-cols-3">{metrics.map(({ label, value, icon: Icon }) => (<div key={label} className="rounded-2xl border border-slate-900/8 bg-white/50 p-3 dark:border-white/10 dark:bg-black/20"><Icon className="mb-2 h-5 w-5 text-cyan-600 dark:text-cyan-200" /><p className="text-xl font-black tracking-tight">{value}</p><p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</p></div>))}</div><div className="mt-3 rounded-3xl border border-slate-900/8 bg-white/54 p-4 dark:border-white/10 dark:bg-[#050916]/75"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-black">{t.skillMap}</span><Zap className="h-5 w-5 text-amber-500 dark:text-amber-200" /></div><div className="space-y-2.5">{FEATURES.slice(0, 4).map(({ key, accent }, index) => (<div key={key} className="grid grid-cols-[5.4rem_1fr_2.3rem] items-center gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-200"><span>{translate(`nav.${key}`)}</span><span className="h-2 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10"><motion.span className={`block h-full rounded-full bg-gradient-to-r ${accent}`} initial={{ width: 0 }} animate={{ width: `${78 + index * 5}%` }} transition={{ duration: 1.1, delay: 0.25 + index * 0.12 }} /></span><span className="text-right text-cyan-700 dark:text-cyan-100">{78 + index * 5}%</span></div>))}</div></div></div></div>
              </div>
            </motion.section>
          )}
          {slide === 1 && (<motion.section key="disciplines" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 grid h-full place-items-center overflow-hidden px-4 pb-16 pt-14"><div className="w-full max-w-6xl"><div className="mx-auto mb-4 max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-200 sm:text-xs">{t.disciplinesBadge}</p><h2 className="mt-2 text-[clamp(1.85rem,4.5vw,3.7rem)] font-black leading-none tracking-[-0.05em]">{t.disciplinesTitle}</h2></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">{ENGINEERING_DISCIPLINES.map((id, index) => { const DisciplineIcon = getDisciplineIcon(id); return (<motion.div key={id} initial={{ opacity: 0, y: 16, rotateX: -16 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: index * 0.025, duration: 0.38 }} className="group relative"><div className="absolute inset-0 rounded-3xl bg-cyan-300/20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" /><div className="relative grid min-h-[5rem] place-items-center rounded-3xl border border-slate-900/10 bg-white/62 p-2.5 text-center shadow-2xl backdrop-blur-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/50 dark:border-white/12 dark:bg-white/[0.075] sm:min-h-[6rem]"><DisciplineIcon className="mb-1.5 h-6 w-6 text-cyan-700 transition-transform group-hover:scale-125 group-hover:rotate-6 dark:text-cyan-100" /><span className="text-[10px] font-black leading-tight text-slate-900 dark:text-white sm:text-[11px]">{translate(`discipline.${id}`)}</span></div></motion.div>); })}</div></div></motion.section>)}
          {slide === 2 && (<motion.section key="features" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 grid h-full place-items-center overflow-hidden px-4 pb-16 pt-14"><div className="w-full max-w-6xl"><div className="mx-auto mb-4 max-w-3xl text-center"><span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/62 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-700 dark:border-white/12 dark:bg-white/[0.07] dark:text-fuchsia-100 sm:text-xs"><Layers3 className="h-4 w-4" /> {t.featuresHeaderBadge}</span><h2 className="mt-2 text-[clamp(1.85rem,4.4vw,3.65rem)] font-black leading-none tracking-[-0.06em]">{t.featuresTitle}</h2><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-200">{t.featuresSubtitle}</p></div><div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">{FEATURES.map(({ icon: Icon, key, accent }, index) => (<motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.38 }} className="group relative overflow-hidden rounded-[1.35rem] border border-slate-900/10 bg-white/64 p-3.5 backdrop-blur-2xl transition-all hover:-translate-y-1 dark:border-white/12 dark:bg-white/[0.075]"><div className={`absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} /><div className="relative flex items-start gap-3"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-[#06101f] shadow-xl`}><Icon className="h-5 w-5" /></div><div><h3 className="text-base font-black capitalize tracking-tight text-slate-950 dark:text-white">{translate(`nav.${key}`)}</h3><p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-200">{t.featureDescription}</p></div></div></motion.div>))}</div></div></motion.section>)}
        </AnimatePresence>
        <button type="button" onClick={prev} className="hidden md:flex absolute left-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-900/10 bg-white/58 text-slate-900 backdrop-blur-xl transition-all hover:-translate-x-1 hover:bg-white dark:border-white/12 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/12" aria-label="Previous slide"><ArrowLeft className="h-5 w-5" /></button>
        <button type="button" onClick={next} className="hidden md:flex absolute right-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-900/10 bg-white/58 text-slate-900 backdrop-blur-xl transition-all hover:translate-x-1 hover:bg-white dark:border-white/12 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/12" aria-label="Next slide"><ArrowRight className="h-5 w-5" /></button>
        <div className="absolute bottom-[3.85rem] left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full border border-slate-900/10 bg-white/62 px-2 backdrop-blur-2xl dark:border-white/12 dark:bg-black/25">{slideLabels.map((label, i) => (<button key={label} type="button" onClick={() => goTo(i)} className="grid h-10 w-10 place-items-center" aria-label={`Go to ${label}`} aria-current={i === slide ? 'true' : undefined}><span className={`block rounded-full transition-all duration-300 ${i === slide ? 'h-2 w-8 bg-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.55)] dark:bg-cyan-200' : 'h-2 w-2 bg-slate-500/45 hover:bg-slate-700/60 dark:bg-white/35 dark:hover:bg-white/60'}`} /></button>))}<button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? t.carouselPlay : t.carouselPause} aria-pressed={paused} className="grid h-10 w-10 place-items-center text-slate-700 transition-colors hover:text-slate-950 dark:text-white/70 dark:hover:text-white">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button></div>
      </main>
      <div translate="no" className="fixed bottom-14 right-3 z-50 hidden items-center gap-1 rounded-full border border-slate-900/10 bg-white/62 px-2 py-1 text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-black/25 dark:text-white/50 md:flex"><ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-200" /><span className="text-[10px] font-black tracking-wide">EngVox</span><span className="text-[9px] font-mono font-black text-cyan-700 dark:text-cyan-200">v{PRODUCT_VERSION}</span></div>
      <Footer className="fixed bottom-0 inset-x-0 z-40" />
    </div>
  );
};

export default LandingPage;
