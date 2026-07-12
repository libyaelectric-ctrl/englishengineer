/**
 * ToolsPage Component
 *
 * Serves as a gateway layout routing to three essential sub-panels:
 * - Work Tools: Pre-configured professional phrases, shortcuts, and copy targets.
 * - Quick Tools: Simple input text transformation (rewrites, spelling fixes).
 * - AI Copilot: General engineering context chatbot assistant.
 */
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
    section === 'quick' || section === 'ai'
      ? section
      : 'work';

  return (
    <div className="space-y-7 animate-in fade-in duration-300 pt-12 sm:pt-0">
      <PageHeader
        title="Tools"
        description="Templates, quick phrases, and AI copilot — all in one place."
        badgeText={
          activeTab === 'work'
            ? 'WORK TOOLS'
            : activeTab === 'quick'
              ? 'QUICK TOOLS'
              : 'AI COPILOT'
        }
        badgeColor="border-cyan-200 bg-cyan-50 text-cyan-700"
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
