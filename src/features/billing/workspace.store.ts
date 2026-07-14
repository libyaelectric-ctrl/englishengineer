import { create } from 'zustand';
import { storage } from '@/shared/storage';
import { IdService } from '@/core/ids/id.service';
import { useAIStore } from '@/features/ai/ai.store';
import { AICoachSession } from '@/features/ai/ai.types';
import { BillingPlanId } from './billing.types';

export interface WorkspaceDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  memory: Record<string, string>;
  documents: WorkspaceDocument[];
  sessions: AICoachSession[];
  createdAt: string;
}

interface PersistedWorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
}

interface WorkspaceStoreState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  createWorkspace: (name: string, planId: BillingPlanId) => boolean;
  deleteWorkspace: (id: string) => void;
  switchWorkspace: (id: string) => void;
  updateWorkspaceMemory: (id: string, key: string, value: string) => void;
  addDocumentToWorkspace: (
    id: string,
    docName: string,
    docContent: string
  ) => void;
  deleteDocumentFromWorkspace: (id: string, docId: string) => void;
  resetWorkspaces: () => void;
}

const STORAGE_KEY = 'EngVox_workspaces';

const createDefaultWorkspace = (): Workspace => ({
  id: 'default-workspace',
  name: 'Primary Workspace',
  memory: {},
  documents: [],
  sessions: [],
  createdAt: new Date().toISOString(),
});

const loadInitialState = (): PersistedWorkspaceState => {
  const persisted = storage.globalGet<PersistedWorkspaceState>(STORAGE_KEY);
  if (persisted && persisted.workspaces?.length > 0) {
    return {
      workspaces: persisted.workspaces,
      activeWorkspaceId:
        persisted.activeWorkspaceId || persisted.workspaces[0].id,
    };
  }
  const defaultWs = createDefaultWorkspace();
  return {
    workspaces: [defaultWs],
    activeWorkspaceId: defaultWs.id,
  };
};

const saveState = (state: PersistedWorkspaceState) => {
  storage.globalSet(STORAGE_KEY, state);
};

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => {
  const initialState = loadInitialState();

  return {
    workspaces: initialState.workspaces,
    activeWorkspaceId: initialState.activeWorkspaceId,

    createWorkspace: (name, planId) => {
      const currentWorkspaces = get().workspaces;
      const limit =
        planId === 'free' || planId === 'pro'
          ? 1
          : planId === 'project'
            ? 3
            : Infinity;

      if (currentWorkspaces.length >= limit) {
        return false;
      }

      const newWs: Workspace = {
        id: IdService.createId('ws'),
        name: name.trim() || `Workspace ${currentWorkspaces.length + 1}`,
        memory: {},
        documents: [],
        sessions: [],
        createdAt: new Date().toISOString(),
      };

      const updatedWorkspaces = [...currentWorkspaces, newWs];
      set({ workspaces: updatedWorkspaces, activeWorkspaceId: newWs.id });
      saveState({ workspaces: updatedWorkspaces, activeWorkspaceId: newWs.id });

      // Load clean session history for the new workspace
      useAIStore.getState().setSessions([]);
      return true;
    },

    deleteWorkspace: (id) => {
      const currentWorkspaces = get().workspaces;
      if (currentWorkspaces.length <= 1) return; // Cannot delete the only workspace

      const updatedWorkspaces = currentWorkspaces.filter((ws) => ws.id !== id);
      let newActiveId = get().activeWorkspaceId;

      if (newActiveId === id) {
        newActiveId = updatedWorkspaces[0].id;
      }

      set({ workspaces: updatedWorkspaces, activeWorkspaceId: newActiveId });
      saveState({
        workspaces: updatedWorkspaces,
        activeWorkspaceId: newActiveId,
      });

      // Load sessions of the newly active workspace
      const nextWs = updatedWorkspaces.find((ws) => ws.id === newActiveId);
      if (nextWs) {
        useAIStore.getState().setSessions(nextWs.sessions);
      }
    },

    switchWorkspace: (id) => {
      const currentWorkspaces = get().workspaces;
      const activeId = get().activeWorkspaceId;
      if (activeId === id) return;

      // Save current active sessions to the previous workspace state
      const currentSessions = useAIStore.getState().sessions;
      const updatedWorkspaces = currentWorkspaces.map((ws) => {
        if (ws.id === activeId) {
          return { ...ws, sessions: currentSessions };
        }
        return ws;
      });

      set({ workspaces: updatedWorkspaces, activeWorkspaceId: id });
      saveState({ workspaces: updatedWorkspaces, activeWorkspaceId: id });

      // Load sessions of the selected workspace into AI store
      const targetWs = updatedWorkspaces.find((ws) => ws.id === id);
      if (targetWs) {
        useAIStore.getState().setSessions(targetWs.sessions);
      }
    },

    updateWorkspaceMemory: (id, key, value) => {
      const updatedWorkspaces = get().workspaces.map((ws) => {
        if (ws.id === id) {
          return {
            ...ws,
            memory: { ...ws.memory, [key]: value },
          };
        }
        return ws;
      });

      set({ workspaces: updatedWorkspaces });
      saveState({
        workspaces: updatedWorkspaces,
        activeWorkspaceId: get().activeWorkspaceId,
      });
    },

    addDocumentToWorkspace: (id, docName, docContent) => {
      const newDoc: WorkspaceDocument = {
        id: IdService.createId('doc'),
        name: docName,
        content: docContent,
        uploadedAt: new Date().toISOString(),
      };

      const updatedWorkspaces = get().workspaces.map((ws) => {
        if (ws.id === id) {
          return {
            ...ws,
            documents: [...ws.documents, newDoc],
          };
        }
        return ws;
      });

      set({ workspaces: updatedWorkspaces });
      saveState({
        workspaces: updatedWorkspaces,
        activeWorkspaceId: get().activeWorkspaceId,
      });
    },

    deleteDocumentFromWorkspace: (id, docId) => {
      const updatedWorkspaces = get().workspaces.map((ws) => {
        if (ws.id === id) {
          return {
            ...ws,
            documents: ws.documents.filter((doc) => doc.id !== docId),
          };
        }
        return ws;
      });

      set({ workspaces: updatedWorkspaces });
      saveState({
        workspaces: updatedWorkspaces,
        activeWorkspaceId: get().activeWorkspaceId,
      });
    },

    resetWorkspaces: () => {
      const defaultWs = createDefaultWorkspace();
      set({ workspaces: [defaultWs], activeWorkspaceId: defaultWs.id });
      saveState({ workspaces: [defaultWs], activeWorkspaceId: defaultWs.id });
      useAIStore.getState().setSessions([]);
    },
  };
});
