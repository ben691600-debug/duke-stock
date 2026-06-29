const CACHE_NAME = 'duke-stock-v193
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
  // skipWaiting supprimé - attendre le bouton 'Mettre à jour'
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Nécessaire pour que le SW contrôle la page et que l'install PWA fonctionne
});
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {cache: 'no-store'}).catch(() =>
      caches.match(event.request)
    )
  );
});
