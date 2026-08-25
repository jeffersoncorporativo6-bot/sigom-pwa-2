// SIGOM Service Worker
// Bump CACHE_VERSION whenever index.html (or any cached asset) changes so
// clients pick up the new version next time they're online.
const CACHE_VERSION = 'sigom-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategy:
// - App shell (same-origin): cache-first, so the app opens instantly offline.
// - Everything else (fonts, CDN libs): network-first, falling back to cache,
//   so we always try to get the freshest version when online but still work offline
//   once a resource has been fetched at least once.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
  } else {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req))
    );
  }
});

// Allows the page to ask the SW to activate a newly installed version immediately
// (used by the "Nova versão disponível" prompt in index.html).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
