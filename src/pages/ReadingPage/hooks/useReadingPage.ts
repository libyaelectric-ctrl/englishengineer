import { useState, useEffect, useRef, useMemo } from 'react';
import { useReadingStore, VocabularyItem } from '@/features/reading';
import { useLearningStore } from '@/core/learning';
import {
  ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  filterContentByLevel,
  useSkillLevel,
} from '@/features/level-system';

export function useReadingPage() {
  const {
    missions,
    selectedMissionId,
    answers,
    clickedVocab,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    initializeStore,
    selectMission,
    setAnswer,
    addClickedVocab,
    incrementTimer,
    submitCurrentMission,
    resetCurrentMission,
    resetAllReadingProgress,
    getMissionsSortedByPoolRatio,
  } = useReadingStore();

  const [activeTab, setActiveTab] = useState<'missions' | 'workspace'>(
    'missions'
  );
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem('reading_bookmarks') || '[]')
      );
    } catch {
      return new Set<string>();
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('reading_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = useSkillLevel('reading').currentLevel;
  const vocabularyPool = useLearningStore((s) => s.vocabularyPool);

  const poolEntries = useMemo(
    () =>
      vocabularyPool.map((id) => ({
        content_type: 'vocabulary' as const,
        content_id: id,
      })),
    [vocabularyPool]
  );

  const sortedMissions = useMemo(
    () =>
      poolEntries.length === 0
        ? missions
        : getMissionsSortedByPoolRatio(poolEntries),
    [getMissionsSortedByPoolRatio, missions, poolEntries]
  );

  const visibleMissions = filterContentByLevel(
    sortedMissions,
    currentLevel,
    levelFilter
  );

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

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

  const currentMissionIndex = currentMission
    ? visibleMissions.findIndex((mission) => mission.id === currentMission.id)
    : -1;

  const moveMission = (offset: number) => {
    const nextMission = visibleMissions[currentMissionIndex + offset];
    if (nextMission) {
      selectMission(nextMission.id);
      setSelectedWord(null);
      setUserErrors({});
      setActiveTab('workspace');
    }
  };

  const finishedCount = Object.keys(completedMissions).length;
  const bestScoreAvg =
    finishedCount > 0
      ? Math.round(
          Object.values(completedMissions).reduce((a, b) => a + b, 0) /
            finishedCount
        )
      : 0;

  const handleLaunchMission = (missionId: string) => {
    selectMission(missionId);
    setSelectedWord(null);
    setUserErrors({});
    setActiveTab('workspace');
  };

  const handleSubmit = () => {
    if (!currentMission) return;
    const unansweredList = currentMission.questions.filter(
      (q) => !answers[q.id]
    );
    if (unansweredList.length > 0) {
      const errors: Record<string, string> = {};
      unansweredList.forEach((q) => {
        errors[q.id] = 'Verification answer required';
      });
      setUserErrors(errors);
      return;
    }
    setUserErrors({});
    submitCurrentMission();
  };

  const handleBackToMissions = () => {
    setActiveTab('missions');
    setSelectedWord(null);
  };

  return {
    // Store data
    missions,
    answers,
    clickedVocab,
    timeSpentSeconds,
    evaluationResult,
    completedMissions,
    setAnswer,
    addClickedVocab,
    resetCurrentMission,
    resetAllReadingProgress,

    // Local state
    activeTab,
    setActiveTab,
    selectedWord,
    setSelectedWord,
    userErrors,
    levelFilter,
    setLevelFilter,
    bookmarkedIds,
    toggleBookmark,

    // Derived
    currentLevel,
    visibleMissions,
    currentMission,
    currentMissionIndex,
    finishedCount,
    bestScoreAvg,

    // Handlers
    handleLaunchMission,
    handleSubmit,
    handleBackToMissions,
    moveMission,
  };
}
