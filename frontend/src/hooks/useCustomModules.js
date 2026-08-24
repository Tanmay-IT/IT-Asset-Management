import { createContext, useContext } from 'react';

export const CustomModulesContext = createContext(null);

/** Shared across the app (Sidebar's nav list, the module page's delete action, etc.) so they never go stale relative to each other. */
export function useCustomModules() {
  const context = useContext(CustomModulesContext);
  if (!context) throw new Error('useCustomModules must be used within a CustomModulesProvider');
  return context;
}
