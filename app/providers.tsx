'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';
import { ContextDebugger } from '@/utils/ContextDebugger';

/**
 * RootLayout - The top-level layout component that provides context to the entire application
 * This should wrap the entire application to ensure all components have access to all contexts
 */
export default function RootProvider({ children }: PropsWithChildren) {
  // Use mounting check to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    setMounted(true);
  }, []);

  // During initial SSR and first render, return a placeholder
  if (!mounted) {
    return <>{children}</>;
  }

  // Provide contexts to all children once mounted
  return (
    <AppContextProvider>
      {children}
      {isDev && <ContextDebugger />}
    </AppContextProvider>
  );
}
