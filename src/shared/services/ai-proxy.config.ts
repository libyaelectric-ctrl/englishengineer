import { isConfiguredPublicUrl } from '@/config/environment.config';

import { logger } from '@/shared/logger';
import type { AIProviderMode } from '@/shared/types/ai.types';

interface AIEnv {
  VITE_AI_PROVIDER?: string;
  VITE_AI_PROXY_URL?: string;
}

const env: AIEnv | undefined = import.meta.env;

const requestedProvider =
  env?.VITE_AI_PROVIDER === 'backend' || env?.VITE_AI_PROVIDER === 'backend-proxy'
    ? 'backend'
    : 'mock';
/**
 * The backend mounts every route under `/api/v1`, and its AI routes live at
 * `/api/v1/ai/*`. A proxy URL that stops at `/api/ai` therefore asks for
 * `/api/ai/coach`, a namespace the backend answers with `route_not_found` — the
 * shape production was actually configured with, which made every AI call fail
 * and quietly fall back to the mock provider. Both shapes are accepted here and
 * normalised to the servable one, so a mis-set env var degrades to a warning
 * instead of to a broken feature.
 */
const normalizeProxyUrl = (value: string | undefined): string | null => {
  if (!isConfiguredPublicUrl(value)) return null;
  const trimmed = value!.trim().replace(/\/+$/, '');
  if (/\/api\/ai$/.test(trimmed)) {
    logger.w(
      '[AI] VITE_AI_PROXY_URL points at /api/ai; the backend serves /api/v1/ai. Using /api/v1/ai.'
    );
    return trimmed.replace(/\/api\/ai$/, '/api/v1/ai');
  }
  return trimmed;
};

const proxyUrl = normalizeProxyUrl(env?.VITE_AI_PROXY_URL);

export const AI_BACKEND_PROXY_CONFIG: {
  providerMode: AIProviderMode;
  proxyUrl: string | null;
  isBackendConfigured: boolean;
} = {
  providerMode: requestedProvider,
  proxyUrl,
  isBackendConfigured: proxyUrl !== null,
};
