const CACHE = 'am-network-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/ai_scoring/',
  '/ai_scoring/index.html',
  '/og-image.jpg',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
      return cached || net;
    })
  );
});
