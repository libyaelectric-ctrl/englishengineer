import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IdService } from '@/core/ids/id.service';
import { eosPersistConfig } from '@/shared/storage/persist-middleware';
import type { AICoachSession } from '@/shared/types/ai.types';
import { useAIStore } from '@/features/ai';
import type { BillingPlanId } from './billing.types';
export interface WorkspaceDocument { id: string; name: string; content: string; uploadedAt: string; }
export interface Workspace { id: string; name: string; memory: Record<string, string>; documents: WorkspaceDocument[]; sessions: AICoachSession[]; createdAt: string; }
interface WorkspaceStoreState { workspaces: Workspace[]; activeWorkspaceId: string; createWorkspace: (name: string, planId: BillingPlanId) => boolean; deleteWorkspace: (id: string) => void; switchWorkspace: (id: string) => void; updateWorkspaceMemory: (id: string, key: string, value: string) => void; addDocumentToWorkspace: (id: string, name: string, content: string) => void; deleteDocumentFromWorkspace: (id: string, documentId: string) => void; resetWorkspaces: () => void; }
const STORAGE_KEY = 'EngVox_workspaces';
export const getPlanWorkspaceLimit = (planId: BillingPlanId): number => planId === 'free' || planId === 'junior' ? 1 : planId === 'senior' || planId === 'specialist' ? 3 : Infinity;
const createDefaultWorkspace = (): Workspace => ({ id: 'default-workspace', name: 'Primary Workspace', memory: {}, documents: [], sessions: [], createdAt: new Date().toISOString() });
export const useWorkspaceStore = create<WorkspaceStoreState>()(persist((set, get) => {
  const defaultWorkspace = createDefaultWorkspace();
  return {
    workspaces: [defaultWorkspace], activeWorkspaceId: defaultWorkspace.id,
    createWorkspace: (name, planId) => { const workspaces = get().workspaces; if (workspaces.length >= getPlanWorkspaceLimit(planId)) return false; const workspace: Workspace = { id: IdService.createId('ws'), name: name.trim() || `Workspace ${workspaces.length + 1}`, memory: {}, documents: [], sessions: [], createdAt: new Date().toISOString() }; set({ workspaces: [...workspaces, workspace], activeWorkspaceId: workspace.id }); useAIStore.getState().setSessions([]); return true; },
    deleteWorkspace: (id) => { const current = get().workspaces; if (current.length <= 1) return; const workspaces = current.filter((workspace) => workspace.id !== id); const activeWorkspaceId = get().activeWorkspaceId === id ? workspaces[0].id : get().activeWorkspaceId; set({ workspaces, activeWorkspaceId }); useAIStore.getState().setSessions(workspaces.find((workspace) => workspace.id === activeWorkspaceId)?.sessions ?? []); },
    switchWorkspace: (id) => { const activeId = get().activeWorkspaceId; if (activeId === id || !get().workspaces.some((workspace) => workspace.id === id)) return; const sessions = useAIStore.getState().sessions; const workspaces = get().workspaces.map((workspace) => workspace.id === activeId ? { ...workspace, sessions } : workspace); set({ workspaces, activeWorkspaceId: id }); useAIStore.getState().setSessions(workspaces.find((workspace) => workspace.id === id)?.sessions ?? []); },
    updateWorkspaceMemory: (id, key, value) => set({ workspaces: get().workspaces.map((workspace) => workspace.id === id ? { ...workspace, memory: { ...workspace.memory, [key]: value } } : workspace) }),
    addDocumentToWorkspace: (id, name, content) => { const document: WorkspaceDocument = { id: IdService.createId('doc'), name, content, uploadedAt: new Date().toISOString() }; set({ workspaces: get().workspaces.map((workspace) => workspace.id === id ? { ...workspace, documents: [...workspace.documents, document] } : workspace) }); },
    deleteDocumentFromWorkspace: (id, documentId) => set({ workspaces: get().workspaces.map((workspace) => workspace.id === id ? { ...workspace, documents: workspace.documents.filter((document) => document.id !== documentId) } : workspace) }),
    resetWorkspaces: () => { const workspace = createDefaultWorkspace(); set({ workspaces: [workspace], activeWorkspaceId: workspace.id }); useAIStore.getState().setSessions([]); },
  };
}, eosPersistConfig(STORAGE_KEY)));
