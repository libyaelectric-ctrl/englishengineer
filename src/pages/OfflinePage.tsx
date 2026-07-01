import { useEffect, useMemo, useState } from 'react';
import { CloudOff, Database, History, Wifi, WifiOff } from 'lucide-react';
import {
  OFFLINE_CAPABILITIES,
  getCapabilityLabel,
  getOfflineSummary,
} from '@/features/offline';
import { useWorkToolsStore } from '@/features/work-tools';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { storage } from '@/shared/storage';

const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine
  );
  const { recentItemIds, recentSearches, quickAIDraft } = useWorkToolsStore();
  const summary = useMemo(() => getOfflineSummary(OFFLINE_CAPABILITIES), []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Offline Pack"
        description="Know exactly what remains usable on site when the connection is weak or unavailable."
        badgeText={isOnline ? 'Online' : 'Offline mode'}
        badgeColor={isOnline ? 'emerald' : 'amber'}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card hoverEffect={false}>
          <Database className="h-5 w-5 text-emerald-600" />
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {summary.available}
          </p>
          <p className="mt-1 text-sm text-slate-600">Offline-available areas</p>
        </Card>
        <Card hoverEffect={false}>
          <History className="h-5 w-5 text-amber-600" />
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {summary.limited}
          </p>
          <p className="mt-1 text-sm text-slate-600">Limited offline areas</p>
        </Card>
        <Card hoverEffect={false}>
          {isOnline ? (
            <Wifi className="h-5 w-5 text-blue-700" />
          ) : (
            <WifiOff className="h-5 w-5 text-rose-600" />
          )}
          <p className="mt-4 text-lg font-bold text-slate-950">
            {isOnline ? 'Connection available' : 'Connection unavailable'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Local storage: {storage.isAvailable() ? 'available' : 'unavailable'}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {OFFLINE_CAPABILITIES.map((capability) => (
          <Card
            key={capability.id}
            className="flex items-start justify-between gap-4"
            hoverEffect
          >
            <div>
              <h2 className="font-bold text-slate-950">{capability.name}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {capability.description}
              </p>
            </div>
            <StatusBadge
              label={getCapabilityLabel(capability.status)}
              tone={
                capability.status === 'available'
                  ? 'success'
                  : capability.status === 'limited'
                    ? 'warning'
                    : 'neutral'
              }
            />
          </Card>
        ))}
      </div>

      <Card className="space-y-4" hoverEffect={false}>
        <div className="flex items-center gap-3">
          <CloudOff className="h-5 w-5 text-amber-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Available offline
            </h2>
            <p className="text-sm text-slate-600">
              Core learning and saved progress remain available. Connected AI,
              cloud sync and billing require internet access.
            </p>
          </div>
        </div>
        <p className="rounded-[12px] border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
          Mock AI demo can show the workflow locally. Secure AI rewriting and
          coaching require a verified connected service and internet access.
        </p>
        <p className="rounded-[12px] border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
          Offline-ready content and local saved work are available. A fully
          installable offline app is not available yet.
        </p>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Recently used work-tool items
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {recentItemIds.length
              ? recentItemIds.join(', ')
              : 'No templates, phrases or dictionary items used yet.'}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Recent dictionary searches
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {recentSearches.length
              ? recentSearches.join(', ')
              : 'No dictionary search saved yet.'}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            Saved Quick AI draft
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {quickAIDraft
              ? quickAIDraft.title
              : 'No local Quick AI draft saved.'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OfflinePage;
