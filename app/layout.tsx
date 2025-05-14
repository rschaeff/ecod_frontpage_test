'use client';

import { ReactNode } from 'react';
import RootProvider from './providers';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Root layout component for the entire application
 * Wraps the entire app with the RootProvider to ensure contexts are available everywhere
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>ECOD - Evolutionary Classification of Protein Domains</title>
        <meta name="description" content="Evolutionary Classification of Protein Domains Database" />
      </head>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
