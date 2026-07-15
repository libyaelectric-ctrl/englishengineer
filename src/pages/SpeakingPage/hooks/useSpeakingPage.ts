import { useEffect, useMemo, useState, useRef } from 'react';
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
  useSkillLevel,
} from '@/features/level-system';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

export type RoleplayFilter = 'All' | SpeakingRoleplayCategory;

const ROLEPLAY_FILTERS: RoleplayFilter[] = [
  'All',
  'Daily',
  'Work',
  'Engineering',
];

const MAX_VOICE_MINUTES = 120;

export function useSpeakingPage() {
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

  // Voice minute wallet
  const voiceMinutesUsedThisMonth = useMemo(() => {
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
  }, [history]);

  const walletPercent = Math.min(
    100,
    (voiceMinutesUsedThisMonth / MAX_VOICE_MINUTES) * 100
  );

  // UI state
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

  // Computed values
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

  // Effects
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (activeMission && activeMission.id !== selectedMissionId) {
      selectMission(activeMission.id);
    }
  }, [activeMission, selectMission, selectedMissionId]);

  // Actions
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

  const handleMissionSelect = (missionId: string) => {
    selectMission(missionId);
    ProductAnalyticsService.track('speaking_roleplay_started', '/speaking', {
      metadata: {
        skill: 'speaking',
        missionId,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_started', '/speaking', {
      skill: 'speaking',
      source: 'user',
    });
  };

  const resetRecording = () => {
    setIsRecording(false);
    setRecordedAudio(null);
    setPronunciationScore(null);
    setPhonemeFeedback([]);
    setTypedTranscript('');
    setScoreResult(null);
  };

  const resetMission = () => {
    resetCurrentMission();
    setScoreResult(null);
  };

  return {
    // Constants
    ROLEPLAY_FILTERS,
    MAX_VOICE_MINUTES,
    SPEAKING_MVP_MODE,

    // Store data
    missions,
    selectedMissionId,
    typedTranscript,
    evaluationResult,
    completedMissions,
    setTypedTranscript,

    // Billing
    subscription,
    hasMaxAccess,

    // Voice wallet
    voiceMinutesUsedThisMonth,
    walletPercent,

    // UI state
    responseMode,
    setResponseMode,
    isRecording,
    isPaused,
    setIsPaused,
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

    // Computed
    visibleMissions,
    roleplayMissions,
    activeMission,

    // Actions
    startRecording,
    submitRoleplay,
    handleMissionSelect,
    resetRecording,
    resetMission,
    pauseRef,
  };
}
