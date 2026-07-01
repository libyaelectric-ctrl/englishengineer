import { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  History,
  Layers,
  MessageSquareText,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { ScoreResult } from '@/core/learning';
import {
  getSpeakingRoleplayCategory,
  SPEAKING_MVP_MODE,
  SPEAKING_MVP_REQUIRES_MICROPHONE,
  type SpeakingRoleplayCategory,
  useSpeakingStore,
} from '@/features/speaking';
import {
  type ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  filterContentByLevel,
  getContentAccessLabel,
  LevelAccessBadge,
  LevelContentFilter,
  useSkillLevel,
} from '@/features/level-system';
import { SkillEntryBrief } from '@/features/learning-orchestrator';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

type RoleplayFilter = 'All' | SpeakingRoleplayCategory;

const ROLEPLAY_FILTERS: RoleplayFilter[] = [
  'All',
  'Daily',
  'Work',
  'Engineering',
];

const SpeakingPage = () => {
  const {
    missions,
    selectedMissionId,
    typedTranscript,
    evaluationResult,
    completedMissions,
    history,
    initializeStore,
    selectMission,
    setTypedTranscript,
    submitCurrentMission,
    resetCurrentMission,
  } = useSpeakingStore();
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const [roleplayFilter, setRoleplayFilter] = useState<RoleplayFilter>('All');
  const currentLevel = useSkillLevel('speaking').currentLevel;

  const visibleMissions = useMemo(
    () => filterContentByLevel(missions, currentLevel, levelFilter),
    [currentLevel, levelFilter, missions]
  );
  const roleplayMissions = useMemo(
    () =>
      visibleMissions.filter(
        (mission) =>
          roleplayFilter === 'All' ||
          getSpeakingRoleplayCategory(mission) === roleplayFilter
      ),
    [roleplayFilter, visibleMissions]
  );
  const activeMission =
    roleplayMissions.find((mission) => mission.id === selectedMissionId) ??
    roleplayMissions[0];

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (activeMission && activeMission.id !== selectedMissionId) {
      selectMission(activeMission.id);
    }
  }, [activeMission, selectMission, selectedMissionId]);

  const submitRoleplay = () => {
    const result = submitCurrentMission();
    ProductAnalyticsService.track('speaking_roleplay_completed', '/speaking', {
      metadata: {
        skill: 'speaking',
        missionId: activeMission?.id,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/speaking', {
      skill: 'speaking',
      source: 'user',
    });
    setScoreResult({
      score: result.finalScore,
      xp: result.xpEarned,
      coins: result.coinsEarned,
      eloChange: result.eloChange,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      feedback: result.feedback,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Speaking Workspace"
        description="Written Roleplay is the current Speaking preview. Typed responses are evaluated locally; microphone, pronunciation and AI speaking evaluation are not active."
        badgeText="WRITTEN ROLEPLAY"
        badgeColor="cyan"
      />

      <SkillEntryBrief skill="speaking" />
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />

      <SectionCard
        title="Roleplay Category"
        subtitle="Daily, workplace and engineering communication remain balanced"
        icon={MessageSquareText}
      >
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Speaking roleplay categories"
        >
          {ROLEPLAY_FILTERS.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={roleplayFilter === category}
              onClick={() => setRoleplayFilter(category)}
              className={`min-h-11 rounded-[12px] border px-4 text-sm font-bold transition-colors ${
                roleplayFilter === category
                  ? 'border-sky-300 bg-sky-50 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2 rounded-[12px] border border-slate-200 bg-white p-2.5 shadow-sm">
        {roleplayMissions.map((mission) => (
          <button
            key={mission.id}
            type="button"
            onClick={() => {
              selectMission(mission.id);
              ProductAnalyticsService.track(
                'speaking_roleplay_started',
                '/speaking',
                {
                  metadata: {
                    skill: 'speaking',
                    missionId: mission.id,
                    source: 'user',
                  },
                }
              );
              ProductAnalyticsService.trackOnce(
                'first_task_started',
                '/speaking',
                { skill: 'speaking', source: 'user' }
              );
            }}
            className={`flex min-h-11 items-center gap-2 rounded-[10px] border px-4 py-2 text-xs font-bold transition-colors ${
              selectedMissionId === mission.id
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : 'border-transparent text-slate-600 hover:border-sky-200 hover:bg-sky-50/60'
            }`}
          >
            <span>{mission.title}</span>
            <LevelAccessBadge
              label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
            />
            {typeof completedMissions[mission.id] === 'number' && (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            )}
          </button>
        ))}
        {roleplayMissions.length === 0 && (
          <p className="px-3 py-3 text-sm text-slate-600">
            No current-level content yet. No Speaking roleplay is available for
            this category and level filter.
          </p>
        )}
      </div>

      {activeMission && (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            <MetricCard
              label="Best Speaking Score"
              value={
                completedMissions[activeMission.id]
                  ? `${completedMissions[activeMission.id]}%`
                  : 'Not scored'
              }
              icon={MessageSquareText}
              trend="Written response evidence"
              statusColor="cyan"
            />
            <MetricCard
              label="Vocabulary Targets"
              value={`${activeMission.expectedKeywords.length} Terms`}
              icon={Brain}
              trend={activeMission.discipline}
              statusColor="primary"
            />
            <MetricCard
              label="Task Level"
              value={activeMission.cefrLevel}
              icon={Layers}
              trend={getSpeakingRoleplayCategory(activeMission)}
              statusColor="emerald"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <SectionCard
              title={activeMission.title}
              subtitle={activeMission.description}
              icon={MessageSquareText}
              headerActions={
                <StatusBadge
                  label={`${SPEAKING_MVP_MODE} · No microphone required`}
                  tone="info"
                />
              }
            >
              <div className="rounded-[12px] border border-sky-200 bg-sky-50 p-5">
                <p className="text-xs font-black uppercase text-sky-700">
                  Roleplay prompt
                </p>
                <p className="mt-2 text-base leading-7 text-slate-900">
                  {activeMission.promptText}
                </p>
              </div>

              <label
                className="mt-5 block text-sm font-black text-slate-800"
                htmlFor="written-roleplay-response"
              >
                Written Roleplay response
              </label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                This is text-based communication practice, not real speech or
                pronunciation scoring.
              </p>
              <textarea
                id="written-roleplay-response"
                value={typedTranscript}
                onChange={(event) => setTypedTranscript(event.target.value)}
                className="mt-3 min-h-48 w-full resize-y rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                placeholder="Typed transcript fallback for Written Roleplay. Respond at your current Speaking level."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={submitRoleplay}
                  disabled={!typedTranscript.trim()}
                >
                  Submit Written Roleplay
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetCurrentMission();
                    setScoreResult(null);
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> Reset response
                </Button>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Microphone required:{' '}
                {SPEAKING_MVP_REQUIRES_MICROPHONE ? 'Yes' : 'No'} · AI required:
                No
              </p>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard
                title="Target Language"
                subtitle="Current task reference"
                icon={Brain}
              >
                <div className="flex flex-wrap gap-2">
                  {activeMission.expectedKeywords.map((term) => (
                    <span
                      key={term}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {term}
                    </span>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  {activeMission.grammarTargets.map((target) => (
                    <p
                      key={target}
                      className="rounded-[10px] border border-slate-200 bg-white p-3 text-xs text-slate-600"
                    >
                      {target}
                    </p>
                  ))}
                </div>
              </SectionCard>

              {evaluationResult && (
                <SectionCard
                  title="Latest Speaking Score"
                  subtitle="Deterministic local text evaluation"
                  icon={Brain}
                >
                  <div className="space-y-4">
                    {[
                      ['Fluency', evaluationResult.fluencyScore],
                      ['Clarity', evaluationResult.clarityScore],
                      ['Grammar', evaluationResult.grammarScore],
                      [
                        'Technical vocabulary',
                        evaluationResult.technicalVocabularyScore,
                      ],
                      ['Confidence', evaluationResult.confidenceScore],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
                          <span>{label}</span>
                          <span>{value}%</span>
                        </div>
                        <ProgressBar value={Number(value)} color="primary" />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              <SectionCard
                title="Task History"
                subtitle="No audio recordings are stored"
                icon={History}
              >
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No written roleplay attempt yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 3).map((entry) => (
                      <div
                        key={`${entry.missionId}-${entry.timestamp}`}
                        className="rounded-[10px] border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black text-slate-900">
                            {entry.roleplayMode ?? SPEAKING_MVP_MODE}
                          </span>
                          <span className="text-xs font-black text-sky-700">
                            {entry.score}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-600">
                          Error type: {entry.errorType ?? 'No critical issue'}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {entry.progressNote ??
                            'Progress note will appear after the next attempt.'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}

      <ScoreFeedbackOverlay
        result={scoreResult}
        onClose={() => setScoreResult(null)}
        onAction={() => setScoreResult(null)}
      />
    </div>
  );
};

export default SpeakingPage;
