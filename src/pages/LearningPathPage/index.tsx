import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';

import { Flame, Heart, Zap } from 'lucide-react';

import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  MasteryOverview,
  PathStageColumn,
  buildLearningPath,
  getDisciplinePalette,
  resolveDefaultDiscipline,
} from '@/features/learning-path';
import type { LearningPath } from '@/features/learning-path';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import type { CefrLevel } from '@/shared/types/domain.types';

const STATUS_DOT: Record<string, string> = {
  available: '#64748B',
  'in-progress': '#D97706',
  completed: '#16A34A',
  locked: '#57534E',
};

const LearningPathPage = () => {
  const translate = useLocalizationStore((state) => state.translate);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);

  const { xp, streak, hearts, vocabularyPool } = useLearningStore(
    useShallow((state) => ({
      xp: state.xp,
      streak: state.streak,
      hearts: state.hearts,
      vocabularyPool: state.vocabularyPool,
    }))
  );

  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  const discipline = resolveDefaultDiscipline(profile.discipline);
  const palette = getDisciplinePalette(discipline);
  const disciplineMeta = DISCIPLINE_META[discipline];
  const currentBand = (profile.skills.vocabulary.cefrBand.replace('+', '') as CefrLevel) ?? 'A1';

  const [path, setPath] = useState<LearningPath | null>(null);
  const [failed, setFailed] = useState(false);

  const animatedXp = useCountUp(xp);
  const prevXpRef = useRef(xp);
  const [xpGain, setXpGain] = useState<{ amount: number; key: number } | null>(null);

  useEffect(() => {
    const prev = prevXpRef.current;
    prevXpRef.current = xp;
    if (xp <= prev) return undefined;
    setXpGain({ amount: xp - prev, key: Date.now() });
    const timer = setTimeout(() => setXpGain(null), 1900);
    return () => clearTimeout(timer);
  }, [xp]);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setPath(null);
    buildLearningPath(discipline, {
      masteredTermIds: vocabularyPool,
      currentBand,
    })
      .then((built) => {
        if (active) setPath(built);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [discipline, currentBand, vocabularyPool]);

  const termsLabel = translate('learningpath.terms');
  const bandTitle = (level: string) => translate(`learningpath.band.${level.toLowerCase()}`);
  const statusKey = (status: string) =>
    translate(`learningpath.status${status.charAt(0).toUpperCase()}${status.slice(1)}`);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 font-sans">
      <div className="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--background)]/95 py-3.5 backdrop-blur-xl">
        <h1 className="text-base font-bold tracking-tight text-[var(--foreground)]">
          {translate('learningpath.title')}
        </h1>
      </div>

      {/* Discipline hero */}
      <section
        className={`relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br ${palette.gradient} p-6 text-white shadow-lg`}
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {translate('learningpath.subtitle')}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">
              {translate(disciplineMeta.labelKey)}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {translate(`learningpath.currentBand`)} ·{' '}
              <span className="font-bold">{bandTitle(currentBand)}</span>
            </p>
          </div>
          <div className="flex items-center gap-5 rounded-xl bg-black/20 px-5 py-3 backdrop-blur">
            <div className="relative flex flex-col items-center">
              {xpGain && (
                <span
                  key={xpGain.key}
                  className="animate-xp-pop pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-extrabold text-yellow-300 drop-shadow"
                >
                  +{xpGain.amount} {translate('learningpath.xp')}
                </span>
              )}
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="mt-0.5 text-lg font-extrabold leading-none tabular-nums">
                {animatedXp}
              </span>
              <span className="text-[10px] uppercase text-white/70">{translate('learningpath.xp')}</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="mt-0.5 text-lg font-extrabold leading-none">{streak}</span>
              <span className="text-[10px] uppercase text-white/70">{translate('learningpath.streak')}</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <Heart className="h-5 w-5 text-rose-300" />
              <span className="mt-0.5 text-lg font-extrabold leading-none">{hearts}</span>
              <span className="text-[10px] uppercase text-white/70">{translate('learningpath.hearts')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            {translate('learningpath.legend')}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--color-muted-copy)]">
            {(['available', 'in-progress', 'completed', 'locked'] as const).map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_DOT[status] }}
                />
                {statusKey(status)}
              </span>
            ))}
          </div>
        </div>

        {failed ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted-copy)]">
            {translate('learningpath.error')}
          </p>
        ) : !path ? (
          <p className="py-16 text-center text-sm text-[var(--color-muted-copy)]">
            {translate('learningpath.loading')}
          </p>
        ) : (
          <>
            <MasteryOverview
              percent={
                path.totalTerms > 0
                  ? Math.round((path.masteredTerms / path.totalTerms) * 100)
                  : 0
              }
              levelsCompleted={path.stages.reduce(
                (count, stage) =>
                  count + stage.levels.filter((level) => level.status === 'completed').length,
                0
              )}
              levelsTotal={path.totalLevels}
              accent={palette.primary}
            />
            <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-3">
              {path.stages.map((stage) => (
                <div key={stage.id} className="flex items-start">
                  <PathStageColumn
                    stage={stage}
                    title={bandTitle(stage.cefrLevel)}
                    termsLabel={termsLabel}
                    onSelectLevel={() => navigate(`/vocabulary?cefr=${stage.cefrLevel}`)}
                  />
                  {stage.cefrLevel !== 'C2' && (
                    <div className="mt-[5.75rem] h-0.5 w-6 shrink-0 bg-[var(--color-border-soft)]" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-4 border-t border-[var(--color-border-soft)] pt-3 text-[11px] text-[var(--color-muted-copy)]">
          {translate('learningpath.practice')} {translate('learningpath.contentHint')}
        </p>
      </section>
    </div>
  );
};

export default LearningPathPage;