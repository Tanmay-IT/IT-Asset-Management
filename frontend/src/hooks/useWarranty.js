import { useResource } from './useResource';

export function useWarranty() {
  const { items, isLoading, error, addItem, editItem, removeItem, refetch } = useResource('/api/warranty');

  return {
    warranties: items,
    isLoading,
    error,
    addWarranty: addItem,
    editWarranty: editItem,
    deleteWarranty: removeItem,
    refetch,
  };
}
