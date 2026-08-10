import ReactDOM from 'react-dom/client';

import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import { ObservabilityService } from '@/core/observability/observability.service';

import App from './App';
import './index.css';
import { logger } from './shared/logger';

// Polyfill: Safari < 16 does not support requestIdleCallback
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as unknown as Record<string, unknown>).requestIdleCallback = (
    cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
    options?: { timeout?: number }
  ): number => {
    const start = Date.now();
    return window.setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, options?.timeout ?? 1);
  };
  (window as unknown as Record<string, unknown>).cancelIdleCallback = (id: number): void => {
    clearTimeout(id);
  };
}

// Global unhandled rejection handler for production error tracking
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    ObservabilityService.logError({
      code: 'unhandled_rejection',
      message: error.message,
      severity: 'high',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
    event.preventDefault(); // Prevent default browser behavior (console error)
  });
}

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

  window.addEventListener('load', () => {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Mouse tracking for card hover effects (throttled via rAF)
    let mouseFrame = 0;
    document.addEventListener('mousemove', (e) => {
      window.cancelAnimationFrame(mouseFrame);
      mouseFrame = window.requestAnimationFrame(() => {
        const target = (e.target as HTMLElement).closest('.card-interactive') as HTMLElement | null;
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
  const metaEnv = import.meta.env;
  eventBus.publish({
    id: IdService.createId('sys'),
    type: 'app.started',
    timestamp: new Date().toISOString(),
    payload: {
      environment: metaEnv.MODE || 'development',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
    },
  });
  logger.i('Core app.started event emitted successfully.');
} catch (err) {
  logger.e('Failed to emit app.started event', err);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

// Preload vocabulary data in background (non-blocking, lazy loaded)
requestIdleCallback(async () => {
  try {
    const { loadVocabularyEntries } = await import('./features/vocabulary/data/vocabulary.data');
    await loadVocabularyEntries();
  } catch (err: unknown) {
    logger.w('[preload] Vocabulary data preload failed:', err);
  }
});

// Migrate large data sets from localStorage to IndexedDB (deferred)
requestIdleCallback(() => {
  import('@/shared/storage/indexed-db.service').then(({ indexedDBStorage }) =>
    indexedDBStorage.migrateAll().catch((err: unknown) => {
      logger.w('[IndexedDB] Migration failed:', err);
    })
  );
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      logger.d('Service worker registration failed:', err);
    });
  });
}
