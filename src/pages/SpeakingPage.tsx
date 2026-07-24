import { lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mic,
  RotateCcw,
  MessageSquareText,
  Trophy,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { LevelContentFilter } from '@/features/level-system';
import { SPEAKING_MVP_MODE } from '@/features/speaking';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing/writing.store';
import { DefenseSimulator } from '@/features/speaking/DefenseSimulator';

const READING_THRESHOLD = 5;
const WRITING_THRESHOLD = 5;

const InterviewSimulator = lazy(() =>
  import('@/features/speaking/components/InterviewSimulator').then((m) => ({
    default: m.InterviewSimulator,
  }))
);

import {
  VoiceMinuteWallet,
  RoleplayCategoryFilter,
  MissionSelector,
  MissionMetrics,
  VoicePracticePanel,
  EvaluationScores,
  ScoreComparison,
  useSpeakingPage,
} from './SpeakingPage/index';

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
      {hasMaxAccess && subscription.planId === 'exec' && (
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
          <MissionMetrics
            activeMission={activeMission}
            completedMissions={completedMissions}
          />

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
              <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase text-[#0047bb] tracking-wider">
                  Roleplay prompt
                </p>
                <p className="mt-2 text-base leading-7 text-foreground font-normal">
                  {activeMission.promptText}
                </p>
              </div>

              <div className="flex items-start gap-2.5 mt-3 rounded-[4px] border border-border-soft bg-[#f3f3fd] p-3 shadow-sm">
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
                      ? 'text-[#0047bb] font-bold border-b-2 border-[#0047bb]'
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
                      ? 'text-[#0047bb] font-bold border-b-2 border-[#0047bb]'
                      : 'text-muted-copy hover:text-[#0047bb]'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice & Microphone Response
                  {!hasMaxAccess && (
                    <span className="rounded-[4px] bg-warning/10 px-1.5 py-0.5 text-[8px] font-bold text-warning uppercase tracking-wider">
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
                    This is text-based communication practice, not real speech
                    or pronunciation scoring.
                  </p>
                  <textarea
                    id="written-roleplay-response"
                    value={typedTranscript}
                    onChange={(event) => setTypedTranscript(event.target.value)}
                    className="mt-3 min-h-48 w-full resize-y rounded-[4px] border border-border-soft bg-surface px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-[#0047bb] focus:bg-white focus:ring-2 focus:ring-[#0047bb]/10 font-bold placeholder-muted-copy shadow-sm"
                    placeholder="Typed transcript fallback for Written Roleplay. Respond at your current Speaking level."
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={submitRoleplay}
                      disabled={!typedTranscript.trim()}
                      className="rounded-[4px] cursor-pointer bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 shadow-sm"
                    >
                      Submit Written Roleplay
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={resetMission}
                      className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-[#0047bb]/5 hover:text-[#0047bb] shadow-sm flex items-center gap-1.5"
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
              {evaluationResult && (
                <EvaluationScores evaluationResult={evaluationResult} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const SpeakingPage = () => {
  const readingStore = useReadingStore();
  const writingStore = useWritingStore();
  const readingDone = Object.keys(readingStore.completedMissions || {}).length;
  const writingDone = Object.keys(writingStore.completedMissions || {}).length;
  const canAccess =
    readingDone >= READING_THRESHOLD && writingDone >= WRITING_THRESHOLD;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[4px] border-2 border-[#0047bb] bg-surface p-8 text-center space-y-4">
          <Lock className="mx-auto h-10 w-10 text-[#0047bb]" />
          <h2 className="text-lg font-bold text-foreground">Speaking Locked</h2>
          <p className="text-xs text-muted-copy leading-relaxed">
            Complete {READING_THRESHOLD} readings and {WRITING_THRESHOLD}{' '}
            writings to unlock Speaking.
          </p>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between text-muted-copy">
              <span>Reading</span>
              <span className="font-bold text-foreground">
                {readingDone}/{READING_THRESHOLD}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
              <div
                className="h-full bg-[#0047bb]"
                style={{
                  width: `${Math.min((readingDone / READING_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-muted-copy">
              <span>Writing</span>
              <span className="font-bold text-foreground">
                {writingDone}/{WRITING_THRESHOLD}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
              <div
                className="h-full bg-[#0047bb]"
                style={{
                  width: `${Math.min((writingDone / WRITING_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <Link
              to="/reading"
              className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground hover:bg-surface-hover"
            >
              Go to Reading
            </Link>
            <Link
              to="/writing"
              className="rounded-[4px] border-2 border-[#0047bb] px-4 py-2 text-[10px] font-bold uppercase text-foreground hover:bg-surface-hover"
            >
              Go to Writing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [speakingTab, setSpeakingTab] = useState<SpeakingTab>('roleplay');
  const {
    MAX_VOICE_MINUTES,
    voiceMinutesUsedThisMonth,
    scoreResult,
    setScoreResult,
  } = useSpeakingPage();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-12 sm:pt-0 text-foreground relative z-10 font-sans pb-16 animate-in fade-in duration-300">
      {/* Speaking sticky header */}
      <div className="sticky top-0 z-30 border-b border-border-soft bg-background/95 backdrop-blur-xl py-3.5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="text-base font-bold tracking-tight text-foreground">
              Speaking
            </h1>
            <span className="text-[11px] font-medium text-muted-copy leading-tight">
              {MAX_VOICE_MINUTES - voiceMinutesUsedThisMonth} min remaining
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-xl border border-border-soft bg-surface/90 p-1 shadow-sm"
            role="tablist"
            aria-label="Speaking mode"
          >
            <button
              role="tab"
              type="button"
              aria-selected={speakingTab === 'roleplay'}
              onClick={() => setSpeakingTab('roleplay')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                speakingTab === 'roleplay'
                  ? 'bg-[#0047bb] text-white shadow-sm'
                  : 'text-muted-copy hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              <span>Roleplay</span>
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={speakingTab === 'interview'}
              onClick={() => setSpeakingTab('interview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                speakingTab === 'interview'
                  ? 'bg-[#0047bb] text-white shadow-sm'
                  : 'text-muted-copy hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Interview Simulator</span>
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={speakingTab === 'defense'}
              onClick={() => setSpeakingTab('defense')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                speakingTab === 'defense'
                  ? 'bg-[#0047bb] text-white shadow-sm'
                  : 'text-muted-copy hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Defense Simulators</span>
            </button>
          </div>
        </div>
      </div>

      {speakingTab === 'interview' ? (
        <InterviewSimulator />
      ) : speakingTab === 'defense' ? (
        <DefenseSimulator />
      ) : (
        <RoleplayTab />
      )}

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
