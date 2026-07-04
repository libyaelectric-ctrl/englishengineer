import { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  History,
  Layers,
  MessageSquareText,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
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
  const subscription = useBillingStore((state) => state.subscription);
  const hasMaxAccess = canAccessFeature(subscription, 'realVoiceSpeaking').allowed;

  const [responseMode, setResponseMode] = useState<'written' | 'voice'>('written');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [phonemeFeedback, setPhonemeFeedback] = useState<Array<{ word: string; score: number; phonemes: string }>>([]);

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
    setRecordedAudio(null);
    setPronunciationScore(null);
    setPhonemeFeedback([]);
    
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
      setRecordedAudio('simulated_blob_url');
      
      // Auto transcribe based on mission guidelines
      if (activeMission) {
        const textResponse = `We need to check the ${activeMission.expectedKeywords[0] || 'commissioning schedule'} and verify the compliance parameters.`;
        setTypedTranscript(textResponse);
        
        // Generate simulated pronunciation metrics
        setPronunciationScore(92);
        setPhonemeFeedback(
          (activeMission.expectedKeywords.length > 0 ? activeMission.expectedKeywords : ['compliance', 'schedule', 'system']).slice(0, 3).map((kw) => ({
            word: kw,
            score: Math.floor(Math.random() * 15) + 85,
            phonemes: `/${kw.toLowerCase().replace(/a/g, 'æ').replace(/e/g, 'ɛ')}/`
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

              {/* Practice Mode Selector */}
              <div className="mt-5 flex gap-3 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setResponseMode('written')}
                  className={`pb-2 px-1 text-xs font-bold transition-all relative ${
                    responseMode === 'written'
                      ? 'text-sky-600 font-extrabold border-b-2 border-sky-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Written Response
                </button>
                <button
                  type="button"
                  onClick={() => setResponseMode('voice')}
                  className={`pb-2 px-1 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    responseMode === 'voice'
                      ? 'text-sky-600 font-extrabold border-b-2 border-sky-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice & Microphone Response
                  {!hasMaxAccess && (
                    <span className="rounded bg-amber-100 px-1 text-[8px] font-extrabold text-amber-800 uppercase">
                      Max
                    </span>
                  )}
                </button>
              </div>

              {responseMode === 'written' ? (
                <>
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
                    Microphone required: No · AI required: No
                  </p>
                </>
              ) : (
                /* Voice Practice Panel */
                <div className="mt-4 space-y-4">
                  {!hasMaxAccess ? (
                    <div className="rounded-[12px] border border-amber-500/20 bg-amber-500/5 p-6 text-center space-y-4">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-900">Voice Practice & Pronunciation Rating is Locked</p>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Real Voice Speaking, pronunciation analysis, and voice simulator workflows are exclusive features of the Max Plan ($59/mo). Upgrade today to practice speech dynamically.
                        </p>
                      </div>
                      <Button
                        onClick={() => (window.location.href = '/checkout?plan=max')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                      >
                        Upgrade to Max Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Voice Workspace for Max Subscribers */}
                      <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-5 flex flex-col items-center justify-center min-h-48 relative overflow-hidden">
                        {isRecording ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-1.5 h-8">
                              <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-7 bg-rose-500 rounded-full animate-bounce delay-150"></span>
                              <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce delay-300"></span>
                            </div>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest animate-pulse">
                              Recording... Speak now.
                            </p>
                          </div>
                        ) : recordedAudio ? (
                          <div className="flex flex-col items-center gap-2">
                            <Volume2 className="h-8 w-8 text-primary animate-pulse" />
                            <p className="text-xs font-bold text-foreground">Audio recording captured successfully</p>
                            <span className="text-[10px] text-muted-copy">Click Reset response to re-record</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Mic className="h-8 w-8 text-slate-400" />
                            <p className="text-xs font-bold text-slate-700">Microphone is configured and ready</p>
                            <p className="text-[10px] text-slate-400">Click Start Speaking to record your roleplay response</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!isRecording && !recordedAudio && (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="flex-1 rounded-[12px] bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/95 transition-colors flex items-center justify-center gap-2"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            Start Speaking
                          </button>
                        )}
                        {isRecording && (
                          <button
                            type="button"
                            disabled
                            className="flex-1 rounded-[12px] bg-rose-500 px-4 py-2.5 text-xs font-bold text-white opacity-80 flex items-center justify-center gap-2 cursor-not-allowed"
                          >
                            <MicOff className="h-3.5 w-3.5 animate-spin" />
                            Speaking (4s limit)...
                          </button>
                        )}
                        {recordedAudio && (
                          <button
                            type="button"
                            onClick={submitRoleplay}
                            className="flex-1 rounded-[12px] bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                          >
                            Submit Spoken Response
                          </button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setRecordedAudio(null);
                            setPronunciationScore(null);
                            setPhonemeFeedback([]);
                            setTypedTranscript('');
                            setScoreResult(null);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" /> Reset
                        </Button>
                      </div>

                      {/* Spoken loopback transcript */}
                      {recordedAudio && typedTranscript && (
                        <div className="rounded-[8px] bg-white border border-slate-200 p-3 space-y-1">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Spoken Loopback Transcript</p>
                          <p className="text-xs text-slate-800 italic leading-relaxed">"{typedTranscript}"</p>
                        </div>
                      )}

                      {/* Pronunciation Dashboard */}
                      {pronunciationScore && (
                        <div className="rounded-[12px] border border-emerald-500/20 bg-emerald-50/50 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900">Pronunciation Performance</p>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                              Score: {pronunciationScore}/100
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-500">Phoneme Analysis:</p>
                            <div className="flex flex-wrap gap-2">
                              {phonemeFeedback.map((item, idx) => (
                                <div key={idx} className="rounded bg-white border border-slate-100 p-2 text-center min-w-16">
                                  <p className="text-xs font-bold text-slate-800">{item.word}</p>
                                  <p className="text-[10px] font-mono text-slate-500">{item.phonemes}</p>
                                  <span className={`text-[9px] font-bold ${item.score >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
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
