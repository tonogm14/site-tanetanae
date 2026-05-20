import { useState, useEffect, useRef } from 'react';
import { fetchPosts } from '../api/wordpress.js';

// Caché en memoria por pestaña. Evita re-fetcheos al navegar entre secciones.
// TTL de 5 minutos — tiempo razonable para contenido de noticias.
const memCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return entry.posts;
}

/**
 * Carga notas filtradas por categoría de WordPress.
 *
 * @param {string|null} slug  - Slug de la categoría (ej: 'suceso', 'deporte').
 *                              Pasar null o undefined desactiva el fetch.
 * @param {number}      limit - Cuántas notas traer (por defecto 6).
 * @returns {{ posts, loading, error }}
 */
export function useNotasByCategory(slug, limit = 6) {
  const cacheKey = `cat:${slug}:${limit}`;
  const mounted = useRef(true);

  const [state, setState] = useState(() => {
    if (!slug) return { posts: [], loading: false, error: null };
    const cached = getCached(cacheKey);
    return { posts: cached || [], loading: !cached, error: null };
  });

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!slug) {
      setState({ posts: [], loading: false, error: null });
      return;
    }

    const cached = getCached(cacheKey);
    if (cached) {
      setState({ posts: cached, loading: false, error: null });
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    fetchPosts({ page: 1, perPage: limit, category: slug })
      .then(({ posts }) => {
        if (!mounted.current) return;
        memCache.set(cacheKey, { posts, ts: Date.now() });
        setState({ posts, loading: false, error: null });
      })
      .catch(err => {
        if (!mounted.current) return;
        setState({ posts: [], loading: false, error: err.message });
      });
  }, [cacheKey, slug, limit]);

  return state;
}
