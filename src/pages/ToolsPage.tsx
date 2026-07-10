/**
 * ToolsPage Component
 *
 * Serves as a gateway layout routing to four essential sub-panels:
 * - Work Tools: Pre-configured professional phrases, shortcuts, and copy targets.
 * - Quick Tools: Simple input text transformation (rewrites, spelling fixes).
 * - AI Copilot: General engineering context chatbot assistant.
 * - Developer Hub: Interactive scenario builder, templates, and plugin validator.
 */
import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import QuickToolsPage from './QuickToolsPage';
import WorkToolsPage from './WorkToolsPage';
import DeveloperHubPage from './DeveloperHubPage';

const AIPage = lazy(() => import('./AIPage'));

type ToolsSection = 'work' | 'quick' | 'ai' | 'developer';

const ToolsPage = () => {
  const { section } = useParams<{ section: string }>();
  const activeTab: ToolsSection =
    section === 'quick' || section === 'ai' || section === 'developer'
      ? section
      : 'work';

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Tools"
        description="Templates, quick phrases, and AI copilot — all in one place."
        badgeText={
          activeTab === 'work'
            ? 'WORK TOOLS'
            : activeTab === 'quick'
              ? 'QUICK TOOLS'
              : activeTab === 'ai'
                ? 'AI COPILOT'
                : 'DEVELOPER HUB'
        }
        badgeColor="cyan"
      />

      {activeTab === 'work' && <WorkToolsPage embedded />}
      {activeTab === 'quick' && <QuickToolsPage embedded />}
      {activeTab === 'developer' && <DeveloperHubPage />}
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
