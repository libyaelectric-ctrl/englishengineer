import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { CloudSyncService } from './cloud-sync.service';
import type { CloudSyncState, CloudSyncStatus } from './cloud-sync.types';

const statusPresentation: Record<
  CloudSyncStatus,
  {
    label: string;
    detail: string;
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  }
> = {
  idle: {
    label: 'Cloud ready',
    detail: 'Waiting for a local learning change.',
    tone: 'neutral',
  },
  queued: {
    label: 'Sync queued',
    detail: 'Local progress is queued for cloud synchronization.',
    tone: 'info',
  },
  syncing: {
    label: 'Syncing',
    detail: 'Learning progress is being merged with the cloud snapshot.',
    tone: 'info',
  },
  synced: {
    label: 'Synced',
    detail: 'Local and cloud learning progress are synchronized.',
    tone: 'success',
  },
  offline: {
    label: 'Offline',
    detail: 'Progress remains local and will sync when the connection returns.',
    tone: 'warning',
  },
  error: {
    label: 'Sync failed',
    detail: 'Progress remains safely stored locally. Cloud sync will retry.',
    tone: 'danger',
  },
};

interface CloudSyncStatusProps {
  providerMode: 'local' | 'supabase';
}

export const CloudSyncStatusPanel = ({
  providerMode,
}: CloudSyncStatusProps) => {
  const [state, setState] = useState<CloudSyncState>(() =>
    CloudSyncService.getState()
  );

  useEffect(() => CloudSyncService.subscribe(setState), []);

  const presentation =
    providerMode === 'local'
      ? {
          label: 'Local only',
          detail:
            'Demo progress stays on this device. Cloud sync requires secure account access and a configured cloud workspace.',
          tone: 'neutral' as const,
        }
      : statusPresentation[state.status];
  const Icon =
    providerMode === 'local' || state.status === 'offline' ? CloudOff : Cloud;

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      aria-label="Cloud sync status"
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900">Progress storage</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {presentation.detail}
          </p>
          {providerMode === 'supabase' && state.lastError && (
            <p className="mt-1 text-xs text-rose-700">{state.lastError}</p>
          )}
        </div>
      </div>
      <StatusBadge label={presentation.label} tone={presentation.tone} />
    </section>
  );
};
