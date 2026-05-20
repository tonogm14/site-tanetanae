import { useState, useEffect } from 'react';
import { fetchPosts, MOCK_DATA } from '../api/wordpress.js';

/**
 * Fetches a paginated list of posts, with optional category filter.
 * Falls back to mock data if the API is unreachable.
 */
export default function usePosts({ page = 1, perPage = 10, category } = {}) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPosts({ page, perPage, category })
      .then(({ posts: p, total: t, totalPages: tp }) => {
        if (cancelled) return;
        setPosts(p);
        setTotal(t);
        setTotalPages(tp);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        // Fallback to relevant mock data
        const fallback = category
          ? (MOCK_DATA[category] || MOCK_DATA.hero)
          : MOCK_DATA.hero;
        setPosts(Array.isArray(fallback) ? fallback : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, perPage, category]);

  return { posts, total, totalPages, loading, error };
}
