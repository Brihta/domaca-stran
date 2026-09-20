const CACHE = 'zaslon-v6';
const ASSETS = [
  './',
  './index.html',
  './zaslon.html',
  './manifest.json',
  './icon.svg',
  './assets/logo-os-sempeter.png',
  './css/zaslon.css',
  './js/razredi.js',
  './js/jedro.js',
  './js/skupine.js',
  './js/pripomocki.js',
  './js/zagon.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
