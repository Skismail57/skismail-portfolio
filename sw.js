/* =============================================================================
   Portfolio Service Worker - Offline Support
   -----------------------------------------------------------------------------
   This service worker provides offline support for the entire portfolio site.
   When network is down, it serves the unplugged 404 page.
   ========================================================================== */

const CACHE_NAME = 'portfolio-offline-v1';
const UNPLUGGED_CACHE = 'unplugged-assets-v1';

// Cache the unplugged page and assets
const UNPLUGGED_ASSETS = [
  '/unplugged-404/',
  '/unplugged-404/index.html',
  '/unplugged-404/style.css',
  '/unplugged-404/script.js',
  '/unplugged-404/fonts/Geist-Variable.woff2',
  '/unplugged-404/fonts/GeistMono-Variable.woff2',
];

// Install event - cache unplugged assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(UNPLUGGED_CACHE).then((cache) => {
      return Promise.all(UNPLUGGED_ASSETS.map((url) => {
        return fetch(url).then((response) => {
          if (response.ok) {
            return cache.put(url, response.clone());
          }
        }));
      }));
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== UNPLUGGED_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle offline scenarios
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      // If not in cache, try network
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed - serve unplugged page for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/unplugged-404/index.html').then((unpluggedResponse) => {
            if (unpluggedResponse) {
              // Inject offline flag
              return unpluggedResponse.text().then((html) => {
                const modifiedHtml = html.replace('<html', '<html data-offline="true"');
                return new Response(modifiedHtml, {
                  status: 200,
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            });
          }
        }
        // Return offline error for other requests
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
