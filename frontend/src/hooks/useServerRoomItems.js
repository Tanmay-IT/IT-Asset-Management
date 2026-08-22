import { useResource } from './useResource';

export function useServerRoomItems() {
  const { items, isLoading, error, addItem, editItem, removeItem, refetch } = useResource('/api/server-room-items');

  return {
    items,
    isLoading,
    error,
    addItem,
    editItem,
    deleteItem: removeItem,
    refetch,
  };
}
