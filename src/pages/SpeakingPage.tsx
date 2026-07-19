import { lazy, useState } from 'react';
import {
  FileText,
  Mic,
  RotateCcw,
  MessageSquareText,
  Trophy,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { LevelContentFilter } from '@/features/level-system';
import { SPEAKING_MVP_MODE } from '@/features/speaking';

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

type SpeakingTab = 'roleplay' | 'interview';

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
  const [speakingTab, setSpeakingTab] = useState<SpeakingTab>('roleplay');
  const {
    MAX_VOICE_MINUTES,
    voiceMinutesUsedThisMonth,
    scoreResult,
    setScoreResult,
  } = useSpeakingPage();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-12 sm:pt-0 text-foreground relative z-10 font-sans pb-16 animate-in fade-in duration-300">
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3.5 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 font-sans">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Speaking
            <span className="ml-2 text-sm font-bold text-muted-copy uppercase tracking-wider">
              {MAX_VOICE_MINUTES - voiceMinutesUsedThisMonth} min remaining
            </span>
          </h1>
        </div>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Speaking mode">
        <Button
          role="tab"
          aria-selected={speakingTab === 'roleplay'}
          variant={speakingTab === 'roleplay' ? 'primary' : 'ghost'}
          onClick={() => setSpeakingTab('roleplay')}
          className="rounded-[4px] cursor-pointer font-bold uppercase tracking-wider text-[10px] h-9 border border-border-soft bg-surface hover:bg-[#0047bb]/5"
        >
          <MessageSquareText className="h-4 w-4" />
          Roleplay
        </Button>
        <Button
          role="tab"
          aria-selected={speakingTab === 'interview'}
          variant={speakingTab === 'interview' ? 'primary' : 'ghost'}
          onClick={() => setSpeakingTab('interview')}
          className="rounded-[4px] cursor-pointer font-bold uppercase tracking-wider text-[10px] h-9 border border-border-soft bg-surface hover:bg-[#0047bb]/5"
        >
          <Trophy className="h-4 w-4" />
          Interview Simulator
        </Button>
      </div>

      {speakingTab === 'interview' ? <InterviewSimulator /> : <RoleplayTab />}

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
