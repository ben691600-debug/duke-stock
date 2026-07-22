const CACHE_NAME = 'duke-stock-v194';
// index.html n'est JAMAIS mis en cache - toujours servi depuis le réseau
// Seuls les assets statiques qui ne changent pas sont cachés
const STATIC_ASSETS = [
  '/duke-stock/manifest.json',
  '/duke-stock/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // skipWaiting OK ici : on ne cache pas HTML, donc pas de risque de version figée
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
  const url = new URL(event.request.url);
  const path = url.pathname;

  // index.html et racine : TOUJOURS depuis le réseau, jamais depuis le cache
  if(path === '/duke-stock/' || path === '/duke-stock/index.html' || path.endsWith('/')){
    event.respondWith(
      fetch(event.request, {cache: 'no-store'}).catch(() =>
        new Response('App hors ligne. Reconnectez-vous.', {status: 503})
      )
    );
    return;
  }

  // Assets statiques (logo, manifest) : cache en priorité
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request, {cache: 'no-store'});
    })
  );
});

// Cache busted: 20260722131500
