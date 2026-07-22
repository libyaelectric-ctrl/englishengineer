import { useParams, useNavigate } from 'react-router-dom';
import { ProgressOverviewTab } from './ProgressOverviewTab';
import { ProgressNextStepsTab } from './ProgressNextStepsTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'next-steps', label: 'Next Steps' },
] as const;

const ProgressPage = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const activeTab = section === 'next-steps' ? 'next-steps' : 'overview';

  return (
    <div className="bg-background pb-16 text-foreground space-y-4 animate-in fade-in duration-300">
      {/* Fixed Header with Tabs */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Progress Hub
          </h1>
          <p className="hidden text-[11px] font-medium text-muted-copy leading-tight sm:block">
            Analytics, milestones, and next steps.
          </p>
        </div>
        <div className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/progress/${tab.id}`, { replace: true })}
              className={`px-4 py-1.5 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
                activeTab === tab.id
                  ? 'bg-[#0047bb] text-white border border-[#0047bb]'
                  : 'text-muted-copy hover:bg-primary/5 hover:text-[#0047bb]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <ProgressOverviewTab />}
        {activeTab === 'next-steps' && <ProgressNextStepsTab />}
      </div>
    </div>
  );
};

export default ProgressPage;
