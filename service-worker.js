const CACHE_NAME = 'placement-prep-v2-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-client@2'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.error('[ServiceWorker] Cache addAll error', err))
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network First, falling back to cache for app shell)
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or Supabase API requests for caching
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid HTTP responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request);
      })
  );
});
