// Duke Stock Manager - Service Worker v3
const CACHE_NAME = 'duke-stock-v3';
const URLS_TO_CACHE = [
  '/duke-stock/',
  '/duke-stock/index.html',
  '/duke-stock/manifest.json',
  '/duke-stock/logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('gstatic') || url.includes('googleapis')) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (!response || response.status !== 200) return response;
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
