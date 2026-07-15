import { useWritingStore } from '@/features/writing';
import { SkillSidebar } from '@/shared/layout/sidebar/SkillSidebar';
import type { SidebarConfig } from '@/shared/layout/sidebar/sidebar.config';

export function WritingSidebar() {
  const { missions, completedMissions, selectedMissionId } = useWritingStore();
  const done = Object.keys(completedMissions).length;
  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ?? missions[0];
  const selectedMissionIndex = selectedMission
    ? missions.findIndex((m) => m.id === selectedMission.id)
    : -1;

  const config: SidebarConfig = {
    skill: 'writing',
    pathLabel: 'Your writing path',
    pathDescription:
      'Draft professional responses and master technical writing.',
    currentLevel: selectedMission?.cefrLevel,
    totalItems: missions.length,
    progressBars: [
      {
        label: 'Completed',
        value: done,
        max: missions.length,
        color: '#f97316',
      },
    ],
    actions: [],
    custom: selectedMission ? (
      <div className="rounded-lg bg-surface-hover p-3 border border-border-soft">
        <p className="text-[10px] font-bold text-primary mb-1">
          SCENARIO {selectedMissionIndex + 1} OF {missions.length}
        </p>
        <p className="text-sm font-bold text-foreground">
          {selectedMission.title}
        </p>
        <p className="text-[10px] text-muted-copy mt-1 truncate">
          {selectedMission.discipline}
        </p>
      </div>
    ) : undefined,
  };

  return <SkillSidebar config={config} />;
}
