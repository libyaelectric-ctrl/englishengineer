import { createApiClient } from '@/shared/services/apiClient';

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
    } catch {
      return EMPTY;
    }
  },

  async fetchAdmin(): Promise<AiAdminAnalytics | null> {
    if (!analyticsClient) return null;
    try {
      const payload = await analyticsClient.get<{ data?: AiAdminAnalytics }>('/analytics/admin');
      return payload.data ?? null;
    } catch {
      return null;
    }
  },
};
