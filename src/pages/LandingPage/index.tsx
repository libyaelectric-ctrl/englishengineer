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

import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { HeroScene } from './HeroScene';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';
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
  { value: '10', count: 10, label: 'Mühendislik Dalı', icon: Target },
  { value: '15', count: 15, label: 'Desteklenen Dil', icon: Globe },
  { value: '6', count: 6, label: 'Öğrenme Modülü', icon: BookOpen },
  { value: 'A1-C2', count: null, label: 'CEFR Seviyeleri', icon: TrendingUp },
] as const;

function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    vocabulary: '14,000+ teknik terim ile mühendislik kelime dağarcığınızı geliştirin.',
    reading: 'FIDIC sözleşmeleri ve teknik dokümanlar ile okuma pratiği yapın.',
    writing:
      'Profesyonel e-posta ve rapor yazım becerilerinizi, gerçek saha senaryolarıyla geliştirin.',
    speaking: 'Sesli pratik ve telaffuz analizi ile konuşma becerilerinizi geliştirin.',
    listening: 'İş toplantıları ve saha konuşmaları ile dinleme pratiği yapın.',
    grammar: 'Mühendislik İngilizcesine özel dilbilgisi modülleri ile gramerinizi güçlendirin.',
  };
  return descriptions[key] || '';
}

// ---------------------------------------------------------------------------
// Shared visual primitives
// ---------------------------------------------------------------------------

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 bg-[var(--color-surface)]/40 backdrop-blur-xl shadow-2xl ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {children}
  </div>
);

const FloatingElement = ({
  children,
  delay = 0,
  className = '',
  duration = 4,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (import.meta.env.MODE === 'test') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const float = gsap.to(node, {
      y: -10,
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay,
    });
    return () => {
      float.kill();
    };
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const heroContent = heroContentRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (import.meta.env.MODE === 'test' || prefersReduced) return;

    const ctx = gsap.context(() => {
      // Reveals throughout the page – Webflow-grade ease + slight drift.
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((section) => {
        gsap.from(section, {
          y: 44,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 86%', once: true },
        });
      });

      // Stat counters count up as they enter the viewport.
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count || '0');
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });

      // Hero entrance timeline – cinematic, Webflow-grade easing.
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

      const line = timelineLineRef.current;
      if (line) {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
            end: 'bottom 60%',
            scrub: 0.6,
          },
        });
      }
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

        {/* Three.js constellation globe */}
        <HeroScene />

        <div
          ref={heroContentRef}
          className="relative z-10 text-center px-4 max-w-6xl mx-auto will-change-transform"
        >
          <FloatingElement delay={0.2} duration={6}>
            <div
              data-hero="badge"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white/90"
            >
              <Sparkles className="h-5 w-5 text-primary animate-spin-slow" />
              {t.heroBadge}
            </div>
          </FloatingElement>

          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mt-8 mb-8"
            data-hero-wrap
          >
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

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="relative py-6 -mt-24 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div data-reveal>
            <GlassCard className="p-8 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {STATS.map(({ value, count, label, icon: Icon }) => (
                  <div key={label} className="text-center" data-reveal>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/25 to-blue-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-white mb-2">
                      {count === null ? value : <span data-count={String(count)}>{value}</span>}
                    </p>
                    <p className="text-sm text-white/50">{label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16" data-reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-2">
              {t.disciplinesHeaderBadge}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-6">
              {t.disciplinesTitle}
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">{t.disciplinesSub}</p>
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
                  <p className="text-white/50 leading-relaxed">{getFeatureDescription(key)}</p>
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
            10 Mühendislik Dalı
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

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-center text-4xl md:text-5xl font-black text-white mb-20" data-reveal>
            {t.workflowTitle}
          </h2>

          <div className="relative">
            <div
              ref={timelineLineRef}
              className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary via-blue-500 to-violet-500"
            />

            <div className="space-y-16">
              {[
                {
                  step: 1,
                  title: t.step1Title,
                  desc: t.step1Desc,
                  badge: t.step1Badge,
                  icon: Zap,
                  color: 'from-yellow-500 to-orange-500',
                },
                {
                  step: 2,
                  title: t.step2Title,
                  desc: t.step2Desc,
                  badge: t.step2Badge,
                  icon: BookOpen,
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  step: 3,
                  title: t.step3Title,
                  desc: t.step3Desc,
                  badge: t.step3Badge,
                  icon: Sparkles,
                  color: 'from-violet-500 to-purple-500',
                },
              ].map(({ step, title, desc, badge, icon: Icon, color }, index) => (
                <div
                  key={step}
                  className="relative flex gap-8 items-start"
                  data-reveal
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div
                    className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-2xl transition-transform duration-300 hover:scale-110 hover:rotate-6`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-lg text-white/50 leading-relaxed mb-4">{desc}</p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-white border border-white/15">
                      <Shield className="h-4 w-4" />
                      {badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <div id="pricing" data-reveal>
        <PricingSection />
      </div>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-4xl md:text-5xl font-black text-white mb-16" data-reveal>
            {translate('landing.faqTitle')}
          </h2>

          <div className="space-y-4">
            {[
              ['landing.faq1Q', 'landing.faq1A'],
              ['landing.faq2Q', 'landing.faq2A'],
              ['landing.faq5Q', 'landing.faq5A'],
            ].map(([questionKey, answerKey], i) => (
              <div key={i} className="group" data-reveal>
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-colors duration-300">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    aria-expanded={faqOpen === i}
                    className="flex w-full items-center justify-between px-8 py-6 text-left cursor-pointer"
                  >
                    <span className="text-lg font-semibold text-white pr-4">
                      {translate(questionKey)}
                    </span>
                    <ChevronDown
                      className={`h-6 w-6 text-white/50 shrink-0 transition-transform duration-300 ${
                        faqOpen === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {faqOpen === i && (
                    <div className="px-8 pb-6 -mt-1">
                      <p className="text-white/60 leading-relaxed">{translate(answerKey)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-violet-500/20 animate-pulse" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center" data-reveal>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
            Mühendislik İngilizcenizi
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Geliştirmeye Başlayın
            </span>
          </h2>

          <p className="text-xl text-white/60 mb-12">
            Kredi kartı gerekmez. Hemen ücretsiz planla başlayın.
          </p>

          <div>
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-4 px-12 py-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-xl font-bold text-white overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative z-10">Ücretsiz Başla</span>
              <ArrowRight className="relative z-10 h-6 w-6 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LandingPage;
