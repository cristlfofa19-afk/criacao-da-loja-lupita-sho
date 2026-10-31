const CACHE_NAME = 'lupita-shopee-v2'
const APP_SHELL = ['/', '/icon.svg', '/apple-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// Only page navigations get an offline fallback. Streaming RSC payloads, API calls,
// Next.js assets and cross-origin requests go straight to the network so the SW never
// holds (and aborts) a streamed response the server is still writing.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || request.mode !== 'navigate') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
  event.respondWith(fetch(request).catch(() => caches.match('/')))
})
