/* EASY QURAN — القرآن الكريم — Service Worker
   أوف لاين: النص والترجمة الروسية والخط والأيقونات محفوظة مع التطبيق.
   الشبكة أولاً للكود (بمهلة ٤ ثوانٍ) حتى تظهر التحديثات، والكاش احتياطياً. */
const VERSION = 'quran-v1.1.0';
const CORE = [
  './', './index.html',
  './css/style.css?v=1.1.0',
  './js/i18n.js?v=1.1.0',
  './js/app.js?v=1.1.0',
  './data/quran.js?v=1.1.0',
  './data/tr_index.json',
  './data/tr/ru-kuliev.js',
  './fonts/amiri.ttf',
  './manifest.json',
  './icons/i192.png', './icons/i512.png',
  './icons/apple-touch-icon.png', './icons/maskable512.png'
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

function timedFetch(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req).then((res) => { clearTimeout(timer); resolve(res); },
                    (err) => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // الصوت والتلاوة تحتاج إنترنت دائماً — لا نتدخل
  if (url.origin !== location.origin) return;

  // الترجمات: الكاش أولاً (تشغيل فوري وأوف لاين)، وتُحمّل مرة واحدة
  if (/\/data\/tr\//.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then((h) => h || new Response('', { status: 504 }))))
    );
    return;
  }

  // الكود والواجهة: الشبكة أولاً بمهلة قصيرة، وإلا الكاش
  e.respondWith(
    timedFetch(req, 4000)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req)
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : null))
        .then((r) => r || new Response('', { status: 504 })))
  );
});
