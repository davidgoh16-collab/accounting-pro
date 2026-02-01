
const CACHE_NAME = 'geo-pro-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
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

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like firebase, google apis, cdns) from caching logic
  // to avoid opaque response issues or caching failures unless explicitly handled
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
            // Return a reliable offline fallback if available, or just rethrow
            // console.error('Fetch failed for:', event.request.url, error);
            // Don't crash the promise chain with a raw error if possible
            return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
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
