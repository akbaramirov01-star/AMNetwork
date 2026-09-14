const CACHE = 'amnetwork-v20-hardening';
const STATIC = [
  '/',
  '/index.html',
  '/i18n-data.js',
  '/i18n-data.js?v=ce8e9a2b56',
  '/logo.webp',
  '/favicon.svg?v=20260911',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/zakat/currency.js?v=20260905',
  '/apply/review.js?v=20260905',
  '/academy/progress-transfer.js?v=20260905',
  '/updates/',
  '/updates/index.html',
  '/zakat/',
  '/zakat/metal-prices.js?v=20260903',
  '/zakat/index.html',
  '/ai_scoring/',
  '/ai_scoring/index.html',
  '/investors/',
  '/investors/index.html',
  '/apply/',
  '/apply/index.html',
  '/academy/',
  '/academy/index.html',
  '/privacy/',
  '/privacy/index.html',
  '/terms/',
  '/terms/index.html',
  '/faq/',
  '/faq/index.html',
  '/team/',
  '/team/index.html',
  '/roadmap/',
  '/roadmap/index.html',
  '/tasbeeh/',
  '/tasbeeh/index.html',
  '/calendar/',
  '/calendar/index.html',
  '/qibla/',
  '/qibla/index.html',
  '/prayer-times/',
  '/prayer-times/index.html',
  '/hadith/',
  '/hadith/index.html',
  '/dua/',
  '/dua/index.html',
  '/live/',
  '/live/index.html',
  '/names/',
  '/names/index.html',
];

self.addEventListener('install', e => {
  // Cached one by one rather than with addAll(): addAll is all-or-nothing, so
  // a single 404 anywhere in this list (a renamed page, a stale ?v= hash)
  // silently aborts the install and the site loses offline support entirely,
  // with nothing to show for it. A missing entry should cost that one entry.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(STATIC.map(url => c.add(url))).then(results => {
        const failed = results
          .map((r, i) => (r.status === 'rejected' ? STATIC[i] : null))
          .filter(Boolean);
        if (failed.length) console.warn('[sw] not precached:', failed);
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Never persist third-party API quotes or private API responses.
  if (new URL(e.request.url).origin !== self.location.origin) return;

  // Network-first для HTML-страниц — всегда свежий контент
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copy = r.clone();
          // Storage can be full or blocked (private mode); a failed write
          // must not surface as an unhandled rejection.
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return r;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/')))
    );
    return;
  }

  // Cache-first для статики (иконки, шрифты, картинки)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(e.request, r.clone())).catch(() => {});
        }
        return r;
      });
    })
  );
});
