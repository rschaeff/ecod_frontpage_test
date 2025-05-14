'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Download, Info, ArrowRight, AlertCircle, Eye, ChevronRight,
  Share2, ExternalLink, FileText
} from 'lucide-react';
import Link from 'next/link';

// Import modular components
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import StructureViewer from '@/components/StructureViewer';
import SequenceViewer from '@/components/SequenceViewer';
import ClassificationDisplay from '@/components/domain/ClassificationDisplay';
import DomainCard from '@/components/domain/DomainCard';
import ControlPanel from '@/components/visualization/ControlPanel';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import ClientOnly from '@/components/ClientOnly';

// Import context hooks if needed
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

// Types
interface DomainClassification {
  architecture: string;  // A-level
  xgroup: {             // X-level
    id: string;
    name: string;
  };
  hgroup: {             // H-level
    id: string;
    name: string;
  };
  tgroup: {             // T-level
    id: string;
    name: string;
  };
  fgroup: {             // F-level
    id: string;
    name: string;
  };
}

interface Protein {
  id: string;           // PDB ID
  name: string;         // Protein name
  uniprotId: string;    // UniProt accession
  organism: string;     // Source organism
  length: number;       // Total protein length
  resolution: string;   // Structure resolution
  method: string;       // Experimental method
}

interface Ligand {
  id: string;
  name: string;
  count: number;
}

interface PfamMapping {
  id: string;
  name: string;
  evalue: number;
}

interface SimilarDomain {
  id: string;
  similarity: number;
  description: string;
}

interface DomainData {
  id: string;             // Domain ID (e.g., e4ubpA1)
  pdbId: string;          // PDB ID component
  chainId: string;        // Chain identifier
  domainNum: number;      // Domain number within the chain
  range: string;          // Residue range (e.g., "159-252")
  rangeStart: number;     // Numeric start position
  rangeEnd: number;       // Numeric end position
  sequence: string;       // Domain sequence
  description: string;    // Human-readable description
  classification: DomainClassification;
  protein: Protein;       // Parent protein info
  representativeFor: string; // F-group or null if not representative
  similar: SimilarDomain[];  // Similar domains
  pfam: PfamMapping[];    // Pfam mappings
  ligands: Ligand[];      // Bound ligands
}

interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  colorScheme: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity';
  showSideChains: boolean;
  showLigands: boolean;
  showWater: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface DomainPageParams {
  params: {
    id: string;
  };
}

export default function DomainDetailPage({ params }: DomainPageParams) {
  // Access user preferences if needed
  const { preferences } = useUserPreferences();
  
  // State definitions
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<DomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPosition, setHighlightedPosition] = useState<number | null>(null);
  const [structureLoaded, setStructureLoaded] = useState<boolean>(false);
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
  
  // Fetch domain data based on ID
  useEffect(() => {
    setLoading(true);
    
    // In a real app, this would be an API call to fetch domain data
    // For now, we simulate with a timeout and mock data
    const timer = setTimeout(() => {
      // Extract components from domain ID (format typically e[PDBID][Chain][Number], e.g., e4ubpA1)
      const id = params.id;
      let pdbId = '';
      let chainId = '';
      let domainNum = 1;
      
      if (id.startsWith('e') && id.length >= 6) {
        pdbId = id.substring(1, 5);
        chainId = id.substring(5, 6);
        domainNum = parseInt(id.substring(6), 10) || 1;
      }
      
      // Sample mock data
      const mockData: DomainData = {
        id: id,
        pdbId: pdbId.toUpperCase(),
        chainId: chainId,
        domainNum: domainNum,
        range: domainNum === 1 ? "159-252" : "253-339",
        rangeStart: domainNum === 1 ? 159 : 253,
        rangeEnd: domainNum === 1 ? 252 : 339,
        sequence: domainNum === 1
          ? "KFSVNQFCGVMNHDLNSKIILDRFSKEQSRLAARKYILGTTVKPHHRICQFKLGPKKFDENRNAVIPKSKIPEFLAQLTEDY"
          : "GAVKEQVKHYSMGDITDVYVPKTVGKELNQYTPPVSQAEGLQSTETASGSVGNGQESEAG",
        description: domainNum === 1
          ? "TATA-binding protein, N-terminal domain"
          : "TATA-binding protein, C-terminal domain",
        classification: {
          architecture: "Alpha proteins",
          xgroup: {
            id: "X.1.1",
            name: "TBP-like"
          },
          hgroup: {
            id: "H.1.1.1",
            name: "TATA-binding protein-like"
          },
          tgroup: {
            id: "T.1.1.1.1",
            name: "TATA-binding protein"
          },
          fgroup: {
            id: "F.1.1.1.1.1",
            name: "TATA-box binding protein family"
          }
        },
        protein: {
          id: pdbId.toUpperCase(),
          name: "TATA-box-binding protein",
          uniprotId: "P20226",
          organism: "Homo sapiens",
          length: 339,
          resolution: "2.1Å",
          method: "X-ray diffraction"
        },
        representativeFor: domainNum === 1 ? "F.1.1.1.1.1" : null,
        similar: [
          {
            id: domainNum === 1 ? "e1cdcA1" : "e1cdcA2",
            similarity: 78,
            description: "TATA-binding protein from S. cerevisiae"
          },
          {
            id: domainNum === 1 ? "e1mp9A1" : "e1mp9A2",
            similarity: 65,
            description: "TATA-binding protein from A. thaliana"
          }
        ],
        pfam: [
          {
            id: "PF00352",
            name: "TBP",
            evalue: 1.2e-45
          }
        ],
        ligands: domainNum === 1 ? [
          {
            id: "DNA",
            name: "DNA fragment",
            count: 1
          }
        ] : []
      };
      
      if (id) {
        setDomain(mockData);
        setError(null);
      } else {
        setError("Invalid domain ID");
        setDomain(null);
      }
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  // Handle structure loading completion
  const handleStructureLoaded = () => {
    setStructureLoaded(true);
  };
  
  // Handle structure loading error
  const handleStructureError = (err) => {
    console.error("Error loading structure:", err);
    // We don't set the main error state, just log it since we can still show other data
  };
  
  // Handle selection of a position in the sequence viewer
  const handleSequencePositionSelect = (position) => {
    setHighlightedPosition(position);
    
    // Highlight the residue in the structure viewer if it's available
    if (structureViewerRef.current && structureViewerRef.current.highlightResidue) {
      structureViewerRef.current.highlightResidue(position);
    }
  };
  
  // Handle selection of a residue in the structure viewer
  const handleStructureResidueSelect = (position) => {
    setHighlightedPosition(position);
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
  
  // Create breadcrumb items
  const getBreadcrumbs = () => {
    if (!domain) return [];
    
    return [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: domain.protein.id, href: `/protein/${domain.protein.id}` },
      { label: domain.id }
    ];
  };
  
  // If loading, show loading state
  if (loading) {
    return (
      <PageLayout 
        title="Loading Domain" 
        activePage="tree"
      >
        <LoadingState message={`Loading domain information for ${params.id}...`} />
      </PageLayout>
    );
  }
  
  // If error, show error state
  if (error || !domain) {
    return (
      <PageLayout 
        title="Domain Not Found" 
        activePage="tree"
      >
        <ErrorState
          title="Domain Not Found"
          message={error || `We couldn't find domain with ID: ${params.id}`}
          actions={
            <>
              <Link href="/" className="bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition">
                Return to Home
              </Link>
              <Link href="/search" className="bg-gray-200 text-gray-800 py-2 rounded text-center hover:bg-gray-300 transition">
                Search for Domains
              </Link>
            </>
          }
        />
      </PageLayout>
    );
  }
  
  // If domain data is loaded, render the domain detail view
  return (
    <PageLayout
      title={domain.id}
      subtitle={domain.description}
      activePage="tree"
      breadcrumbs={getBreadcrumbs()}
    >
      {/* Domain header - extra info beyond what's in the page title */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">{domain.id}</h1>
                  {domain.representativeFor && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Representative
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {domain.protein.name} • {domain.protein.organism}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 space-y-1 text-sm text-gray-600">
                <div><span className="font-medium">Range:</span> {domain.range}</div>
                <div><span className="font-medium">PDB:</span> {domain.protein.id} (Chain {domain.chainId})</div>
                <div><span className="font-medium">ECOD:</span> {domain.classification.fgroup.id}</div>
              </div>
            </div>
            
            {/* Parent protein link */}
            <div className="mt-2 mb-4">
              <Link
                href={`/protein/${domain.protein.id}`}
                className="inline-flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md border border-blue-200 transition-colors"
              >
                <Info className="h-4 w-4 mr-2" />
                <span>View in context of full protein structure</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                {domain.classification.architecture}
              </span>
              <Link
                href={`/tree?id=${domain.classification.hgroup.id}`}
                className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200"
              >
                {domain.classification.hgroup.name}
              </Link>
              {domain.pfam.map(pfam => (
                <a
                  key={pfam.id}
                  href={`https://pfam.xfam.org/family/${pfam.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200"
                >
                  Pfam: {pfam.id}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Main content - Structure and Sequence visualization */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Domain visualization controls and classification */}
            <div className="lg:col-span-1">
              {/* Visualization Controls - using the ControlPanel component */}
              <ControlPanel 
                options={viewerOptions}
                onChange={updateViewerOptions}
                onReset={resetViewerOptions}
              />
              
              {/* Domain classification - using the ClassificationDisplay component */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium mb-3">ECOD Classification</h3>
                <ClassificationDisplay classification={domain.classification} />
              </div>
              
              {/* Pfam Mappings */}
              {domain.pfam.length > 0 && (
                <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-medium mb-3">Pfam Mappings</h3>
                  <div className="space-y-2">
                    {domain.pfam.map(pfam => (
                      <a
                        key={pfam.id}
                        href={`https://pfam.xfam.org/family/${pfam.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-purple-800">{pfam.id}</div>
                          <div className="text-xs text-purple-700">{pfam.name}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          E-value: {pfam.evalue.toExponential(2)}
                        </div>
                        <ExternalLink className="h-4 w-4 ml-2 text-purple-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Structure and sequence viewers */}
            <div className="lg:col-span-2">
              {/* Structure viewer */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">3D Structure</h3>
                </div>
                
                <div className="p-0">
                  <ClientOnly>
                    <div className="h-96 bg-gray-50 relative">
                      <StructureViewer
                        ref={structureViewerRef}
                        pdbId={domain.pdbId}
                        style={viewerOptions.style}
                        colorScheme={viewerOptions.colorScheme}
                        showSideChains={viewerOptions.showSideChains}
                        showLigands={viewerOptions.showLigands}
                        showWater={viewerOptions.showWater}
                        quality={viewerOptions.quality}
                        highlights={[{
                          start: domain.rangeStart,
                          end: domain.rangeEnd,
                          chainId: domain.chainId,
                          color: '#FF5722'
                        }]}
                        selectedPosition={highlightedPosition}
                        onResidueSelect={handleStructureResidueSelect}
                        onLoaded={handleStructureLoaded}
                        onError={handleStructureError}
                      />
                      
                      {!structureLoaded && (
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                          <LoadingState message="Loading structure..." size="small" />
                        </div>
                      )}
                    </div>
                  </ClientOnly>
                </div>
                
                {/* Structure related metadata/info */}
                {domain.ligands.length > 0 && (
                  <div className="bg-yellow-50 p-3 border-t">
                    <div className="text-sm flex items-center">
                      <Info className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Ligand Information:</span>
                      <div className="ml-2 flex flex-wrap gap-1">
                        {domain.ligands.map(ligand => (
                          <span key={ligand.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {ligand.name} ({ligand.id})
                            {ligand.count > 1 && <span className="ml-1">×{ligand.count}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sequence viewer */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Domain Sequence</h3>
                  <div className="flex items-center">
                    <button
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm mr-2 border border-blue-200 flex items-center"
                      onClick={() => setHighlightedPosition(null)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Clear selection
                    </button>
                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200">
                      <Download className="inline-block h-4 w-4 mr-1" />
                      FASTA
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded border overflow-x-auto">
                  <SequenceViewer
                    sequence={domain.sequence}
                    rangeStart={domain.rangeStart}
                    highlights={[
                      {
                        start: domain.rangeStart,
                        end: domain.rangeEnd,
                        color: '#4285F4',
                        className: 'domain-highlight'
                      }
                    ]}
                    features={domain.ligands.map(ligand => ({
                      type: 'ligand',
                      start: domain.rangeStart + Math.floor(Math.random() * domain.sequence.length), // For demo, in real app use actual binding sites
                      end: domain.rangeStart + Math.floor(Math.random() * domain.sequence.length),
                      color: '#FBBC05',
                      description: `${ligand.name} binding site`
                    }))}
                    onPositionSelect={handleSequencePositionSelect}
                    highlightedPosition={highlightedPosition}
                    showNumbering={true}
                    showAxis={true}
                    displayFormat="wrap"
                    residuesPerLine={50}
                    renderingMode="default"
                    displayHeight={200}
                    colorMapping={{
                      'A': '#80A0F0', 'R': '#00007C', 'N': '#00007C', 'D': '#A00042',
                      'C': '#F08080', 'Q': '#00007C', 'E': '#A00042', 'G': '#F09048',
                      'H': '#00007C', 'I': '#80A0F0', 'L': '#80A0F0', 'K': '#00007C',
                      'M': '#80A0F0', 'F': '#80A0F0', 'P': '#C040C0', 'S': '#00007C',
                      'T': '#00007C', 'W': '#80A0F0', 'Y': '#80A0F0', 'V': '#80A0F0'
                    }}
                  />
                </div>
                
                {highlightedPosition && (
                  <div className="mt-2 p-2 bg-blue-50 text-sm rounded">
                    <span className="font-medium">Selected position:</span> {highlightedPosition}
                    <span className="ml-2 text-gray-500">
                      (Residue {domain.sequence[highlightedPosition - domain.rangeStart]})
                    </span>
                  </div>
                )}
                
                {/* Sequence stats */}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Length:</span> {domain.sequence.length} amino acids
                  </div>
                  <div>
                    <span className="font-medium">Molecular Weight:</span> ~{Math.round(domain.sequence.length * 110)} Da
                  </div>
                </div>
              </div>
              
              {/* Similar domains */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-3">Similar Domains</h3>
                
                <div className="space-y-2">
                  {domain.similar.map(similar => (
                    <DomainCard
                      key={similar.id}
                      domain={{
                        id: similar.id,
                        description: similar.description,
                        similarity: similar.similarity,
                        range: "" // Not available in the data
                      }}
                      onClick={(id) => window.location.href = `/domain/${id}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Download and export section */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-3">Download & Export</h3>
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
                    <Share2 className="h-4 w-4 mr-2" />
                    Citation
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
