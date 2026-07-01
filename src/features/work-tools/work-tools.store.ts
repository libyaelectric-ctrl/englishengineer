import { create } from 'zustand';
import { QuickAIDraft, WorkToolsPreferences } from './work-tools.types';
import { WorkToolsService } from './work-tools.service';

interface WorkToolsState extends WorkToolsPreferences {
  toggleFavorite: (phraseId: string) => void;
  remember: (itemId: string) => void;
  rememberSearch: (search: string) => void;
  sendToQuickAI: (draft: QuickAIDraft) => void;
  clearQuickAIDraft: () => void;
}

const initial = WorkToolsService.load();

export const useWorkToolsStore = create<WorkToolsState>((set, get) => ({
  ...initial,
  toggleFavorite: (phraseId) =>
    set(WorkToolsService.toggleFavorite(phraseId, get())),
  remember: (itemId) => set(WorkToolsService.remember(itemId, get())),
  rememberSearch: (search) =>
    set(WorkToolsService.rememberSearch(search, get())),
  sendToQuickAI: (draft) => set(WorkToolsService.setQuickAIDraft(draft, get())),
  clearQuickAIDraft: () => {
    const next = { ...get(), quickAIDraft: null };
    WorkToolsService.save(next);
    set({ quickAIDraft: null });
  },
}));
