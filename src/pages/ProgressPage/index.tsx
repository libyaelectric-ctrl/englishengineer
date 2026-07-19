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
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-6 animate-in fade-in duration-300">
      {/* Fixed Header with Tabs */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3.5 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Progress Hub</h1>
            <p className="text-xs text-muted-copy font-medium mt-0.5">
              Analytics, milestones, and next steps.
            </p>
          </div>
          <div className="flex gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  navigate(`/progress/${tab.id}`, { replace: true })
                }
                className={`px-4 py-1.5 text-[10px] font-sans font-bold rounded-[4px] transition-all cursor-pointer uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'bg-[#0047bb] text-white border border-[#0047bb]'
                    : 'text-muted-copy hover:bg-[#0047bb]/5 hover:text-[#0047bb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
