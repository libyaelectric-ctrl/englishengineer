import { AIProviderMode } from './ai.types';
import { isConfiguredPublicUrl } from '@/config/environment.config';

interface AIEnv {
  VITE_AI_PROVIDER?: string;
  VITE_AI_PROXY_URL?: string;
}

interface ImportMetaWithEnv {
  env?: AIEnv;
}

const env = (import.meta as unknown as ImportMetaWithEnv).env;

const requestedProvider =
  env?.VITE_AI_PROVIDER === 'backend' ||
  env?.VITE_AI_PROVIDER === 'backend-proxy'
    ? 'backend'
    : 'mock';
const proxyUrl = isConfiguredPublicUrl(env?.VITE_AI_PROXY_URL)
  ? env?.VITE_AI_PROXY_URL?.trim() || null
  : null;

export const AI_BACKEND_PROXY_CONFIG: {
  providerMode: AIProviderMode;
  proxyUrl: string | null;
  isBackendConfigured: boolean;
} = {
  providerMode: requestedProvider,
  proxyUrl,
  isBackendConfigured: proxyUrl !== null,
};
