import { ReactNode } from 'react';
import { SearchProvider } from './SearchContext';
import { TreeProvider } from './TreeContext';
import { UserPreferencesProvider } from './UserPreferencesContext';

interface AppContextProviderProps {
  children: ReactNode;
}

/**
 * AppContextProvider component combines all context providers
 * into a single wrapper to simplify application state setup.
 */
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
