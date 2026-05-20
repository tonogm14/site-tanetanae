import { useState, useEffect } from 'react';
import { fetchCategories, MOCK_DATA } from '../api/wordpress.js';

/**
 * Fetches the list of categories.
 * Falls back to mock categories if the API is unreachable.
 */
export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategories(cats);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setCategories(MOCK_DATA.categories);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}
