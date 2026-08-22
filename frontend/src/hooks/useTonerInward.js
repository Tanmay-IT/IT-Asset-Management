import { useResource } from './useResource';

export function useTonerInward() {
  const { items, isLoading, error, addItem, editItem, removeItem, refetch } = useResource('/api/toners/inward');

  return {
    inward: items,
    isLoading,
    error,
    addInward: addItem,
    editInward: editItem,
    deleteInward: removeItem,
    refetch,
  };
}
