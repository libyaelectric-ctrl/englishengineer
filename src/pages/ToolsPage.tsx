import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import QuickToolsPage from './QuickToolsPage';
import WorkToolsPage from './WorkToolsPage';

const AIPage = lazy(() => import('./AIPage'));

type ToolsSection = 'work' | 'quick' | 'ai';

const ToolsPage = () => {
  const { section } = useParams<{ section: string }>();
  const activeTab: ToolsSection =
    section === 'quick' || section === 'ai' ? section : 'work';

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Tools"
        description="Templates, quick phrases, and AI copilot — all in one place."
        badgeText={activeTab === 'work' ? 'WORK TOOLS' : activeTab === 'quick' ? 'QUICK TOOLS' : 'AI COPILOT'}
        badgeColor="cyan"
      />

      {activeTab === 'work' && <WorkToolsPage embedded />}
      {activeTab === 'quick' && <QuickToolsPage embedded />}
      {activeTab === 'ai' && (
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-xl border border-border-soft bg-surface-hover" />
          }
        >
          <AIPage embedded />
        </Suspense>
      )}
    </div>
  );
};

export default ToolsPage;
