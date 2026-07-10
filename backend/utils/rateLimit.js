// Minimal in-memory rate limiter (per IP + endpoint, sliding window).
// Good enough for a single Node process; swap for a Redis-backed limiter
// when scaling to multiple instances.
const buckets = new Map()

function rateLimit({ windowMs = 5 * 60 * 1000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`
    const now = Date.now()

    const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
    if (hits.length >= max) {
      return res
        .status(429)
        .json({ error: 'Too many requests. Please try again later.' })
    }

    hits.push(now)
    buckets.set(key, hits)

    // Lazy cleanup so the map can't grow without bound.
    if (buckets.size > 10000) {
      for (const [k, v] of buckets) {
        if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
      }
    }

    next()
  }
}

module.exports = rateLimit
