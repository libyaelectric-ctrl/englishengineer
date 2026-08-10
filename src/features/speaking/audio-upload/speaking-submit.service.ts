import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import { AI_BACKEND_PROXY_CONFIG } from '@/features/ai/ai.config';

interface SpeakingSubmitResponse {
  success?: boolean;
  id?: string;
  overallScore?: number;
  status?: string;
}

const resolveBackendBase = (): string | null => {
  const proxy = AI_BACKEND_PROXY_CONFIG.proxyUrl;
  return proxy ? proxy.replace(/\/api\/ai\/?$/, '') : null;
};

export async function submitSpeakingToBackend(input: {
  missionId: string;
  transcript: string;
  audioUrl?: string;
}): Promise<SpeakingSubmitResponse | null> {
  const base = resolveBackendBase();
  if (!base) return null;

  try {
    const response = await fetch(`${base}/api/v1/speaking/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getBackendAuthHeaders()),
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    return (await response.json()) as SpeakingSubmitResponse;
  } catch {
    return null;
  }
}
