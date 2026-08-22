import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useResource(endpoint) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(
    (signal) => {
      setIsLoading(true);
      setError(null);
      return api
        .get(endpoint, { signal })
        .then(({ data }) => setItems(data))
        .catch((err) => {
          if (err.code !== 'ERR_CANCELED') setError(err);
        })
        .finally(() => setIsLoading(false));
    },
    [endpoint]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  async function addItem(payload) {
    const { data } = await api.post(endpoint, payload);
    setItems((prev) => [data, ...prev]);
  }

  async function editItem(id, payload) {
    const { data } = await api.put(`${endpoint}/${id}`, payload);
    setItems((prev) => prev.map((item) => (item._id === id ? data : item)));
  }

  async function removeItem(id) {
    await api.delete(`${endpoint}/${id}`);
    setItems((prev) => prev.filter((item) => item._id !== id));
  }

  return { items, isLoading, error, addItem, editItem, removeItem, refetch: () => fetchItems() };
}
