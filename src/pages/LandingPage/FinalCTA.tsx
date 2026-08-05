import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLocalizationStore } from '@/features/localization';
import { getLandingTranslations } from './landing-i18n';

export const FinalCTA: React.FC = () => {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{t.finalCtaBadge ?? '15 Languages · 10 Disciplines · One Platform'}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {t.finalCtaTitle ?? 'Your Engineering Voice Starts'}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              {t.finalCtaTitleHighlight ?? 'Here'}
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.finalCtaSub ?? 'Select your discipline, choose your interface language, and start mastering professional engineering English today. No credit card required.'}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/onboarding"
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <span>{t.ctaSelectBranch ?? 'Select Your Discipline'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t.ctaViewPlans ?? 'View Plans'}
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            {t.finalCtaNote ?? 'Free plan available · No credit card · Cancel anytime'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};