import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useHddDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/api/hdd/dashboard', { signal: controller.signal })
      .then(({ data }) => setStats(data))
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') setError(err);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  return { stats, isLoading, error };
}
