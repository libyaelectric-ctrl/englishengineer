import { ProgressBar } from '@/shared/components/ProgressBar';
import { GamificationMissionProgress } from '@/features/gamification';

export const MissionList = ({
  missions,
}: {
  missions: GamificationMissionProgress[];
}) => (
  <div className="space-y-4">
    {missions.map((mission) => {
      const value = Math.round(
        (mission.progress / mission.template.target) * 100
      );
      return (
        <div
          key={mission.template.id}
          className="rounded-[4px] border border-[#d9d9e3] bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono text-[#0047bb] uppercase tracking-widest font-bold">
                {mission.template.category}
              </p>
              <h4 className="mt-1 text-base font-bold text-foreground">
                {mission.template.title}
              </h4>
              <p className="text-xs text-muted-copy mt-1 font-medium">
                {mission.template.description}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono uppercase border px-2 py-1 rounded-[4px] self-start font-bold ${
                mission.isCompleted
                  ? 'bg-success/10 text-success border-success/20'
                  : 'border-[#d9d9e3] bg-[#faf8ff] text-muted-copy'
              }`}
            >
              {mission.isCompleted
                ? 'Complete'
                : `${mission.progress}/${mission.template.target}`}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <ProgressBar
              value={value}
              color={mission.isCompleted ? 'emerald' : 'primary'}
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-copy font-bold">
              <span>+{mission.template.xpReward} XP</span>
              <span>+{mission.template.coinReward} coins</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between border-b border-[#d9d9e3] pb-2 last:border-b-0 last:pb-0">
    <span className="font-mono text-xs uppercase font-bold">{label}</span>
    <span className="font-bold text-foreground">{value}</span>
  </div>
);

export const MiniStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
    <p className="text-[10px] font-mono text-muted-copy uppercase font-bold">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
  </div>
);

export const FeedList = ({
  items,
  emptyLabel,
}: {
  items: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  emptyLabel: string;
}) => (
  <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
    {items.map((item) => (
      <div
        key={item.id}
        className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-bold text-foreground">{item.title}</p>
        <p className="text-xs text-muted-copy mt-1 font-medium">
          {item.description}
        </p>
        <p className="text-[10px] font-mono text-[#0047bb] mt-2 font-bold">
          {new Date(item.timestamp).toLocaleDateString()}
        </p>
      </div>
    ))}
    {items.length === 0 && (
      <p className="text-xs text-muted-copy font-medium">{emptyLabel}</p>
    )}
  </div>
);
