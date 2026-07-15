import { useState, useEffect, useRef } from 'react';
import {
  useWritingStore,
  WritingHelpers,
  WritingCorrection,
} from '@/features/writing';
import {
  ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  filterContentByLevel,
  useSkillLevel,
} from '@/features/level-system';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

export function useWritingPage() {
  // Read state and actions from the writing store
  const {
    missions,
    selectedMissionId,
    draft,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    initializeStore,
    selectMission,
    setDraft,
    incrementAutoFixCount,
    incrementTimer,
    submitCurrentMission,
    resetCurrentMission,
    resetAllWritingProgress,
    getMissionsSortedByPoolRatio,
  } = useWritingStore();

  // Havuza göre sıralanmış mission'lar
  const sortedMissions = getMissionsSortedByPoolRatio();

  const [activeTab, setActiveTab] = useState<'missions' | 'workspace'>(
    'missions'
  );
  const [selectedRule, setSelectedRule] = useState<WritingCorrection | null>(
    null
  );
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const [writingHistory, setWritingHistory] = useState<Array<{date: string; wordCount: number; score: number}>>(() => {
    try {
      return JSON.parse(localStorage.getItem('writing_history') || '[]');
    } catch {
      return [];
    }
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('writing').currentLevel;
  const visibleMissions = filterContentByLevel(
    sortedMissions,
    currentLevel,
    levelFilter
  );

  // Initialize writing store
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Start / stop timer based on active tab and state
  useEffect(() => {
    if (activeTab === 'workspace' && !evaluationResult) {
      timerRef.current = setInterval(() => {
        incrementTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTab, evaluationResult, incrementTimer]);

  useEffect(() => {
    if (visibleMissions.length === 0) {
      setActiveTab('missions');
      return;
    }
    if (
      visibleMissions.length > 0 &&
      !visibleMissions.some((mission) => mission.id === selectedMissionId)
    ) {
      selectMission(visibleMissions[0].id);
    }
  }, [selectMission, selectedMissionId, visibleMissions]);

  const currentMission =
    visibleMissions.find((m) => m.id === selectedMissionId) ||
    visibleMissions[0];

  const currentMissionIndex = visibleMissions.findIndex(
    (mission) => mission.id === currentMission?.id
  );

  // Helper to count total finished missions
  const finishedCount = Object.keys(completedMissions).length;
  const bestScoreAvg =
    finishedCount > 0
      ? Math.round(
          Object.values(completedMissions).reduce((a, b) => a + b, 0) /
            finishedCount
        )
      : 0;

  // Active Draft Analysis: count unresolved corrections
  const getActiveCorrections = () => {
    if (!currentMission) return [];
    return currentMission.corrections.filter((item) =>
      draft.includes(item.original)
    );
  };

  const activeCorrections = getActiveCorrections();

  const getReadabilityScore = () => {
    const wordCount = draft.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) return 0;

    let score = 55;
    if (draft.length > 50) score += 15;
    if (draft.length > 100) score += 15;

    // Penalize if errors still present
    score -= activeCorrections.length * 10;
    return Math.max(Math.min(score, 100), 10);
  };

  const handleApplyFix = (original: string, fix: string) => {
    setDraft(draft.replace(original, fix));
    incrementAutoFixCount();
  };

  const handleAutoFixAll = () => {
    let updatedDraft = draft;
    currentMission?.corrections.forEach((item) => {
      if (updatedDraft.includes(item.original)) {
        updatedDraft = updatedDraft.replace(item.original, item.fix);
        incrementAutoFixCount();
      }
    });
    setDraft(updatedDraft);
  };

  const handleLaunchMission = (missionId: string) => {
    ProductAnalyticsService.track('writing_task_started', '/writing', {
      metadata: { skill: 'writing', missionId, source: 'user' },
    });
    ProductAnalyticsService.trackOnce('first_task_started', '/writing', {
      skill: 'writing',
      source: 'user',
    });
    selectMission(missionId);
    setSelectedRule(null);
    setUserErrors({});
    setActiveTab('workspace');
  };

  const handleSubmit = () => {
    if (!draft.trim()) {
      setUserErrors({ draft: 'Draft cannot be empty' });
      return;
    }

    setUserErrors({});
    submitCurrentMission();
    const newEntry = { date: new Date().toLocaleDateString(), wordCount: draft.trim().split(/\s+/).filter(Boolean).length, score: 0 };
    setWritingHistory((prev) => {
      const next = [newEntry, ...prev].slice(0, 5);
      localStorage.setItem('writing_history', JSON.stringify(next));
      return next;
    });
    ProductAnalyticsService.track('writing_task_completed', '/writing', {
      metadata: {
        skill: 'writing',
        missionId: currentMission?.id,
        source: 'user',
      },
    });
    ProductAnalyticsService.trackOnce('first_task_completed', '/writing', {
      skill: 'writing',
      source: 'user',
    });
  };

  const handleBackToMissions = () => {
    setActiveTab('missions');
    setSelectedRule(null);
  };

  const moveMission = (offset: number) => {
    const nextMission = visibleMissions[currentMissionIndex + offset];
    if (nextMission) {
      selectMission(nextMission.id);
      setSelectedRule(null);
      setUserErrors({});
      setActiveTab('workspace');
    }
  };

  return {
    missions,
    selectedMissionId,
    draft,
    setDraft,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    activeTab,
    setActiveTab,
    selectedRule,
    setSelectedRule,
    userErrors,
    setUserErrors,
    showModelAnswer,
    setShowModelAnswer,
    levelFilter,
    setLevelFilter,
    writingHistory,
    currentLevel,
    visibleMissions,
    currentMission,
    currentMissionIndex,
    finishedCount,
    bestScoreAvg,
    activeCorrections,
    getReadabilityScore,
    handleApplyFix,
    handleAutoFixAll,
    handleLaunchMission,
    handleSubmit,
    handleBackToMissions,
    moveMission,
    resetCurrentMission,
    resetAllWritingProgress,
    WritingHelpers,
  };
}