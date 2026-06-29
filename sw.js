const CACHE_NAME = 'duke-stock-v194
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
  // skipWaiting seulement si c'est la première installation (pas de clients existants)
  event.waitUntil(
    self.clients.matchAll({type:'window'}).then(function(clients){
      if(clients.length === 0){
        // Première installation : prendre le contrôle immédiatement pour activer PWA
        self.skipWaiting();
      }
      // Mise à jour : attendre le bouton - skipWaiting déclenché par message
    })
  );
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
