/**
 * Service Worker for Edgtec-Trends
 * 
 * Implements network-first for API requests with cache fallback,
 * and cache-first for assets with network fallback.
 */

const CACHE_NAME = 'edgtec-trends-v1';
const API_CACHE_NAME = 'edgtec-api-v1';
const ASSET_CACHE_NAME = 'edgtec-assets-v1';

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// Asset file patterns for cache-first strategy
const ASSET_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.webp$/,
];

// Install: Precache assets
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Non-fatal: precache may fail in dev
        console.log('[SW] Precache skipped (dev mode)');
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== ASSET_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch: Implement caching strategies
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const { url } = request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests: network-first with cache fallback
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses (5 min TTL via headers)
          if (response.ok) {
            const cacheResponse = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached API response
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Assets (JS, CSS, fonts, images): cache-first with network fallback
  const isAsset = ASSET_PATTERNS.some((pattern) => pattern.test(url));
  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful asset responses
          if (response.ok) {
            const cacheResponse = response.clone();
            caches.open(ASSET_CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: network-first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cacheResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(fetch(request).catch(() => new Response('Offline', { status: 503 })));
});
