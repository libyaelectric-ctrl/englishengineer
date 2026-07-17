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
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy mb-2">
      Select Mission
    </p>
    <div className="flex flex-wrap gap-2 rounded-[4px] border border-[#d9d9e3] bg-white p-2.5 shadow-sm">
      {roleplayMissions.map((mission) => (
        <button
          key={mission.id}
          type="button"
          onClick={() => onMissionSelect(mission.id)}
          className={`flex min-h-9 items-center gap-2 rounded-[4px] border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            selectedMissionId === mission.id
              ? 'border-[#0047bb] bg-[#0047bb]/10 text-foreground'
              : 'border-transparent text-muted-copy hover:border-[#0047bb]/30 hover:bg-[#0047bb]/5 hover:text-[#0047bb]'
          }`}
        >
          <span>{mission.title}</span>
          <span className="rounded-[4px] bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold text-warning border border-warning/20">
            {mission.difficulty}
          </span>
          <span className="rounded-[4px] bg-[#0047bb]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#0047bb] border border-[#0047bb]/20">
            {mission.estimatedMinutes}M
          </span>
          {mission.expectedKeywords[0] && (
            <span className="rounded-[4px] bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success border border-success/20">
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
        <p className="px-3 py-3 text-sm text-muted-copy font-bold uppercase">
          No current-level content yet. No Speaking roleplay is available for
          this category and level filter.
        </p>
      )}
    </div>
  </div>
);
