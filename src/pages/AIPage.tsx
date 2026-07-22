import { useBillingStore } from '@/features/billing';
import { useAIPage } from './AIPage/hooks/useAIPage';
import { WorkspacePanel } from './AIPage/WorkspacePanel';
import { ProviderStatusPanel } from './AIPage/ProviderStatusPanel';
import { MetricsGrid } from './AIPage/MetricsGrid';
import { CoachModeSelector } from './AIPage/CoachModeSelector';
import { CoachInputForm } from './AIPage/CoachInputForm';
import { CoachResultPanel } from './AIPage/CoachResultPanel';
import { UserContextSidebar } from './AIPage/UserContextSidebar';

interface AIPageProps {
  embedded?: boolean;
}

export const AIPage = ({ embedded = false }: AIPageProps) => {
  const subscription = useBillingStore((state) => state.subscription);
  const h = useAIPage();

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-sans pt-8 sm:pt-0">
      {!embedded && (
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-base font-bold tracking-tight text-foreground">
            AI Copilot Studio
          </h1>
        </div>
      )}

      {(subscription.planId === 'project' ||
        subscription.planId === 'exec' ||
        subscription.planId === 'private') && (
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
            onRegenerate={() =>
              h.regenerateLast(h.currentUser, h.learningState)
            }
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
