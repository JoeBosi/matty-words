// Service worker — Allenamento all'ascolto (PWA)
// - Precarica la "shell" dell'app per l'uso offline.
// - Mette in cache a runtime i font Google e le registrazioni umane (Lingua Libre),
//   così le parole già ascoltate funzionano anche senza rete.
// - NON intercetta le richieste POST (es. /api/tts): vanno sempre in rete; se offline,
//   l'app ripiega da sola sulla voce del dispositivo.

const VERSION = "v28";
const SHELL = "shell-" + VERSION;
const RUNTIME = "runtime-" + VERSION;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/prova-voci.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  // suoni reali di f0 (registrazioni CC): disponibili anche offline
  "/sounds/moo.mp3",
  "/sounds/horn.mp3",
  "/sounds/bell.mp3",
  "/sounds/drum.mp3",
  "/sounds/birds.mp3",
  "/sounds/whistle.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function cacheFirst(req, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      })
    )
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET: le POST (es. /api/tts) passano direttamente alla rete.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigazione: prova la rete, poi ripiega sulla shell in cache (offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Font Google: cache-first.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // Registrazioni umane (Wikimedia): cache-first, per riascolto offline.
  if (url.hostname === "upload.wikimedia.org") {
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // Stessa origine (file statici): cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL));
    return;
  }
});
