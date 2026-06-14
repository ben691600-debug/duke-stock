// Duke Stock Manager - Service Worker v4 - NETWORK FIRST
const CACHE_NAME = 'duke-stock-v4';

// Installation : vider tous les anciens caches immédiatement
self.addEventListener('install', event => {
  self.skipWaiting(); // Activer immédiatement sans attendre
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        console.log('Duke SW: suppression cache', k);
        return caches.delete(k);
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
