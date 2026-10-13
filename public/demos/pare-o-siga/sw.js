/* PARE O SIGA · service worker: the game installs and plays without a connection.
   · The page: network first (an update arrives the next time it opens online), the saved copy after 3 s or offline.
   · The libraries, the font and the icons: saved at install, served from the phone (they never change: bump VERSION if one does).
   · Anything else of ours (MediaPipe, ~20 MB, only if someone uses the camera) and the CDNs: saved the first time they are used. */
const VERSION = 'v1';
const CACHE = 'pareosiga-' + VERSION;
const SHELL = [
  './', 'manifest.webmanifest', 'favicon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'vendor/three.module.min.js', 'vendor/cannon-es.js', 'vendor/archivo-latin.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('pareosiga-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const timeout = (ms, p) => new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('timeout')), ms); p.then(v => { clearTimeout(t); ok(v); }, e => { clearTimeout(t); ko(e); }); });

async function page(req) {
  const c = await caches.open(CACHE);
  try {
    const res = await timeout(3000, fetch(req));
    if (res.ok) c.put('./', res.clone()); // one copy of the page, whatever the ?query (?modo=movil, ?sencillo…)
    return res;
  } catch (e) {
    return (await c.match('./')) || Response.error();
  }
}

async function saved(req) {
  const c = await caches.open(CACHE), hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') c.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' && url.origin === location.origin) return e.respondWith(page(req));
  const ours = url.origin === location.origin && url.pathname.startsWith(new URL('./', location.href).pathname);
  const cdn = /^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|storage\.googleapis\.com)$/.test(url.hostname);
  if (ours || cdn) e.respondWith(saved(req));
});
