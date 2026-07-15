import { lazy } from 'react';

export const LazyBillingStatusPanel = lazy(() => import('./BillingStatusPanel'));
export const LazyWorkspaceSelector = lazy(() => import('./WorkspaceSelector'));
export const LazyWorkspaceMemoryPanel = lazy(() => import('./WorkspaceMemoryPanel'));
export const LazyEntitlementGate = lazy(() => import('./EntitlementGate'));
