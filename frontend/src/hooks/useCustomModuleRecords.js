import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Module definition (name/columns) + its records, for one slug. */
export function useCustomModuleRecords(slug) {
  const [module, setModule] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(
    (signal) => {
      setIsLoading(true);
      setError(null);
      return api
        .get(`/api/custom-modules/${slug}/records`, { signal })
        .then(({ data }) => {
          setModule(data.module);
          setRecords(data.records);
        })
        .catch((err) => {
          if (err.code !== 'ERR_CANCELED') setError(err);
        })
        .finally(() => setIsLoading(false));
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => controller.abort();
  }, [fetchAll]);

  async function addRecord(data) {
    const { data: created } = await api.post(`/api/custom-modules/${slug}/records`, { data });
    setRecords((prev) => [created, ...prev]);
    return created;
  }

  async function editRecord(id, data) {
    const { data: updated } = await api.put(`/api/custom-modules/${slug}/records/${id}`, { data });
    setRecords((prev) => prev.map((r) => (r._id === id ? updated : r)));
    return updated;
  }

  async function removeRecord(id) {
    await api.delete(`/api/custom-modules/${slug}/records/${id}`);
    setRecords((prev) => prev.filter((r) => r._id !== id));
  }

  async function addColumn(label) {
    const { data: updated } = await api.post(`/api/custom-modules/${slug}/columns`, { label });
    setModule(updated);
    return updated;
  }

  return {
    module,
    records,
    isLoading,
    error,
    addRecord,
    editRecord,
    removeRecord,
    addColumn,
    refetch: () => fetchAll(),
  };
}
