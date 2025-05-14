'use client';

import { AppContextProvider } from '@/contexts/AppContextProvider';
import { ReactNode } from 'react';

/**
 * A component wrapper that ensures components have access to all contexts.
 * This is useful for isolated components that need access to all application contexts
 * but might be rendered outside the main application hierarchy.
 */
export default function ContextWrapper({ children }: { children: ReactNode }) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}
