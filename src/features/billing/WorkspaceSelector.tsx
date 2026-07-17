import { useState } from 'react';
import { FolderOpen, Plus, Trash2, ChevronDown, X } from 'lucide-react';
import {
  useWorkspaceStore,
  Workspace,
} from '@/features/billing/workspace.store';
import { BillingPlanId } from '@/features/billing/billing.types';

interface WorkspaceSelectorProps {
  planId: BillingPlanId;
}

const PLAN_WORKSPACE_LIMIT: Record<BillingPlanId, number | null> = {
  free: 1,
  pro: 1,
  project: 3,
  max: null,
  exec: null,
  private: null,
};

export const WorkspaceSelector = ({ planId }: WorkspaceSelectorProps) => {
  const {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    switchWorkspace,
  } = useWorkspaceStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const limit = PLAN_WORKSPACE_LIMIT[planId];
  const canCreate = limit === null || workspaces.length < limit;
  const activeWorkspace =
    workspaces.find((ws) => ws.id === activeWorkspaceId) ?? workspaces[0];

  const handleCreate = () => {
    setCreateError(null);
    const name = newName.trim() || `Workspace ${workspaces.length + 1}`;
    const success = createWorkspace(name, planId);
    if (!success) {
      setCreateError(
        limit === 1
          ? 'Your plan supports 1 workspace. Upgrade to Project ($39) for up to 3.'
          : `Workspace limit reached (${limit}). Upgrade for more.`
      );
      return;
    }
    setNewName('');
    setShowCreate(false);
    setIsOpen(false);
  };

  const handleSwitch = (ws: Workspace) => {
    switchWorkspace(ws.id);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (workspaces.length <= 1) return;
    deleteWorkspace(id);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        id="workspace-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[8px] border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-hover transition-colors"
      >
        <FolderOpen
          className="h-3.5 w-3.5 text-primary shrink-0"
          aria-hidden="true"
        />
        <span className="max-w-[140px] truncate">
          {activeWorkspace?.name ?? 'Workspace'}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-copy transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Project Workspaces"
          className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-[10px] border border-border-soft bg-surface shadow-xl shadow-black/10 overflow-hidden"
        >
          <div className="border-b border-border-soft px-3 py-2 flex items-center justify-between">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Project Workspaces
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-copy hover:text-foreground"
              aria-label="Close workspace menu"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={ws.id === activeWorkspaceId}
                  onClick={() => handleSwitch(ws)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs transition-colors hover:bg-surface-hover/60 ${
                    ws.id === activeWorkspaceId
                      ? 'bg-primary/5 font-semibold text-primary'
                      : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FolderOpen
                      className="h-3 w-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{ws.name}</span>
                  </span>
                  {ws.id !== activeWorkspaceId && workspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, ws.id)}
                      aria-label={`Delete workspace ${ws.name}`}
                      className="shrink-0 rounded p-0.5 text-muted-copy hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Create new workspace */}
          {canCreate && (
            <div className="border-t border-border-soft p-2">
              {showCreate ? (
                <div className="flex flex-col gap-1.5">
                  <input
                    id="new-workspace-name"
                    type="text"
                    placeholder="Workspace name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate();
                      if (e.key === 'Escape') setShowCreate(false);
                    }}
                    autoFocus
                    aria-label="New workspace name"
                    className="w-full rounded-[6px] border border-border-soft bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-copy focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  {createError && (
                    <p className="text-[10px] text-error leading-4">
                      {createError}
                    </p>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="flex-1 rounded-[6px] bg-primary px-2 py-1 text-[10px] font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setCreateError(null);
                      }}
                      className="rounded-[6px] border border-border-soft px-2 py-1 text-[10px] text-muted-copy hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="flex w-full items-center gap-1.5 rounded-[6px] px-2 py-1.5 text-xs text-primary hover:bg-primary/5 transition-colors font-medium"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  New Workspace
                  {limit !== null && (
                    <span className="ml-auto text-[10px] text-muted-copy">
                      {workspaces.length}/{limit}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {!canCreate && (
            <div className="border-t border-border-soft px-3 py-2">
              <p className="text-[10px] leading-4 text-muted-copy">
                {limit === 1
                  ? 'Upgrade to Project ($39) for up to 3 workspaces.'
                  : `Workspace limit reached (${limit}).`}
              </p>
            </div>
          )}

          <div className="border-t border-border-soft px-3 py-2">
            <p className="text-[10px] text-muted-copy leading-4">
              <span className="font-semibold text-foreground">
                {activeWorkspace?.name}
              </span>
              {' · '}
              {activeWorkspace?.documents?.length ?? 0} docs
              {' · '}
              {activeWorkspace?.sessions?.length ?? 0} sessions
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
