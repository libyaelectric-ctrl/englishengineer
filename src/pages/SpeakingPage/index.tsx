import { FileText, MessageSquareText, Mic, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';

import type { JSX } from 'react';
import { Suspense, lazy, useState } from 'react';

import { Button } from '@/shared/components/Button';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { SectionCard } from '@/shared/components/SectionCard';
import { SkillLockedState } from '@/shared/components/SkillLockedState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { READING_THRESHOLD, WRITING_THRESHOLD } from '@/shared/constants/progression-thresholds';
import { isProgressionBypassed } from '@/shared/utils/progression-lock.helpers';

import { LevelContentFilter } from '@/features/level-system';
import { useReadingStore } from '@/features/reading';
import { SPEAKING_MVP_MODE } from '@/features/speaking';
import { DefenseSimulator } from '@/features/speaking/simulator/DefenseSimulator';
import { useWritingStore } from '@/features/writing/writing.store';

import {
  EvaluationScores,
  MissionMetrics,
  MissionSelector,
  RoleplayCategoryFilter,
  ScoreComparison,
  VoiceMinuteWallet,
  VoicePracticePanel,
} from './components';
import { useSpeakingPage } from './hooks/useSpeakingPage';

const InterviewSimulator = lazy(() =>
  import('@/features/speaking/components/InterviewSimulator').then((m) => ({
    default: m.InterviewSimulator,
  }))
);

type SpeakingTab = 'roleplay' | 'interview' | 'defense';

const RoleplayTab = () => {
  const {
    ROLEPLAY_FILTERS,
    typedTranscript,
    setTypedTranscript,
    evaluationResult,
    completedMissions,
    hasMaxAccess,
    subscription,
    voiceMinutesUsedThisMonth,
    walletPercent,
    responseMode,
    setResponseMode,
    isRecording,
    isPaused,
    setIsPaused,
    pauseRef,
    recordedAudio,
    pronunciationScore,
    phonemeFeedback,
    waveformBars,
    levelFilter,
    setLevelFilter,
    roleplayFilter,
    setRoleplayFilter,
    currentLevel,
    roleplayMissions,
    activeMission,
    selectedMissionId,
    startRecording,
    submitRoleplay,
    handleMissionSelect,
    resetRecording,
    resetMission,
    MAX_VOICE_MINUTES,
  } = useSpeakingPage();

  return (
    <>
      {hasMaxAccess && subscription.planId === 'master' && (
        <VoiceMinuteWallet
          voiceMinutesUsedThisMonth={voiceMinutesUsedThisMonth}
          maxVoiceMinutes={MAX_VOICE_MINUTES}
          walletPercent={walletPercent}
        />
      )}

      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />

      <RoleplayCategoryFilter
        roleplayFilters={ROLEPLAY_FILTERS}
        roleplayFilter={roleplayFilter}
        onFilterChange={setRoleplayFilter}
      />

      <MissionSelector
        roleplayMissions={roleplayMissions}
        selectedMissionId={selectedMissionId}
        completedMissions={completedMissions}
        currentLevel={currentLevel}
        onMissionSelect={handleMissionSelect}
      />

      {activeMission && (
        <>
          <MissionMetrics activeMission={activeMission} completedMissions={completedMissions} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <SectionCard
              title={activeMission.title}
              subtitle={activeMission.description}
              icon={MessageSquareText}
              headerActions={
                <StatusBadge label={`${SPEAKING_MVP_MODE} · No microphone required`} tone="info" />
              }
            >
              <div className="rounded-[4px] border border-primary/25 bg-primary/5 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase text-primary tracking-wider">
                  Roleplay prompt
                </p>
                <p className="mt-2 text-base leading-7 text-foreground font-normal">
                  {activeMission.promptText}
                </p>
              </div>

              <div className="flex items-start gap-2.5 mt-3 rounded-[4px] border border-border-soft bg-surface-hover p-3 shadow-sm">
                <FileText className="h-4 w-4 text-muted-copy shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-copy tracking-wider">
                    Practice Script Summary
                  </p>
                  <p className="mt-1 text-xs text-foreground leading-5 font-normal">
                    {activeMission.description}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-copy font-bold">
                    Keywords: {activeMission.expectedKeywords.join(', ')}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3 border-b border-border-soft pb-2">
                <button
                  type="button"
                  onClick={() => setResponseMode('written')}
                  className={`pb-2 px-1 text-[10px] font-sans font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                    responseMode === 'written'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-muted-copy hover:text-foreground'
                  }`}
                >
                  Written Response
                </button>
                <button
                  type="button"
                  onClick={() => setResponseMode('voice')}
                  className={`pb-2 px-1 text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    responseMode === 'voice'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-muted-copy hover:text-primary'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice & Microphone Response
                  {!hasMaxAccess && (
                    <span className="rounded-[4px] bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning uppercase tracking-wider">
                      Max
                    </span>
                  )}
                </button>
              </div>

              {responseMode === 'written' ? (
                <>
                  <label
                    className="mt-5 block text-sm font-bold text-foreground uppercase tracking-wider"
                    htmlFor="written-roleplay-response"
                  >
                    Written Roleplay response
                  </label>
                  <p className="mt-1 text-xs leading-5 text-muted-copy font-medium">
                    This is text-based communication practice, not real speech or pronunciation
                    scoring.
                  </p>
                  <textarea
                    id="written-roleplay-response"
                    value={typedTranscript}
                    onChange={(event) => setTypedTranscript(event.target.value)}
                    className="mt-3 min-h-48 w-full resize-y rounded-[4px] border border-border-soft bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 font-bold placeholder-muted-copy shadow-sm"
                    placeholder="Typed transcript fallback for Written Roleplay. Respond at your current Speaking level."
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={submitRoleplay}
                      disabled={!typedTranscript.trim()}
                      className="rounded-[4px] cursor-pointer bg-primary hover:bg-primary-hover border border-primary text-primary-foreground font-bold uppercase tracking-wider text-[11px] h-10 px-5 shadow-sm"
                    >
                      Submit Written Roleplay
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={resetMission}
                      className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-primary/5 hover:text-primary shadow-sm flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset response
                    </Button>
                  </div>
                  <p className="mt-4 text-xs font-bold text-muted-copy uppercase tracking-wider">
                    Microphone required: No · AI required: No
                  </p>
                </>
              ) : (
                <VoicePracticePanel
                  hasMaxAccess={hasMaxAccess}
                  isRecording={isRecording}
                  isPaused={isPaused}
                  setIsPaused={setIsPaused}
                  pauseRef={pauseRef}
                  recordedAudio={recordedAudio}
                  pronunciationScore={pronunciationScore}
                  phonemeFeedback={phonemeFeedback}
                  waveformBars={waveformBars}
                  typedTranscript={typedTranscript}
                  onStartRecording={startRecording}
                  onSubmitRoleplay={submitRoleplay}
                  onResetRecording={resetRecording}
                />
              )}
            </SectionCard>

            <div className="space-y-6">
              {evaluationResult && <EvaluationScores evaluationResult={evaluationResult} />}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const TAB_CONFIG: Record<
  SpeakingTab,
  {
    label: string;
    icon: typeof MessageSquareText;
    Component: React.LazyExoticComponent<() => JSX.Element | null> | (() => JSX.Element | null);
  }
> = {
  roleplay: {
    label: 'Roleplay',
    icon: MessageSquareText,
    Component: RoleplayTab,
  },
  interview: {
    label: 'Interview Simulator',
    icon: Trophy,
    Component: InterviewSimulator,
  },
  defense: {
    label: 'Defense Simulators',
    icon: ShieldCheck,
    Component: DefenseSimulator,
  },
};

const SpeakingTabContent = ({ tab }: { tab: SpeakingTab }) => {
  const { Component } = TAB_CONFIG[tab];
  return <Component />;
};

const SpeakingPage = () => {
  const readingCompletedMissions = useReadingStore((s) => s.completedMissions);
  const writingCompletedMissions = useWritingStore((s) => s.completedMissions);
  const readingDone = Object.keys(readingCompletedMissions || {}).length;
  const writingDone = Object.keys(writingCompletedMissions || {}).length;

  const [bypassUnlocked, setBypassUnlocked] = useState(() => isProgressionBypassed());
  const [previewMode, setPreviewMode] = useState(false);

  const canAccess =
    bypassUnlocked ||
    previewMode ||
    (readingDone >= READING_THRESHOLD && writingDone >= WRITING_THRESHOLD);

  const [speakingTab, setSpeakingTab] = useState<SpeakingTab>('roleplay');
  const { MAX_VOICE_MINUTES, voiceMinutesUsedThisMonth, scoreResult, setScoreResult } =
    useSpeakingPage();

  if (!canAccess) {
    return (
      <SkillLockedState
        skillName="Speaking"
        prerequisites={[
          { label: 'Reading', done: readingDone, threshold: READING_THRESHOLD },
          { label: 'Writing', done: writingDone, threshold: WRITING_THRESHOLD },
        ]}
        onPreview={() => setPreviewMode(true)}
        onUnlocked={() => setBypassUnlocked(true)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-12 sm:pt-0 text-foreground relative z-10 font-sans pb-16 animate-in fade-in duration-300">
      {/* Speaking sticky header */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight text-foreground">Speaking</h1>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {MAX_VOICE_MINUTES - voiceMinutesUsedThisMonth}m LEFT
          </span>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            AI interview simulation & technical defense practice.
          </p>
        </div>

        <div
          className="flex items-center gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm overflow-x-auto"
          role="tablist"
          aria-label="Speaking mode"
        >
          {(Object.entries(TAB_CONFIG) as [SpeakingTab, (typeof TAB_CONFIG)[SpeakingTab]][]).map(
            ([key, { label, icon: Icon }]) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={speakingTab === key}
                onClick={() => setSpeakingTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
                  speakingTab === key
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'text-muted-copy hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            )
          )}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-soft border-t-primary" />
          </div>
        }
      >
        <SpeakingTabContent tab={speakingTab} />
      </Suspense>

      <ScoreFeedbackOverlay
        result={scoreResult}
        onClose={() => setScoreResult(null)}
        onAction={() => setScoreResult(null)}
      />

      {scoreResult && <ScoreComparison scoreResult={scoreResult} />}
    </div>
  );
};

export default SpeakingPage;
