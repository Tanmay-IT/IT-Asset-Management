import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useHddSearch(query) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    const timer = setTimeout(() => {
      api
        .get('/api/hdd/search', { params: { q: trimmed }, signal: controller.signal })
        .then(({ data }) => setResults(data.results))
        .catch((err) => {
          if (err.code !== 'ERR_CANCELED') setError(err);
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, isLoading, error };
}
