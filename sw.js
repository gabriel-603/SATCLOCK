const cacheName = 'study-timer-v1';
const staticAssets = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  // Add other assets you want to cache
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('fetch', e => {
  e.respondWith(cacheFirst(e.request));
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}
