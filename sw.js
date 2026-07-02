const CACHE_NAME = 'duke-stock-v118';
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
  // NE PAS appeler skipWaiting() ici — le nouveau SW attend que l'utilisateur
  // clique sur "Mettre à jour", qui envoie le message SKIP_WAITING ci-dessous.
});
self.addEventListener('activate', event => {
  // Purger les anciens caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  // NE PAS appeler clients.claim() ici — cela forcerait le SW à prendre
  // le contrôle des onglets existants automatiquement, contournant le bouton.
  // La mise à jour est gérée exclusivement via le bouton "Mettre à jour".
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
