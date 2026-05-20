const NodeCache = require('node-cache');

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 });

/**
 * Express middleware that caches responses by URL + query string.
 * Skips caching for non-GET requests.
 */
const cacheMiddleware = (ttl) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `${req.originalUrl}`;
  const cached = cache.get(key);

  if (cached !== undefined) {
    return res.json(cached);
  }

  // Monkey-patch res.json to store the response in cache before sending
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, data, ttl || CACHE_TTL);
    return originalJson(data);
  };

  next();
};

module.exports = { cache, cacheMiddleware };
