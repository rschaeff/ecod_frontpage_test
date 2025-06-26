// components/ContextBridge.tsx - Fixed version
'use client';

import { ReactNode } from 'react';
import { AppContextProvider } from '@/contexts/AppContextProvider';

interface ContextBridgeProps {
  children: ReactNode;
}

export default function ContextBridge({ children }: ContextBridgeProps) {
  return <AppContextProvider>{children}</AppContextProvider>;
}
