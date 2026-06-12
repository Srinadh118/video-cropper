const CACHE_NAME = "video-cropper-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/favicon.ico",
  "/favicon-96x96.png",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/site.webmanifest"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event with Stale-While-Revalidate caching pattern
self.addEventListener("fetch", (event) => {
  // Bypass fetch interception on localhost/dev hosts to prevent HMR issues
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1" ||
    self.location.hostname.startsWith("192.168.")
  ) {
    return;
  }

  // Only intercept GET requests from the same origin
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background to update cache for next load
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {/* ignore network failure on background updates */});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
