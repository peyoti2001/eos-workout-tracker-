// Simple cache-first service worker for offline use
const CACHE_NAME = "eos-workout-tracker-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    const req = event.request;
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if(cached) return cached;
    try{
      const fresh = await fetch(req);
      if(req.method === "GET" && fresh && fresh.status === 200){
        cache.put(req, fresh.clone());
      }
      return fresh;
    }catch{
      // fallback to cached index for navigation
      if(req.mode === "navigate"){
        return cache.match("./index.html");
      }
      throw;
    }
  })());
});
