import { CheckCircle2 } from 'lucide-react';
import {
  LevelAccessBadge,
  getContentAccessLabel,
  type CefrLevel,
} from '@/features/level-system';
import type { SpeakingMission } from '@/features/speaking';

interface MissionSelectorProps {
  roleplayMissions: SpeakingMission[];
  selectedMissionId: string | undefined;
  completedMissions: Record<string, number | undefined>;
  currentLevel: CefrLevel;
  onMissionSelect: (missionId: string) => void;
}

export const MissionSelector = ({
  roleplayMissions,
  selectedMissionId,
  completedMissions,
  currentLevel,
  onMissionSelect,
}: MissionSelectorProps) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-muted-copy mb-2">
      Select Mission
    </p>
    <div className="flex flex-wrap gap-2 rounded-xl border border-border-soft bg-surface p-2.5">
      {roleplayMissions.map((mission) => (
        <button
          key={mission.id}
          type="button"
          onClick={() => onMissionSelect(mission.id)}
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
);
