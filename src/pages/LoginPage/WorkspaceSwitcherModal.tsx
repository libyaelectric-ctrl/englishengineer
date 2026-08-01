import { Building, Check, Plus, Shield, Users, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceName: string) => void;
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  membersCount: number;
  projectCode: string;
  isCurrent: boolean;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'w1',
    name: 'Bechtel NEOM Mega Project',
    role: 'Lead QA/QC Auditor',
    membersCount: 42,
    projectCode: 'SA-NEOM-2026',
    isCurrent: true,
  },
  {
    id: 'w2',
    name: 'Siemens Offshore Wind Farm',
    role: 'Site Mechanical Engineer',
    membersCount: 18,
    projectCode: 'EU-WIND-088',
    isCurrent: false,
  },
  {
    id: 'w3',
    name: 'Personal Professional Sandbox',
    role: 'Individual Engineer',
    membersCount: 1,
    projectCode: 'PERSONAL-FREE',
    isCurrent: false,
  },
];

export const WorkspaceSwitcherModal = ({
  isOpen,
  onClose,
  onSelectWorkspace,
}: WorkspaceSwitcherModalProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (ws: Workspace) => {
    setWorkspaces((prev) => prev.map((w) => ({ ...w, isCurrent: w.id === ws.id })));
    onSelectWorkspace(ws.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Switch project workspace"
        className="w-full max-w-md rounded-2xl border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Switch Project Workspace (Multi-Tenant)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-copy">
          Select an active enterprise team workspace or personal sandbox to isolate your ASTM
          termsets and FIDIC contract archives.
        </p>

        {/* Workspaces List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
                w.isCurrent
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border-soft bg-background hover:border-primary/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{w.name}</span>
                  <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[8px] font-bold text-primary font-mono">
                    {w.projectCode}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-copy">
                  <span className="flex items-center gap-1 font-semibold">
                    <Shield className="h-3 w-3 text-primary" /> {w.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-copy" /> {w.membersCount} members
                  </span>
                </div>
              </div>
              {w.isCurrent && <Check className="h-4 w-4 text-primary shrink-0 font-bold" />}
            </button>
          ))}
        </div>

        {/* Create New Workspace Action */}
        <div className="pt-2 border-t border-border-soft flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Team Workspace</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-muted-copy hover:text-foreground cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
