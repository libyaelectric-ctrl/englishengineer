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
    <div className="relative font-sans">
      {/* Trigger */}
      <button
        type="button"
        id="workspace-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-[#faf8ff] cursor-pointer transition-colors shadow-sm"
      >
        <FolderOpen
          className="h-3.5 w-3.5 text-[#0047bb] shrink-0"
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
          className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-[4px] border border-[#d9d9e3] bg-white shadow-xl shadow-black/10 overflow-hidden"
        >
          <div className="border-b border-[#d9d9e3] px-3 py-2 flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-wider">
              Project Workspaces
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-copy hover:text-foreground cursor-pointer"
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
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs transition-colors hover:bg-[#faf8ff] cursor-pointer ${
                    ws.id === activeWorkspaceId
                      ? 'bg-[#0047bb]/5 font-bold text-[#0047bb]'
                      : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FolderOpen
                      className="h-3 w-3 shrink-0 text-muted-copy"
                      aria-hidden="true"
                    />
                    <span className="truncate">{ws.name}</span>
                  </span>
                  {ws.id !== activeWorkspaceId && workspaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, ws.id)}
                      aria-label={`Delete workspace ${ws.name}`}
                      className="shrink-0 rounded-[4px] p-0.5 text-muted-copy hover:text-error hover:bg-error/10 transition-colors border border-transparent hover:border-error/20 cursor-pointer"
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
            <div className="border-t border-[#d9d9e3] p-2">
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
                    aria-label="New workspace name"
                    className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-xs text-foreground placeholder:text-muted-copy focus:outline-none focus:border-[#0047bb] shadow-sm font-semibold"
                  />
                  {createError && (
                    <p className="text-[10px] text-error font-bold uppercase tracking-wider leading-4">
                      {createError}
                    </p>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="flex-1 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer shadow-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setCreateError(null);
                      }}
                      className="rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-foreground cursor-pointer shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="flex w-full items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-xs text-[#0047bb] hover:bg-[#0047bb]/5 transition-colors font-bold uppercase tracking-wider cursor-pointer border border-[#d9d9e3] bg-white shadow-sm"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  New Workspace
                  {limit !== null && (
                    <span className="ml-auto text-[10px] text-muted-copy font-bold">
                      {workspaces.length}/{limit}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {!canCreate && (
            <div className="border-t border-[#d9d9e3] px-3 py-2">
              <p className="text-[10px] leading-4 text-muted-copy font-bold uppercase tracking-wider">
                {limit === 1
                  ? 'Upgrade to Project ($39) for up to 3 workspaces.'
                  : `Workspace limit reached (${limit}).`}
              </p>
            </div>
          )}

          <div className="border-t border-[#d9d9e3] px-3 py-2">
            <p className="text-[10px] text-muted-copy leading-4 font-mono font-medium">
              <span className="font-bold text-foreground">
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
