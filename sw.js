// Duke Stock Manager - Service Worker v5 - NETWORK FIRST + gestion de mise à jour propre
const CACHE_NAME = 'duke-stock-v5';

// Installation : on NE saute plus l'attente automatiquement.
// Le nouveau SW reste en "waiting" tant que l'utilisateur n'a pas validé la mise à jour
// dans l'application (bannière "Mise à jour disponible").
self.addEventListener('install', event => {
  // rien ici : on attend le message SKIP_WAITING envoyé par la page
});

// Permet à la page (index.html) de déclencher l'activation du nouveau SW
// quand l'utilisateur clique sur "Mettre à jour"
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log('Duke SW: suppression ancien cache', k);
          return caches.delete(k);
        }
      }))
    ).then(() => self.clients.claim()) // Prendre le contrôle immédiatement
  );
});

// STRATÉGIE RÉSEAU EN PRIORITÉ
// Toujours essayer le réseau d'abord, cache uniquement si hors ligne
self.addEventListener('fetch', event => {
  // Ignorer Firebase et APIs externes
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('gstatic') ||
      url.includes('googleapis') || url.includes('qrserver') ||
      url.includes('api.')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Réseau OK → mettre en cache ET retourner
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Réseau indisponible → utiliser le cache (mode hors ligne)
        return caches.match(event.request);
      })
  );
});
