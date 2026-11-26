// Service Worker von KrautKompass. Vorlage: Der Build (scripts/pwa/plugin.ts) setzt Version und Dateiliste ein.
//  - App-Hülle und Build-Dateien liegen offline bereit, dadurch startet die App schnell und auch ohne Netz.
//  - Seitenaufrufe: zuerst Netz, offline die gespeicherte App-Hülle.
//  - /api wird NIE gespeichert (private Daten, Sitzung). Produktbilder (/media) werden zwischengespeichert.
//  - Ein Update wird erst aktiv, wenn die App es anfordert (Meldung „Neue Version“ → SKIP_WAITING).
const VERSION = '__VERSION__';
const PRECACHE = [] /* __PRECACHE__ */;
const APP_CACHE = `kk-app-${VERSION}`;
const MEDIA_CACHE = 'kk-media';
const MEDIA_LIMIT = 300;

const scope = new URL(self.registration.scope);
const shellUrl = scope.href;
const inScope = (path) => scope.pathname + path;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll([shellUrl, ...PRECACHE.map((file) => new URL(file, scope).href)])),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('kk-app-') && key !== APP_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirstShell(request) {
  try {
    const response = await fetch(request);
    // Nur echte App-Seiten als Hülle speichern (alle Routen liefern dieselbe index.html)
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      (await caches.open(APP_CACHE)).put(shellUrl, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(shellUrl)) ?? Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

async function mediaCache(request) {
  const response = await cacheFirst(request, MEDIA_CACHE);
  // Älteste Bilder verwerfen, damit der Speicher auf dem Handy klein bleibt
  const cache = await caches.open(MEDIA_CACHE);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MEDIA_LIMIT)).map((key) => cache.delete(key)));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.startsWith(inScope('api/'))) return;

  if (url.pathname.startsWith(inScope('media/'))) event.respondWith(mediaCache(request));
  else if (url.pathname.startsWith(inScope('assets/'))) event.respondWith(cacheFirst(request, APP_CACHE));
  else if (request.mode === 'navigate') event.respondWith(networkFirstShell(request));
});
