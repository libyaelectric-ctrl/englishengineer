import { logger } from '@/shared/logger';

const prefetched = new Set<string>();

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
  };

  const importer = routes[path];
  if (importer) {
    importer().catch((err) => logger.d(`Prefetch failed for ${path}:`, err));
  }
};
