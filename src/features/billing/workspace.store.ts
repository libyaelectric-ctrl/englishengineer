import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { IdService } from '@/core/ids/id.service';

import { logger } from '@/shared/logger';
import { eosPersistConfig } from '@/shared/storage/persist-middleware';

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

interface WorkspaceStoreState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  createWorkspace: (name: string, planId: BillingPlanId) => boolean;
  deleteWorkspace: (id: string) => void;
  switchWorkspace: (id: string) => void;
  updateWorkspaceMemory: (id: string, key: string, value: string) => void;
  addDocumentToWorkspace: (id: string, docName: string, docContent: string) => void;
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

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set, get) => {
      const defaultWs = createDefaultWorkspace();

      return {
        workspaces: [defaultWs],
        activeWorkspaceId: defaultWs.id,

        createWorkspace: (name, planId) => {
          const currentWorkspaces = get().workspaces;
          const limit =
            planId === 'free' || planId === 'pro' ? 1 : planId === 'project' ? 3 : Infinity;

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

          useAIStore.getState().setSessions([]);
          return true;
        },

        deleteWorkspace: (id) => {
          const currentWorkspaces = get().workspaces;
          if (currentWorkspaces.length <= 1) return;

          const updatedWorkspaces = currentWorkspaces.filter((ws) => ws.id !== id);
          let newActiveId = get().activeWorkspaceId;

          if (newActiveId === id) {
            newActiveId = updatedWorkspaces[0].id;
          }

          set({ workspaces: updatedWorkspaces, activeWorkspaceId: newActiveId });

          const nextWs = updatedWorkspaces.find((ws) => ws.id === newActiveId);
          if (nextWs) {
            useAIStore.getState().setSessions(nextWs.sessions);
          }
        },

        switchWorkspace: (id) => {
          const currentWorkspaces = get().workspaces;
          const activeId = get().activeWorkspaceId;
          if (activeId === id) return;

          const currentSessions = useAIStore.getState().sessions;
          const updatedWorkspaces = currentWorkspaces.map((ws) => {
            if (ws.id === activeId) {
              return { ...ws, sessions: currentSessions };
            }
            return ws;
          });

          set({ workspaces: updatedWorkspaces, activeWorkspaceId: id });

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
        },

        resetWorkspaces: () => {
          const defaultWs = createDefaultWorkspace();
          set({ workspaces: [defaultWs], activeWorkspaceId: defaultWs.id });
          useAIStore.getState().setSessions([]);
        },
      };
    },
    {
      ...eosPersistConfig(STORAGE_KEY),
      // Workspace uses global storage (not user-scoped)
      storage: {
        getItem: (name) => {
          try {
            if (typeof window === 'undefined' || !window.localStorage) return null;
            const item = localStorage.getItem(`eos_${name}`);
            return item ? JSON.parse(item) : null;
          } catch (e) {
            logger.w('[WORKSPACE_STORE] Failed to read from localStorage', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            localStorage.setItem(`eos_${name}`, JSON.stringify(value));
          } catch (e) {
            logger.w('[WORKSPACE_STORE] Failed to write to localStorage', e);
          }
        },
        removeItem: (name) => {
          try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            localStorage.removeItem(`eos_${name}`);
          } catch (e) {
            logger.w('[WORKSPACE_STORE] Failed to remove from localStorage', e);
          }
        },
      },
    }
  )
);
