const CACHE = 'zaslon-v20';

/** Lupina aplikacije. */
const ASSETS = [
  './',
  './index.html',
  './skupine.html',
  './manifest.json',
  './icon.svg',
  './assets/logo-os-sempeter.png',
  './css/zaslon.css',
  './js/razredi.js',
  './js/jedro.js',
  './js/skupine.js',
  './js/pripomocki.js',
  './js/orodja.js',
  './js/pustolovscina.js',
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
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const tuja = url.origin !== self.location.origin;

  /* Slike in pisave se ne spreminjajo — najprej predpomnilnik.
     Koda aplikacije (html/css/js) pa se: tam gre najprej na mrežo,
     sicer vsak popravek obvisi, dokler nekdo ne poveča CACHE. */
  const nespremenljivo = tuja || /\.(svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);

  e.respondWith(nespremenljivo ? najprejPredpomnilnik(e.request) : najprejMreza(e.request));
});

async function najprejPredpomnilnik(zahteva) {
  const zadetek = await caches.match(zahteva);
  if (zadetek) return zadetek;
  const odziv = await fetch(zahteva);
  if (odziv.ok) (await caches.open(CACHE)).put(zahteva, odziv.clone());
  return odziv;
}

async function najprejMreza(zahteva) {
  try {
    const odziv = await fetch(zahteva);
    if (odziv.ok) (await caches.open(CACHE)).put(zahteva, odziv.clone());
    return odziv;
  } catch (e) {
    // brez povezave: karkoli imamo shranjenega, sicer začetna stran
    return (await caches.match(zahteva)) || (await caches.match('./')) || Response.error();
  }
}
