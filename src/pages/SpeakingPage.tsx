import { FileText, Mic, RotateCcw, MessageSquareText } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { LevelContentFilter } from '@/features/level-system';
import { SPEAKING_MVP_MODE } from '@/features/speaking';

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

const SpeakingPage = () => {
  const {
    ROLEPLAY_FILTERS,
    MAX_VOICE_MINUTES,
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
    scoreResult,
    setScoreResult,
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
  } = useSpeakingPage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Speaking sticky header */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Speaking
            <span className="ml-2 text-sm font-medium text-muted-copy">
              {MAX_VOICE_MINUTES - voiceMinutesUsedThisMonth} min remaining
            </span>
          </h1>
        </div>
      </div>

      {/* Voice Minute Wallet — Max plan only */}
      {hasMaxAccess && subscription.planId === 'max' && (
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
              {/* Roleplay prompt */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase text-primary">
                  Roleplay prompt
                </p>
                <p className="mt-2 text-base leading-7 text-foreground">
                  {activeMission.promptText}
                </p>
              </div>

              {/* Practice Script Summary */}
              <div className="flex items-start gap-2 mt-3 rounded-lg border border-border-soft bg-surface-hover p-3">
                <FileText className="h-4 w-4 text-muted-copy shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-copy tracking-wider">
                    Practice Script Summary
                  </p>
                  <p className="mt-1 text-xs text-foreground leading-5">
                    {activeMission.description}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-copy">
                    Keywords: {activeMission.expectedKeywords.join(', ')}
                  </p>
                </div>
              </div>

              {/* Practice Mode Selector */}
              <div className="mt-5 flex gap-3 border-b border-border-soft pb-2">
                <button
                  type="button"
                  onClick={() => setResponseMode('written')}
                  className={`pb-2 px-1 text-xs font-medium transition-all relative ${
                    responseMode === 'written'
                      ? 'text-primary font-semibold border-b-2 border-primary'
                      : 'text-muted-copy hover:text-foreground'
                  }`}
                >
                  Written Response
                </button>
                <button
                  type="button"
                  onClick={() => setResponseMode('voice')}
                  className={`pb-2 px-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                    responseMode === 'voice'
                      ? 'text-primary font-semibold border-b-2 border-primary'
                      : 'text-muted-copy hover:text-foreground'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice & Microphone Response
                  {!hasMaxAccess && (
                    <span className="rounded bg-warning/10 px-1 text-[8px] font-semibold text-warning uppercase">
                      Max
                    </span>
                  )}
                </button>
              </div>

              {/* Response Mode Content */}
              {responseMode === 'written' ? (
                <>
                  <label
                    className="mt-5 block text-sm font-medium text-foreground"
                    htmlFor="written-roleplay-response"
                  >
                    Written Roleplay response
                  </label>
                  <p className="mt-1 text-xs leading-5 text-muted-copy">
                    This is text-based communication practice, not real speech or
                    pronunciation scoring.
                  </p>
                  <textarea
                    id="written-roleplay-response"
                    value={typedTranscript}
                    onChange={(event) => setTypedTranscript(event.target.value)}
                    className="mt-3 min-h-48 w-full resize-y rounded-lg border border-border-soft bg-surface-hover px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10"
                    placeholder="Typed transcript fallback for Written Roleplay. Respond at your current Speaking level."
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={submitRoleplay}
                      disabled={!typedTranscript.trim()}
                    >
                      Submit Written Roleplay
                    </Button>
                    <Button variant="secondary" onClick={resetMission}>
                      <RotateCcw className="h-4 w-4" /> Reset response
                    </Button>
                  </div>
                  <p className="mt-4 text-xs font-medium text-muted-copy">
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
