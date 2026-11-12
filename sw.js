/* EASY QURAN — نور — Service Worker (offline first) */
const VERSION = 'noor-v1.0.2';
const CORE = [
  './', './index.html', './css/style.css?v=1.0.2', './js/app.js?v=1.0.2', './js/i18n.js?v=1.0.2',
  './data/quran.js', './data/tr/ru-kuliev.js',
  './fonts/amiri.ttf', './manifest.json',
  './icons/i192.png', './icons/i512.png', './icons/apple-touch-icon.png', './icons/maskable512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.all(
      CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))
    ))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* الشبكة أولاً للملفات الأساسية، والكاش احتياطياً — والعكس للترجمات */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !/everyayah\.com/.test(url.hostname)) return;
  if (/everyayah\.com/.test(url.hostname)) return;

  const isTranslation = /\/data\/tr\//.test(url.pathname);
  if (isTranslation) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => new Response('', { status: 504 })))
    );
    return;
  }

  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
