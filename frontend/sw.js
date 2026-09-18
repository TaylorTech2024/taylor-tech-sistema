const CACHE_NAME = 'taylor-tech-cache-v4';
const ASSETS_TO_CACHE = [
  '/index.html',
  '/assets/css/base.css',
  '/assets/css/client.css',
  '/assets/js/api.js',
  '/assets/js/client.js',
  '/assets/icons/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first pra tudo (API e estaticos): sempre busca a versao mais
// nova quando tem internet, e cai pro cache soh se estiver offline. Assim
// uma atualizacao de codigo chega pra quem ja instalou o app sem depender
// de trocar o nome do cache a cada deploy.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copia = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Notificacoes push (nova OS entrando, etc).
self.addEventListener('push', (event) => {
  let dados = {};
  try { dados = event.data ? event.data.json() : {}; } catch (_) { /* payload nao era JSON */ }

  event.waitUntil(
    self.registration.showNotification(dados.title || 'Taylor Tech', {
      body: dados.body || '',
      icon: '/assets/icons/logo.png',
      badge: '/assets/icons/logo.png',
      data: { url: dados.url || '/admin.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/admin.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
