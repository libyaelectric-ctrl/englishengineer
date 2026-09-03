import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import { LearningState } from '@/core/learning/learning.types';

import { logger } from '@/shared/logger';
import { eosPersistConfig } from '@/shared/storage/persist-middleware';
import { useLearningIntelligenceStore } from '@/shared/stores/learning-intelligence.store';
import {
  AICoachMode,
  AICoachModeId,
  AICoachResult,
  AICoachSession,
  AIProviderStatus,
  AISessionLog,
} from '@/shared/types/ai.types';
import { UserProfile } from '@/shared/types/auth.types';

import {
  AI_COACH_MODES,
  buildCoachContext,
  createCoachSessionId,
  getCoachModeById,
} from './ai.helpers';
import { AIService } from './ai.service';

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
  submitCoachRequest: (user: UserProfile | null, learningState: LearningState) => Promise<void>;
  resetCoach: () => void;
  clearSessionHistory: () => void;
  regenerateLast: (user: UserProfile | null, learningState: LearningState) => Promise<void>;
  getUsageSummary: () => AIUsageSummary;
  setSessions: (sessions: AICoachSession[]) => void;
}

const EMPTY_EXAMPLES: Array<{ input: string; output: string }> = [];

export interface AIUsageSummary {
  totalSessions: number;
  mostUsedMode: string;
  suggestedFocusArea: string;
  recentSession: AICoachSession | null;
  totalTokens: number;
  estimatedCostUsd: number;
  byOperation: Array<{ operation: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

const isCoachResult = (
  value: AICoachResult | Record<string, unknown> | undefined
): value is AICoachResult => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.summary === 'string' && Array.isArray(v.strengths) && Array.isArray(v.weaknesses);
};

const buildResultOrFallback = (
  response: Awaited<ReturnType<typeof AIService.run>>,
  context: ReturnType<typeof buildCoachContext>
): AICoachResult =>
  isCoachResult(response.structuredResult)
    ? response.structuredResult
    : {
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

const buildSessionList = (
  mode: ReturnType<typeof getCoachModeById>,
  prompt: string,
  response: Awaited<ReturnType<typeof AIService.run>>,
  result: AICoachResult,
  existingSessions: AICoachSession[]
): AICoachSession[] => {
  const session: AICoachSession = {
    id: createCoachSessionId(),
    modeId: mode.id,
    modeName: mode.name,
    input: prompt,
    result,
    timestamp: new Date().toISOString(),
    providerUsed: response.providerStatus,
  };
  return [session, ...existingSessions].slice(0, 20);
};

const buildSuccessLogList = (
  mode: ReturnType<typeof getCoachModeById>,
  response: Awaited<ReturnType<typeof AIService.run>>,
  existingLogs: AISessionLog[]
): AISessionLog[] => {
  const sessionLog: AISessionLog = {
    id: IdService.createId('ai_log'),
    provider: response.providerStatus.mode,
    operation: mode.operation,
    durationMs: response.metadata?.durationMs || 0,
    success: response.metadata?.success === true,
    timestamp: new Date().toISOString(),
    errorMessage: response.metadata?.success === false ? response.providerStatus.detail : undefined,
    requestId: response.metadata?.requestId,
  };
  return [sessionLog, ...existingLogs].slice(0, 50);
};

const buildErrorLogList = (
  mode: ReturnType<typeof getCoachModeById>,
  message: string,
  existingLogs: AISessionLog[]
): AISessionLog[] =>
  [
    {
      id: IdService.createId('ai_log'),
      provider: 'backend' as const,
      operation: mode.operation,
      durationMs: 0,
      success: false,
      timestamp: new Date().toISOString(),
      errorMessage: message,
    },
    ...existingLogs,
  ].slice(0, 50);

export const buildAIUsageSummary = (sessions: AICoachSession[]): AIUsageSummary => {
  const modeCounts = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.modeName] = (acc[session.modeName] || 0) + 1;
    return acc;
  }, {});
  const mostUsedMode =
    Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No sessions yet';
  const recentSession = sessions[0] || null;

  const totalTokens = sessions.reduce((sum, session) => sum + (session.tokensUsed || 0), 0);
  const estimatedCostUsd = Math.round(totalTokens * (0.01 / 1000) * 10000) / 10000;

  const byOperationMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  for (const session of sessions) {
    byOperationMap.set(session.modeName, (byOperationMap.get(session.modeName) ?? 0) + 1);
    const day = new Date(session.timestamp).toISOString().split('T')[0];
    byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
  }

  return {
    totalSessions: sessions.length,
    mostUsedMode,
    suggestedFocusArea: recentSession?.result.focusArea || 'Writing',
    recentSession,
    totalTokens,
    estimatedCostUsd,
    byOperation: [...byOperationMap.entries()]
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count),
    byDay: [...byDayMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
};

const STORAGE_KEY = 'ai_coach_pro_state';

export const useAIStore = create<AIStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        modes: AI_COACH_MODES,
        selectedModeId: 'site_report_writer',
        input: '',
        sessions: [],
        sessionLogs: [],
        providerStatus: AIService.getStatus(EMPTY_EXAMPLES),
        isLoading: false,
        error: null,
        lastResult: null,
        isLimitedResponse: false,

        setMode: (modeId) => set({ selectedModeId: modeId }),

        setInput: (input) => set({ input }),

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

            const result = buildResultOrFallback(response, context);
            const isLimitedResponse = !response.structuredResult;
            if (isLimitedResponse && response.providerStatus.mode === 'backend') {
              logger.w(
                'Backend AI response did not include structuredResult; showing raw response.'
              );
            }

            const sessions = buildSessionList(mode, prompt, response, result, get().sessions);
            const sessionLogs = buildSuccessLogList(mode, response, get().sessionLogs);

            set({
              sessions,
              sessionLogs,
              input: '',
              providerStatus: response.providerStatus,
              lastResult: result,
              isLimitedResponse,
              isLoading: false,
            });

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
            const message = error instanceof Error ? error.message : 'AI Coach request failed.';
            const sessionLogs = buildErrorLogList(mode, message, get().sessionLogs);

            set({
              isLoading: false,
              error: message,
              isLimitedResponse: false,
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
        },

        clearSessionHistory: () => {
          set({
            sessions: [],
            sessionLogs: [],
            lastResult: null,
            isLimitedResponse: false,
            error: null,
          });
        },

        regenerateLast: async (user, learningState) => {
          const lastSession = get().sessions[0];
          if (!lastSession) return;
          set({
            selectedModeId: lastSession.modeId,
            input: lastSession.input,
          });
          await get().submitCoachRequest(user, learningState);
        },

        getUsageSummary: () => {
          return buildAIUsageSummary(get().sessions);
        },

        setSessions: (sessions) => {
          set({ sessions, lastResult: sessions[0]?.result || null });
        },
      }),
      eosPersistConfig(STORAGE_KEY)
    ),
    { name: 'AIStore' }
  )
);

/** Convenience helper — reads the current usage summary from the store. */
export const getStoredAIUsageSummary = () => {
  return useAIStore.getState().getUsageSummary();
};
