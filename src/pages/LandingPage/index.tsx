import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe,
  Headphones,
  Moon,
  PenTool,
  Sparkles,
  Sun,
  Volume2,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTheme } from '@/features/theme/ThemeProvider';
import { useLocalizationStore, INTERFACE_LANGUAGES } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getLandingTranslations } from './landing-i18n';

const DISCIPLINE_ICONS: Record<string, string> = {
  architecture: '🏛️',
  chemical: '⚗️',
  civil: '🌉',
  electrical: '⚡',
  electronics: '🔌',
  hse: '🦺',
  industrial: '🏭',
  mechanical: '⚙️',
  mechatronics: '🤖',
  software: '💻',
};

const FEATURES = [
  { icon: BookOpen, key: 'vocabulary', color: 'blue' },
  { icon: BookOpen, key: 'reading', color: 'emerald' },
  { icon: PenTool, key: 'writing', color: 'violet' },
  { icon: Volume2, key: 'speaking', color: 'orange' },
  { icon: Headphones, key: 'listening', color: 'cyan' },
  { icon: Sparkles, key: 'grammar', color: 'pink' },
] as const;

const PRICING_TIERS = [
  { id: 'junior', price: 29, popular: false },
  { id: 'senior', price: 59, popular: true },
  { id: 'specialist', price: 79, popular: false },
  { id: 'master', price: 99, popular: false },
  { id: 'team', price: 999, popular: false },
] as const;

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);
  const [langOpen, setLangOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'EngineerOS — Professional Engineering English';
  }, []);

  const langLabel =
    INTERFACE_LANGUAGES.find((l) => l.id === language)?.nativeLabel || language;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border-soft)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-[var(--color-primary)]" />
            EngineerOS
          </Link>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-soft)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-primary)] transition-colors"
              >
                <Globe className="h-4 w-4" />
                {langLabel}
                <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 max-h-64 w-48 overflow-y-auto rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface)] p-1 shadow-xl">
                  {INTERFACE_LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        useLocalizationStore.getState().setLanguage(l.id as SupportedInterfaceLanguage);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        l.id === language
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-soft)] hover:border-[var(--color-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              to="/welcome"
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {t.ctaStartFree}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            {t.heroBadge}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {t.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-blue-400 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>{' '}
            {t.heroTitle2}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted-copy)]">
            {t.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/welcome"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-primary-hover)] transition-all"
            >
              {t.ctaSelectBranch}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] px-6 py-3 text-sm font-semibold hover:border-[var(--color-primary)] transition-colors"
            >
              {t.ctaViewPlans}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-muted-copy)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {t.badgeNoCard}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {t.badgeLanguages}
            </span>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">1,420+</p>
            <p className="text-xs text-[var(--color-muted-copy)]">Active Engineers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">10</p>
            <p className="text-xs text-[var(--color-muted-copy)]">Disciplines</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">15</p>
            <p className="text-xs text-[var(--color-muted-copy)]">Languages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">5,000+</p>
            <p className="text-xs text-[var(--color-muted-copy)]">Technical Terms</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {t.disciplinesHeaderBadge}
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">{t.disciplinesTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted-copy)]">{t.disciplinesSub}</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className="group rounded-2xl border border-[var(--color-border-soft)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-${color}-500/10 p-3`}>
                  <Icon className={`h-6 w-6 text-${color}-500`} />
                </div>
                <h3 className="font-bold capitalize">{key}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {t.disciplinesFormulaDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">{t.disciplinesTitle}</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ENGINEERING_DISCIPLINES.map((id) => (
              <div
                key={id}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--background)] p-4 text-center transition-all hover:border-[var(--color-primary)]/40"
              >
                <span className="text-2xl">{DISCIPLINE_ICONS[id] || '🔧'}</span>
                <span className="text-xs font-semibold capitalize">{id}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold">{t.workflowTitle}</h2>
          <div className="mt-12 space-y-8">
            {[
              { step: 1, title: t.step1Title, desc: t.step1Desc, badge: t.step1Badge },
              { step: 2, title: t.step2Title, desc: t.step2Desc, badge: t.step2Badge },
              { step: 3, title: t.step3Title, desc: t.step3Desc, badge: t.step3Badge },
            ].map(({ step, title, desc, badge }) => (
              <div key={step} className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">{desc}</p>
                  <span className="mt-2 inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">{t.pricingTitle}</h2>
          <p className="mt-2 text-center text-[var(--color-muted-copy)]">{t.pricingSubtitle}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PRICING_TIERS.map(({ id, price, popular }) => (
              <div
                key={id}
                className={`relative rounded-2xl border bg-[var(--background)] p-5 transition-all ${
                  popular
                    ? 'border-[var(--color-primary)] shadow-lg'
                    : 'border-[var(--color-border-soft)] hover:border-[var(--color-primary)]/40'
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white">
                    {t.pricingMostPopular}
                  </span>
                )}
                <p className="text-sm font-semibold capitalize">{id}</p>
                <p className="mt-2 text-3xl font-bold">
                  ${price}
                  <span className="text-sm font-normal text-[var(--color-muted-copy)]">
                    {t.pricingPerMonth}
                  </span>
                </p>
                <Link
                  to="/welcome"
                  className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    popular
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                      : 'border border-[var(--color-border-soft)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {t.pricingGetStarted}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: 'Can I change my discipline later?', a: 'No — discipline selection is permanent to ensure a focused curriculum.' },
              { q: 'Is there a free plan?', a: 'Yes — the Junior plan includes core learning modules with daily AI request allowances.' },
              { q: 'Which languages are supported?', a: '15 interface languages including EN, TR, DE, AR, ES, FR, PT, RU, ZH, JA, IT, VI, PL, ID, NL.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-[var(--color-border-soft)]">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold"
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <p className="px-5 pb-4 text-sm text-[var(--color-muted-copy)]">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-primary)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="text-3xl font-bold">{t.finalCtaTitle}</h2>
          <p className="mt-3 text-white/80">{t.finalCtaSub}</p>
          <Link
            to="/welcome"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg hover:bg-white/90 transition-all"
          >
            {t.ctaStartFree}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-white/60">{t.finalCtaNote}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-soft)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-[var(--color-muted-copy)] sm:flex-row">
          <p>© 2026 EngineerOS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-[var(--color-primary)]">Pricing</Link>
            <Link to="/welcome" className="hover:text-[var(--color-primary)]">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
