import { Cpu, Flame, Heart, Zap } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  type PipelineStation,
  UniversalCyberPipeline,
} from '@/shared/components/UniversalCyberPipeline';
import {
  DISCIPLINE_META,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import type { CefrLevel } from '@/shared/types/domain.types';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { getDisciplineTopics } from '../discipline-topics';
import { type LearningPath, buildLearningPath, resolveDefaultDiscipline } from '../index';

export interface ConceptCPipelineViewProps {
  disciplineOverride?: EngineeringDiscipline;
  showHeroStats?: boolean;
  className?: string;
}

export const ConceptCPipelineView: React.FC<ConceptCPipelineViewProps> = ({
  disciplineOverride,
  showHeroStats = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((state) => state.translate);
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
  const discipline = resolveDefaultDiscipline(
    disciplineOverride ||
      (currentUser?.engineeringDiscipline as EngineeringDiscipline) ||
      profile.discipline
  );
  const disciplineMeta = DISCIPLINE_META[discipline];
  const currentBand = (profile.skills.vocabulary.cefrBand.replace('+', '') as CefrLevel) ?? 'A1';

  const [path, setPath] = useState<LearningPath | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    buildLearningPath(discipline, {
      masteredTermIds: vocabularyPool,
      currentBand,
    })
      .then((built) => {
        if (active) {
          setPath(built);
          setLoading(false);
          const allLevels = built.stages.flatMap((s) => s.levels);
          const activeLevel =
            allLevels.find((l) => l.status === 'in-progress') ||
            allLevels.find((l) => l.status === 'available') ||
            allLevels[0];
          if (activeLevel) {
            setSelectedStationId(activeLevel.id);
          }
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [discipline, currentBand, vocabularyPool]);

  // Transform stages and levels into PipelineStation format
  const stations: PipelineStation[] = useMemo(() => {
    if (!path) return [];

    const domainTopics = getDisciplineTopics(discipline);

    let globalIndex = 0;
    return path.stages.flatMap((stage) =>
      stage.levels.map((level) => {
        const topicName =
          domainTopics[globalIndex % domainTopics.length] ||
          `Engineering Module ${globalIndex + 1}`;
        globalIndex += 1;
        const masteredCount = Math.round(level.masteryRatio * level.termCount);
        return {
          id: level.id,
          levelBadge: `${level.cefrLevel}.${level.index + 1}`,
          title: topicName,
          subtitle: `${stage.titleKey} · ${level.termCount} terms`,
          status: level.status as PipelineStation['status'],
          progressRatio: level.masteryRatio,
          totalItems: level.termCount,
          completedItems: masteredCount,
          actionLabel:
            level.status === 'completed'
              ? translate('learningpath.reviewModule')
              : translate('learningpath.startLesson'),
          onAction: () => navigate(`/lesson-runner/${level.id}`),
        };
      })
    );
  }, [path, discipline, navigate, translate]);

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] p-8 ${className}`}
      >
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-56 rounded bg-slate-800" />
            <div className="h-6 w-32 rounded bg-slate-800" />
          </div>
          <div className="h-64 rounded-xl bg-slate-900/60" />
        </div>
      </div>
    );
  }

  if (!path || !stations.length) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hero Stats */}
      {showHeroStats && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#050811] p-5 sm:p-7 text-slate-100 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Cpu className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {translate(disciplineMeta.labelKey)}
                </h1>
                <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                  CEFR: {currentBand}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {translate('learningpath.subtitle')} ·{' '}
                {translate(`learningpath.band.${currentBand.toLowerCase()}`)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-slate-400">{translate('learningpath.careerPoints')}:</span>
              <span className="font-bold text-white tabular-nums">{xp} XP</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-slate-400">{translate('learningpath.shiftDays')}:</span>
              <span className="font-bold text-white tabular-nums">
                {streak} {translate('learningpath.shiftDays')}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="text-slate-400">{translate('learningpath.systemIntegrity')}:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{hearts * 20}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Pipeline */}
      <UniversalCyberPipeline
        title={translate(disciplineMeta.labelKey)}
        subtitle={translate('learningpath.subtitle')}
        badgeText={`CEFR: ${currentBand}`}
        icon={Cpu}
        stations={stations}
        activeStationId={selectedStationId}
        onSelectStation={setSelectedStationId}
        translate={translate}
        metrics={[
          {
            icon: <Zap className="h-4 w-4 text-amber-400" />,
            label: translate('learningpath.careerPoints'),
            value: `${xp} XP`,
          },
          {
            icon: <Flame className="h-4 w-4 text-orange-400" />,
            label: translate('learningpath.shiftDays'),
            value: `${streak}d`,
          },
          {
            icon: <Heart className="h-4 w-4 text-rose-400" />,
            label: translate('learningpath.systemIntegrity'),
            value: `${hearts * 20}%`,
          },
        ]}
      />
    </div>
  );
};
