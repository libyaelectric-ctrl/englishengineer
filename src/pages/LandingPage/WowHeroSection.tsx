import { ArrowRight, CheckCircle2, Globe, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

import React from 'react';

import { Link } from 'react-router-dom';

import { getIcon } from '@/shared/icons/registry';

import { useLocalizationStore } from '@/features/localization';

import { getLandingTranslations } from './landing-i18n';

export const WowHeroSection: React.FC = () => {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
      {/* Glow blob top-center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
      {/* Glow right */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />
      {/* Glow left */}
      <div className="absolute top-40 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{t.heroBadge}</span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance mx-auto"
        >
          {t.heroTitle1}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              {t.heroTitleHighlight}
            </span>
            {/* underline accent */}
            <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-40" />
          </span>{' '}
          {t.heroTitle2}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          {t.heroSubtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[var(--radius-card)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 group"
          >
            <span>{t.ctaSelectBranch}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[var(--radius-card)] bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-200"
          >
            <span>{t.ctaViewPlans}</span>
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {t.badgeNoCard}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            {t.badgeLockGuarantee}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-violet-500" />
            {t.badgeLanguages}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            C1 Mastery Track
          </span>
        </motion.div>

        {/* Floating metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {[
            { label: 'Engineering Disciplines', value: '10', icon: 'building' },
            { label: 'Interface Languages', value: '15', icon: 'globe' },
            { label: 'Technical Terms', value: '27K+', icon: 'library' },
            { label: 'CEFR Levels', value: 'A1–C2', icon: 'target' },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center gap-1.5 rounded-[4px] border border-slate-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/5"
            >
              {(() => {
                const MetricIcon = getIcon(m.icon);
                return MetricIcon ? (
                  <MetricIcon
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                ) : null;
              })()}
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {m.value}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight">
                {m.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
