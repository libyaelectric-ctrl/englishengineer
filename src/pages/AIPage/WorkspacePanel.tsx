import { WorkspaceSelector } from '@/features/billing/WorkspaceSelector';
import { WorkspaceMemoryPanel } from '@/features/billing/WorkspaceMemoryPanel';
import type { BillingPlanId } from '@/features/billing';

interface WorkspacePanelProps {
  planId: BillingPlanId;
  activeWorkspaceId: string;
  workspaceMemoryContext: string;
}

export const WorkspacePanel = ({
  planId,
  activeWorkspaceId,
  workspaceMemoryContext,
}: WorkspacePanelProps) => (
  <div className="space-y-3">
    <div className="premium-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <WorkspaceSelector planId={planId} />
        {workspaceMemoryContext && (
          <span className="hidden sm:inline text-[10px] text-muted-copy border border-border-soft rounded-full px-2 py-0.5">
            Memory active
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-copy">
        Sessions and documents are isolated per workspace.
      </p>
    </div>
    <WorkspaceMemoryPanel workspaceId={activeWorkspaceId} />
  </div>
);
