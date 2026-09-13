import { ArrowRight, BookOpen, Globe, Hash, Settings, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { DailyChallenge } from './DailyChallenge';
import { DailyDigest } from './DailyDigest';
import { ProgressNudge } from './ProgressNudge';

const getGreeting = (hour: number, translate: (key: string) => string): string => {
  if (hour < 12) return translate('dashboard.goodMorning');
  if (hour < 18) return translate('dashboard.goodAfternoon');
  return translate('dashboard.goodEvening');
};

const DashboardHeader = ({
  greeting,
  displayName,
  email,
  meta,
  translate,
}: {
  greeting: string;
  displayName: string;
  email?: string;
  meta?: { labelKey: string; descriptionKey: string };
  translate: (key: string) => string;
}) => (
  <header className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 shadow-card sm:p-7">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
      {translate('dashboard.commandCenter')}
    </p>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
      {greeting}, {displayName}
    </h1>
    {email && (
      <p className="mt-1 text-sm font-semibold text-muted-copy">{email}</p>
    )}
    {meta && (
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted-copy">
        {translate(meta.labelKey as TranslationKey)} • {translate(meta.descriptionKey as TranslationKey)}
      </p>
    )}
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link to="/curriculum" className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary-hover">
        {translate('dashboard.startHere')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <Link to="/learning-path" className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border-soft bg-surface px-5 py-2.5 text-sm font-black text-foreground transition hover:bg-surface-hover">
        {translate('learningpath.title')}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </header>
);

const DisciplineCard = ({
  discipline,
  translate,
}: {
  discipline: string;
  translate: (key: string) => string;
}) => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-card">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-sm font-black">
        <Settings className="h-4 w-4 text-primary" />
        {translate('dashboard.myDiscipline')}
      </h2>
      <Link to="/profile" className="flex items-center gap-1 text-xs font-black text-primary hover:underline">
        {translate('profile.save')}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{discipline}</p>
          <p className="text-xs text-muted-copy">{translate('engineeringDiscipline.title')}</p>
        </div>
      </div>
    </div>
  </div>
);

const MetricsRow = ({
  xp,
  streak,
  hearts,
  activeMissions,
  translate,
}: {
  xp: number;
  streak: number;
  hearts: number;
  activeMissions: number;
  translate: (key: string) => string;
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <MetricCard icon={Zap} label={translate('dashboard.xp')} value={String(xp)} />
    <MetricCard icon={TrendingUp} label={translate('dashboard.streak')} value={`${streak} 🔥`} />
    <MetricCard icon={Target} label={translate('dashboard.hearts')} value={String(hearts)} />
    <MetricCard icon={BookOpen} label={translate('dashboard.missions')} value={String(activeMissions)} />
  </div>
);

const LearningStats = ({
  vocabBand,
  targetLevel,
  overallProgress,
  translate,
}: {
  vocabBand: string;
  targetLevel: string;
  overallProgress: number;
  translate: (key: string) => string;
}) => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-card">
    <h2 className="mb-3 text-sm font-black">{translate('dashboard.yourProgress')}</h2>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-copy">{translate('vocabulary.title')}</span>
        <span className="font-bold text-foreground">{vocabBand} → {targetLevel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border-soft">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
      </div>
    </div>
  </div>
);

const LanguagePicker = ({
  currentLanguage,
  translate,
}: {
  currentLanguage: string;
  translate: (key: string) => string;
}) => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 shadow-card">
    <div className="mb-3 flex items-center gap-2">
      <Globe className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-black">{translate('dashboard.language')}</h2>
    </div>
    <p className="text-xs text-muted-copy">
      {INTERFACE_LANGUAGES.find((l) => l.id === currentLanguage)?.label ?? currentLanguage}
    </p>
  </div>
);

const resolveUserProfile = (currentUser: ReturnType<typeof useAuthStore.getState>['currentUser']) => {
  if (!currentUser) return { profile: null, discipline: undefined, meta: undefined };
  const profile = LearningProfileRepository.getProfile(currentUser.id || 'local-user');
  const discipline = resolveDefaultDiscipline((currentUser.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline);
  const meta = DISCIPLINE_META[discipline];
  return { profile, discipline, meta };
};

const useDashboardData = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);
  const currentLanguage = useLocalizationStore((state) => state.language);
  useShortcutHint();
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const activeMissions = useLearningStore((s) => s.missions?.filter((m) => m.status === 'active').length || 0);
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30_000); return () => clearInterval(id); }, []);

  const { profile, discipline, meta } = resolveUserProfile(currentUser);
  const vocabBand = profile?.skills?.vocabulary?.cefrBand ?? 'A1';
  const targetLevel = currentUser?.targetLevel ?? 'C1';
  const overallProgress = profile?.skills?.vocabulary?.progressToNextBand ?? 0;
  const greeting = getGreeting(new Date().getHours(), translate);

  return {
    currentUser,
    translate,
    currentLanguage,
    xp,
    streak,
    hearts,
    activeMissions,
    profile,
    meta,
    discipline: discipline ?? 'general',
    vocabBand,
    targetLevel,
    overallProgress,
    greeting,
  };
};

export const DashboardPage = () => {
  const data = useDashboardData();
  const { currentUser, translate, currentLanguage, xp, streak, hearts, activeMissions, meta, discipline, vocabBand, targetLevel, overallProgress, greeting } = data;

  if (!currentUser) return <PageContainer className="max-w-6xl"><SkeletonPage /></PageContainer>;

  return (
    <PageContainer className="max-w-6xl space-y-5">
      <DashboardHeader
        greeting={greeting}
        displayName={currentUser?.displayName ?? ''}
        email={currentUser?.email}
        meta={meta}
        translate={translate}
      />
      {meta && (
        <DisciplineCard discipline={discipline} translate={translate} />
      )}
      <MetricsRow
        xp={xp}
        streak={streak}
        hearts={hearts}
        activeMissions={activeMissions}
        translate={translate}
      />
      <LearningStats
        vocabBand={vocabBand}
        targetLevel={targetLevel}
        overallProgress={overallProgress}
        translate={translate}
      />
      <LanguagePicker currentLanguage={currentLanguage} translate={translate} />
      <DailyChallenge />
      <DailyDigest />
      <ProgressNudge />
    </PageContainer>
  );
};
export default DashboardPage;
