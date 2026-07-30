import { useAIStore } from './ai.store';

/**
 * Re-exports for backward compatibility.
 * Persistence is now handled by Zustand persist middleware in ai.store.ts.
 */
export { buildAIUsageSummary } from './ai.store';
export type { AIUsageSummary } from './ai.store';

export const getStoredAIUsageSummary = () => {
  return useAIStore.getState().getUsageSummary();
};
