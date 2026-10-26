// Lets the site install as an app and keeps the map and the lessons already opened readable offline. Pages are fetched
// from the network first, so a new deploy shows at once; the cache only answers when the network does not. Requests to
// other origins (GitHub's API, fonts) and media streams pass through untouched.
const CACHE = 'roadmap-v2'

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
  // a video is fetched in ranges (206 Partial Content), which the cache refuses to store; leave media to the browser
  if (request.headers.has('range') || /\.(mp4|webm|mp3|m4a|wav)$/i.test(new URL(request.url).pathname)) return
  event.respondWith(
    (async () => {
      let response
      try {
        response = await fetch(request)
      } catch {
        const cached = (await caches.match(request)) ?? (request.mode === 'navigate' ? await caches.match('./') : undefined)
        return cached ?? Response.error()
      }
      // only whole responses are kept, and a failure to keep one never costs the page its response
      if (response.status === 200) {
        try {
          const cache = await caches.open(CACHE)
          await cache.put(request, response.clone())
        } catch {
          // storage full or refused: serve without caching
        }
      }
      return response
    })(),
  )
})
