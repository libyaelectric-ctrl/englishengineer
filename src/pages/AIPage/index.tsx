import { useEffect } from 'react';

import { PageHeader } from '@/shared/components/PageHeader';
import { ToastContainer, showToast } from '@/shared/components/Toast';

import { useBillingStore } from '@/features/billing';

import { CoachInputForm } from './CoachInputForm';
import { CoachModeSelector } from './CoachModeSelector';
import { CoachResultPanel } from './CoachResultPanel';
import { MetricsGrid } from './MetricsGrid';
import { ProviderStatusPanel } from './ProviderStatusPanel';
import { UserContextSidebar } from './UserContextSidebar';
import { WorkspacePanel } from './WorkspacePanel';
import { useAIPage } from './hooks/useAIPage';

interface AIPageProps {
  embedded?: boolean;
}

export const AIPage = ({ embedded = false }: AIPageProps) => {
  const subscription = useBillingStore((state) => state.subscription);
  const h = useAIPage();

  useEffect(() => {
    if (h.isLimitedResponse) {
      showToast(
        'AI yanıtı kısaltıldı (limit aşıldı veya yapılandırılmadı). Yeniden deneyin.',
        'error'
      );
    }
  }, [h.isLimitedResponse]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-sans pt-8 sm:pt-0">
      <ToastContainer />
      {!embedded && <PageHeader title="AI Copilot Studio" />}

      {(subscription.planId === 'specialist' || subscription.planId === 'master') && (
        <WorkspacePanel
          planId={subscription.planId}
          activeWorkspaceId={h.activeWorkspaceId}
          workspaceMemoryContext={h.workspaceMemoryContext}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <ProviderStatusPanel
            providerStatus={h.providerStatus}
            providerTone={h.providerTone}
            subscription={subscription}
            buyError={h.buyError}
            isBuyingCredits={h.isBuyingCredits}
            onBuyCredits={h.handleBuyCredits}
          />

          <MetricsGrid
            usage={h.usage}
            coachContext={h.coachContext}
            connectionValue={h.connectionValue}
            connectionTrend={h.connectionTrend}
          />

          <CoachModeSelector
            modes={h.modes}
            selectedModeId={h.selectedModeId}
            selectedMode={h.selectedMode}
            promptTemplates={h.promptTemplates}
            subscription={subscription}
            onSetMode={h.setMode}
            onSetInput={h.setInput}
          />

          <CoachInputForm
            selectedModeId={h.selectedModeId}
            selectedMode={h.selectedMode}
            input={h.input}
            isModeLocked={h.isModeLocked}
            requiredFeature={h.requiredFeature}
            aiEntitlement={h.aiEntitlement}
            isLoading={h.isLoading}
            error={h.error}
            docLimit={h.docLimit}
            docLimitLabel={h.docLimitLabel}
            uploadedDocsCount={h.uploadedDocsCount}
            uploadError={h.uploadError}
            sessions={h.sessions}
            onSetInput={h.setInput}
            onSubmit={h.handleSubmit}
            onRegenerate={() => h.regenerateLast(h.currentUser, h.learningState)}
            onClearHistory={h.clearSessionHistory}
            onReset={h.resetCoach}
            onFileUpload={h.handleFileUpload}
            onNavigate={h.navigate}
          />

          {h.lastResult && (
            <CoachResultPanel
              lastResult={h.lastResult}
              isLimitedResponse={h.isLimitedResponse}
              providerStatus={h.providerStatus}
              onCopyResult={h.handleCopyResult}
              onExportResult={h.handleExportResult}
            />
          )}
        </div>

        <UserContextSidebar
          coachContext={h.coachContext}
          assessmentProfile={h.assessmentProfile}
          lastResult={h.lastResult}
          sessions={h.sessions}
        />
      </div>
    </div>
  );
};

export default AIPage;
