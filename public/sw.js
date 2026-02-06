const CACHE_NAME = 'financas-v4'; // Nome do cache atualizado para forçar a atualização
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache during install:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new service worker (', CACHE_NAME, ')');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Adiciona uma condição para ignorar requisições do ambiente de desenvolvimento do Vite
  // e também para garantir que apenas requisições da mesma origem sejam interceptadas.
  if (
    event.request.url.includes('@vite/client') ||
    event.request.url.includes('@react-refresh') ||
    event.request.url.includes('/src/') || // Ignora arquivos .tsx do src/
    !event.request.url.startsWith(self.location.origin) // Ignora requisições de outras origens
  ) {
    return; // Deixa o navegador lidar com essas requisições diretamente
  }

  // Para HTML e scripts principais, tente a rede primeiro, depois o cache
  if (event.request.mode === 'navigate' || event.request.destination === 'script' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se a rede for bem-sucedida, cacheie e retorne
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Se a rede falhar, tente servir do cache
          console.log('[Service Worker] Network failed, serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
  } else {
    // Para outros assets (imagens, CSS, etc.), use cache primeiro, depois a rede
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          // Se não estiver no cache, tenta buscar na rede e cachear
          return fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }).catch(error => {
            console.error('[Service Worker] Fetch failed for:', event.request.url, error);
            // Pode-se retornar uma página offline aqui se for um recurso crítico
            return new Response('Offline content not available', { status: 503, statusText: 'Service Unavailable' });
          });
        })
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event.data.text());
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Finanças',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Finanças', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});