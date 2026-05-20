import { useState, useEffect } from 'react';
import { fetchPost, MOCK_DATA } from '../api/wordpress.js';

/**
 * Fetches a single post by slug.
 * Falls back to mock article data if the API is unreachable.
 */
export default function usePost(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPost(slug)
      .then((p) => {
        if (cancelled) return;
        setPost(p || MOCK_DATA.article);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setPost(MOCK_DATA.article);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { post, loading, error };
}
