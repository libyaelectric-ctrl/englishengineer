import { useAuthStore } from '@/features/auth';
import { useBillingStore } from '@/features/billing';

interface ResettableStore {
  getState: () => Record<string, unknown>;
  setState: (partial: Record<string, unknown>, replace?: boolean) => void;
}

interface RegisteredStore {
  store: ResettableStore;
  snapshot: Record<string, unknown>;
}

// Snapshots are captured at module load, i.e. the pristine state of each
// store. Vitest runs every test file in an isolated module registry, so the
// snapshot always reflects the untouched initial state.
const registered: RegisteredStore[] = [
  { store: useAuthStore as unknown as ResettableStore, snapshot: { ...useAuthStore.getState() } },
  {
    store: useBillingStore as unknown as ResettableStore,
    snapshot: { ...useBillingStore.getState() },
  },
];

/**
 * Resets the stores seeded by the vitest E2E suites back to their module-load
 * state, so state set by one test file can never leak into the next file in
 * the same worker. Call from an afterEach in the affected suites.
 * See docs/TECH_DEBT.md, TD-018.
 */
export function resetStores(): void {
  for (const { store, snapshot } of registered) {
    store.setState({ ...snapshot }, true);
  }
}
