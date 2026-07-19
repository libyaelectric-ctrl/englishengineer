import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './shared/logger';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';
import { loadVocabularyEntries } from '@/features/vocabulary/data/vocabulary.data';
import { ObservabilityService } from '@/core/observability/observability.service';

// Initialize Sentry error monitoring
ObservabilityService.init();

// Initialize theme from store (auto-detects time-based theme)
import { useAppStore } from './store/app.store';
if (typeof window !== 'undefined') {
  const store = useAppStore.getState();
  const effectiveTheme = store.theme;
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.add('light');
  }
}

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
    // Watch for new elements
    domObserver.observe(document.body, { childList: true, subtree: true });

    // Mouse tracking for card hover effects
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.card-interactive').forEach((card) => {
        const el = card as HTMLElement;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mouse-x', `${x}%`);
        el.style.setProperty('--mouse-y', `${y}%`);
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

// Preload vocabulary data in background (non-blocking)
loadVocabularyEntries().catch((err: unknown) => {
  logger.w('[preload] Vocabulary data preload failed:', err);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed silently
    });
  });
}
