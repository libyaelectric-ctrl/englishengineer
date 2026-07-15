import { lazy } from 'react';

export const LazyBillingStatusPanel = lazy(() =>
  import('./BillingStatusPanel').then((m) => ({
    default: m.BillingStatusPanel,
  }))
);
export const LazyWorkspaceSelector = lazy(() =>
  import('./WorkspaceSelector').then((m) => ({ default: m.WorkspaceSelector }))
);
export const LazyWorkspaceMemoryPanel = lazy(() =>
  import('./WorkspaceMemoryPanel').then((m) => ({
    default: m.WorkspaceMemoryPanel,
  }))
);
export const LazyEntitlementGate = lazy(() =>
  import('./EntitlementGate').then((m) => ({ default: m.EntitlementGate }))
);
