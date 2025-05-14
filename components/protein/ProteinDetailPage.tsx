'use client';

import { useState, useEffect } from 'react';
import { ProteinData, ViewerOptions } from '@/types/protein';
import AppLayout from '@/components/layout/AppLayout';
import ProteinHeader from '@/components/protein/ProteinHeader';
import ProteinStructureViewer from '@/components/protein/ProteinStructureViewer';
import EnhancedProteinStructureViewer from '@/components/protein/EnhancedProteinStructureViewer';
import ProteinDomainMap from '@/components/protein/ProteinDomainMap';
import ProteinSequenceViewer from '@/components/protein/ProteinSequenceViewer';
import EnhancedProteinSequenceViewer from '@/components/protein/EnhancedProteinSequenceViewer';
import ExportSection from '@/components/protein/ExportSection';
import ExternalResources from '@/components/protein/ExternalResources';
import StructureUploader from '@/components/protein/StructureUploader';
import ClientOnly from '@/components/ClientOnly';

// Mock data for a sample protein
const mockProteinData: ProteinData = {
  id: "4UBP",
  uniprotId: "P20226",
  name: "TATA-box-binding protein",
  organism: "Homo sapiens",
  length: 339,
  sequence: "MDQNNSLPPYAQGLASPQGAMTPGIPIFSPMMPYGTGLTPQPIQNTNSLSILEEQQRQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQAVAAAAVQQSTSQQATQGTSGQAPQLFHSQTLTTAPLPGTTPLYPSPMTPMTPITPATPASESSKVDNCSESYNEDNKTFPTEGIQTGAAAAAAAVSYLGYKFSVNQFCGVMNHDLNSKIILDRFSKEQSRLAARKYILGTTVKPHHRICQFKLGPKKFDENRNAVIPKSKIPEFLAQLTEDYGAVKEQVKHYSMGDITDVYVPKTVGKELNQYTPPVSQAEGLQSTETASGSVGNGQESEAGKAQQDEQVDDKDDGDRPKLNGHISSVPGLNERSVSQVNEGSSGSSQDYKYMTTLSDSESEEESQEKKDQEKSEDKSNSEDKPPEIDKESSEEENQSQTSNEQVSSSPSTNGKASPRHVSGEETTDETREEK",
  domains: [
    {
      id: "e4ubpA1",
      range: "159-252",
      rangeStart: 159,
      rangeEnd: 252,
      ecod: {
        xgroup: "X.1.1",
        hgroup: "H.1.1.1",
        tgroup: "T.1.1.1.1",
        fgroup: "F.1.1.1.1.1"
      },
      color: "#4285F4",
      description: "TATA-binding protein, N-terminal domain"
    },
    {
      id: "e4ubpA2",
      range: "253-339",
      rangeStart: 253,
      rangeEnd: 339,
      ecod: {
        xgroup: "X.1.1",
        hgroup: "H.1.1.1",
        tgroup: "T.1.1.1.1",
        fgroup: "F.1.1.1.1.1"
      },
      color: "#EA4335",
      description: "TATA-binding protein, C-terminal domain"
    },
  ],
  resolution: "2.1Å",
  method: "X-ray diffraction",
  releaseDate: "2023-06-15"
};

interface ProteinDetailPageProps {
  proteinId?: string; // Optional prop to fetch protein data by ID
}

/**
 * Enhanced ProteinDetailPage component using modular architecture
 */
export default function EnhancedProteinDetailPage({ proteinId }: ProteinDetailPageProps) {
  const [protein, setProtein] = useState<ProteinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    style: 'cartoon',
    showLabels: true,
    showSideChains: false,
    zoom: 1
  });

  // Use advanced components based on feature flag
  const [useAdvancedComponents, setUseAdvancedComponents] = useState(true);

  // Fetch protein data on mount/when proteinId changes
  useEffect(() => {
    // In a real application, this would fetch data from API
    // For now, we're using mock data
    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      try {
        // If proteinId is provided, we would fetch that specific protein
        // For now, just return mock data
        setProtein(mockProteinData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading protein data:', err);
        setError('Failed to load protein data. Please try again later.');
        setLoading(false);
      }
    }, 500);
  }, [proteinId]);

  // Handlers
  const handleDomainHover = (domainId: string | null) => {
    setHighlightedDomain(domainId);
  };

  const handleViewerOptionsChange = (newOptions: ViewerOptions) => {
    setViewerOptions(newOptions);
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file);
    // In a real app, this would process the file and update the viewer
  };

  const handlePositionSelect = (position: number) => {
    // Find which domain this residue belongs to
    if (!protein) return;

    const domain = protein.domains.find(
      d => position >= d.rangeStart && position <= d.rangeEnd
    );

    if (domain) {
      setHighlightedDomain(domain.id);
    }
  };

  // Prepare breadcrumb items
  const breadcrumbs = protein ? [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: `${protein.id} Protein View` }
  ] : [];

  // Show loading state
  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs} activePage="protein">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-700">Loading protein data...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error || !protein) {
    return (
      <AppLayout breadcrumbs={breadcrumbs} activePage="protein">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'Protein data not found'}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} activePage="protein">
      {/* Protein info header */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <ProteinHeader protein={protein} />
        </div>
      </section>

      {/* Feature toggle for advanced components */}
      <div className="container mx-auto px-4 mb-4">
        <div className="flex items-center justify-end">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useAdvancedComponents}
              onChange={(e) => setUseAdvancedComponents(e.target.checked)}
              className="rounded"
            />
            <span>Use enhanced visualization components</span>
          </label>
        </div>
      </div>

      {/* Main content sections */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Structure viewer section */}
            <div className="md:col-span-1">
              {/* Use either basic or enhanced structure viewer based on feature flag */}
              <ClientOnly>
                {useAdvancedComponents ? (
                  <EnhancedProteinStructureViewer
                    protein={protein}
                    highlightedDomain={highlightedDomain}
                    viewerOptions={viewerOptions}
                    onViewerOptionsChange={handleViewerOptionsChange}
                  />
                ) : (
                  <ProteinStructureViewer
                    protein={protein}
                    highlightedDomain={highlightedDomain}
                    viewerOptions={viewerOptions}
                    onViewerOptionsChange={handleViewerOptionsChange}
                  />
                )}
              </ClientOnly>

              {/* External resources section */}
              <div className="mt-4">
                <ExternalResources
                  pdbId={protein.id}
                  uniprotId={protein.uniprotId}
                />
              </div>

              {/* Structure uploader section */}
              <div className="mt-4">
                <StructureUploader onFileUpload={handleFileUpload} />
              </div>
            </div>

            {/* Domain info section */}
            <div className="md:col-span-2">
              {/* Domain map */}
              <ProteinDomainMap
                protein={protein}
                highlightedDomain={highlightedDomain}
                onDomainHover={handleDomainHover}
              />

              {/* Sequence viewer - either basic or enhanced */}
              <ClientOnly>
                {useAdvancedComponents ? (
                  <EnhancedProteinSequenceViewer
                    protein={protein}
                    highlightedDomain={highlightedDomain}
                    onPositionSelect={handlePositionSelect}
                  />
                ) : (
                  <ProteinSequenceViewer
                    protein={protein}
                    highlightedDomain={highlightedDomain}
                  />
                )}
              </ClientOnly>

              {/* Export section */}
              <ExportSection protein={protein} />
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
