import { createApiClient } from '@/shared/services/apiClient';
import { unwrapApiSuccess } from '@/shared/types/api-response';
import { logger } from '@/shared/logger';

import { AI_BACKEND_PROXY_CONFIG } from './ai.config';

export interface AiAnalyticsData {
  userId: string;
  planId: string;
  limits: {
    used: number;
    remaining: number;
    daily: number | null;
    monthly: number | null;
  };
  totalRequests: number;
  averageDurationMs: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  vocabulary: number;
  byOperation: Array<{ operation: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

export interface AiAdminAnalytics {
  totalRequests: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  topUsers: Array<{
    userId: string;
    totalRequests: number;
    totalEstimatedTokens: number;
    estimatedCostUsd: number;
  }>;
}

const EMPTY: AiAnalyticsData = {
  userId: '',
  planId: '',
  limits: { used: 0, remaining: 0, daily: null, monthly: null },
  totalRequests: 0,
  averageDurationMs: 0,
  totalEstimatedTokens: 0,
  estimatedCostUsd: 0,
  vocabulary: 0,
  byOperation: [],
  byDay: [],
};

const analyticsClient = AI_BACKEND_PROXY_CONFIG.isBackendConfigured
  ? createApiClient({ baseUrl: AI_BACKEND_PROXY_CONFIG.proxyUrl! })
  : null;

export const AiAnalyticsService = {
  async fetch(): Promise<AiAnalyticsData> {
    if (!analyticsClient) return EMPTY;
    try {
      return await analyticsClient.get<AiAnalyticsData>('/analytics');
    } catch (err) {
      logger.e('[AI] Failed to fetch analytics:', err);
      return EMPTY;
    }
  },

  async fetchAdmin(): Promise<AiAdminAnalytics | null> {
    if (!analyticsClient) return null;
    try {
      return (
        unwrapApiSuccess<AiAdminAnalytics>(
          await analyticsClient.get<AiAdminAnalytics>('/analytics/admin')
        ) ?? null
      );
    } catch (err) {
      logger.e('[AI] Failed to fetch admin analytics:', err);
      return null;
    }
  },
};
