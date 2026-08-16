import { ArrowRight, BookOpen, Target, TrendingUp, Trophy } from 'lucide-react';
import { motion, useInView } from 'motion/react';

import React, { useEffect, useRef } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import {
  cardHover,
  countUp,
  fadeUp,
  iconHover,
  staggerContainer,
  staggerItem,
} from '@/shared/motion/variants';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const translate = useLocalizationStore((state) => state.translate);

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isLoading && currentUser) {
      const userId = currentUser.id || 'local-user';
      const profile = LearningProfileRepository.getProfile(userId);
      if (!currentUser.engineeringDiscipline || !profile.onboardingCompleted) {
        navigate('/welcome', { replace: true });
      }
    }
  }, [currentUser, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-[var(--color-muted-copy)]">{translate('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.engineeringDiscipline) {
    return null;
  }

  const discipline = currentUser.engineeringDiscipline;
  const meta = DISCIPLINE_META[discipline as keyof typeof DISCIPLINE_META];
  const learningState = useLearningStore.getState();
  const activeMissions = learningState.missions?.filter((m) => m.status === 'active').length || 0;

  const stats = [
    {
      label: translate('dashboard.myDiscipline'),
      value: meta ? translate(meta.labelKey as TranslationKey) : discipline,
      icon: BookOpen,
    },
    {
      label: translate('dashboard.targetLevel'),
      value: 'A1 → C2',
      icon: Target,
    },
    {
      label: translate('curriculum.active'),
      value: `${activeMissions} ${translate('curriculum.items')}`,
      icon: TrendingUp,
    },
    {
      label: translate('dashboard.level'),
      value: 'A1',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Header / Hero */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-6 sm:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent" />
          <div className="relative">
            <motion.p
              className="text-sm font-semibold text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {translate('dashboard.commandCenter')}
            </motion.p>
            <motion.h1
              className="mt-1 text-2xl font-extrabold text-[var(--foreground)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {translate('dashboard.goodMorning')}, {currentUser.displayName}!
            </motion.h1>
            <motion.p
              className="mt-1 text-sm text-[var(--color-muted-copy)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {meta
                ? `${translate(meta.labelKey as TranslationKey)} • ${translate(meta.descriptionKey as TranslationKey)}`
                : discipline}
            </motion.p>
            <motion.div
              className="mt-5 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <motion.div variants={cardHover} whileHover="hover" whileTap="tap">
                <Link
                  to="/curriculum/today"
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] border border-[var(--color-border-soft)] px-5 py-2.5 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  {translate('dashboard.startHere')}
                  <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(({ label, value, icon: Icon }, index) => (
            <motion.div
              key={label}
              variants={staggerItem}
              custom={index}
              whileHover="hover"
              whileTap="tap"
              className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-4"
            >
              <motion.div
                className="mb-3 inline-flex rounded-[var(--radius-card)] bg-[var(--color-primary)]/10 p-2.5"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <motion.span variants={iconHover} whileHover="hover" whileTap="tap">
                  <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                </motion.span>
              </motion.div>
              <motion.p variants={fadeUp} className="text-xs text-[var(--color-muted-copy)]">
                {label}
              </motion.p>
              <motion.div
                variants={countUp}
                className="mt-1 text-lg font-bold text-[var(--foreground)]"
              >
                {value}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
