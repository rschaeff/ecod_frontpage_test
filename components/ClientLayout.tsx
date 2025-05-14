'use client';

import { ReactNode } from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * ClientLayout component
 * 
 * This is a client component wrapper that provides context to the entire application
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}
