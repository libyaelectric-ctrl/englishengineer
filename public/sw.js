// SERVICE WORKER DISABLED — purges itself and all caches on load.
// Content-hashed filenames from Vite make SW caching redundant.
// Re-enable only if offline-first support is needed.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});

// No fetch handler = network always wins.
