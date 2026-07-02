const CACHE_NAME = 'duke-stock-v119';
const urlsToCache = [
  '/duke-stock/',
  '/duke-stock/index.html',
  '/duke-stock/manifest.json',
  '/duke-stock/logo.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // cache:'reload' bypass le cache HTTP — garantit les fichiers les plus récents
      return Promise.all(urlsToCache.map(url =>
        fetch(url, {cache:'reload'})
          .then(resp => cache.put(url, resp))
          .catch(() => cache.add(url))
      ));
    })
  );
  // skipWaiting() uniquement via le bouton "Mettre à jour"
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  // clients.claim() nécessaire : dès que le bouton active le nouveau SW,
  // il prend le contrôle immédiatement → controllerchange → rechargement
  self.clients.claim();
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
