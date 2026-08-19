import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe,
  Headphones,
  PenTool,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { motion, useInView } from 'motion/react';

import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { ENGINEERING_DISCIPLINES } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { PricingSection } from './PricingSection';
import { getLandingTranslations } from './landing-i18n';

const FEATURES = [
  { icon: BookOpen, key: 'vocabulary', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: BookOpen, key: 'reading', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: PenTool, key: 'writing', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: Volume2, key: 'speaking', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Headphones, key: 'listening', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: Sparkles, key: 'grammar', color: 'text-pink-500', bg: 'bg-pink-500/10' },
] as const;

const AnimatedSection = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'EngVox — Engineering English for Global Projects';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-14 text-[var(--foreground)] transition-colors duration-300">
      <Navbar />

      {/* Hero with animated gradient */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-violet-500/10 via-transparent to-primary/10"
            animate={{
              rotate: [360, 0],
            }}
            transition={{
              duration: 80,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              {t.heroBadge}
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>{' '}
            {t.heroTitle2}
          </motion.h1>

          <motion.p
            className="mx-auto mt-8 max-w-2xl text-xl text-[var(--color-muted-copy)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/dashboard"
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              {t.ctaSelectBranch}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
            <a
              href="#pricing"
              className="flex items-center gap-2 rounded-full border-2 border-[var(--color-border-soft)] px-8 py-4 text-base font-semibold hover:border-primary hover:text-primary transition-all"
            >
              {t.ctaViewPlans}
            </a>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-muted-copy)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {t.badgeNoCard}
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              {t.badgeLanguages}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with stagger animation */}
      <AnimatedSection className="py-20 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <motion.p
              className="text-sm font-semibold uppercase tracking-wider text-primary"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {t.disciplinesHeaderBadge}
            </motion.p>
            <motion.h2
              className="mt-4 text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {t.disciplinesTitle}
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {FEATURES.map(({ icon: Icon, key, color, bg }, index) => (
              <motion.div
                key={key}
                className={`flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--background)] p-6 text-center transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-1`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`rounded-xl ${bg} p-3`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <span className="text-sm font-semibold capitalize">
                  {translate(`nav.${key}` as Parameters<typeof translate>[0])}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Disciplines with animated grid */}
      <AnimatedSection className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              10 Mühendislik Dalı
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-[var(--color-muted-copy)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Alanınıza özel kelime dağarcığı ve içerik
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {ENGINEERING_DISCIPLINES.map((id, index) => {
              const DisciplineIcon = getDisciplineIcon(id);
              return (
                <motion.div
                  key={id}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--background)] p-6 text-center transition-all hover:border-primary/40 hover:shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <DisciplineIcon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <span className="text-sm font-semibold">
                    {translate(`discipline.${id}` as Parameters<typeof translate>[0])}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* How it Works with animated steps */}
      <AnimatedSection className="py-20 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-4">
          <motion.h2
            className="text-center text-4xl font-bold md:text-5xl mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t.workflowTitle}
          </motion.h2>

          <div className="relative">
            {/* Animated line connecting steps */}
            <motion.div
              className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ transformOrigin: 'top' }}
            />

            <div className="space-y-12">
              {[
                { step: 1, title: t.step1Title, desc: t.step1Desc, badge: t.step1Badge, icon: Zap },
                {
                  step: 2,
                  title: t.step2Title,
                  desc: t.step2Desc,
                  badge: t.step2Badge,
                  icon: BookOpen,
                },
                {
                  step: 3,
                  title: t.step3Title,
                  desc: t.step3Desc,
                  badge: t.step3Badge,
                  icon: Sparkles,
                },
              ].map(({ step, title, desc, badge, icon: Icon }, index) => (
                <motion.div
                  key={step}
                  className="flex gap-8 items-start"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <motion.div
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="mt-2 text-base text-[var(--color-muted-copy)]">{desc}</p>
                    <span className="mt-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                      {badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <PricingSection />

      {/* FAQ with animated accordion */}
      <AnimatedSection className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <motion.h2
            className="text-center text-4xl font-bold md:text-5xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {translate('landing.faqTitle')}
          </motion.h2>

          <div className="space-y-4">
            {[
              ['landing.faq1Q', 'landing.faq1A'],
              ['landing.faq2Q', 'landing.faq2A'],
              ['landing.faq5Q', 'landing.faq5A'],
            ].map(([questionKey, answerKey], i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-[var(--color-border-soft)] overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold hover:bg-[var(--color-surface)] transition-colors"
                >
                  {translate(questionKey as Parameters<typeof translate>[0])}
                  <motion.div
                    animate={{ rotate: faqOpen === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[var(--color-muted-copy)]" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: faqOpen === i ? 'auto' : 0,
                    opacity: faqOpen === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-base text-[var(--color-muted-copy)]">
                    {translate(answerKey as Parameters<typeof translate>[0])}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.h2
            className="text-4xl font-bold md:text-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Mühendislik İngilizcenizi Geliştirmeye Başlayın
          </motion.h2>
          <motion.p
            className="text-lg text-[var(--color-muted-copy)] mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Kredi kartı gerekmez. Hemen ücretsiz planla başlayın.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-blue-600 px-10 py-5 text-lg font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              Ücretsiz Başla
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

export default LandingPage;
