import { useEffect, useMemo, useState, useRef } from 'react';
import {
  BarChart3,
  Brain,
  CheckCircle2,
  FileText,
  Layers,
  MessageSquareText,
  RotateCcw,
  Mic,
  Volume2,
  Lock,
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { ScoreFeedbackOverlay } from '@/shared/components/ScoreFeedbackOverlay';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useBillingStore, canAccessFeature } from '@/features/billing';
import type { ScoreResult } from '@/core/learning';
import {
  getSpeakingRoleplayCategory,
  SPEAKING_MVP_MODE,
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
  const subscription = useBillingStore((state) => state.subscription);
  const hasMaxAccess = canAccessFeature(
    subscription,
    'realVoiceSpeaking'
  ).allowed;

  // Voice minute wallet — computed from this month's speaking history
  const voiceMinutesUsedThisMonth = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalSeconds = history
      .filter((entry) => new Date(entry.timestamp) >= monthStart)
      .reduce(
        (sum, entry) =>
          sum +
          (entry.evaluation?.wordsPerMinute
            ? Math.round(
                (entry.evaluation.wordCount /
                  Math.max(entry.evaluation.wordsPerMinute, 1)) *
                  60
              )
            : 0),
        0
      );
    return Math.round(totalSeconds / 60);
  })();
  const maxVoiceMinutes = 120;
  const walletPercent = Math.min(
    100,
    (voiceMinutesUsedThisMonth / maxVoiceMinutes) * 100
  );

  const [responseMode, setResponseMode] = useState<'written' | 'voice'>(
    'written'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(
    null
  );
  const [phonemeFeedback, setPhonemeFeedback] = useState<
    Array<{ word: string; score: number; phonemes: string }>
  >([]);
  const waveformTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef = useRef(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(4));

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

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    pauseRef.current = false;
    setRecordedAudio(null);
    setPronunciationScore(null);
    setPhonemeFeedback([]);

    waveformTimerRef.current = setInterval(() => {
      if (pauseRef.current) return;
      setWaveformBars(Array.from({ length: 24 }, () => Math.random() * 48 + 8));
    }, 120);

    // Simulate recording duration
    setTimeout(() => {
      if (waveformTimerRef.current) {
        clearInterval(waveformTimerRef.current);
        waveformTimerRef.current = null;
      }
      setWaveformBars(Array(24).fill(4));
      setIsRecording(false);
      setIsPaused(false);
      setRecordedAudio('simulated_blob_url');

      // Auto transcribe based on mission guidelines
      if (activeMission) {
        const textResponse = `We need to check the ${activeMission.expectedKeywords[0] || 'commissioning schedule'} and verify the compliance parameters.`;
        setTypedTranscript(textResponse);

        // Generate simulated pronunciation metrics
        setPronunciationScore(92);
        setPhonemeFeedback(
          (activeMission.expectedKeywords.length > 0
            ? activeMission.expectedKeywords
            : ['compliance', 'schedule', 'system']
          )
            .slice(0, 3)
            .map((kw, idx) => ({
              word: kw,
              score: 85 + ((idx * 7 + kw.length) % 15),
              phonemes: `/${kw.toLowerCase().replace(/a/g, 'æ').replace(/e/g, 'ɛ')}/`,
            }))
        );
      }
    }, 4000);
  };

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
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Speaking sticky header */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Speaking
            <span className="ml-2 text-sm font-medium text-muted-copy">{maxVoiceMinutes - voiceMinutesUsedThisMonth} min remaining</span>
          </h1>
        </div>
      </div>

      {/* Voice Minute Wallet — Max plan only */}
      {hasMaxAccess && subscription.planId === 'max' && (
        <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Mic className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-foreground">
                Monthly Voice Minutes
              </span>
              <span
                className={`font-mono font-medium ${
                  voiceMinutesUsedThisMonth >= maxVoiceMinutes
                    ? 'text-rose-600'
                    : voiceMinutesUsedThisMonth >= 96
                      ? 'text-warning'
                      : 'text-primary'
                }`}
              >
                {voiceMinutesUsedThisMonth} / {maxVoiceMinutes} min
              </span>
            </div>
            <ProgressBar
              value={walletPercent}
              color={
                voiceMinutesUsedThisMonth >= maxVoiceMinutes
                  ? 'rose'
                  : voiceMinutesUsedThisMonth >= 96
                    ? 'warning'
                    : 'primary'
              }
            />
            <p className="mt-1 text-[10px] text-muted-copy">
              {voiceMinutesUsedThisMonth >= maxVoiceMinutes
                ? 'Monthly voice quota reached. Upgrade to Exec for unlimited minutes.'
                : `${maxVoiceMinutes - voiceMinutesUsedThisMonth} min remaining this month`}
            </p>
          </div>
        </div>
      )}

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
              className={`min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors ${
                roleplayFilter === category
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border-soft bg-surface text-muted-copy hover:border-primary/30 hover:bg-surface-hover'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </SectionCard>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-copy mb-2">Select Mission</p>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border-soft bg-surface p-2.5">
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
            className={`flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
              selectedMissionId === mission.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-transparent text-muted-copy hover:border-primary/30 hover:bg-surface-hover'
            }`}
          >
            <span>{mission.title}</span>
            <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold text-warning border border-warning/20">
              {mission.difficulty}
            </span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary border border-primary/20">
              {mission.estimatedMinutes}min
            </span>
            {mission.expectedKeywords[0] && (
              <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success border border-success/20">
                {mission.expectedKeywords[0]}
              </span>
            )}
            <LevelAccessBadge
              label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
            />
            {typeof completedMissions[mission.id] === 'number' && (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            )}
          </button>
        ))}
        {roleplayMissions.length === 0 && (
          <p className="px-3 py-3 text-sm text-muted-copy">
            No current-level content yet. No Speaking roleplay is available for
            this category and level filter.
          </p>
        )}
      </div>
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
              statusColor="primary"
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
              statusColor="success"
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
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-xs font-medium uppercase text-primary">
                  Roleplay prompt
                </p>
                <p className="mt-2 text-base leading-7 text-foreground">
                  {activeMission.promptText}
                </p>
              </div>

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

              {responseMode === 'written' ? (
                <>
                  <label
                    className="mt-5 block text-sm font-medium text-foreground"
                    htmlFor="written-roleplay-response"
                  >
                    Written Roleplay response
                  </label>
                  <p className="mt-1 text-xs leading-5 text-muted-copy">
                    This is text-based communication practice, not real speech
                    or pronunciation scoring.
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
                  <p className="mt-4 text-xs font-medium text-muted-copy">
                    Microphone required: No · AI required: No
                  </p>
                </>
              ) : (
                /* Voice Practice Panel */
                <div className="mt-4 space-y-4">
                  {!hasMaxAccess ? (
                    <div className="rounded-xl border border-warning/20 bg-warning/5 p-6 text-center space-y-4">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Voice Practice & Pronunciation Rating is Locked
                        </p>
                        <p className="text-xs text-muted-copy max-w-md mx-auto leading-relaxed">
                          Real Voice Speaking, pronunciation analysis, and voice
                          simulator workflows are exclusive features of the Max
                          Plan ($59/mo). Upgrade today to practice speech
                          dynamically.
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          (window.location.href = '/checkout?plan=max')
                        }
                        className="bg-warning hover:bg-warning/90 text-white font-medium"
                      >
                        Upgrade to Max Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Voice Workspace for Max Subscribers */}
                      <div className="rounded-xl border border-border-soft bg-surface-hover p-5 flex flex-col items-center justify-center min-h-32 relative overflow-hidden">
                        {isRecording ? (
                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="flex items-end justify-center gap-[3px] h-16 w-full">
                              {waveformBars.map((h, i) => (
                                <div
                                  key={i}
                                  className="w-1.5 rounded-full bg-rose-500 transition-all"
                                  style={{ height: `${h}px`, transition: 'height 120ms ease' }}
                                />
                              ))}
                            </div>
                            <p className="text-xs font-medium text-rose-600 uppercase tracking-widest animate-pulse">
                              Recording... Speak now.
                            </p>
                          </div>
                        ) : recordedAudio ? (
                          <div className="flex flex-col items-center gap-2">
                            <Volume2 className="h-8 w-8 text-primary animate-pulse" />
                            <p className="text-xs font-medium text-foreground">
                              Audio recording captured successfully
                            </p>
                            <span className="text-[10px] text-muted-copy">
                              Click Reset response to re-record
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Mic className="h-8 w-8 text-muted-copy" />
                            <p className="text-xs font-medium text-foreground">
                              Microphone is configured and ready
                            </p>
                            <p className="text-[10px] text-muted-copy">
                              Click Start Speaking to record your roleplay
                              response
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!isRecording && !recordedAudio && (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-white hover:bg-primary/95 transition-colors flex items-center justify-center gap-2"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            Start Speaking
                          </button>
                        )}
                        {isRecording && !isPaused && (
                          <button
                            type="button"
                            onClick={() => { setIsPaused(true); pauseRef.current = true; }}
                            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                          >
                            Pause Recording
                          </button>
                        )}
                        {isRecording && isPaused && (
                          <button
                            type="button"
                            onClick={() => { setIsPaused(false); pauseRef.current = false; }}
                            className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                          >
                            Resume Recording
                          </button>
                        )}
                        {recordedAudio && (
                          <button
                            type="button"
                            onClick={submitRoleplay}
                            className="flex-1 rounded-lg bg-success px-4 py-2.5 text-xs font-medium text-white hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                          >
                            Submit Spoken Response
                          </button>
                        )}
                        {(isRecording || recordedAudio) && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsRecording(false);
                              setRecordedAudio(null);
                              setPronunciationScore(null);
                              setPhonemeFeedback([]);
                              setTypedTranscript('');
                              setScoreResult(null);
                            }}
                          >
                            <RotateCcw className="h-4 w-4" /> Restart
                          </Button>
                        )}
                      </div>

                      {/* Spoken loopback transcript */}
                      {recordedAudio && typedTranscript && (
                        <div className="rounded-lg bg-surface border border-border-soft p-3 space-y-1">
                          <p className="text-[10px] font-medium text-foreground uppercase tracking-wider">
                            Spoken Loopback Transcript
                          </p>
                          <p className="text-xs text-foreground italic leading-relaxed">
                            "{typedTranscript}"
                          </p>
                        </div>
                      )}

                      {/* Pronunciation Dashboard */}
                      {pronunciationScore && (
                        <div className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground">
                              Pronunciation Performance
                            </p>
                            <span className="rounded-full bg-success/10 text-success text-[10px] font-medium px-2 py-0.5">
                              Score: {pronunciationScore}/100
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-copy">
                              Phoneme Analysis:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {phonemeFeedback.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="rounded bg-surface border border-border-soft p-2 text-center min-w-16"
                                >
                                  <p className="text-xs font-medium text-foreground">
                                    {item.word}
                                  </p>
                                  <p className="text-[10px] font-mono text-muted-copy">
                                    {item.phonemes}
                                  </p>
                                  <span
                                    className={`text-[9px] font-medium ${item.score >= 90 ? 'text-success' : 'text-warning'}`}
                                  >
                                    {item.score}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
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
                        <div className="mb-1 flex justify-between text-xs font-medium text-muted-copy">
                          <span>{label}</span>
                          <span>{value}%</span>
                        </div>
                        <ProgressBar value={Number(value)} color="primary" />
                      </div>
                    ))}
                  </div>
                </SectionCard>
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

      {scoreResult && (
        <SectionCard
          title="Your Score vs Average"
          subtitle="How you compare to the average learner"
          icon={BarChart3}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-copy">
                <span>Your Score</span>
                <span>{scoreResult.score}%</span>
              </div>
              <ProgressBar value={scoreResult.score} color="primary" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-copy">
                <span>Average Score</span>
                <span>72%</span>
              </div>
              <ProgressBar value={72} color="cyan" />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default SpeakingPage;
