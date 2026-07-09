// Kurd TV Service Worker — Real App PWA
// Version: v1

const CACHE_NAME = 'kurd-tv-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './favicon.ico'
];

// ===================== INSTALL =====================
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Kurd TV SW] Caching app shell...');
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('[Kurd TV SW] Precache failed:', err);
    })
  );
});

// ===================== ACTIVATE =====================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Kurd TV SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[Kurd TV SW] Activated and controlling clients');
      return self.clients.claim();
    })
  );
});

// ===================== STREAMING BYPASS =====================
function isStreamingRequest(request, url) {
  const pathname = url.pathname.toLowerCase();
  const accept = request.headers.get('Accept') || '';

  // File extensions used for live streaming
  const streamExtensions = /\.(m3u8|ts|mp4|m4s|aac|ac3|webm|mkv|mov|mp2t|m4a|m4v|f4v|f4a|f4m|3gp|3g2|ogv|ogg)$/i;

  // Check extension
  if (streamExtensions.test(pathname)) return true;

  // Check MIME type hints
  if (accept.includes('application/vnd.apple.mpegurl')) return true;
  if (accept.includes('application/x-mpegurl')) return true;
  if (accept.includes('video/mp2t')) return true;
  if (accept.includes('video/')) return true;
  if (accept.includes('audio/')) return true;

  // Check destination
  if (request.destination === 'media') return true;
  if (request.destination === 'video') return true;
  if (request.destination === 'audio') return true;

  // Check for known streaming / proxy / CDN host patterns
  const host = url.hostname.toLowerCase();
  const streamHosts = [
    'stream', 'cdn', 'hls', 'live', 'video', 'media', 'chunk',
    'm3u8', 'ts', 'playlist', 'segment', 'manifest',
    'workers.dev', 'cloudfront', 'cloudflare', 'herokuapp',
    'streamhostingcdn', 'bozztv', 'adabmedia'
  ];
  if (streamHosts.some(h => host.includes(h))) return true;

  // Check for HLS.js internal fetch patterns (level/fragment requests)
  if (pathname.includes('/level') || pathname.includes('/fragment')) return true;

  return false;
}

// ===================== FETCH =====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ---- BYPASS: Live streaming traffic NEVER cached ----
  if (isStreamingRequest(request, url)) {
    // Network-only: do not intercept at all
    return;
  }

  // ---- STRATEGY: Stale-While-Revalidate for static assets ----
  const isStaticAsset = (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest'
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[Kurd TV SW] Network fetch failed, serving cache:', err);
          return cachedResponse;
        });

        // Return cached immediately, update in background
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // ---- DEFAULT: Network first, cache fallback ----
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
