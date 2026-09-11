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

interface HeaderProps {
  greeting: string;
  displayName: string;
  email?: string;
  meta?: (typeof DISCIPLINE_META)[EngineeringDiscipline];
  translate: (key: TranslationKey) => string;
}

const DashboardHeroHeader: React.FC<HeaderProps> = ({
  greeting,
  displayName,
  email,
  meta,
  translate,
}) => (
  <header className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 shadow-card sm:p-7">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
      {translate('dashboard.commandCenter')}
    </p>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
      {greeting}, {displayName}
    </h1>
    {email && <p className="mt-1 text-sm font-semibold text-muted-copy">{email}</p>}
    {meta && (
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted-copy">
        {translate(meta.labelKey as TranslationKey)} •{' '}
        {translate(meta.descriptionKey as TranslationKey)}
      </p>
    )}
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link
        to="/curriculum"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary-hover"
      >
        {translate('dashboard.startHere')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <Link
        to="/learning-path"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border-soft bg-surface px-5 py-2.5 text-sm font-black text-foreground transition hover:bg-surface-hover"
      >
        {translate('learningpath.title')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </header>
);

interface DisciplineProps {
  meta?: (typeof DISCIPLINE_META)[EngineeringDiscipline];
  discipline: string;
  currentLanguage: string;
  translate: (key: TranslationKey) => string;
}

const DisciplineCard: React.FC<DisciplineProps> = ({
  meta,
  discipline,
  currentLanguage,
  translate,
}) => {
  const langOption = INTERFACE_LANGUAGES.find((l) => l.id === currentLanguage);
  const langLabel = langOption
    ? `${langOption.nativeLabel} (${langOption.id.toUpperCase()})`
    : (currentLanguage ?? '—');
  const disciplineLabel = meta ? translate(meta.labelKey as TranslationKey) : discipline;
  const wordCount = meta?.wordCount ? meta.wordCount.toLocaleString() : '—';

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <Settings className="h-4 w-4 text-primary" />
          {translate('dashboard.myDiscipline')}
        </h2>
        <Link
          to="/profile"
          className="flex items-center gap-1 text-xs font-black text-primary hover:underline"
        >
          {translate('profile.save')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-button)] bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-copy">
              {translate('onboarding.selectDiscipline')}
            </p>
            <p className="truncate text-sm font-black text-foreground">{disciplineLabel}</p>
          </div>
        </div>
        <div className="hidden h-10 w-px bg-border-soft sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[160px]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-button)] bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-copy">
              {translate('onboarding.selectLanguageTitle')}
            </p>
            <p className="truncate text-sm font-black text-foreground">{langLabel}</p>
          </div>
        </div>
        <div className="hidden h-10 w-px bg-border-soft sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[140px]">
          <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-button)] bg-primary/10 text-primary">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-copy">{translate('dashboard.words')}</p>
            <p className="text-sm font-black text-foreground">{wordCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricsGridProps {
  disciplineLabel: string;
  vocabBand: string;
  targetLevel: string;
  xp: number;
  streak: number;
  activeMissions: number;
  translate: (key: TranslationKey) => string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  disciplineLabel,
  vocabBand,
  targetLevel,
  xp,
  streak,
  activeMissions,
  translate,
}) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <MetricCard
      label={translate('dashboard.myDiscipline')}
      value={disciplineLabel}
      icon={BookOpen}
    />
    <MetricCard
      label={translate('dashboard.level')}
      value={vocabBand}
      icon={Target}
      trend={`${translate('dashboard.targetLevel')}: ${targetLevel}`}
    />
    <MetricCard
      label={translate('dashboard.words')}
      value={`${xp} XP`}
      icon={Zap}
      trend={`${streak} day streak`}
    />
    <MetricCard
      label={translate('dashboard.completedTasks')}
      value={`${activeMissions} ${translate('curriculum.items')}`}
      icon={TrendingUp}
    />
  </div>
);

interface GlobalProgressCardProps {
  vocabBand: string;
  overallProgress: number;
  hearts: number;
  streak: number;
  translate: (key: TranslationKey) => string;
}

const GlobalProgressCard: React.FC<GlobalProgressCardProps> = ({
  vocabBand,
  overallProgress,
  hearts,
  streak,
  translate,
}) => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-card">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-black text-foreground">
        {translate('dashboard.globalProgress')}
      </h2>
      <span className="text-xs font-black text-primary">{vocabBand}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.max(5, overallProgress)}%` }}
      />
    </div>
    <div className="mt-3 flex items-center justify-between text-xs font-bold text-muted-copy">
      <span>
        {hearts * 20}% {translate('dashboard.competencyIndex')}
      </span>
      {streak > 0 && <span>🔥 {streak} day streak</span>}
    </div>
  </div>
);

const resolveGreeting = (hour: number, translate: (key: TranslationKey) => string): string => {
  if (hour < 12) return translate('dashboard.goodMorning');
  if (hour < 18) return translate('dashboard.goodAfternoon');
  return translate('dashboard.goodEvening');
};

function getProfileData(user: {
  id?: string;
  engineeringDiscipline?: string;
  targetLevel?: string;
}) {
  const userId = user.id ? user.id : 'local-user';
  const profile = LearningProfileRepository.getProfile(userId);
  const discipline = resolveDefaultDiscipline(
    (user.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline
  );
  const meta = DISCIPLINE_META[discipline];
  const skills = profile ? profile.skills : undefined;
  const vocab = skills ? skills.vocabulary : undefined;
  const vocabBand = vocab?.cefrBand ?? 'A1';
  const targetLevel = user.targetLevel ?? 'C1';
  const overallProgress = vocab?.progressToNextBand ?? 0;
  return { discipline, meta, vocabBand, targetLevel, overallProgress };
}

const PersonalReasonBanner: React.FC<{ personalReason?: string }> = ({ personalReason }) => {
  if (!personalReason) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-3 shadow-card">
      <p className="text-xs font-black text-primary">{personalReason}</p>
      <Link
        to="/curriculum"
        className="mt-1 inline-block text-xs font-bold text-muted-copy underline transition hover:text-primary"
      >
        Bugünkü kişisel planını gör →
      </Link>
    </div>
  );
};

export const DashboardPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);
  const currentLanguage = useLocalizationStore((state) => state.language);
  useShortcutHint();
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const missionsList = useLearningStore((s) => s.missions);
  const activeMissions = missionsList
    ? missionsList.filter((m) => m.status === 'active').length
    : 0;
  const { missions } = useLearningCockpit(currentUser ? currentUser.id : undefined);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!currentUser)
    return (
      <PageContainer className="max-w-6xl">
        <SkeletonPage />
      </PageContainer>
    );

  const { discipline, meta, vocabBand, targetLevel, overallProgress } = getProfileData(currentUser);
  const greeting = resolveGreeting(new Date().getHours(), translate);
  const personalReason = missions?.find((m) => m.personalReason)?.personalReason;
  const disciplineLabel = meta ? translate(meta.labelKey as TranslationKey) : discipline;
  const displayName = currentUser.displayName || '';

  return (
    <PageContainer className="max-w-6xl space-y-5">
      <DashboardHeroHeader
        greeting={greeting}
        displayName={displayName}
        email={currentUser.email}
        meta={meta}
        translate={translate}
      />
      <DisciplineCard
        meta={meta}
        discipline={discipline}
        currentLanguage={currentLanguage}
        translate={translate}
      />
      <MetricsGrid
        disciplineLabel={disciplineLabel}
        vocabBand={vocabBand}
        targetLevel={targetLevel}
        xp={xp}
        streak={streak}
        activeMissions={activeMissions}
        translate={translate}
      />
      <DailyDigest />
      <PersonalReasonBanner personalReason={personalReason} />
      <DailyChallenge />
      <ProgressNudge />
      <GlobalProgressCard
        vocabBand={vocabBand}
        overallProgress={overallProgress}
        hearts={hearts}
        streak={streak}
        translate={translate}
      />
    </PageContainer>
  );
};
export default DashboardPage;
