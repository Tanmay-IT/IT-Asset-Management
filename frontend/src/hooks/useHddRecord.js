import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useHddRecord(kind, id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecord = useCallback(
    (signal) => {
      setIsLoading(true);
      setError(null);
      const url = kind === 'main' ? `/api/hdd/main/${id}` : `/api/hdd/detail/${id}`;

      return api
        .get(url, { signal })
        .then(({ data: response }) => {
          if (kind === 'main') {
            setData({ main: response.main, detail: response.detailSheets[0] || null });
          } else {
            setData({ main: response.mainRecord || null, detail: response });
          }
        })
        .catch((err) => {
          if (err.code !== 'ERR_CANCELED') setError(err);
        })
        .finally(() => setIsLoading(false));
    },
    [kind, id]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRecord(controller.signal);
    return () => controller.abort();
  }, [fetchRecord]);

  return { data, isLoading, error, refetch: () => fetchRecord() };
}
