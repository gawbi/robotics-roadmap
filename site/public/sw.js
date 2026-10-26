// Lets the site install as an app and keeps the map and the lessons already opened readable offline. Pages are fetched
// from the network first, so a new deploy shows at once; the cache only answers when the network does not. Requests to
// other origins (GitHub's API, fonts) pass through untouched.
const CACHE = 'roadmap-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE)
          await cache.put(request, response.clone())
        }
        return response
      } catch {
        const cached = (await caches.match(request)) ?? (request.mode === 'navigate' ? await caches.match('./') : undefined)
        return cached ?? Response.error()
      }
    })(),
  )
})
