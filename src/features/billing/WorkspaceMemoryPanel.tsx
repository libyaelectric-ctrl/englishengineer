import { useState } from 'react';
import { Brain, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useWorkspaceStore } from '@/features/billing/workspace.store';

interface WorkspaceMemoryPanelProps {
  workspaceId: string;
}

export const WorkspaceMemoryPanel = ({
  workspaceId,
}: WorkspaceMemoryPanelProps) => {
  const { workspaces, updateWorkspaceMemory } = useWorkspaceStore();
  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  const memory = workspace?.memory ?? {};
  const entries = Object.entries(memory).filter(([, v]) => v !== '');

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleStartEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (!editingKey) return;
    updateWorkspaceMemory(workspaceId, editingKey, editValue.trim());
    setEditingKey(null);
    setEditValue('');
  };

  const handleDelete = (key: string) => {
    updateWorkspaceMemory(workspaceId, key, '');
  };

  const handleAddNew = () => {
    setKeyError(null);
    const k = newKey.trim();
    const v = newValue.trim();
    if (!k) {
      setKeyError('Key cannot be empty.');
      return;
    }
    if (memory[k] !== undefined) {
      setKeyError(`"${k}" already exists. Edit it instead.`);
      return;
    }
    if (!v) {
      setKeyError('Value cannot be empty.');
      return;
    }
    updateWorkspaceMemory(workspaceId, k, v);
    setNewKey('');
    setNewValue('');
    setAddingNew(false);
  };

  return (
    <div className="rounded-card border border-border-soft bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <p className="text-xs font-bold text-foreground">Workspace Memory</p>
          {entries.length > 0 && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {entries.length} active
            </span>
          )}
        </div>
        {!addingNew && (
          <button
            type="button"
            id="workspace-memory-add-btn"
            onClick={() => {
              setAddingNew(true);
              setKeyError(null);
            }}
            className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/5 transition-colors"
            aria-label="Add memory entry"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] leading-4 text-muted-copy mb-3">
        Memory entries are automatically included in every AI request for this
        workspace. Use them to store project context, team names, standards, or
        preferences.
      </p>

      {/* Entries */}
      {entries.length === 0 && !addingNew && (
        <div className="rounded-[8px] border border-dashed border-border-soft bg-surface-hover/10 px-4 py-5 text-center">
          <p className="text-[10px] text-muted-copy">
            No memory entries yet. Add project context, standards, or team info.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="space-y-1.5 mb-2" aria-label="Memory entries">
          {entries.map(([key, value]) => (
            <li
              key={key}
              className="flex items-start gap-2 rounded-[6px] border border-border-soft bg-background p-2"
            >
              {editingKey === key ? (
                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="text-[10px] font-bold text-foreground">{key}</p>
                  <textarea
                    id={`memory-edit-${key}`}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={2}
                    autoFocus
                    className="w-full resize-none rounded-[6px] border border-border-soft bg-surface px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-copy focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 rounded-[6px] bg-primary px-2 py-1 text-[10px] font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="flex items-center gap-1 rounded-[6px] border border-border-soft px-2 py-1 text-[10px] text-muted-copy hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-primary truncate">
                      {key}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-foreground break-words">
                      {value}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(key, value)}
                      aria-label={`Edit ${key}`}
                      className="rounded p-1 text-muted-copy hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(key)}
                      aria-label={`Delete ${key}`}
                      className="rounded p-1 text-muted-copy hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add new entry form */}
      {addingNew && (
        <div className="mt-2 rounded-[8px] border border-primary/20 bg-primary/3 p-3 space-y-2">
          <p className="text-[10px] font-bold text-foreground">
            New Memory Entry
          </p>
          <input
            id="memory-new-key"
            type="text"
            placeholder="Key (e.g. Project Name, Client, Standards)"
            value={newKey}
            onChange={(e) => {
              setNewKey(e.target.value);
              setKeyError(null);
            }}
            className="w-full rounded-[6px] border border-border-soft bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-copy focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <textarea
            id="memory-new-value"
            placeholder="Value (e.g. Offshore Wind Project Phase 2, IEC 61400 standard)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-[6px] border border-border-soft bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-copy focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {keyError && (
            <p className="text-[10px] text-error leading-4">{keyError}</p>
          )}
          <div className="flex gap-1.5">
            <button
              type="button"
              id="memory-add-confirm-btn"
              onClick={handleAddNew}
              className="flex-1 rounded-[6px] bg-primary px-3 py-1.5 text-[10px] font-bold text-white hover:bg-primary/90 transition-colors"
            >
              Add to Memory
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingNew(false);
                setNewKey('');
                setNewValue('');
                setKeyError(null);
              }}
              className="rounded-[6px] border border-border-soft px-3 py-1.5 text-[10px] text-muted-copy hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
