// Duke Stock Manager - Service Worker v8 - CACHE FIRST avec détection de mise à jour
const CACHE_NAME = 'duke-stock-v87';
const FILES_TO_CACHE = ['/', '/index.html', '/manifest.json', '/logo.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)).catch(() => {})
  );
  // NE PAS skipWaiting automatiquement — l'utilisateur doit valider
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('gstatic') ||
      url.includes('googleapis') || url.includes('qrserver') ||
      url.includes('api.') || url.includes('cdnjs')) return;

  if (url.endsWith('/') || url.endsWith('/index.html') || url.includes('index.html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(response => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
