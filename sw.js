const CACHE_NAME = 'duke-stock-v156
const urlsToCache = [
  '/duke-stock/',
  '/duke-stock/index.html',
  '/duke-stock/manifest.json',
  '/duke-stock/logo.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {cache: 'no-store'}).catch(() =>
      caches.match(event.request)
    )
  );
});
