import { AI_BACKEND_PROXY_CONFIG } from '@/shared/services/ai-proxy.config';
import { createApiClient } from '@/shared/services/apiClient';
import { unwrapApiSuccess } from '@/shared/types/api-response';

interface SpeakingSubmitPayload {
  id: string;
  overallScore?: number;
  feedback?: Record<string, string>;
  status: string;
}

export async function submitSpeakingToBackend(input: {
  missionId: string;
  transcript: string;
  audioUrl?: string;
}): Promise<SpeakingSubmitPayload | null> {
  const proxy = AI_BACKEND_PROXY_CONFIG.proxyUrl;
  if (!proxy) return null;

  const base = proxy.replace(/\/api\/(?:v1\/)?ai\/?$/, '');
  try {
    const client = createApiClient({ baseUrl: base });
    return unwrapApiSuccess<SpeakingSubmitPayload>(
      await client.post<SpeakingSubmitPayload>('/api/v1/speaking/submit', input)
    );
  } catch {
    return null;
  }
}
