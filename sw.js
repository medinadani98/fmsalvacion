const CACHE_NAME = 'fm-salvacion-v1';

// Archivos básicos de la interfaz que sí se pueden guardar en caché
const ASSETS = [
  '/',
  '/favicon.ico'
];

// Instalación del Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de red inteligente (Ignora el streaming de audio para evitar cortes)
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // EXCLUSIÓN CRUCIAL: Si la petición es el streaming de audio (puerto 8104 o formato icecast/shoutcast), va directo por internet
  if (url.includes(':8104') || url.includes('/stream') || e.request.destination === 'audio') {
    return e.respondWith(fetch(e.request));
  }

  // Para el resto del sitio web normal, intenta cargar desde internet y si falla usa la caché
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
