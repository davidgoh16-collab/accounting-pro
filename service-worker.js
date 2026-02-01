
const CACHE_NAME = 'geo-pro-v2.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn('SW install warning:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Only intercept GET requests
  if (event.request.method !== 'GET') return;

  // 2. Ignore non-origin requests (CDN, APIs, Firebase)
  // This prevents the SW from interfering with external API calls
  if (!event.request.url.startsWith(self.location.origin)) return;

  // EXPLICIT: Ignore Google/Firebase services (redundant but safe)
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('firebasestorage')) return;

  // 3. Ignore browser-extension requests or other protocols
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        try {
            return await fetch(event.request);
        } catch (networkError) {
            console.warn('SW Fetch failed for:', event.request.url);
            // Return a fallback response for navigation requests to prevent "This site can't be reached"
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
            // Rethrow or return error response
            throw networkError;
        }
      } catch (error) {
        // Final fallback to prevent "Uncaught (in promise)" in console
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});
