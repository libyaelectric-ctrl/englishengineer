import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

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

export const AiAnalyticsService = {
  async fetch(): Promise<AiAnalyticsData> {
    if (!AI_BACKEND_PROXY_CONFIG.isBackendConfigured) return EMPTY;
    const base = AI_BACKEND_PROXY_CONFIG.proxyUrl!.replace(/\/$/, '');
    try {
      const authHeaders = await getBackendAuthHeaders();
      const response = await fetch(`${base}/analytics`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) return EMPTY;
      return (await response.json()) as AiAnalyticsData;
    } catch {
      return EMPTY;
    }
  },

  async fetchAdmin(): Promise<AiAdminAnalytics | null> {
    if (!AI_BACKEND_PROXY_CONFIG.isBackendConfigured) return null;
    const base = AI_BACKEND_PROXY_CONFIG.proxyUrl!.replace(/\/$/, '');
    try {
      const authHeaders = await getBackendAuthHeaders();
      const response = await fetch(`${base}/analytics/admin`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as { data?: AiAdminAnalytics };
      return payload.data ?? null;
    } catch {
      return null;
    }
  },
};
