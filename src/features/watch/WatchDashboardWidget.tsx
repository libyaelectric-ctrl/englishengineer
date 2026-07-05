import { Link } from 'react-router-dom';
import { Watch, Battery, Wifi, ChevronRight } from 'lucide-react';
import { useWatchStore } from './watch.store';
import { cn } from '@/shared/utils/cn';

export const WatchDashboardWidget = () => {
  const { pairedWatches, activeWatchId, notifications } = useWatchStore();
  const activeWatch = pairedWatches.find((w) => w.id === activeWatchId);
  const pendingNotifications = notifications.filter((n) => !n.acknowledged).length;

  if (!activeWatch) {
    return (
      <Link
        to="/watch"
        className="group flex items-center gap-3 rounded-card border border-border-soft bg-surface p-4 transition-all hover:border-border-hover hover:bg-surface-hover/20"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-soft bg-surface-hover text-primary">
          <Watch className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground">Pair Your Watch</p>
          <p className="mt-0.5 text-[10px] text-muted-copy">
            Connect EngineerOS smart watch
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-copy group-hover:text-foreground" />
      </Link>
    );
  }

  return (
    <Link
      to="/watch"
      className="group flex items-center gap-3 rounded-card border border-border-soft bg-surface p-4 transition-all hover:border-border-hover hover:bg-surface-hover/20"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-soft bg-surface-hover text-primary">
        <Watch className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-foreground">{activeWatch.model}</p>
          <div className="flex items-center gap-1">
            {pendingNotifications > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {pendingNotifications}
              </div>
            )}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-copy">
          <div className="flex items-center gap-1">
            <Battery className={cn('h-3 w-3', activeWatch.batteryLevel < 25 ? 'text-amber-500' : 'text-emerald-500')} />
            {activeWatch.batteryLevel}%
          </div>
          <div className="flex items-center gap-1">
            <Wifi className={cn('h-3 w-3', activeWatch.syncStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400')} />
            {activeWatch.syncStatus === 'connected' ? 'Synced' : 'Syncing...'}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-copy group-hover:text-foreground" />
    </Link>
  );
};
