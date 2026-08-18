import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import { AI_BACKEND_PROXY_CONFIG } from './ai.config';

export interface AiAnalyticsData {
  userId: string;
  totalRequests: number;
  averageDurationMs: number;
  totalEstimatedTokens: number;
  estimatedCostUsd: number;
  byOperation: Array<{ operation: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}

const EMPTY: AiAnalyticsData = {
  userId: '',
  totalRequests: 0,
  averageDurationMs: 0,
  totalEstimatedTokens: 0,
  estimatedCostUsd: 0,
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
};
