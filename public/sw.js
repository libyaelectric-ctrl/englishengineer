const CACHE_NAME = 'engvox-v1';
const CACHE_URLS = ['/', '/index.html', '/src/main.tsx', '/manifest.json', '/brand/logo.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_URLS))
      .catch(() => {})
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
