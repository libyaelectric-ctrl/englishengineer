import { logger } from '@/shared/logger';

const prefetched = new Set<string>();

/**
 * Prefetch a route's code-split chunk.
 * Uses requestIdleCallback when available to avoid competing with
 * critical rendering work. Falls back to immediate import on
 * browsers without requestIdleCallback support.
 */
export const prefetchRoute = (path: string) => {
  if (prefetched.has(path)) return;
  prefetched.add(path);

  const routes: Record<string, () => Promise<unknown>> = {
    '/dashboard': () => import('@/pages/DashboardPage'),
    '/profile': () => import('@/pages/ProfilePage'),
    '/speaking': () => import('@/pages/SpeakingPage'),
    '/vocabulary': () => import('@/pages/VocabularyPage'),
    '/grammar': () => import('@/pages/GrammarPage'),
    '/reading': () => import('@/pages/ReadingPage'),
    '/writing': () => import('@/pages/WritingPage'),
    '/listening': () => import('@/pages/ListeningPage'),
    '/progress': () => import('@/pages/ProgressPage'),
    '/admin': () => import('@/pages/AdminPage'),
    '/curriculum': () => import('@/pages/CurriculumPage'),
    '/tools': () => import('@/pages/ToolsPage'),
    '/team': () => import('@/pages/TeamPage'),
    '/placement': () => import('@/pages/PlacementPage'),
    '/pricing': () => import('@/pages/PricingPage'),
    '/business': () => import('@/pages/BusinessPage'),
    '/learning-path': () => import('@/pages/LearningPathPage'),
    '/billing': () => import('@/pages/BillingPage'),
  };

  const importer = routes[path];
  if (!importer) return;

  // Use requestIdleCallback to avoid competing with critical rendering
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => {
        importer().catch((err) => logger.d(`Prefetch failed for ${path}:`, err));
      },
      { timeout: 2000 } // max 2s wait before force-prefetch
    );
  } else {
    importer().catch((err) => logger.d(`Prefetch failed for ${path}:`, err));
  }
};
