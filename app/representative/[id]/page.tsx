import ECODRepresentativePage from '@/components/ECODRepresentativePage';

interface RepresentativePageParams {
  params: {
    id: string;
  };
}

export default function RepresentativePage({ params }: RepresentativePageParams) {
  return <ECODRepresentativePage domainId={params.id} />;
}
