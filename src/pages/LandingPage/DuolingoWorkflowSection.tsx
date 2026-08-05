import React from 'react';
import { ShieldCheck, Flame, Cpu, ArrowRight, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLocalizationStore } from '@/features/localization';
import { getLandingTranslations } from './landing-i18n';

export const DuolingoWorkflowSection: React.FC = () => {
  const language = useLocalizationStore((s) => s.language);
  const t = getLandingTranslations(language);

  const steps = [
    {
      num: '01',
      icon: <ShieldCheck className="w-7 h-7" />,
      iconBg: 'bg-blue-500/10 border-blue-400/20 text-blue-600 dark:text-blue-400',
      badgeColor: 'text-blue-600 dark:text-blue-400',
      title: t.step1Title,
      desc: t.step1Desc,
      badge: t.step1Badge,
      BadgeIcon: Target,
    },
    {
      num: '02',
      icon: <Flame className="w-7 h-7 animate-bounce" />,
      iconBg: 'bg-amber-500/10 border-amber-400/20 text-amber-600 dark:text-amber-400',
      badgeColor: 'text-amber-600 dark:text-amber-400',
      title: t.step2Title,
      desc: t.step2Desc,
      badge: t.step2Badge,
      BadgeIcon: Flame,
    },
    {
      num: '03',
      icon: <Cpu className="w-7 h-7" />,
      iconBg: 'bg-indigo-500/10 border-indigo-400/20 text-indigo-600 dark:text-indigo-400',
      badgeColor: 'text-indigo-600 dark:text-indigo-400',
      title: t.step3Title,
      desc: t.step3Desc,
      badge: t.step3Badge,
      BadgeIcon: Cpu,
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 relative overflow-hidden">
      {/* glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-gradient-to-b from-cyan-500/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>{t.workflowHeaderBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t.workflowTitle}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            {t.workflowSub}
          </p>
        </motion.div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="relative flex flex-col justify-between p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* big number watermark */}
              <span className="absolute top-4 right-5 text-7xl font-black text-slate-100 dark:text-slate-800 select-none pointer-events-none leading-none">
                {s.num}
              </span>

              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${s.iconBg}`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>

              <div className={`mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold ${s.badgeColor}`}>
                <s.BadgeIcon className="w-4 h-4" />
                <span>{s.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 group"
          >
            <span>{t.ctaStartFree}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
