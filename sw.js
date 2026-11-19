// Yolo Nest service worker.
// Caches ONLY the app shell. Supabase API/auth calls are never cached
// (tenant data is private and must always be fresh).
const VERSION = 'v2';                       // bump this on every deploy
const CACHE = 'yolonest-shell-' + VERSION;
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/supabase.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
// Export libraries (Excel/PDF). Cached if present; a missing file will not break the install.
const OPTIONAL = [
  './vendor/exceljs.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(SHELL).then(() => Promise.all(OPTIONAL.map(u => c.add(u).catch(() => { }))))
  ));
  // no skipWaiting here: the page decides when to apply updates
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('yolonest-shell-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // Supabase etc. -> straight to network

  // Page loads (incl. ?changes=... links): network first, fall back to cached shell
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache first, then network (and remember it)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});