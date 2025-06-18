'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Download, Info, ArrowRight, AlertCircle, Eye, ChevronRight,
  Share2, ExternalLink, FileText, Home, Database, HelpCircle, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { convertDomainFormat, ThreeDMolDomain } from '@/types/protein';

// Dynamic import for 3DMol viewer
const ThreeDMolViewer = dynamic(
  () => import('@/components/visualization/ThreeDMolViewer'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-96 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading 3D viewer...</div>
        </div>
      </div>
    )
  }
);

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

// Minimal layout components since they're not provided
const AppLayout: React.FC<{
  title: string;
  subtitle?: string;
  activePage?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}> = ({ title, subtitle, breadcrumbs, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">ECOD</h1>
              <p className="hidden md:block ml-2 text-sm">Evolutionary Classification of Protein Domains</p>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="flex items-center hover:text-blue-200">
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link href="/tree" className="flex items-center hover:text-blue-200">
                <Database className="mr-1 h-4 w-4" />
                Browse
              </Link>
              <Link href="/documentation" className="flex items-center hover:text-blue-200">
                <HelpCircle className="mr-1 h-4 w-4" />
                Help
              </Link>
              <a href="http://prodata.swmed.edu/" className="flex items-center hover:text-blue-200" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                Lab Homepage
              </a>
            </nav>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden rounded-md p-2 hover:bg-blue-600 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 space-y-3">
              <Link href="/" className="flex items-center hover:text-blue-200 py-2">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>
              <Link href="/tree" className="flex items-center hover:text-blue-200 py-2">
                <Database className="mr-2 h-5 w-5" />
                Browse
              </Link>
              <Link href="/documentation" className="flex items-center hover:text-blue-200 py-2">
                <HelpCircle className="mr-2 h-5 w-5" />
                Help
              </Link>
              <a href="http://prodata.swmed.edu/" className="flex items-center hover:text-blue-200 py-2" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                Lab Homepage
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Breadcrumb */}
      {breadcrumbs && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-blue-600">{crumb.label}</Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2014-2025 Grishin lab/HHMI/UTSW</p>
            <p className="text-sm mt-2 md:mt-0">Last database update: develop292 - 08302024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoadingState: React.FC<{ message: string; size?: 'small' | 'medium' | 'large' }> = ({ 
  message, 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ 
  title: string; 
  message: string; 
  actions?: React.ReactNode 
}> = ({ title, message, actions }) => (
  <div className="flex items-center justify-center p-8">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <div className="text-center text-red-500 text-5xl mb-4">
        <AlertCircle className="mx-auto h-16 w-16" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{title}</h2>
      <p className="text-gray-600 mb-6 text-center">{message}</p>
      {actions && (
        <div className="flex flex-col space-y-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

export default function DomainDetail({ params }: DomainPageParams) {
  // State definitions
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<DomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPosition, setHighlightedPosition] = useState<number | null>(null);
  const [structureLoaded, setStructureLoaded] = useState<boolean>(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    style: 'cartoon',
    colorScheme: 'chain',
    showSideChains: false,
    showLigands: true,
    showWater: false,
    quality: 'medium'
  });

  // Refs for components
  const structureViewerRef = useRef<any>(null);

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
    console.log('Domain structure loaded successfully');
    setStructureLoaded(true);
    setStructureError(null);
  };

  // Handle structure loading error
  const handleStructureError = (err: string) => {
    console.error('Error loading domain structure:', err);
    setStructureError(err);
    setStructureLoaded(false);
  };

  // Handle selection of a position in the sequence viewer
  const handleSequencePositionSelect = (position: number) => {
    setHighlightedPosition(position);

    // Highlight the residue in the structure viewer if it's available
    if (structureViewerRef.current && structureViewerRef.current.current) {
      // You could implement residue highlighting here
      console.log('Highlighting residue at position:', position);
    }
  };

  // Update viewer options
  const updateViewerOptions = (newOptions: Partial<ViewerOptions>) => {
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

  // Convert domain to 3DMol format
  const getDomainFor3DMol = (): ThreeDMolDomain[] => {
    if (!domain) return [];

    // Create a pseudo ProteinDomain to convert
    const pseudoDomain = {
      id: domain.id,
      range: domain.range,
      rangeStart: domain.rangeStart,
      rangeEnd: domain.rangeEnd,
      ecod: {
        xgroup: domain.classification.xgroup.id,
        hgroup: domain.classification.hgroup.id,
        tgroup: domain.classification.tgroup.id,
        fgroup: domain.classification.fgroup.id
      },
      color: '#FF5722', // Orange color for the domain
      description: domain.description
    };

    return [convertDomainFormat(pseudoDomain, domain.chainId)];
  };

  // If loading, show loading state
  if (loading) {
    return (
      <AppLayout
        title="Loading Domain"
        activePage="tree"
      >
        <LoadingState message={`Loading domain information for ${params.id}...`} />
      </AppLayout>
    );
  }

  // If error, show error state
  if (error || !domain) {
    return (
      <AppLayout
        title="Domain Not Found"
        activePage="tree"
      >
        <ErrorState
          title="Domain Not Found"
          message={error || `We couldn't find domain with ID: ${params.id}`}
          actions={
            <>
              <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition">
                Return to Home
              </Link>
              <Link href="/search" className="bg-gray-200 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-300 transition">
                Search for Domains
              </Link>
            </>
          }
        />
      </AppLayout>
    );
  }

  // If domain data is loaded, render the domain detail view
  return (
    <AppLayout
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
                  <h2 className="text-xl font-bold text-gray-800">{domain.id}</h2>
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
              {/* Visualization Controls */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-medium mb-3">Viewer Controls</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={viewerOptions.style}
                      onChange={(e) => updateViewerOptions({ style: e.target.value as any })}
                    >
                      <option value="cartoon">Cartoon</option>
                      <option value="ball-and-stick">Ball and Stick</option>
                      <option value="surface">Surface</option>
                      <option value="spacefill">Space Fill</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showSideChains"
                      checked={viewerOptions.showSideChains}
                      onChange={(e) => updateViewerOptions({ showSideChains: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="showSideChains" className="text-sm text-gray-700">Show Side Chains</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showLigands"
                      checked={viewerOptions.showLigands}
                      onChange={(e) => updateViewerOptions({ showLigands: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="showLigands" className="text-sm text-gray-700">Show Ligands</label>
                  </div>
                  
                  <button
                    onClick={resetViewerOptions}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Domain classification */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-medium mb-3">ECOD Classification</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold mr-2 text-sm">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{domain.classification.architecture}</div>
                      <div className="text-xs text-gray-500">Architecture</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-2 text-sm">
                      X
                    </div>
                    <div className="flex-1">
                      <Link href={`/tree?node=${domain.classification.xgroup.id}`} className="font-medium hover:text-blue-600">
                        {domain.classification.xgroup.name}
                      </Link>
                      <div className="text-xs text-gray-500">X-group (Possible homology)</div>
                    </div>
                    <div className="text-xs text-gray-500">{domain.classification.xgroup.id}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-2 text-sm">
                      H
                    </div>
                    <div className="flex-1">
                      <Link href={`/tree?node=${domain.classification.hgroup.id}`} className="font-medium hover:text-blue-600">
                        {domain.classification.hgroup.name}
                      </Link>
                      <div className="text-xs text-gray-500">H-group (Homology)</div>
                    </div>
                    <div className="text-xs text-gray-500">{domain.classification.hgroup.id}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold mr-2 text-sm">
                      T
                    </div>
                    <div className="flex-1">
                      <Link href={`/tree?node=${domain.classification.tgroup.id}`} className="font-medium hover:text-blue-600">
                        {domain.classification.tgroup.name}
                      </Link>
                      <div className="text-xs text-gray-500">T-group (Topology)</div>
                    </div>
                    <div className="text-xs text-gray-500">{domain.classification.tgroup.id}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold mr-2 text-sm">
                      F
                    </div>
                    <div className="flex-1">
                      <Link href={`/tree?node=${domain.classification.fgroup.id}`} className="font-medium hover:text-blue-600">
                        {domain.classification.fgroup.name}
                      </Link>
                      <div className="text-xs text-gray-500">F-group (Family)</div>
                    </div>
                    <div className="text-xs text-gray-500">{domain.classification.fgroup.id}</div>
                  </div>
                </div>
              </div>

              {/* Pfam Mappings */}
              {domain.pfam.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
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
                  <h3 className="font-medium">3D Structure: {domain.pdbId}_{domain.chainId}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (structureViewerRef.current) {
                          structureViewerRef.current.current?.reset?.();
                        }
                      }}
                      disabled={!structureLoaded}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        if (structureViewerRef.current) {
                          const dataUrl = structureViewerRef.current.current?.exportImage?.();
                          if (dataUrl) {
                            const link = document.createElement('a');
                            link.href = dataUrl;
                            link.download = `${domain.id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }
                      }}
                      disabled={!structureLoaded}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      Export
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <ThreeDMolViewer
                    ref={structureViewerRef}
                    pdbId={domain.pdbId}
                    chainId={domain.chainId}
                    domains={getDomainFor3DMol()}
                    height="500px"
                    width="100%"
                    onStructureLoaded={handleStructureLoaded}
                    onError={handleStructureError}
                    showControls={true}
                    showLoading={true}
                  />

                  {/* Error overlay */}
                  {structureError && (
                    <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center p-4">
                      <div className="text-center text-red-700">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium mb-2">Structure Loading Error</div>
                        <div className="text-sm">{structureError}</div>
                        <div className="mt-3">
                          <a
                            href={`https://www.rcsb.org/structure/${domain.pdbId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View in RCSB PDB
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* Structure status */}
                <div className="p-2 bg-gray-50 border-t flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      structureLoaded ? 'bg-green-500' : structureError ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-xs text-gray-600">
                      {structureLoaded ? 'Structure loaded' : structureError ? 'Error loading' : 'Loading...'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Resolution: {domain.protein.resolution}
                  </div>
                </div>
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
                  <div className="p-3 font-mono text-sm leading-relaxed">
                    {/* Simple sequence display */}
                    {Array.from({ length: Math.ceil(domain.sequence.length / 50) }).map((_, lineIndex) => {
                      const lineStart = lineIndex * 50;
                      const lineChars = domain.sequence.slice(lineStart, lineStart + 50);
                      
                      return (
                        <div key={lineIndex} className="flex">
                          <div className="w-12 text-right pr-2 font-medium text-gray-500">
                            {domain.rangeStart + lineStart}
                          </div>
                          <div>
                            {Array.from(lineChars).map((char, i) => {
                              const position = domain.rangeStart + lineStart + i;
                              const isHighlighted = highlightedPosition === position;
                              
                              return (
                                <span 
                                  key={i}
                                  className={`cursor-pointer ${isHighlighted ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                                  onClick={() => handleSequencePositionSelect(position)}
                                  style={{ padding: '0 1px' }}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                    <div 
                      key={similar.id}
                      className="border rounded-md p-3 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="font-medium">{similar.description}</div>
                          <div className="text-sm text-gray-500">
                            Domain ID: {similar.id}
                          </div>
                        </div>
                        <div className="text-right mr-3">
                          <div className="font-medium text-green-700">
                            {similar.similarity}% similar
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${similar.similarity}%` }}
                            ></div>
                          </div>
                        </div>
                        <Link 
                          href={`/domain/${similar.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100"
                        >
                          View
                        </Link>
                      </div>
                    </div>
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
    </AppLayout>
  );
}
