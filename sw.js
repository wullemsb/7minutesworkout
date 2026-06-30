/* ============================================================
   Service Worker — 7 Minutes Workout PWA
   Implements a cache-first strategy for app shell resources.

   NOTE: All paths are relative so this works both at the root
   (https://example.com/) and in a GitHub Pages sub-path
   (https://user.github.io/repo-name/).
   ============================================================ */

const CACHE_NAME = '7min-workout-v1';

// Resolve URLs relative to this service worker's location so they
// work correctly whether the app is served from the root or a sub-path.
const BASE = new URL('./', self.location.href).href;

const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'css/style.css',
  BASE + 'js/exercises.js',
  BASE + 'js/audio.js',
  BASE + 'js/history.js',
  BASE + 'js/workout.js',
  BASE + 'js/app.js',
  BASE + 'icons/icon.svg'
];

// ── Install: pre-cache app shell ───────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first with network fallback ───────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache valid responses in the background without blocking the response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseToCache))
          .catch(() => {}); // ignore cache-write failures silently
        return response;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + 'index.html');
        }
      });
    })
  );
});
