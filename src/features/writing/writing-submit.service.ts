import { getBackendAuthHeaders } from '@/shared/services/backend-auth.service';

import { AI_BACKEND_PROXY_CONFIG } from '@/features/ai/ai.config';

interface WritingSubmitResponse {
  success?: boolean;
  id?: string;
  score?: number;
  feedback?: Record<string, string>;
  status?: string;
}

const resolveBackendBase = (): string | null => {
  const proxy = AI_BACKEND_PROXY_CONFIG.proxyUrl;
  return proxy ? proxy.replace(/\/api\/(?:v1\/)?ai\/?$/, '') : null;
};

/**
 * Sends the student's draft to POST /api/writing/submit for AI evaluation.
 * This is the single source of AI grading for writing submissions -- do not
 * also call the AI proxy directly from the client for the same draft (see
 * note in writing.service.ts).
 *
 * `promptId` is intentionally NOT sent: the local WRITING_MISSIONS catalog
 * (mission.id, e.g. "writing_a1_simple_site_update") and the backend's own
 * WRITING_PROMPTS catalog (wp-001..wp-008) are separate, unrelated content
 * sets with no shared IDs. Omitting promptId makes the backend grade the
 * draft generically rather than against a mismatched prompt.
 */
export async function submitWritingToBackend(input: {
  content: string;
}): Promise<WritingSubmitResponse | null> {
  const base = resolveBackendBase();
  if (!base) return null;

  try {
    const response = await fetch(`${base}/api/v1/writing/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getBackendAuthHeaders()),
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    return (await response.json()) as WritingSubmitResponse;
  } catch {
    return null;
  }
}
