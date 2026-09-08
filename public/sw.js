const CACHE_NAME = 'engvox-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

const PRIVATE_PATH_PREFIXES = [
  '/api/',
  '/login',
  '/signup',
  '/register',
  '/sign-in',
  '/sign-up',
  '/auth',
];

const isPrivateRequest = (url) =>
  PRIVATE_PATH_PREFIXES.some(
    (prefix) => url.pathname === prefix.replace(/\/$/, '') || url.pathname.startsWith(prefix)
  );

const isCacheableStaticAsset = (request, url) =>
  url.origin === self.location.origin &&
  ['style', 'script', 'font', 'image'].includes(request.destination) &&
  (url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/mascot/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico');

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivateRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error())
    );
    return;
  }

  if (!isCacheableStaticAsset(request, url)) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (!response || !response.ok || response.type !== 'basic') return response;
          const cacheControl = response.headers.get('cache-control') || '';
          if (/no-cache|no-store|private/i.test(cacheControl)) return response;
          const clone = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)));
          return response;
        })
    )
  );
});
