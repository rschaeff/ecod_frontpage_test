'use client';

import ClientOnly from '@/components/ClientOnly';
import ProteinDetailPage from '@/components/protein/ProteinDetailPage';

export default function ProteinView() {
  return (
    <ClientOnly>
      <ProteinDetailPage />
    </ClientOnly>
  );
}
