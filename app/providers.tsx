'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';
import { ContextDebugger } from '@/utils/ContextDebugger';

/**
 * RootProvider - The top-level layout component that provides context to the entire application
 * This should wrap the entire application to ensure all components have access to all contexts
 */
export default function RootProvider({ children }: PropsWithChildren) {
  // Use mounting check to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always provide contexts, but conditionally render debug tools
  // This ensures contexts are available during SSR and initial render
  return (
    <AppContextProvider>
      {children}
      {isDev && mounted && <ContextDebugger />}
    </AppContextProvider>
  );
}
