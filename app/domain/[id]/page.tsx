// app/domain/[id]/page.tsx - Fixed version
import DomainDetail from '@/components/domain/DomainDetail';

interface DomainPageParams {
  params: {
    id: string;
  };
}

// Use the refactored component that incorporates modular components
export default function DomainDetailPage({ params }: DomainPageParams) {
  return <DomainDetail params={params} />;
}
