/**
 * Graceful-optional Redis cache (cache-aside pattern).
 *
 * - Activates ONLY when REDIS_URL is set.
 * - If Redis is unreachable or errors, every operation degrades safely:
 *   reads miss, writes are skipped, and getOrSet always runs the loader.
 *   The backend never breaks because of the cache.
 */
const Redis = require('ioredis')

let client = null
let ready = false

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
  })

  client.on('ready', () => {
    ready = true
    console.log('✅ Redis cache connected')
  })
  client.on('end', () => { ready = false })
  client.on('error', (err) => {
    // Avoid log spam: only note the first failure
    if (ready) console.error('Redis error:', err.message)
    ready = false
  })

  client.connect().catch((err) => {
    console.warn(`⚠️  Redis unavailable (caching disabled): ${err.message}`)
  })
} else {
  console.log('ℹ️  REDIS_URL not set — caching disabled (running without cache)')
}

const isReady = () => Boolean(client) && ready

/**
 * Cache-aside: return cached value for `key`, otherwise run `loader`,
 * cache its result for `ttlSeconds`, and return it.
 */
async function getOrSet(key, ttlSeconds, loader) {
  if (isReady()) {
    try {
      const cached = await client.get(key)
      if (cached !== null) return JSON.parse(cached)
    } catch {
      /* fall through to loader */
    }
  }

  const fresh = await loader()

  if (isReady() && fresh !== undefined && fresh !== null) {
    // Fire-and-forget write; never block the response on caching
    client
      .set(key, JSON.stringify(fresh), 'EX', ttlSeconds)
      .catch(() => {})
  }

  return fresh
}

/** Delete one or more exact keys. */
async function del(...keys) {
  if (!isReady() || keys.length === 0) return
  try {
    await client.del(...keys)
  } catch {
    /* ignore */
  }
}

/** Delete every key matching `prefix*` using a non-blocking SCAN. */
async function delByPrefix(prefix) {
  if (!isReady()) return
  try {
    let cursor = '0'
    do {
      const [next, found] = await client.scan(
        cursor, 'MATCH', `${prefix}*`, 'COUNT', 100
      )
      cursor = next
      if (found.length) await client.del(...found)
    } while (cursor !== '0')
  } catch {
    /* ignore */
  }
}

module.exports = { cache: { getOrSet, del, delByPrefix, isReady }, redisClient: client }
