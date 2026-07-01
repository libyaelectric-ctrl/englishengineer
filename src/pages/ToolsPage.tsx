import { lazy, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BriefcaseBusiness,
  BrainCircuit,
  CheckCircle2,
  WandSparkles,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import QuickToolsPage from './QuickToolsPage';
import WorkToolsPage from './WorkToolsPage';

const AIPage = lazy(() => import('./AIPage'));

type ToolsTab = 'work' | 'quick' | 'ai';

const getRequestedTab = (value: string | null): ToolsTab =>
  value === 'quick' || value === 'ai' ? value : 'work';

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = getRequestedTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<ToolsTab>(requestedTab);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  const chooseTab = (tab: ToolsTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'work' ? {} : { tab });
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Tools"
        description="Choose one job: prepare a document, find a fast phrase, or improve text with the AI Copilot."
        badgeText="3 CLEAR WORKFLOWS"
        badgeColor="cyan"
      />

      <div
        role="tablist"
        aria-label="Tools sections"
        className="grid gap-3 rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3"
      >
        {(
          [
            {
              id: 'work',
              label: 'Work Tools',
              title: 'Templates & emails',
              description:
                'Prepare reports, replies and professional messages.',
              icon: BriefcaseBusiness,
            },
            {
              id: 'quick',
              label: 'Quick Tools',
              title: 'Fast help',
              description: 'Find meeting phrases and site terminology quickly.',
              icon: WandSparkles,
            },
            {
              id: 'ai',
              label: 'AI Copilot',
              title: 'AI Copilot',
              description:
                'Rewrite and review text through the protected provider.',
              icon: BrainCircuit,
            },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-label={item.label}
              aria-selected={active}
              onClick={() => chooseTab(item.id)}
              className={`min-w-0 rounded-[14px] border p-4 text-left transition-colors ${active ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-[11px] border border-blue-100 bg-white p-2 text-blue-700">
                  <Icon className="h-4 w-4" />
                </span>
                {active && <CheckCircle2 className="h-4 w-4 text-blue-700" />}
              </div>
              <p className="mt-3 text-sm font-black text-slate-950">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {activeTab === 'work' ? (
        <WorkToolsPage embedded />
      ) : activeTab === 'quick' ? (
        <QuickToolsPage embedded />
      ) : (
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-[16px] border border-slate-200 bg-slate-50" />
          }
        >
          <AIPage embedded />
        </Suspense>
      )}
    </div>
  );
};

export default ToolsPage;
