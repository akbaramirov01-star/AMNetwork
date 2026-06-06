const CACHE = 'am-network-v2';
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

  const req = e.request;
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  // Network-first for HTML pages so new deploys are always picked up.
  if (isHTML) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first for static assets (hashed filenames are immutable).
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res.ok && req.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
        }
        return res;
      });
      return cached || net;
    })
  );
});
