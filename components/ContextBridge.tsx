// components/ContextBridge.tsx
'use client';

import { AppContextProvider } from '@/contexts/AppContextProvider';

export default function ContextBridge({ children }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}

