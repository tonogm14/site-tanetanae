import { useState, useEffect, useRef } from 'react';
import { fetchPosts } from '../api/wordpress.js';

// TTL más corto que useNotasByCategory porque este feed es cronológico global
// y puede actualizarse con más frecuencia.
const memCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000;

function getCached(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return entry;
}

/**
 * Carga el feed cronológico global de todas las notas publicadas,
 * sin filtrar por categoría. Útil para la sección "Más Recientes".
 *
 * @param {number} limit - Notas por página (por defecto 12).
 * @param {number} page  - Número de página (por defecto 1).
 * @returns {{ posts, total, totalPages, loading, error }}
 */
export function useNotasRecientes(limit = 12, page = 1) {
  const cacheKey = `recientes-global:${limit}:${page}`;
  const mounted = useRef(true);

  const [state, setState] = useState(() => {
    const cached = getCached(cacheKey);
    return cached
      ? { posts: cached.posts, total: cached.total, totalPages: cached.totalPages, loading: false, error: null }
      : { posts: [], total: 0, totalPages: 1, loading: true, error: null };
  });

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const cached = getCached(cacheKey);
    if (cached) {
      setState({ posts: cached.posts, total: cached.total, totalPages: cached.totalPages, loading: false, error: null });
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    fetchPosts({ page, perPage: limit })
      .then(({ posts, total, totalPages }) => {
        if (!mounted.current) return;
        memCache.set(cacheKey, { posts, total, totalPages, ts: Date.now() });
        setState({ posts, total, totalPages, loading: false, error: null });
      })
      .catch(err => {
        if (!mounted.current) return;
        setState(s => ({ ...s, loading: false, error: err.message }));
      });
  }, [cacheKey, limit, page]);

  return state;
}
