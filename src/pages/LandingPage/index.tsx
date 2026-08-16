import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Headphones,
  PenTool,
  Sparkles,
  Volume2,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getPublicPageCopy } from '@/shared/data/public-page-copy';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';
import { getLandingTranslations } from './landing-i18n';

const FEATURES = [
  { icon: BookOpen, key: 'vocabulary', color: 'blue' },
  { icon: BookOpen, key: 'reading', color: 'emerald' },
  { icon: PenTool, key: 'writing', color: 'violet' },
  { icon: Volume2, key: 'speaking', color: 'orange' },
  { icon: Headphones, key: 'listening', color: 'cyan' },
  { icon: Sparkles, key: 'grammar', color: 'pink' },
] as const;

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);
  const publicCopy = getPublicPageCopy(language);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'EngineerOS — Professional Engineering English';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-14 text-[var(--foreground)] transition-colors duration-300">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
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
              className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--color-primary-foreground)] shadow-lg hover:bg-[var(--color-primary-hover)] transition-all"
            >
              {t.ctaSelectBranch}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] px-6 py-3 text-sm font-semibold hover:border-[var(--color-primary)] transition-colors"
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
            <p className="text-xs text-[var(--color-muted-copy)]">{publicCopy.activeEngineers}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">10</p>
            <p className="text-xs text-[var(--color-muted-copy)]">{publicCopy.disciplines}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">15</p>
            <p className="text-xs text-[var(--color-muted-copy)]">{publicCopy.languages}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">14,199+</p>
            <p className="text-xs text-[var(--color-muted-copy)]">{publicCopy.technicalTerms}</p>
          </div>
        </div>
      </section>

      {/* Disciplines and compact skill map */}
      <section className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {t.disciplinesHeaderBadge}
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">{t.disciplinesTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted-copy)]">
              {t.disciplinesSub}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ENGINEERING_DISCIPLINES.map((id) => (
              <div
                key={id}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--background)] p-4 text-center transition-all hover:border-[var(--color-primary)]/40"
              >
                {(() => {
                  const DisciplineIcon = getDisciplineIcon(id);
                  return (
                    <DisciplineIcon
                      className="h-6 w-6 text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                  );
                })()}
                <span className="text-xs font-semibold">
                  {translate(`discipline.${id}` as Parameters<typeof translate>[0])}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {FEATURES.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--background)] px-3 py-2.5 transition-colors hover:border-[var(--color-primary)]/40"
              >
                <span
                  className={`inline-flex shrink-0 rounded-[var(--radius-card)] bg-${color}-500/10 p-1.5`}
                >
                  <Icon className={`h-4 w-4 text-${color}-500`} />
                </span>
                <span className="text-xs font-semibold capitalize">
                  {translate(`nav.${key}` as Parameters<typeof translate>[0])}
                </span>
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

      <PricingSection />

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">{translate('landing.faqTitle')}</h2>
          <div className="mt-8 space-y-3">
            {[
              ['landing.faq1Q', 'landing.faq1A'],
              ['landing.faq2Q', 'landing.faq2A'],
              ['landing.faq5Q', 'landing.faq5A'],
            ].map(([questionKey, answerKey], i) => (
              <div
                key={i}
                className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)]"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold"
                >
                  {translate(questionKey as Parameters<typeof translate>[0])}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {faqOpen === i && (
                  <p className="px-5 pb-4 text-sm text-[var(--color-muted-copy)]">
                    {translate(answerKey as Parameters<typeof translate>[0])}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LandingPage;
