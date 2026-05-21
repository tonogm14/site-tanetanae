const NodeCache = require('node-cache');

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300', 10);
// Hard TTL long enough that stale data survives between revalidations.
// Revalidators refresh data well before this expires.
const cache = new NodeCache({ checkperiod: 30 });

// Registry: path → async function that returns fresh data
const revalidators = new Map();
const revalidating  = new Set();
// In-flight coalescing: si dos requests llegan al mismo tiempo con cache miss,
// el segundo espera el resultado del primero en lugar de ir a WordPress también.
const inFlight = new Map();

function registerRevalidator(path, fn) {
  revalidators.set(path, fn);
}

function setCache(key, data, ttl) {
  cache.set(key, data, ttl || CACHE_TTL);
}

/**
 * Middleware de caché con stale-while-revalidate.
 *
 * - Cache hit fresco: respuesta instantánea.
 * - Cache hit stale (último 25% del TTL): respuesta instantánea + refresh en background.
 * - Cache miss: espera la respuesta y la guarda.
 */
const cacheMiddleware = (ttl) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key  = req.originalUrl;
  const data = cache.get(key);

  if (data !== undefined) {
    // Comprobar si estamos en la ventana stale (último 25% del TTL)
    const expiresAt  = cache.getTtl(key);      // timestamp ms, o undefined
    const now        = Date.now();
    const isStale    = expiresAt && (expiresAt - now) < ttl * 1000 * 0.25;
    const revalidate = revalidators.get(req.path);

    if (isStale && revalidate && !revalidating.has(key)) {
      revalidating.add(key);
      cache.ttl(key, ttl); // extender TTL para evitar que otro request espere
      revalidate()
        .then(fresh => { cache.set(key, fresh, ttl); })
        .catch(() => {})
        .finally(() => revalidating.delete(key));
    }

    return res.json(data);
  }

  // Cache miss — si ya hay un request en vuelo para esta misma key, esperarlo
  if (inFlight.has(key)) {
    return inFlight.get(key).then(payload => res.json(payload)).catch(() => next());
  }

  // Primer request para esta key: monkey-patch res.json, registrar promesa en vuelo
  let resolveInflight;
  const inflightPromise = new Promise(r => { resolveInflight = r; });
  inFlight.set(key, inflightPromise);

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    cache.set(key, payload, ttl || CACHE_TTL);
    inFlight.delete(key);
    resolveInflight(payload);
    return originalJson(payload);
  };

  next();
};

module.exports = { cache, cacheMiddleware, registerRevalidator, setCache };
