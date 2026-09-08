import { ArrowRight, BookOpen, Globe, Hash, Settings, Target, TrendingUp, Zap } from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { MetricCard } from '@/shared/components/MetricCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { SkeletonPage } from '@/shared/components/Skeleton';
import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { useShortcutHint } from '@/shared/hooks/useShortcutHint';

import { useAuthStore } from '@/features/auth';
import { resolveDefaultDiscipline } from '@/features/learning-path';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useLearningCockpit } from '@/features/profile/useLearningCockpit';

import { DailyChallenge } from './DailyChallenge';
import { DailyDigest } from './DailyDigest';
import { ProgressNudge } from './ProgressNudge';

export const DashboardPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);
  const currentLanguage = useLocalizationStore((state) => state.language);
  useShortcutHint();
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const activeMissions = useLearningStore((s) => s.missions?.filter((m) => m.status === 'active').length || 0);
  const { missions } = useLearningCockpit(currentUser?.id);
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30_000); return () => clearInterval(id); }, []);

  if (!currentUser) return <PageContainer className="max-w-6xl"><SkeletonPage /></PageContainer>;

  const profile = LearningProfileRepository.getProfile(currentUser.id || 'local-user');
  const discipline = resolveDefaultDiscipline((currentUser.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline);
  const meta = DISCIPLINE_META[discipline];
  const vocabBand = profile?.skills?.vocabulary?.cefrBand ?? 'A1';
  const targetLevel = currentUser?.targetLevel ?? 'C1';
  const overallProgress = profile?.skills?.vocabulary?.progressToNextBand ?? 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? translate('dashboard.goodMorning') : hour < 18 ? translate('dashboard.goodAfternoon') : translate('dashboard.goodEvening');

  return (
    <PageContainer className="max-w-6xl space-y-5">
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] sm:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-100">{translate('dashboard.commandCenter')}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">{greeting}, {currentUser?.displayName ?? ''}</h1>{currentUser?.email && <p className="mt-1 text-sm font-bold text-slate-600 dark:text-white/55">{currentUser.email}</p>}{meta && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-200">{translate(meta.labelKey as TranslationKey)} • {translate(meta.descriptionKey as TranslationKey)}</p>}<div className="mt-5 flex flex-wrap items-center gap-3"><Link to="/curriculum" className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">{translate('dashboard.startHere')}<ArrowRight className="h-3.5 w-3.5" /></Link><Link to="/learning-path" className="inline-flex items-center gap-1.5 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-800 transition hover:-translate-y-0.5 dark:text-cyan-100">{translate('learningpath.title')}<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
        </div>
      </header>

      <div className="rounded-[2rem] border border-slate-900/10 bg-white/68 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-black"><Settings className="h-4 w-4 text-cyan-700 dark:text-cyan-100" />{translate('dashboard.myDiscipline')}</h2><Link to="/profile" className="flex items-center gap-1 text-xs font-black text-cyan-700 hover:underline dark:text-cyan-100">{translate('profile.save')}<ArrowRight className="h-3 w-3" /></Link></div><div className="flex flex-wrap items-center gap-4"><div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-100"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><p className="text-xs font-bold text-slate-500 dark:text-white/50">{translate('onboarding.selectDiscipline')}</p><p className="truncate text-sm font-black">{meta ? translate(meta.labelKey as TranslationKey) : discipline}</p></div></div><div className="hidden h-10 w-px bg-slate-900/10 dark:bg-white/10 sm:block" /><div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[160px]"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-200"><Globe className="h-5 w-5" /></div><div className="min-w-0"><p className="text-xs font-bold text-slate-500 dark:text-white/50">{translate('onboarding.selectLanguageTitle')}</p><p className="truncate text-sm font-black">{(() => { const langOption = INTERFACE_LANGUAGES.find((l) => l.id === currentLanguage); return langOption ? `${langOption.nativeLabel} (${langOption.id.toUpperCase()})` : (currentLanguage ?? '—'); })()}</p></div></div><div className="hidden h-10 w-px bg-slate-900/10 dark:bg-white/10 sm:block" /><div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[140px]"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-200"><Hash className="h-5 w-5" /></div><div><p className="text-xs font-bold text-slate-500 dark:text-white/50">{translate('dashboard.words')}</p><p className="text-sm font-black">{meta?.wordCount?.toLocaleString() ?? '—'}</p></div></div></div></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><MetricCard label={translate('dashboard.myDiscipline')} value={meta ? translate(meta.labelKey as TranslationKey) : discipline} icon={BookOpen} /><MetricCard label={translate('dashboard.level')} value={vocabBand} icon={Target} trend={`${translate('dashboard.targetLevel')}: ${targetLevel}`} /><MetricCard label={translate('dashboard.words')} value={`${xp} XP`} icon={Zap} trend={`${streak} day streak`} /><MetricCard label={translate('dashboard.completedTasks')} value={`${activeMissions} ${translate('curriculum.items')}`} icon={TrendingUp} /></div>
      <DailyDigest />
      {missions?.find((m) => m.personalReason) && <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 px-4 py-3"><p className="text-xs font-black text-cyan-800 dark:text-cyan-100">{missions.find((m) => m.personalReason)?.personalReason}</p><Link to="/curriculum" className="mt-1 inline-block text-xs font-bold text-slate-600 underline transition hover:text-cyan-700 dark:text-white/55 dark:hover:text-cyan-100">Bugünkü kişisel planını gör →</Link></div>}
      <DailyChallenge />
      <ProgressNudge />
      <div className="rounded-[2rem] border border-slate-900/10 bg-white/68 p-5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black">{translate('dashboard.globalProgress')}</h2><span className="text-xs font-black text-cyan-700 dark:text-cyan-100">{vocabBand}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${Math.max(5, overallProgress)}%` }} /></div><div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-white/55"><span>{hearts * 20}% {translate('dashboard.competencyIndex')}</span><span>{streak > 0 && `🔥 ${streak} day streak`}</span></div></div>
    </PageContainer>
  );
};

export default DashboardPage;
