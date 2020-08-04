const STATIC_CACHE_NAME = "site-static-v6";
const DYNAMIC_CACHE_NAME = "site-dynamic-v5";
const ASSETS = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/css/styles.css",
  "/img/dish.png",
  "/img/icons/icon-72x72.png",
  "/pages/fallback.html",
  "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v54/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
];

// Limit Cache size
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// Install Event
self.addEventListener("install", (evt) => {
  console.log("service worker installed ");
  evt.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener("activate", (evt) => {
  console.log("service worker activated ");
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event
self.addEventListener("fetch", (evt) => {
  console.log("fetch event ");
  if (evt.request.url.indexOf("firestore.googleapis.com") === -1) {
    evt.respondWith(
      caches
        .match(evt.request)
        .then((cacheRes) => {
          return (
            cacheRes ||
            fetch(evt.request).then((fetchRes) => {
              return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(evt.request.url, fetchRes.clone());
                limitCacheSize(DYNAMIC_CACHE_NAME, 15);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          if (evt.request.url.indexOf(".html") > -1) {
            return caches.match("/pages/fallback.html");
          }
        })
    );
  }
});
