import { storage } from '@/shared/storage';
import { AI_COACH_MODES } from './ai.helpers';
import {
  AICoachModeId,
  AICoachSession,
  AISessionLog,
} from './ai.types';

export interface PersistedAIState {
  selectedModeId: AICoachModeId;
  input: string;
  sessions: AICoachSession[];
  sessionLogs: AISessionLog[];
}

export interface AIUsageSummary {
  totalSessions: number;
  mostUsedMode: string;
  suggestedFocusArea: string;
  recentSession: AICoachSession | null;
}

const STORAGE_KEY = 'ai_coach_pro_state';

export const getInitialState = (): PersistedAIState => {
  const persisted = storage.get<PersistedAIState>(STORAGE_KEY);
  return {
    selectedModeId:
      persisted?.selectedModeId &&
      AI_COACH_MODES.some((mode) => mode.id === persisted.selectedModeId)
        ? persisted.selectedModeId
        : 'site_report_writer',
    input: persisted?.input || '',
    sessions: persisted?.sessions || [],
    sessionLogs: persisted?.sessionLogs || [],
  };
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
export const saveState = (state: PersistedAIState): void => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    storage.set(STORAGE_KEY, state);
  }, 500);
};

export const removeStoredState = (): void => {
  storage.remove(STORAGE_KEY);
};

export const buildAIUsageSummary = (
  sessions: AICoachSession[]
): AIUsageSummary => {
  const modeCounts = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.modeName] = (acc[session.modeName] || 0) + 1;
    return acc;
  }, {});
  const mostUsedMode =
    Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No sessions yet';
  const recentSession = sessions[0] || null;
  return {
    totalSessions: sessions.length,
    mostUsedMode,
    suggestedFocusArea: recentSession?.result.focusArea || 'Writing',
    recentSession,
  };
};

export const getStoredAIUsageSummary = (): AIUsageSummary => {
  const persisted = storage.get<PersistedAIState>(STORAGE_KEY);
  return buildAIUsageSummary(persisted?.sessions || []);
};
