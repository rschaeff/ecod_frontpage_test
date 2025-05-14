// components/ContextBridge.tsx
'use client';

import { AppContextProvider } from '@/contexts/AppContextProvider';

export default function ContextBridge({ children }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}

// app/page.tsx
import ContextBridge from '@/components/ContextBridge';
import ECODHomePage from '@/components/ECODHomePage';

export default function Home() {
  return (
    <ContextBridge>
      <ECODHomePage />
    </ContextBridge>
  );
}
