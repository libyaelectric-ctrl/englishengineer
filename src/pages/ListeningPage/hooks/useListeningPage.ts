import { useEffect, useMemo, useState } from 'react';
import { useListeningMissionsStore } from '@/features/listening';
import {
  DEFAULT_CONTENT_LEVEL_FILTER,
  filterContentByLevel,
  useSkillLevel,
  type ContentLevelFilter,
} from '@/features/level-system';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing/writing.store';

export const READING_THRESHOLD = 5;
export const WRITING_THRESHOLD = 5;

export const CATEGORIES = [
  'All',
  'Site Meetings',
  'Technical',
  'Safety',
  'Commissioning',
] as const;

export function useListeningPage() {
  const readingStore = useReadingStore();
  const writingStore = useWritingStore();
  const readingDone = Object.keys(readingStore.completedMissions || {}).length;
  const writingDone = Object.keys(writingStore.completedMissions || {}).length;
  const canAccess =
    readingDone >= READING_THRESHOLD && writingDone >= WRITING_THRESHOLD;

  const missions = useListeningMissionsStore((s) => s.missions);
  const selectedMissionId = useListeningMissionsStore(
    (s) => s.selectedMissionId
  );
  const answers = useListeningMissionsStore((s) => s.answers);
  const summary = useListeningMissionsStore((s) => s.summary);
  const userKeywords = useListeningMissionsStore((s) => s.userKeywords);
  const evaluationResult = useListeningMissionsStore((s) => s.evaluationResult);
  const initializeStore = useListeningMissionsStore(
    (s) => s.initializeMissions
  );
  const selectMission = useListeningMissionsStore((s) => s.selectMission);
  const setAnswer = useListeningMissionsStore((s) => s.setAnswer);
  const setSummary = useListeningMissionsStore((s) => s.setSummary);
  const setUserKeywords = useListeningMissionsStore((s) => s.setUserKeywords);
  const submitCurrentMission = useListeningMissionsStore(
    (s) => s.submitCurrentMission
  );
  const resetCurrentMission = useListeningMissionsStore(
    (s) => s.resetCurrentMission
  );
  const currentLevel = useSkillLevel('listening').currentLevel;
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(
    DEFAULT_CONTENT_LEVEL_FILTER
  );
  const visibleMissions = useMemo(
    () => filterContentByLevel(missions, currentLevel, levelFilter),
    [currentLevel, levelFilter, missions]
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof CATEGORIES)[number]>('All');
  const filteredMissions = useMemo(
    () =>
      categoryFilter === 'All'
        ? visibleMissions
        : visibleMissions.filter((m) =>
            m.missionType?.toLowerCase().includes(categoryFilter.toLowerCase())
          ),
    [visibleMissions, categoryFilter]
  );
  const currentMission =
    visibleMissions.find((mission) => mission.id === selectedMissionId) ??
    visibleMissions[0];

  useEffect(() => initializeStore(), [initializeStore]);

  return {
    readingDone,
    writingDone,
    canAccess,
    missions,
    selectedMissionId,
    answers,
    summary,
    userKeywords,
    evaluationResult,
    selectMission,
    setAnswer,
    setSummary,
    setUserKeywords,
    submitCurrentMission,
    resetCurrentMission,
    currentLevel,
    levelFilter,
    setLevelFilter,
    visibleMissions,
    workspaceOpen,
    setWorkspaceOpen,
    categoryFilter,
    setCategoryFilter,
    filteredMissions,
    currentMission,
  };
}
