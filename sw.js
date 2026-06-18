// Duke Stock Manager - Service Worker v8 - NETWORK FIRST + activation automatique des mises à jour
const CACHE_NAME = 'duke-stock-v10';

// Installation : on active IMMÉDIATEMENT le nouveau SW dès qu'il est installé,
// pour que les mises à jour (correctifs de sync, etc.) s'appliquent automatiquement
// sans dépendre d'un clic utilisateur sur une bannière qui peut être manquée.
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Conservé pour compatibilité si la page envoie encore ce message.
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
