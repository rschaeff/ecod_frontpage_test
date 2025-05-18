'use client';

import React, { ReactNode } from 'react';

// Import all context providers
import { SearchProvider } from './SearchContext';
import { UserPreferencesProvider } from './UserPreferencesContext';
import { TreeProvider } from './TreeContext';

/**
 * AppContextProvider - Provides all application contexts to child components
 * This should wrap the entire application to ensure all components have access to all contexts
 */
interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  return (
    <UserPreferencesProvider>
      <SearchProvider>
        <TreeProvider>
          {children}
        </TreeProvider>
      </SearchProvider>
    </UserPreferencesProvider>
  );
}

// Export individual context hooks for convenience
export { useSearch } from './SearchContext';
export { useUserPreferences } from './UserPreferencesContext';
export { useTree } from './TreeContext';

// Export the providers individually if needed elsewhere
export { SearchProvider } from './SearchContext';
export { UserPreferencesProvider } from './UserPreferencesContext';
export { TreeProvider } from './TreeContext';
