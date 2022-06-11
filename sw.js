;
// ASIGNAR UN NOMBRE Y VERSION AL CACHE

const CACHE_NAME = 'v1_cache_pedidos';
urlsToCache = [ 
    './',
    './css/app.css',
    './css/bootstrap.min.css',
    'script.js',
    './img/icono1.png',
    './img/icono2.png',
]

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(async cache => {
            await cache.addAll(urlsToCache);
            return self.skipWaiting();
        })
        .catch(err => console.log('No se pudo registrar el cache', err))
    )
})

self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME]
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            if (res) {
                return res;
            } 
            
            return fetch(e.request);
            
        })
    )
})