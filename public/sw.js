// Minimal service worker for Mkulima Pro PWA.
// Important: do NOT cache HTML navigations cache-first (it can serve stale pages after deploys and break interactivity).
const CACHE_NAME = 'mkulima-pro-static-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

function isCacheableAsset(url) {
  if (url.origin !== self.location.origin) return false
  if (url.pathname.startsWith('/_next/static/')) return true
  return /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$/i.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  // Always go to network for page navigations (prevents stale Server Action IDs and "unclickable" UI after deploys).
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req))
    return
  }

  const url = new URL(req.url)
  if (!isCacheableAsset(url)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req)
      if (cached) return cached
      const res = await fetch(req)
      if (res.ok) cache.put(req, res.clone())
      return res
    })
  )
})
