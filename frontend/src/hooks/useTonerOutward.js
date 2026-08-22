import { useResource } from './useResource';

export function useTonerOutward() {
  const { items, isLoading, error, addItem, editItem, removeItem, refetch } = useResource('/api/toners/outward');

  return {
    outward: items,
    isLoading,
    error,
    addOutward: addItem,
    editOutward: editItem,
    deleteOutward: removeItem,
    refetch,
  };
}
