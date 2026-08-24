import { useCallback, useEffect, useState } from 'react';
import { CustomModulesContext } from '../hooks/useCustomModules';
import { api } from '../lib/api';

export function CustomModulesProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModules = useCallback((signal) => {
    setIsLoading(true);
    setError(null);
    return api
      .get('/api/custom-modules', { signal })
      .then(({ data }) => setModules(data))
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') setError(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchModules(controller.signal);
    return () => controller.abort();
  }, [fetchModules]);

  async function createModule(name) {
    const { data } = await api.post('/api/custom-modules', { name });
    setModules((prev) => [...prev, data]);
    return data;
  }

  async function deleteModule(slug) {
    await api.delete(`/api/custom-modules/${slug}`);
    setModules((prev) => prev.filter((m) => m.slug !== slug));
  }

  function updateModuleLocally(updated) {
    setModules((prev) => prev.map((m) => (m.slug === updated.slug ? updated : m)));
  }

  return (
    <CustomModulesContext.Provider
      value={{ modules, isLoading, error, createModule, deleteModule, updateModuleLocally, refetch: () => fetchModules() }}
    >
      {children}
    </CustomModulesContext.Provider>
  );
}
