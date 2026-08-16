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

import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { fadeUp, staggerContainer, staggerItem, fadeIn, scaleIn, countUp, glowPulse } from '@/shared/motion/variants';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';
import { getPublicPageCopy } from '@/shared/data/public-page-copy';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { getLandingTranslations } from './landing-i18n';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';

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

  const heroRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const disciplinesRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const socialProofInView = useInView(socialProofRef, { once: true, margin: '-100px' });
  const disciplinesInView = useInView(disciplinesRef, { once: true, margin: '-100px' });
  const workflowInView = useInView(workflowRef, { once: true, margin: '-100px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-100px' });

  const socialProofStats = [
    { value: '1,420+', label: publicCopy.activeEngineers },
    { value: '10', label: publicCopy.disciplines },
    { value: '15', label: publicCopy.languages },
    { value: '14,199+', label: publicCopy.technicalTerms },
  ];

  useEffect(() => {
    document.title = 'EngineerOS — Professional Engineering English';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-14 text-[var(--foreground)] transition-colors duration-300">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden py-20 md:py-28">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: heroInView ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          className="relative mx-auto max-w-4xl px-4 text-center"
        >
          <motion.div variants={staggerItem} className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
            <motion.span variants={iconHover} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            {t.heroBadge}
          </motion.div>

          <motion.h1 variants={staggerItem} className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {t.heroTitle1}{' '}
            <motion.span
              className="bg-gradient-to-r from-[var(--color-primary)] to-blue-400 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              {t.heroTitleHighlight}
            </motion.span>{' '}
            {t.heroTitle2}
          </motion.h1>

          <motion.p variants={staggerItem} className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted-copy)]">
            {t.heroSubtitle}
          </motion.p>

          <motion.div variants={staggerItem} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.a
              href="/welcome"
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
              className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-primary-hover)] transition-all"
            >
              {t.ctaSelectBranch}
              <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </motion.a>
            <motion.a
              href="#pricing"
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] px-6 py-3 text-sm font-semibold hover:border-[var(--color-primary)] transition-colors"
            >
              {t.ctaViewPlans}
            </motion.a>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-muted-copy)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {t.badgeNoCard}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {t.badgeLanguages}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section ref={socialProofRef} className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={socialProofInView ? 'visible' : 'hidden'}
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 text-center"
        >
          {socialProofStats.map((stat, i) => (
            <motion.div key={i} variants={staggerItem} className="text-center">
              <motion.div variants={countUp} className="text-2xl font-bold text-[var(--color-primary)]">
                {stat.value}
              </motion.div>
              <motion.p variants={fadeIn} className="text-xs text-[var(--color-muted-copy)]">
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Disciplines and compact skill map */}
      <section ref={disciplinesRef} className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface)] py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={disciplinesInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-6xl px-4"
        >
          <motion.div variants={staggerItem} className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {t.disciplinesHeaderBadge}
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">{t.disciplinesTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted-copy)]">
              {t.disciplinesSub}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={disciplinesInView ? 'visible' : 'hidden'} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ENGINEERING_DISCIPLINES.map((id, i) => (
              <motion.div key={id} variants={staggerItem} className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--background)] p-4 text-center transition-all hover:border-[var(--color-primary)]/40" whileHover={{ scale: 1.03, y: -2 }}>
                {(() => {
                  const DisciplineIcon = getDisciplineIcon(id);
                  return (
                    <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                      <DisciplineIcon className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
                    </motion.span>
                  );
                })()}
                <span className="text-xs font-semibold">{translate(`discipline.${id}` as Parameters<typeof translate>[0])}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={disciplinesInView ? 'visible' : 'hidden'} className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {FEATURES.map(({ icon: Icon, key, color }, i) => (
              <motion.div key={key} variants={staggerItem} className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--background)] px-3 py-2.5 transition-colors hover:border-[var(--color-primary)]/40" whileHover={{ scale: 1.02, y: -2 }}>
                <motion.span
                  className={`inline-flex shrink-0 rounded-[var(--radius-card)] bg-${color}-500/10 p-1.5`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon className={`h-4 w-4 text-${color}-500`} />
                </motion.span>
                <span className="text-xs font-semibold capitalize">
                  {translate(`nav.${key}` as Parameters<typeof translate>[0])}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section ref={workflowRef} className="py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={workflowInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-4xl px-4"
        >
          <motion.h2 variants={staggerItem} className="text-center text-3xl font-bold">{t.workflowTitle}</h2>
          <motion.div variants={staggerContainer} initial="hidden" animate={workflowInView ? 'visible' : 'hidden'} className="mt-12 space-y-8">
            {[
              { step: 1, title: t.step1Title, desc: t.step1Desc, badge: t.step1Badge },
              { step: 2, title: t.step2Title, desc: t.step2Desc, badge: t.step2Badge },
              { step: 3, title: t.step3Title, desc: t.step3Desc, badge: t.step3Badge },
            ].map(({ step, title, desc, badge }) => (
              <motion.div key={step} variants={staggerItem} className="flex gap-6">
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {step}
                </motion.div>
                <motion.div variants={fadeUp}>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">{desc}</p>
                  <span className="mt-2 inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    {badge}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
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
                    <span className="text-xs font-semibold">{translate(`discipline.${id}` as Parameters<typeof translate>[0])}</span>
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
      <section ref={faqRef} className="py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={faqInView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl px-4"
        >
          <motion.h2 variants={staggerItem} className="text-center text-3xl font-bold">{translate('landing.faqTitle')}</h2>
          <motion.div variants={staggerContainer} initial="hidden" animate={faqInView ? 'visible' : 'hidden'} className="mt-8 space-y-3">
            {[
              ['landing.faq1Q', 'landing.faq1A'],
              ['landing.faq2Q', 'landing.faq2A'],
              ['landing.faq5Q', 'landing.faq5A'],
            ].map(([questionKey, answerKey], i) => (
              <motion.div key={i} variants={staggerItem}>
                <motion.button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {translate(questionKey as Parameters<typeof translate>[0])}
                  <motion.div
                    animate={{ rotate: faqOpen === i ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="px-5 pb-4 text-sm text-[var(--color-muted-copy)]"
                    >
                      {translate(answerKey as Parameters<typeof translate>[0])}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LandingPage;
