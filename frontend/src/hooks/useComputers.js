import { useResource } from './useResource';

export function useComputers() {
  const { items, isLoading, error, addItem, editItem, removeItem, refetch } = useResource('/api/computers');

  return {
    computers: items,
    isLoading,
    error,
    addComputer: addItem,
    editComputer: editItem,
    deleteComputer: removeItem,
    refetch,
  };
}
