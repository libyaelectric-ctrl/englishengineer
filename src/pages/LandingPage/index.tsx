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
import { motion, useInView, useScroll, useTransform } from 'motion/react';

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
  { value: '10', label: 'Mühendislik Dalı', icon: Target },
  { value: '15', label: 'Desteklenen Dil', icon: Globe },
  { value: '6', label: 'Öğrenme Modülü', icon: BookOpen },
  { value: 'A1-C2', label: 'CEFR Seviyeleri', icon: TrendingUp },
];

const GlassCard = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

const FloatingElement = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  </motion.div>
);

export const LandingPage = () => {
  const { language, translate } = useLocalizationStore();
  const t = getLandingTranslations(language);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  useEffect(() => {
    document.title = 'EngVox — Engineering English for Global Projects';

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--background)] pb-14 text-[var(--foreground)] transition-colors duration-300"
    >
      <Navbar />

      {/* Hero with parallax and gradient mesh */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />

        <motion.div
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Floating badge */}
          <FloatingElement delay={0.2}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white mb-8">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
              {t.heroBadge}
            </div>
          </FloatingElement>

          {/* Main heading with gradient text */}
          <motion.h1
            className="text-6xl md:text-8xl font-black leading-tight tracking-tight mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-white">{t.heroTitle1}</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>
            <br />
            <span className="text-white">{t.heroTitle2}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {t.heroSubtitle}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link
              to="/dashboard"
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t.ctaSelectBranch}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-bold text-lg backdrop-blur-md hover:bg-white/10 hover:border-white/50 transition-all"
            >
              {t.ctaViewPlans}
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              {t.badgeNoCard}
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              {t.badgeLanguages}
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-white/50" />
        </motion.div>
      </section>

      {/* Stats section with glassmorphism */}
      <section className="relative py-20 -mt-32 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard className="p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(({ value, label, icon: Icon }, index) => (
                <motion.div
                  key={label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <p className="text-3xl md:text-4xl font-black text-white mb-2">{value}</p>
                  <p className="text-sm text-white/60">{label}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features with interactive cards */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.p
              className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {t.disciplinesHeaderBadge}
            </motion.p>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              {t.disciplinesTitle}
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">{t.disciplinesSub}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, key, color, glow }, index) => (
              <motion.div
                key={key}
                className="group relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                />
                <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg ${glow}`}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3 capitalize">
                    {translate(`nav.${key}` as Parameters<typeof translate>[0])}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{getFeatureDescription(key)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines showcase */}
      <section className="relative py-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            className="text-center text-5xl md:text-6xl font-black text-white mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            10 Mühendislik Dalı
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ENGINEERING_DISCIPLINES.map((id, index) => {
              const DisciplineIcon = getDisciplineIcon(id);
              return (
                <motion.div
                  key={id}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <DisciplineIcon className="h-10 w-10 text-primary" />
                    </motion.div>
                    <span className="text-sm font-semibold text-white text-center">
                      {translate(`discipline.${id}` as Parameters<typeof translate>[0])}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works with timeline */}
      <section className="relative py-32">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            className="text-center text-5xl md:text-6xl font-black text-white mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t.workflowTitle}
          </motion.h2>

          <div className="relative">
            {/* Animated timeline line */}
            <motion.div
              className="absolute left-8 top-0 w-0.5 h-full bg-gradient-to-b from-primary via-blue-500 to-violet-500"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
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
                <motion.div
                  key={step}
                  className="relative flex gap-8 items-start"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <motion.div
                    className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8" />
                  </motion.div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-lg text-white/70 leading-relaxed mb-4">{desc}</p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-white border border-white/20">
                      <Shield className="h-4 w-4" />
                      {badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* FAQ with glassmorphism */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            className="text-center text-5xl md:text-6xl font-black text-white mb-16"
            initial={{ opacity: 0, y: 30 }}
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
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="flex w-full items-center justify-between px-8 py-6 text-left"
                  >
                    <span className="text-lg font-semibold text-white pr-4">
                      {translate(questionKey as Parameters<typeof translate>[0])}
                    </span>
                    <motion.div
                      animate={{ rotate: faqOpen === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-6 w-6 text-white/60" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: faqOpen === i ? 'auto' : 0,
                      opacity: faqOpen === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-8 pb-6 text-white/70 leading-relaxed">
                      {translate(answerKey as Parameters<typeof translate>[0])}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with animated background */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-violet-500/20"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            className="text-5xl md:text-6xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Mühendislik İngilizcenizi
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Geliştirmeye Başlayın
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-white/70 mb-12"
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
              className="group relative inline-flex items-center gap-4 px-12 py-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-xl font-bold text-white overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative z-10">Ücretsiz Başla</span>
              <motion.div
                className="relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer className="fixed bottom-0 inset-x-0 z-50" />
    </div>
  );
};

function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    vocabulary: '14,000+ teknik terim ile mühendislik kelime dağarcığınızı geliştirin.',
    reading: 'FIDIC sözleşmeleri ve teknik dokümanlar ile okuma pratiği yapın.',
    writing: 'Profesyonel e-posta ve rapor yazım becerilerinizi提升 edin.',
    speaking: 'Sesli pratik ve telaffuz analizi ile speaking becerilerinizi geliştirin.',
    listening: 'İş toplantıları ve saha konuşmaları ile dinleme pratiği yapın.',
    grammar: 'Mühendislik İngilizcesine özel dilbilgisi modülleri ile grammerinizi güçlendirin.',
  };
  return descriptions[key] || '';
}

export default LandingPage;
