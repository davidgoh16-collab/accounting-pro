
const CACHE_NAME = 'geo-pro-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Force this new service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
          console.warn('Service Worker install failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (like firebase, google apis, cdns) from caching logic
  // to avoid opaque response issues or caching failures unless explicitly handled
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }

  // Specific exclusions for API/Auth paths if they happen to be on the same origin (e.g. proxied)
  // but usually they are external.

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
            console.error('Fetch failed for:', event.request.url, error);
            // Return a valid offline response so the promise doesn't reject
            return new Response('Network error happening', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
            });
        });
      })
  );
});
