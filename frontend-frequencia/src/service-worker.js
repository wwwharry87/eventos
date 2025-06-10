/* eslint-disable no-restricted-globals, no-undef */
const APP_VERSION = '2.0.1'; // ATUALIZE SEMPRE QUE FIZER DEPLOY
const CACHE_NAME = `app-cache-${APP_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-cache-${APP_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forçar ativação imediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.chunk.js',
        '/static/css/main.chunk.css',
        '/manifest.json'
      ]))
  );
});

// Instalação - Pré-cache dos assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-caching de assets');
        const cacheUrls = WB_MANIFEST.map((entry) => entry.url);
        return cache.addAll(cacheUrls);
      })
      .then(() => self.skipWaiting())
  );
});

// Estratégia de cache: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET e URLs especiais
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('chrome-extension://') ||
    event.request.url.includes('sockjs-node')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Sempre buscar na rede para atualizar o cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Atualizar cache apenas para respostas válidas
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      });

      // Retornar cache se existir, enquanto busca na rede
      return cachedResponse || fetchPromise;
    })
  );
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});