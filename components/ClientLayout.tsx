'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * ClientLayout component
 *
 * This is a client component wrapper that provides context to the entire application
 * It uses a mounting check to ensure hydration completes before context providers run
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  // Use this to avoid hydration mismatch with localStorage
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and first render, return a placeholder or loading state
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Only render context providers once the client has mounted
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}
