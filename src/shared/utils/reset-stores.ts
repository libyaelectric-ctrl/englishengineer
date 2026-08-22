/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared store reset helper for E2E and integration tests.
 *
 * Resets all Zustand stores to their initial state to prevent
 * cross-test contamination.
 *
 * Usage in tests:
 *   import { resetAllStores } from '@/shared/utils/reset-stores';
 *   afterEach(() => resetAllStores());
 */
import { useAppStore } from '@/store/app.store';

import { useLearningStore } from '@/core/learning/learning.store';

import { useLearningIntelligenceStore } from '@/shared/stores/learning-intelligence.store';

import { useAdminStore } from '@/features/admin/admin.store';
import { useAnalyticsStore } from '@/features/analytics/analytics.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useBetaStore } from '@/features/beta/beta.store';
import { useBillingStore } from '@/features/billing/billing.store';
import { useWorkspaceStore } from '@/features/billing/workspace.store';
import { useGrammarStore } from '@/features/grammar/grammar.store';
import { useListeningMissionsStore } from '@/features/listening/listening-missions.store';
import { useListeningPlaybackStore } from '@/features/listening/listening-playback.store';
import { useLocalizationStore } from '@/features/localization/localization.store';
import { usePlacementStore } from '@/features/placement/placement.store';
import { useReadingStore } from '@/features/reading/reading.store';
import { useSpeakingStore } from '@/features/speaking/core/speaking.store';
import { useTeamStore } from '@/features/team/team.store';
import { useVocabularyMemoryStore } from '@/features/vocabulary/store/vocabulary.memory.store';
import { useVocabularyStore } from '@/features/vocabulary/store/vocabulary.store';
import { useWorkToolsStore } from '@/features/work-tools/work-tools.store';
import { useWritingStore } from '@/features/writing/writing.store';

/**
 * Resets all application Zustand stores to their default state.
 * Call this in `afterEach()` of E2E/integration test suites to prevent
 * cross-test contamination.
 */
export function resetAllStores(): void {
  const stores: Array<{ setState: any }> = [
    useAppStore,
    useAuthStore,
    useLearningStore,
    useBillingStore,
    useAnalyticsStore,
    useVocabularyStore,
    useVocabularyMemoryStore,
    useGrammarStore,
    useReadingStore,
    useWritingStore,
    useListeningMissionsStore,
    useListeningPlaybackStore,
    useSpeakingStore,
    usePlacementStore,
    useTeamStore,
    useAdminStore,
    useBetaStore,
    useWorkspaceStore,
    useWorkToolsStore,
    useLearningIntelligenceStore,
    useLocalizationStore,
  ];

  for (const store of stores) {
    try {
      // Zustand stores created with `create()` expose the initial state
      // via `getInitialState()` in Zustand v5+. For older stores we fall
      // back to reading the store's API get() and calling replace.
      const api = (store as any).__store__ ?? store;
      if (typeof api.getInitialState === 'function') {
        api.setState(api.getInitialState(), true);
      } else if (typeof api.getState === 'function') {
        // Fallback: just clear common state keys to their defaults
        const state = api.getState();
        const keys = Object.keys(state).filter((k) => typeof state[k] !== 'function');
        const reset: Record<string, unknown> = {};
        for (const k of keys) reset[k] = undefined;
        api.setState(reset, true);
      }
    } catch {
      // Swallow — a failed reset should not break the test suite
    }
  }
}
