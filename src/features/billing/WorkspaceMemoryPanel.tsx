import { useState } from 'react';
import { Brain, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useWorkspaceStore } from '@/features/billing/workspace.store';
import { useBillingStore, canAccessFeature } from '@/features/billing';

interface MemoryEntryItemProps {
  keyName: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  hasProjectAccess: boolean;
  onSave: () => void;
  onCancel: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

const MemoryEntryItem = ({
  keyName,
  value,
  isEditing,
  editValue,
  setEditValue,
  hasProjectAccess,
  onSave,
  onCancel,
  onStartEdit,
  onDelete,
}: MemoryEntryItemProps) => (
  <li className="flex items-start gap-2 rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-2 shadow-sm">
    {isEditing ? (
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[10px] font-bold text-foreground">{keyName}</p>
        <textarea
          id={`memory-edit-${keyName}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={2}
          aria-label={`Edit memory for ${keyName}`}
          className="w-full resize-none rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-copy focus:outline-none focus:border-[#0047bb] shadow-sm"
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer shadow-sm"
          >
            <Check className="h-3 w-3" /> Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] px-2.5 py-1 text-[10px] font-bold text-muted-copy hover:text-foreground cursor-pointer shadow-sm"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#0047bb] truncate">
            {keyName}
          </p>
          <p className="mt-0.5 text-xs leading-4 text-foreground font-semibold break-words">
            {value}
          </p>
        </div>
        {hasProjectAccess && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onStartEdit}
              aria-label={`Edit ${keyName}`}
              className="rounded-[4px] p-1 text-muted-copy hover:text-[#0047bb] hover:bg-[#faf8ff] transition-colors border border-transparent hover:border-[#d9d9e3] cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${keyName}`}
              className="rounded-[4px] p-1 text-muted-copy hover:text-error hover:bg-error/10 transition-colors border border-transparent hover:border-error/20 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </>
    )}
  </li>
);

const AddMemoryForm = ({
  newKey,
  newValue,
  setNewKey,
  setNewValue,
  keyError,
  onAdd,
  onCancel,
}: {
  newKey: string;
  newValue: string;
  setNewKey: (v: string) => void;
  setNewValue: (v: string) => void;
  keyError: string | null;
  onAdd: () => void;
  onCancel: () => void;
}) => (
  <div className="mt-2 rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-3 space-y-2 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0047bb]">
      New Memory Entry
    </p>
    <input
      id="memory-new-key"
      type="text"
      placeholder="Key (e.g. Project Name, Client, Standards)"
      value={newKey}
      onChange={(e) => setNewKey(e.target.value)}
      aria-label="Memory entry key"
      className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-xs text-foreground placeholder:text-muted-copy focus:outline-none focus:border-[#0047bb] shadow-sm font-semibold"
    />
    <label className="block">
      <span className="sr-only">Memory entry value</span>
      <textarea
        id="memory-new-value"
        placeholder="Value (e.g. Offshore Wind Project Phase 2, IEC 61400 standard)"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        rows={2}
        className="w-full resize-none rounded-[4px] border border-[#d9d9e3] bg-white px-2 py-1.5 text-xs text-foreground placeholder:text-muted-copy focus:outline-none focus:border-[#0047bb] shadow-sm font-semibold"
      />
    </label>
    {keyError && (
      <p className="text-[10px] text-error font-bold uppercase tracking-wider leading-4">
        {keyError}
      </p>
    )}
    <div className="flex gap-1.5">
      <button
        type="button"
        id="memory-add-confirm-btn"
        onClick={onAdd}
        className="flex-1 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer shadow-sm"
      >
        Add to Memory
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-copy hover:text-foreground cursor-pointer shadow-sm"
      >
        Cancel
      </button>
    </div>
  </div>
);

const WorkspaceMemoryContent = ({
  entries,
  editingKey,
  editValue,
  setEditValue,
  hasProjectAccess,
  addingNew,
  newKey,
  newValue,
  setNewKey,
  setNewValue,
  keyError,
  saveEditing,
  startEditing,
  cancelEditing,
  handleDelete,
  validateAndAdd,
  resetAddForm,
}: {
  entries: [string, string][];
  editingKey: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  hasProjectAccess: boolean;
  addingNew: boolean;
  newKey: string;
  newValue: string;
  setNewKey: (v: string) => void;
  setNewValue: (v: string) => void;
  keyError: string | null;
  saveEditing: () => void;
  startEditing: (key: string, value: string) => void;
  cancelEditing: () => void;
  handleDelete: (key: string) => void;
  validateAndAdd: () => void;
  resetAddForm: () => void;
}) => (
  <>
    {entries.length === 0 && !addingNew && (
      <div className="rounded-[4px] border border-dashed border-[#d9d9e3] bg-[#faf8ff] px-4 py-5 text-center shadow-sm">
        <p className="text-[10px] text-muted-copy font-medium">
          No memory entries yet. Add project context, standards, or team info.
        </p>
      </div>
    )}
    {entries.length > 0 && (
      <ul className="space-y-1.5 mb-2" aria-label="Memory entries">
        {entries.map(([key, value]) => (
          <MemoryEntryItem
            key={key}
            keyName={key}
            value={value}
            isEditing={editingKey === key}
            editValue={editValue}
            setEditValue={setEditValue}
            hasProjectAccess={hasProjectAccess}
            onSave={saveEditing}
            onCancel={cancelEditing}
            onStartEdit={() => startEditing(key, value)}
            onDelete={() => handleDelete(key)}
          />
        ))}
      </ul>
    )}
    {addingNew && (
      <AddMemoryForm
        newKey={newKey}
        newValue={newValue}
        setNewKey={setNewKey}
        setNewValue={setNewValue}
        keyError={keyError}
        onAdd={validateAndAdd}
        onCancel={resetAddForm}
      />
    )}
    {!hasProjectAccess && entries.length > 0 && (
      <div className="mt-3 rounded-[4px] bg-[#faf8ff] border border-[#d9d9e3] p-2.5 text-center shadow-sm">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-copy leading-normal">
          Workspace memory is read-only. Upgrade to the Project Plan ($39/mo) to
          edit details.
        </p>
      </div>
    )}
  </>
);

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

  const subscription = useBillingStore((state) => state.subscription);
  const hasProjectAccess = canAccessFeature(
    subscription,
    'projectWorkspace'
  ).allowed;

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleDelete = (key: string) =>
    updateWorkspaceMemory(workspaceId, key, '');

  const validateAndAdd = () => {
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

  const resetAddForm = () => {
    setAddingNew(false);
    setNewKey('');
    setNewValue('');
    setKeyError(null);
  };
  const startEditing = (key: string, val: string) => {
    setEditingKey(key);
    setEditValue(val);
  };
  const saveEditing = () => {
    if (!editingKey) return;
    updateWorkspaceMemory(workspaceId, editingKey, editValue.trim());
    setEditingKey(null);
    setEditValue('');
  };

  return (
    <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-[#d9d9e3] pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-[#0047bb]" aria-hidden="true" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Workspace Memory
          </p>
          {entries.length > 0 && (
            <span className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 px-1.5 py-0.5 text-[9px] font-bold text-[#0047bb] uppercase tracking-wider">
              {entries.length} active
            </span>
          )}
        </div>
        {!addingNew && hasProjectAccess && (
          <button
            type="button"
            id="workspace-memory-add-btn"
            onClick={() => {
              setAddingNew(true);
              setKeyError(null);
            }}
            className="flex items-center gap-1 rounded-[4px] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#0047bb] hover:bg-[#0047bb]/5 border border-[#d9d9e3] bg-white cursor-pointer shadow-sm"
            aria-label="Add memory entry"
          >
            <Plus className="h-3 w-3 text-muted-copy" aria-hidden="true" /> Add
          </button>
        )}
      </div>
      <p className="text-[10px] leading-4 text-muted-copy mb-3 font-medium">
        Memory entries are automatically included in every AI request for this
        workspace. Use them to store project context, team names, standards, or
        preferences.
      </p>
      <WorkspaceMemoryContent
        entries={entries}
        editingKey={editingKey}
        editValue={editValue}
        setEditValue={setEditValue}
        hasProjectAccess={hasProjectAccess}
        addingNew={addingNew}
        newKey={newKey}
        newValue={newValue}
        setNewKey={setNewKey}
        setNewValue={setNewValue}
        keyError={keyError}
        saveEditing={saveEditing}
        startEditing={startEditing}
        cancelEditing={() => setEditingKey(null)}
        handleDelete={handleDelete}
        validateAndAdd={validateAndAdd}
        resetAddForm={resetAddForm}
      />
    </div>
  );
};
