const CACHE_NAME = 'yara-sport-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-72x72.png',
    '/icon-96x96.png',
    '/icon-128x128.png',
    '/icon-144x144.png',
    '/icon-152x152.png',
    '/icon-192x192.png',
    '/icon-384x384.png',
    '/icon-512x512.png',
    '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            return self.skipWaiting();
        }).catch((err) => {
            console.warn('[SW] Cache addAll failed:', err);
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - network-first strategy for dynamic content, cache-first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (except fonts/CDNs)
    if (url.origin !== self.location.origin) {
        // Allow fonts and critical CDNs
        if (url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com') ||
            url.hostname.includes('cdnjs.cloudflare.com') ||
            url.hostname.includes('gstatic.com')) {
            // Cache fonts for offline use
            event.respondWith(
                caches.match(request).then((cached) => {
                    if (cached) return cached;
                    return fetch(request).then((response) => {
                        if (response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, clone);
                            });
                        }
                        return response;
                    }).catch(() => cached);
                })
            );
        }
        return;
    }

    // For static assets - cache first
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) {
                    // Return cached but also update in background
                    fetch(request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response);
                            });
                        }
                    }).catch(() => {});
                    return cached;
                }
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                }).catch(() => {
                    // Fallback for HTML pages
                    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
                        return caches.match('/index.html');
                    }
                });
            })
        );
        return;
    }

    // For everything else - network first with cache fallback
    event.respondWith(
        fetch(request).then((response) => {
            if (response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, clone);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(request).then((cached) => {
                if (cached) return cached;
                // If HTML request fails, return index.html for SPA behavior
                if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
                return new Response('Offline - No cached content available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[SW] Background sync triggered');
    }
});

// Push notifications support
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || 'Yara Sport', {
                body: data.body || 'New update available!',
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                tag: data.tag || 'yara-sport',
                requireInteraction: false,
                data: data
            })
        );
    }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message from main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
