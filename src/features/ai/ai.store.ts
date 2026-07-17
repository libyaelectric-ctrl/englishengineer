import { create } from 'zustand';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import { LearningState } from '@/core/learning/learning.types';
import { UserProfile } from '@/features/auth/auth.types';
import { logger } from '@/shared/logger';
import { AIService } from './ai.service';
import {
  AIProviderStatus,
  AISessionLog,
  AICoachMode,
  AICoachModeId,
  AICoachResult,
  AICoachSession,
} from './ai.types';
import {
  AI_COACH_MODES,
  buildCoachContext,
  createCoachSessionId,
  getCoachModeById,
} from './ai.helpers';
import { useLearningIntelligenceStore } from '@/features/learning-intelligence/learning-intelligence.store';
import {
  AIUsageSummary,
  getInitialState,
  saveState,
  removeStoredState,
  buildAIUsageSummary,
} from './ai.persistence';

interface AIStoreState {
  modes: AICoachMode[];
  selectedModeId: AICoachModeId;
  input: string;
  sessions: AICoachSession[];
  sessionLogs: AISessionLog[];
  providerStatus: AIProviderStatus;
  isLoading: boolean;
  error: string | null;
  lastResult: AICoachResult | null;
  isLimitedResponse: boolean;
  setMode: (modeId: AICoachModeId) => void;
  setInput: (input: string) => void;
  submitCoachRequest: (
    user: UserProfile | null,
    learningState: LearningState
  ) => Promise<void>;
  resetCoach: () => void;
  clearSessionHistory: () => void;
  regenerateLast: (
    user: UserProfile | null,
    learningState: LearningState
  ) => Promise<void>;
  getUsageSummary: () => AIUsageSummary;
  setSessions: (sessions: AICoachSession[]) => void;
}

const EMPTY_EXAMPLES: Array<{ input: string; output: string }> = [];

const persistedState = getInitialState();

export const useAIStore = create<AIStoreState>((set, get) => ({
  modes: AI_COACH_MODES,
  selectedModeId: persistedState.selectedModeId,
  input: persistedState.input,
  sessions: persistedState.sessions,
  sessionLogs: persistedState.sessionLogs,
  providerStatus: AIService.getStatus(EMPTY_EXAMPLES),
  isLoading: false,
  error: null,
  lastResult: persistedState.sessions[0]?.result || null,
  isLimitedResponse: false,

  setMode: (modeId) => {
    set({ selectedModeId: modeId });
    saveState({
      selectedModeId: modeId,
      input: get().input,
      sessions: get().sessions,
      sessionLogs: get().sessionLogs,
    });
  },

  setInput: (input) => {
    set({ input });
    saveState({
      selectedModeId: get().selectedModeId,
      input,
      sessions: get().sessions,
      sessionLogs: get().sessionLogs,
    });
  },

  submitCoachRequest: async (user, learningState) => {
    const prompt = get().input.trim();
    if (!prompt || get().isLoading) return;

    const mode = getCoachModeById(get().selectedModeId);
    const mistakeLog = useLearningIntelligenceStore.getState().mistakeLog;
    const context = buildCoachContext(user, learningState, mistakeLog);

    set({ isLoading: true, error: null });
    eventBus.publish({
      id: IdService.createId('evt'),
      type: 'ai.coach.started',
      timestamp: new Date().toISOString(),
      payload: {
        modeId: mode.id,
        modeName: mode.name,
        focusArea: context.recommendedFocus,
      },
    });

    try {
      const response = await AIService.run(EMPTY_EXAMPLES, mode.operation, {
        modeId: mode.id,
        modeName: mode.name,
        prompt,
        context,
      });

      const isLimitedResponse = !response.structuredResult;
      if (isLimitedResponse && response.providerStatus.mode === 'backend') {
        logger.w(
          'Backend AI response did not include structuredResult; showing raw response.'
        );
      }
      const result = response.structuredResult || {
        summary: response.text,
        strengths: ['Coach response completed.'],
        weaknesses: ['Backend response did not include a structured result.'],
        corrections: [],
        nativeRewrite: response.text,
        technicalVocabulary: [],
        recommendedNextTask: context.recommendedFocus,
        estimatedCefrImpact: `Continue toward ${context.targetLevel}.`,
        suggestedActions: ['Run another coach session with a clearer prompt.'],
        focusArea: context.recommendedFocus,
      };

      const session: AICoachSession = {
        id: createCoachSessionId(),
        modeId: mode.id,
        modeName: mode.name,
        input: prompt,
        result,
        timestamp: new Date().toISOString(),
        providerUsed: response.providerStatus,
      };
      const sessions = [session, ...get().sessions].slice(0, 20);
      const sessionLog: AISessionLog = {
        id: IdService.createId('ai_log'),
        provider: response.providerStatus.mode,
        operation: mode.operation,
        durationMs: response.metadata?.durationMs || 0,
        success: response.metadata?.success === true,
        timestamp: new Date().toISOString(),
        errorMessage:
          response.metadata?.success === false
            ? response.providerStatus.detail
            : undefined,
        requestId: response.metadata?.requestId,
      };
      const sessionLogs = [sessionLog, ...get().sessionLogs].slice(0, 50);

      set({
        sessions,
        sessionLogs,
        input: '',
        providerStatus: response.providerStatus,
        lastResult: result,
        isLimitedResponse,
        isLoading: false,
      });
      saveState({ selectedModeId: mode.id, input: '', sessions, sessionLogs });

      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'ai.coach.completed',
        timestamp: new Date().toISOString(),
        payload: {
          modeId: mode.id,
          modeName: mode.name,
          providerState: response.providerStatus.state,
          focusArea: result.focusArea,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI Coach request failed.';
      const sessionLogs = [
        {
          id: IdService.createId('ai_log'),
          provider: 'backend' as const,
          operation: mode.operation,
          durationMs: 0,
          success: false,
          timestamp: new Date().toISOString(),
          errorMessage: message,
        },
        ...get().sessionLogs,
      ].slice(0, 50);
      set({
        isLoading: false,
        error: message,
        isLimitedResponse: false,
        sessionLogs,
      });
      saveState({
        selectedModeId: get().selectedModeId,
        input: get().input,
        sessions: get().sessions,
        sessionLogs,
      });
      eventBus.publish({
        id: IdService.createId('evt'),
        type: 'ai.coach.failed',
        timestamp: new Date().toISOString(),
        payload: {
          modeId: mode.id,
          modeName: mode.name,
          message,
        },
      });
    }
  },

  resetCoach: () => {
    set({
      selectedModeId: 'site_report_writer',
      input: '',
      sessions: [],
      sessionLogs: [],
      lastResult: null,
      isLimitedResponse: false,
      error: null,
      providerStatus: AIService.getStatus(EMPTY_EXAMPLES),
    });
    removeStoredState();
  },

  clearSessionHistory: () => {
    set({
      sessions: [],
      sessionLogs: [],
      lastResult: null,
      isLimitedResponse: false,
      error: null,
    });
    saveState({
      selectedModeId: get().selectedModeId,
      input: get().input,
      sessions: [],
      sessionLogs: [],
    });
  },

  regenerateLast: async (user, learningState) => {
    const lastSession = get().sessions[0];
    if (!lastSession) return;
    set({
      selectedModeId: lastSession.modeId,
      input: lastSession.input,
    });
    saveState({
      selectedModeId: lastSession.modeId,
      input: lastSession.input,
      sessions: get().sessions,
      sessionLogs: get().sessionLogs,
    });
    await get().submitCoachRequest(user, learningState);
  },

  getUsageSummary: () => {
    return buildAIUsageSummary(get().sessions);
  },

  setSessions: (sessions) => {
    set({ sessions, lastResult: sessions[0]?.result || null });
    saveState({
      selectedModeId: get().selectedModeId,
      input: get().input,
      sessions,
      sessionLogs: get().sessionLogs,
    });
  },
}));

export { buildAIUsageSummary };
