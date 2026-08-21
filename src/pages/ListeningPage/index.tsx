import { Headphones } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/Button';
import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { PersonalAIPanel } from '@/features/ai/PersonalAIPanel';
import { useAuthStore } from '@/features/auth';
import {
  type ContentLevelFilter,
  DEFAULT_CONTENT_LEVEL_FILTER,
  EmptyLevelState,
  LevelAccessBadge,
  LevelContentFilter,
  filterContentByLevel,
  getContentAccessLabel,
  useSkillLevel,
} from '@/features/level-system';
import { useListeningMissionsStore } from '@/features/listening';

import { WorkspaceView } from './components/WorkspaceView';

const CATEGORIES = ['All', 'Site Meetings', 'Technical', 'Safety', 'Commissioning'] as const;

const ListeningPage = () => {
  const missions = useListeningMissionsStore((s) => s.missions);
  const selectedMissionId = useListeningMissionsStore((s) => s.selectedMissionId);
  const answers = useListeningMissionsStore((s) => s.answers);
  const summary = useListeningMissionsStore((s) => s.summary);
  const userKeywords = useListeningMissionsStore((s) => s.userKeywords);
  const evaluationResult = useListeningMissionsStore((s) => s.evaluationResult);
  const initializeStore = useListeningMissionsStore((s) => s.initializeMissions);
  const selectMission = useListeningMissionsStore((s) => s.selectMission);
  const setAnswer = useListeningMissionsStore((s) => s.setAnswer);
  const setSummary = useListeningMissionsStore((s) => s.setSummary);
  const setUserKeywords = useListeningMissionsStore((s) => s.setUserKeywords);
  const submitCurrentMission = useListeningMissionsStore((s) => s.submitCurrentMission);
  const resetCurrentMission = useListeningMissionsStore((s) => s.resetCurrentMission);
  const currentLevel = useSkillLevel('listening').currentLevel;
  const [levelFilter, setLevelFilter] = useState<ContentLevelFilter>(DEFAULT_CONTENT_LEVEL_FILTER);
  const visibleMissions = useMemo(
    () => filterContentByLevel(missions, currentLevel, levelFilter),
    [currentLevel, levelFilter, missions]
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
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
    visibleMissions.find((mission) => mission.id === selectedMissionId) ?? visibleMissions[0];

  const currentUser = useAuthStore((s) => s.currentUser);
  const userDiscipline = (currentUser?.engineeringDiscipline as EngineeringDiscipline) ?? null;

  useEffect(() => initializeStore(), [initializeStore]);

  if (!currentMission) {
    return (
      <PageContainer>
        <PageHeader
          title="Listening"
          description="Engineering site audio, technical meeting transcripts & listening comprehension."
        />
        <div className="space-y-6 pt-4">
          <LevelContentFilter
            value={levelFilter}
            currentLevel={currentLevel}
            onChange={setLevelFilter}
          />
          <EmptyLevelState skill="listening" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Listening"
        description="Engineering site audio, technical meeting transcripts & listening comprehension."
        badgeText={currentLevel}
        actions={
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy rounded-[4px] border border-border-soft bg-surface px-2.5 py-1">
            Mission {visibleMissions.findIndex((m) => m.id === currentMission.id) + 1}/
            {visibleMissions.length}
          </span>
        }
      />
      <div className="space-y-6 pt-4">
        <PersonalAIPanel
          discipline={userDiscipline}
          cefrLevel={currentLevel}
          userName={currentUser?.displayName}
        />
        <LevelContentFilter
          value={levelFilter}
          currentLevel={currentLevel}
          onChange={setLevelFilter}
        />

        {!workspaceOpen ? (
          <>
            <SectionCard
              title="Transcript Tasks"
              subtitle="Choose a level-safe task; the system recommendation remains changeable"
              icon={Headphones}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`min-h-9 rounded-[4px] px-3.5 text-xs font-bold transition-all cursor-pointer border ${
                      categoryFilter === cat
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : 'text-muted-copy border-border-soft bg-surface hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMissions.map((mission) => (
                  <article
                    key={mission.id}
                    className="group rounded-[4px] border border-border-soft bg-surface p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[4px] border border-border-soft bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {mission.cefrLevel}
                        </span>
                        <LevelAccessBadge
                          label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
                        />
                      </div>
                      <span className="text-xs text-muted-copy font-bold">
                        {mission.estimatedMinutes} M
                      </span>
                    </div>
                    <h2 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {mission.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-copy font-normal">
                      {mission.description}
                    </p>
                    <Button
                      className="mt-4 w-full rounded-[4px] font-bold uppercase tracking-wider text-[10px] cursor-pointer bg-primary hover:bg-primary-hover border border-primary h-10"
                      onClick={() => {
                        selectMission(mission.id);
                        setWorkspaceOpen(true);
                      }}
                    >
                      Open transcript task
                    </Button>
                  </article>
                ))}
              </div>
            </SectionCard>
          </>
        ) : (
          <WorkspaceView
            currentMission={currentMission}
            onBack={() => setWorkspaceOpen(false)}
            answers={answers}
            setAnswer={setAnswer}
            summary={summary}
            setSummary={setSummary}
            userKeywords={userKeywords}
            setUserKeywords={setUserKeywords}
            submitCurrentMission={submitCurrentMission}
            resetCurrentMission={resetCurrentMission}
            evaluationResult={evaluationResult}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default ListeningPage;
