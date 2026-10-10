/* Cache static teaching resources only. Never cache Firebase or account data. */
const VERSION = "ground-static-v3";
const base = new URL("./", self.location.href);
const files = [
  "index.html",
  "css/style.css",
  "js/database.js",
  "js/player.js",
  "js/app.js",
  "js/firebase-config.js",
  "js/cloud-progress.js",
  "js/cloud-catalog.js",
  "js/progress-engine.js",
  "js/firestore-progress.js",
  "js/auth.js",
  "js/cloud-database.js",
  "js/firebase-sdk.js",
  "images/mascot.png",
  "images/mascot-head.png",
  "images/campbell/chapter2/page-47.webp",
  "images/campbell/chapter2/page-48.webp",
];
const urls = new Set(files.map((file) => new URL(file, base).href));
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll([...urls]))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("ground-static-") && key !== VERSION,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== base.origin) return;
  const path = url.pathname.slice(base.pathname.length);
  if (
    !urls.has(url.origin + url.pathname) &&
    path !== "" &&
    !/^materials\/grade(?:7|8|9|10|11)\/[a-z0-9-]+\.pdf$/.test(path)
  )
    return;
  // Normalize only static URLs, so navigation with an OAuth query never stores tokens.
  const key =
    path === "" ? new URL("index.html", base).href : url.origin + url.pathname;
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(VERSION);
          await cache.put(key, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(key);
        return (
          cached ||
          new Response(
            "Материал ещё не сохранён на этом устройстве. Открой его при подключении к интернету.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            },
          )
        );
      }),
  );
});
