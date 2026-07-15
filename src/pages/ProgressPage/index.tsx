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
    <div className="animate-in fade-in duration-300 pb-8">
      {/* Fixed Header with Tabs */}
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Progress Hub</h1>
            <p className="text-xs text-muted-copy">
              Analytics, milestones, and next steps.
            </p>
          </div>
          <div className="flex gap-1 rounded-xl border border-border-soft bg-surface-hover p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  navigate(`/progress/${tab.id}`, { replace: true })
                }
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-muted-copy hover:bg-surface-hover hover:text-primary'
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
