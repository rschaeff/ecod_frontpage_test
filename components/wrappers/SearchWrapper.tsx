'use client';

import { SearchProvider, useSearch } from '@/contexts/SearchContext';
import { ReactNode } from 'react';

/**
 * A component wrapper that ensures the child components have access to the SearchContext.
 * This can be used for components that need access to search functionality
 * but might be rendered outside the main application structure.
 */
export default function SearchWrapper({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      {children}
    </SearchProvider>
  );
}

/**
 * Helper wrapper for the ExampleComponent that specifically needs SearchContext
 */
export function ExampleComponentWrapper({ children }: { children: ReactNode }) {
  return <SearchWrapper>{children}</SearchWrapper>;
}
