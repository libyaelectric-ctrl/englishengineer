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
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between rounded-[4px] border border-[#d9d9e3] bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <WorkspaceSelector planId={planId} />
        {workspaceMemoryContext && (
          <span className="hidden sm:inline text-[9px] font-bold text-muted-copy border border-[#d9d9e3] rounded-[4px] px-2 py-0.5 uppercase tracking-wider bg-[#faf8ff]">
            Memory active
          </span>
        )}
      </div>
      <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
        Sessions and documents are isolated per workspace.
      </p>
    </div>
    <WorkspaceMemoryPanel workspaceId={activeWorkspaceId} />
  </div>
);
