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
  <div className="font-sans">
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy mb-3">
      Select Speaking Mission
    </p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roleplayMissions.map((mission) => {
        const isSelected = selectedMissionId === mission.id;
        const isCompleted = typeof completedMissions[mission.id] === 'number';
        return (
          <button
            key={mission.id}
            type="button"
            onClick={() => onMissionSelect(mission.id)}
            className={`w-full text-left p-4 rounded-[4px] border transition-all cursor-pointer shadow-sm flex flex-col justify-between gap-3 min-h-[110px] ${
              isSelected
                ? 'border-[#0047bb] bg-[#0047bb]/5'
                : 'border-border-soft bg-surface hover:border-[#0047bb]/40 hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-start justify-between gap-2 w-full">
              <span className="text-xs font-bold text-foreground leading-tight">
                {mission.title}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-auto">
              <span className="rounded-[4px] bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold text-warning border border-warning/10 uppercase tracking-wider">
                {mission.difficulty}
              </span>
              <span className="rounded-[4px] bg-[#0047bb]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#0047bb] border border-[#0047bb]/10">
                {mission.estimatedMinutes}M
              </span>
              <LevelAccessBadge
                label={getContentAccessLabel(mission.cefrLevel, currentLevel)}
              />
            </div>
          </button>
        );
      })}
    </div>
    {roleplayMissions.length === 0 && (
      <div className="rounded-[4px] border border-border-soft bg-surface p-6 text-xs font-bold text-muted-copy uppercase tracking-wider text-center shadow-sm">
        No current-level content yet. No Speaking roleplay is available for this
        category and level filter.
      </div>
    )}
  </div>
);
