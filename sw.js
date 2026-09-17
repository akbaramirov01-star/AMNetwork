const CACHE = 'amnetwork-v31-hadith-static-ai';
// Must match QURAN_OFFLINE_CACHE in quran/index.html byte-for-byte — that
// page is the only writer of this bucket (a per-surah "save for offline"
// button). It is user data (surahs someone explicitly chose to keep) and
// must survive every site update, unlike the CACHE bucket above.
const QURAN_OFFLINE_CACHE = 'amn-quran-offline-v1';
const QURAN_OFFLINE_HOSTS = ['api.quran.com', 'everyayah.com'];
const STATIC = [
  '/',
  '/index.html',
  '/i18n-data.js',
  '/i18n-data.js?v=218ea40a32',
  '/logo.webp',
  '/favicon.svg?v=20260914',
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
  '/offline.html',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/live/',
  '/live/index.html',
  '/names/',
  '/names/index.html',
  '/quran/',
  '/quran/index.html',
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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== QURAN_OFFLINE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const reqUrl = new URL(e.request.url);
  if (reqUrl.origin !== self.location.origin) {
    if (QURAN_OFFLINE_HOSTS.includes(reqUrl.hostname)) {
      e.respondWith(
        caches.open(QURAN_OFFLINE_CACHE)
          .then(c => c.match(e.request))
          .then(hit => hit || fetch(e.request))
      );
    }
    // Never persist third-party API quotes or private API responses.
    return;
  }

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
        .catch(() => caches.match(e.request)
          .then(hit => hit || caches.match('/offline.html'))
          .then(hit => hit || caches.match('/')))
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

// ── Web Push ──
// Fires when the site is closed — the whole point of moving off the
// Notification API. Payload is whatever ai_scoring/push_send.py built.
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}
  const title = data.title || 'AM Network';
  e.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'amnetwork',
    data: { url: data.url || '/' },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/';
  // Focus an open tab if there is one rather than piling up new windows.
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
    for (const w of wins) {
      if (w.url.includes(target) && 'focus' in w) return w.focus();
    }
    return clients.openWindow(target);
  }));
});
