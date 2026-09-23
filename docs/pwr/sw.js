const CACHE_NAME = "pwr-contact-v10";

const FILES = [
  "/pwr/",
  "/pwr/manifest.webmanifest",
  "/pwr/pwr-icon-192.png",
  "/pwr/pwr-icon-512.png",
  "/pwr/pwr.vcf",
  "/pwr/profile.jpg",
  "/pwr/vcard-url.png",
  "/pwr/vcard.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("pwr-contact-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});