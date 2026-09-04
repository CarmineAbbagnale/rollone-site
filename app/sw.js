// Service worker di RollOne (versione web installabile). Strategia "rete prima, cache come
// riserva": quando c'è connessione l'app è sempre quella pubblicata più di recente (esattamente
// come una pagina web normale, "il rilascio classico" richiesto), quando manca la connessione si
// serve l'ultima copia salvata, cosi' l'app resta utilizzabile anche offline dopo la prima visita.
// Il nome della cache include un numero di versione: cambiarlo alla prossima modifica sostanziale
// di questo file forza tutti i client a ripulire la cache vecchia (vedi "activate" sotto).
const CACHE_NAME = 'rollone-shell-v1';
const APP_SHELL = ['./', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./'))
      )
  );
});
