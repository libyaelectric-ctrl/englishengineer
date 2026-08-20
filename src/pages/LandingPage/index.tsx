import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe,
  Headphones,
  PenTool,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Volume2,
  Zap,
} from 'lucide-react';

import { useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { HeroScene } from './HeroScene';
import { Navbar } from './Navbar';
import { getLandingTranslations } from './landing-i18n';

gsap.registerPlugin(ScrollTrigger);

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

const STATS = [
  { value: '10', labelKey: 'statDisciplines', icon: Target },
  { value: '15', labelKey: 'statLanguages', icon: Globe },
  { value: '6', labelKey: 'statModules', icon: BookOpen },
  { value: 'A1-C2', labelKey: 'statCefr', icon: TrendingUp },
] as const;

const WORKFLOW_STEPS = [
  {
    step: 1,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    badgeKey: 'step1Badge',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    step: 2,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    badgeKey: 'step2Badge',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: 3,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    badgeKey: 'step3Badge',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500',
  },
] as const;

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const heroContent = heroContentRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (import.meta.env.MODE === 'test' || prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero entrance timeline — cinematic, Webflow-grade easing
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-hero="badge"]', { y: 24, opacity: 0, duration: 0.8 })
        .from('[data-hero="line"]', { y: 70, opacity: 0, duration: 1, stagger: 0.13 }, '-=0.4')
        .from('[data-hero="subtitle"]', { y: 30, opacity: 0, duration: 0.9 }, '-=0.5')
        .from('[data-hero="cta"]', { y: 24, opacity: 0, stagger: 0.12, duration: 0.7 }, '-=0.5')
        .from('[data-hero="trust"]', { y: 16, opacity: 0, stagger: 0.08, duration: 0.6 }, '-=0.4')
        .from('[data-hero="scroll"]', { opacity: 0, duration: 0.6 }, '-=0.2');

      if (heroContent) {
        gsap.to(heroContent, {
          y: -120,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroContent,
            start: 'top top',
            end: 'bottom 12% top',
            scrub: true,
          },
        });
      }

      const scene = root.querySelector<HTMLElement>('[data-hero-scene]');
      if (scene) {
        gsap.to(scene.querySelector(':scope > canvas') ?? scene, {
          scale: 1.08,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: scene,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Features reveal
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((section) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 86%', once: true },
        });
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-theme="dark"
      className="min-h-screen bg-[#070a1a] text-white pb-14 overflow-x-clip"
    >
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden isolate">
        {/* Ambient gradient aurora (pure CSS, subtle) */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[44rem] h-[44rem] rounded-full bg-[#0b2a6b]/30 blur-3xl animate-ambient-glow" />
          <div
            className="absolute top-1/4 -right-40 w-[38rem] h-[38rem] rounded-full bg-[#3b0a5f]/25 blur-3xl animate-ambient-glow"
            style={{ animationDelay: '1.4s' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[34rem] h-[34rem] rounded-full bg-[#064e77]/20 blur-3xl animate-ambient-glow"
            style={{ animationDelay: '2.6s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070a1a]" />
        </div>

        {/* Three.js particle flow field */}
        <HeroScene />

        <div
          ref={heroContentRef}
          className="relative z-10 text-center px-4 max-w-6xl mx-auto will-change-transform"
        >
          <div
            data-hero="badge"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white/90"
          >
            <Sparkles className="h-5 w-5 text-primary animate-spin-slow" />
            {t.heroBadge}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mt-8 mb-8">
            <span data-hero="line" className="block text-white">
              {t.heroTitle1}
            </span>
            <span
              data-hero="line"
              className="block bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent"
            >
              {t.heroTitleHighlight}
            </span>
            <span data-hero="line" className="block text-white/80">
              {t.heroTitle2}
            </span>
          </h1>

          <p
            data-hero="subtitle"
            className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10"
          >
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
            <a
              data-hero="cta"
              href="#pricing"
              className="px-8 py-4 rounded-full border border-white/20 text-white font-bold text-lg backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all"
            >
              {t.ctaViewPlans}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/50">
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

        {/* Scroll indicator */}
        <div
          data-hero="scroll"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16" data-reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-2">
              {t.featuresHeaderBadge}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-6">
              {t.featuresTitle}
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, key, color, glow }) => (
              <div key={key} className="group relative" data-reveal>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                />
                <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-500">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg ${glow} transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 capitalize">
                    {translate(`nav.${key}`)}
                  </h3>
                  <p className="text-white/50 leading-relaxed text-sm mt-2">
                    {
                      t[
                        `feature${key.charAt(0).toUpperCase() + key.slice(1)}Desc` as keyof typeof t
                      ]
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCIPLINES ─────────────────────────────────────── */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-4xl md:text-5xl font-black text-white mb-16" data-reveal>
            '10 Engineering Disciplines'
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ENGINEERING_DISCIPLINES.map((id, index) => {
              const DisciplineIcon = getDisciplineIcon(id);
              return (
                <div
                  key={id}
                  className="group relative"
                  data-reveal
                  style={{ transitionDelay: `${index * 20}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                    <DisciplineIcon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span className="text-sm font-semibold text-white text-center">
                      {translate(`discipline.${id}`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LandingPage;
