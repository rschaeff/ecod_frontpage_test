'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Info, ExternalLink, BookOpen, Download, Eye, 
  ArrowDown, Search
} from 'lucide-react';
import Link from 'next/link';

// Import modular components
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import DomainCard from '@/components/domain/DomainCard';
import ControlPanel from '@/components/visualization/ControlPanel';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import SequenceViewer from '@/components/SequenceViewer';
import StructureViewer from '@/components/StructureViewer';
import ClientOnly from '@/components/ClientOnly';

// Import context hooks
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

// Types for protein domains
interface ProteinDomain {
  id: string;
  range: string;
  rangeStart: number;
  rangeEnd: number;
  ecod: {
    xgroup: string;
    hgroup: string;
    tgroup: string;
    fgroup: string;
  };
  color: string;
  description: string;
}

interface ProteinData {
  id: string;
  uniprotId: string;
  name: string;
  organism: string;
  length: number;
  sequence: string;
  domains: ProteinDomain[];
  resolution: string;
  method: string;
  releaseDate: string;
}

interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  colorScheme: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity';
  showSideChains: boolean;
  showLigands: boolean;
  showWater: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface ProteinPageProps {
  params: {
    id: string;
  };
}

export default function ProteinDetailPage({ params }: ProteinPageProps) {
  // Access user preferences if needed
  const { preferences } = useUserPreferences();
  
  // State definitions
  const [loading, setLoading] = useState<boolean>(true);
  const [protein, setProtein] = useState<ProteinData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);
  const [structureLoaded, setStructureLoaded] = useState<boolean>(false);
  
  // Structure viewer options
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    style: 'cartoon',
    colorScheme: 'chain',
    showSideChains: false,
    showLigands: true,
    showWater: false,
    quality: 'medium'
  });
  
  // Refs for components
  const structureViewerRef = useRef(null);
  
  // Fetch protein data based on ID
  useEffect(() => {
    setLoading(true);
    
    // In a real app, this would be an API call to fetch protein data
    // For now, we simulate with a timeout and mock data
    const timer = setTimeout(() => {
      // Sample mock data with dynamic ID from params
      const mockData: ProteinData = {
        id: params.id.toUpperCase(),
        uniprotId: "P12345",
        name: params.id.toUpperCase() === "4UBP" ? 
          "TATA-box-binding protein" : 
          `Protein ${params.id.toUpperCase()}`,
        organism: "Homo sapiens",
        length: 339,
        sequence: "MDQNNSLPPYAQGLASPQGAMTPGIPIFSPMMPYGTGLTPQPIQNTNSLSILEEQQRQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQAVAAAAVQQSTSQQATQGTSGQAPQLFHSQTLTTAPLPGTTPLYPSPMTPMTPITPATPASESSKVDNCSESYNEDNKTFPTEGIQTGAAAAAAAVSYLGYKFSVNQFCGVMNHDLNSKIILDRFSKEQSRLAARKYILGTTVKPHHRICQFKLGPKKFDENRNAVIPKSKIPEFLAQLTEDYGAVKEQVKHYSMGDITDVYVPKTVGKELNQYTPPVSQAEGLQSTETASGSVGNGQESEAGKAQQDEQVDDKDDGDRPKLNGHISSVPGLNERSVSQVNEGSSGSSQDYKYMTTLSDSESEEESQEKKDQEKSEDKSNSEDKPPEIDKESSEEENQSQTSNEQVSSSPSTNGKASPRHVSGEETTDETREEK",
        domains: [
          {
            id: `e${params.id.toLowerCase()}A1`,
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
            description: "TBP domain 1"
          },
          {
            id: `e${params.id.toLowerCase()}A2`,
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
            description: "TBP domain 2"
          },
        ],
        resolution: "2.1Å",
        method: "X-ray diffraction",
        releaseDate: "2023-06-15"
      };
      
      // Only set the protein data if the ID is valid (for demo, we'll accept any)
      if (params.id) {
        setProtein(mockData);
        setError(null);
      } else {
        setError("Invalid protein ID");
        setProtein(null);
      }
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  // Handle domain hover
  const handleDomainHover = (domainId: string | null) => {
    setHighlightedDomain(domainId);
  };
  
  // Handle structure loading completion
  const handleStructureLoaded = () => {
    setStructureLoaded(true);
  };
  
  // Handle structure loading error
  const handleStructureError = (err) => {
    console.error("Error loading structure:", err);
    // We don't set the main error state, just log it since we can still show other data
  };
  
  // Update viewer options
  const updateViewerOptions = (newOptions) => {
    setViewerOptions(prev => ({
      ...prev,
      ...newOptions
    }));
  };
  
  // Reset viewer options to defaults
  const resetViewerOptions = () => {
    setViewerOptions({
      style: 'cartoon',
      colorScheme: 'chain',
      showSideChains: false,
      showLigands: true,
      showWater: false,
      quality: 'medium'
    });
  };
  
  // Get color for a specific position in the sequence
  const getColorForPosition = (position: number) => {
    if (!protein) return null;
    
    // Find the domain that contains this position
    const domain = protein.domains.find(d => 
      position >= d.rangeStart && position <= d.rangeEnd
    );
    
    return domain ? domain.color : null;
  };
  
  // Create breadcrumb items
  const getBreadcrumbs = () => {
    if (!protein) return [];
    
    return [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: `${protein.id} Protein View` }
    ];
  };
  
  // If loading, show loading state
  if (loading) {
    return (
      <PageLayout 
        title="Loading Protein" 
        activePage="tree"
      >
        <LoadingState message={`Loading protein information for ${params.id}...`} />
      </PageLayout>
    );
  }
  
  // If error, show error state
  if (error || !protein) {
    return (
      <PageLayout 
        title="Protein Not Found" 
        activePage="tree"
      >
        <ErrorState
          title="Protein Not Found"
          message={error || `We couldn't find protein with ID: ${params.id.toUpperCase()}`}
          actions={
            <>
              <Link href="/" className="bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition">
                Return to Home
              </Link>
              <Link href="/search" className="bg-gray-200 text-gray-800 py-2 rounded text-center hover:bg-gray-300 transition">
                Search for Proteins
              </Link>
            </>
          }
        />
      </PageLayout>
    );
  }
  
  // Create array of highlights for the sequence viewer
  const sequenceHighlights = protein.domains.map(domain => ({
    start: domain.rangeStart,
    end: domain.rangeEnd,
    color: domain.color,
    className: highlightedDomain === domain.id ? 'domain-highlight-selected' : 'domain-highlight'
  }));
  
  // If protein data is loaded, render the protein view
  return (
    <PageLayout
      title={`${protein.id}: ${protein.name}`}
      subtitle={`${protein.organism} • ${protein.length} residues`}
      activePage="tree"
      breadcrumbs={getBreadcrumbs()}
    >
      {/* Additional protein info */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">{protein.id}</h2>
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    PDB
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  {protein.name} • {protein.organism}
                </p>
              </div>
              
              <div className="mt-3 md:mt-0 space-y-1 text-sm text-gray-600">
                <div><span className="font-medium">Method:</span> {protein.method}</div>
                <div><span className="font-medium">Resolution:</span> {protein.resolution}</div>
                <div><span className="font-medium">Released:</span> {protein.releaseDate}</div>
                <div>
                  <span className="font-medium">UniProt:</span>
                  <a href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                    {protein.uniprotId}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href={`/domain/${protein.domains[0].id}`}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
              >
                {protein.domains.length} domains
              </Link>
              <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                {protein.domains.map(d => d.ecod.hgroup).filter((v, i, a) => a.indexOf(v) === i).length} H-groups
              </span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main content grid */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Structure viewer */}
            <div className="lg:col-span-1">
              {/* Structure Viewer - using ControlPanel and StructureViewer components */}
              <ControlPanel 
                options={viewerOptions}
                onChange={updateViewerOptions}
                onReset={resetViewerOptions}
              />
              
              <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-medium">Protein Structure</h3>
                </div>
                
                <ClientOnly>
                  <div className="aspect-square bg-gray-50 relative">
                    <StructureViewer
                      ref={structureViewerRef}
                      pdbId={protein.id}
                      style={viewerOptions.style}
                      colorScheme={viewerOptions.colorScheme}
                      showSideChains={viewerOptions.showSideChains}
                      showLigands={viewerOptions.showLigands}
                      showWater={viewerOptions.showWater}
                      quality={viewerOptions.quality}
                      highlights={protein.domains.map(domain => ({
                        start: domain.rangeStart,
                        end: domain.rangeEnd,
                        chainId: domain.id.charAt(domain.id.length - 2),
                        color: domain.color
                      }))}
                      onLoaded={handleStructureLoaded}
                      onError={handleStructureError}
                    />
                    
                    {!structureLoaded && (
                      <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                        <LoadingState message="Loading structure..." size="small" />
                      </div>
                    )}
                    
                    {/* Display info about highlighted domain */}
                    {highlightedDomain && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md text-sm">
                        <p className="font-medium" style={{ 
                          color: protein.domains.find(d => d.id === highlightedDomain)?.color 
                        }}>
                          {protein.domains.find(d => d.id === highlightedDomain)?.description} (
                          {protein.domains.find(d => d.id === highlightedDomain)?.range})
                        </p>
                      </div>
                    )}
                  </div>
                </ClientOnly>
              </div>
              
              {/* External links */}
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium mb-3">External Resources</h3>
                <div className="space-y-2">
                  <a href={`https://www.rcsb.org/structure/${protein.id}`} 
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in RCSB PDB
                  </a>
                  <a href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    UniProt Entry
                  </a>
                  <a href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`}
                     target="_blank"
                     rel="noreferrer" 
                     className="flex items-center text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    AlphaFold Structure
                  </a>
                </div>
              </div>
              
              {/* References */}
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium mb-3">References</h3>
                <div className="text-sm space-y-3">
                  <div className="flex">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">
                      <span className="font-medium">Structure:</span> Smith J, et al. (2023). "Crystal structure of {protein.name}." <a href="#" className="text-blue-600 hover:underline">J Mol Biol</a>
                    </p>
                  </div>
                  <div className="flex">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">
                      <span className="font-medium">Classification:</span> Cheng H, et al. (2014). "ECOD: An Evolutionary Classification of Protein Domains." <a href="#" className="text-blue-600 hover:underline">PLoS Comput Biol</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Domains and sequence */}
            <div className="lg:col-span-2">
              {/* Domain architecture */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4">Domain Architecture</h3>
                
                {/* Protein domain map */}
                <div className="relative h-20 mb-6">
                  {/* Protein backbone */}
                  <div className="absolute top-8 left-0 right-0 h-3 bg-gray-200 rounded-full"></div>
                  
                  {/* N and C terminus labels */}
                  <div className="absolute top-8 -left-4 transform -translate-y-1/2 font-bold">N</div>
                  <div className="absolute top-8 -right-4 transform -translate-y-1/2 font-bold">C</div>
                  
                  {/* Position markers */}
                  <div className="absolute top-12 left-0 text-xs text-gray-600">1</div>
                  <div className="absolute top-12 right-0 text-xs text-gray-600">{protein.length}</div>
                  
                  {/* Domains */}
                  {protein.domains.map(domain => {
                    // Calculate positions as percentages
                    const startPos = (domain.rangeStart / protein.length) * 100;
                    const width = ((domain.rangeEnd - domain.rangeStart + 1) / protein.length) * 100;
                    
                    return (
                      <div
                        key={domain.id}
                        className="absolute h-7 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center"
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                          top: '4px',
                          backgroundColor: domain.color,
                          opacity: highlightedDomain && highlightedDomain !== domain.id ? 0.6 : 1,
                          border: highlightedDomain === domain.id ? '2px solid black' : 'none',
                          zIndex: highlightedDomain === domain.id ? 5 : 1
                        }}
                        onMouseEnter={() => handleDomainHover(domain.id)}
                        onMouseLeave={() => handleDomainHover(null)}
                      >
                        {width > 15 && (
                          <span className="text-white text-xs font-medium truncate px-1">
                            {domain.description}
                          </span>
                        )}
                        
                        {/* Range label below */}
                        <span className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 whitespace-nowrap">
                          {domain.range}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Domain details */}
                <div className="mt-8">
                  <h4 className="font-medium mb-2">Domain Details</h4>
                  <div className="space-y-2">
                    {protein.domains.map(domain => (
                      <DomainCard
                        key={domain.id}
                        domain={{
                          id: domain.id,
                          range: domain.range,
                          description: domain.description
                        }}
                        isHighlighted={highlightedDomain === domain.id}
                        onHover={handleDomainHover}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sequence viewer */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Protein Sequence</h3>
                  <div>
                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200">
                      <Download className="inline-block h-3 w-3 mr-1" />
                      Download FASTA
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded border overflow-x-auto">
                  <SequenceViewer
                    sequence={protein.sequence}
                    rangeStart={1}
                    highlights={sequenceHighlights}
                    showNumbering={true}
                    showAxis={true}
                    displayFormat="wrap"
                    residuesPerLine={60}
                    renderingMode="default"
                    displayHeight={300}
                  />
                </div>
                
                {/* Sequence info */}
                <div className="mt-3 text-sm text-gray-500 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Hovering over domains will highlight their regions in the sequence.</span>
                </div>
              </div>
              
              {/* Download section */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-3">Download Data</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200">
                    <Download className="h-4 w-4 mr-2" />
                    PDB Structure
                  </button>
                  <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200">
                    <Download className="h-4 w-4 mr-2" />
                    FASTA Sequence
                  </button>
                  <button className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200">
                    <Download className="h-4 w-4 mr-2" />
                    Domain JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
