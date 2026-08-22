import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useHddInventory() {
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/api/hdd/inventory', { signal: controller.signal })
      .then(({ data }) => setEntities(data))
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') setError(err);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  return { entities, isLoading, error };
}
