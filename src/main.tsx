import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './shared/logger';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import { ObservabilityService } from '@/core/observability/observability.service';

// Defer Sentry init to after first paint for faster initial load
requestIdleCallback(() => ObservabilityService.init());

// Theme is handled by ThemeProvider — no manual DOM manipulation here

logger.i('EngVox Kernel Booting...');

// Scroll-triggered animations via IntersectionObserver
if (typeof window !== 'undefined') {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Re-observe when DOM changes (for lazy-loaded content)
  const domObserver = new MutationObserver(() => {
    document
      .querySelectorAll('.animate-on-scroll:not(.animate-visible)')
      .forEach((el) => {
        observer.observe(el);
      });
  });

  window.addEventListener('load', () => {
    // Initial observe
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
    // Watch for new elements (scoped to main content, not full body)
    const mainContent = document.getElementById('root');
    if (mainContent) {
      domObserver.observe(mainContent, { childList: true, subtree: true });
    }

    // Mouse tracking for card hover effects (throttled via rAF)
    let mouseFrame = 0;
    document.addEventListener('mousemove', (e) => {
      window.cancelAnimationFrame(mouseFrame);
      mouseFrame = window.requestAnimationFrame(() => {
        const target = (e.target as HTMLElement).closest(
          '.card-interactive'
        ) as HTMLElement | null;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty('--mouse-x', `${x}%`);
        target.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  });
}

// Publish app.started event to Core Event Bus
try {
  const metaEnv = (import.meta as unknown as { env?: { MODE?: string } }).env;
  eventBus.publish({
    id: IdService.createId('sys'),
    type: 'app.started',
    timestamp: new Date().toISOString(),
    payload: {
      environment: metaEnv?.MODE || 'development',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
    },
  });
  logger.i('Core app.started event emitted successfully.');
} catch (err) {
  logger.e('Failed to emit app.started event', err);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Preload vocabulary data in background (non-blocking, lazy loaded)
requestIdleCallback(async () => {
  try {
    const { loadVocabularyEntries } = await import('./features/vocabulary/data/vocabulary.data');
    await loadVocabularyEntries();
  } catch (err: unknown) {
    logger.w('[preload] Vocabulary data preload failed:', err);
  }
});

// Migrate large data sets from localStorage to IndexedDB
import { indexedDBStorage } from '@/shared/storage/indexed-db.service';
indexedDBStorage.migrateAll().catch((err: unknown) => {
  logger.w('[IndexedDB] Migration failed:', err);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed silently
    });
  });
}
