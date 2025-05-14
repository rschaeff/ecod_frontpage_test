'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Database, Search, Home, Download, HelpCircle, ExternalLink,
  Menu, X, ChevronRight, Info, ArrowRight, Share2, AlertCircle,
  Eye, Maximize2, RotateCw, ZoomIn, ZoomOut, Settings, Sliders
} from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';
import dynamic from 'next/dynamic';

// Dynamically import the heavy visualization components to improve page load time
const StructureViewer = dynamic(() => import('@/components/StructureViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading 3D viewer...</div>
    </div>
  )
});

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

interface DomainPageParams {
  params: {
    id: string;
  };
}

interface ViewerOptions {
  style: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  colorScheme: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity';
  showSideChains: boolean;
  showLigands: boolean;
  showWater: boolean;
  quality: 'low' | 'medium' | 'high';
}

// Nightingale SequenceViewer component
function SequenceViewer({
  sequence,
  rangeStart,
  highlights = [],
  onPositionSelect,
  highlightedPosition = null
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !sequence) return;

    // In a real implementation, this would initialize the Nightingale SequenceViewer
    // For now, we'll create a simple sequence viewer
    const container = containerRef.current;
    container.innerHTML = '';

    // Create the sequence display
    const sequenceContainer = document.createElement('div');
    sequenceContainer.className = 'sequence-display font-mono text-sm leading-relaxed whitespace-pre';

    // Format sequence with 10 chars per group and 5 groups per line
    const charsPerLine = 50;
    const charsPerGroup = 10;
    const lines = Math.ceil(sequence.length / charsPerLine);

    for (let line = 0; line < lines; line++) {
      const lineStart = line * charsPerLine;
      const lineChars = sequence.slice(lineStart, lineStart + charsPerLine);
      const lineDiv = document.createElement('div');
      lineDiv.className = 'flex mb-1';

      // Position number at start of line
      const startNumberDiv = document.createElement('div');
      startNumberDiv.className = 'w-12 text-right pr-2 font-medium text-gray-500';
      startNumberDiv.textContent = String(rangeStart + lineStart);
      lineDiv.appendChild(startNumberDiv);

      // Sequence for this line
      const seqDiv = document.createElement('div');
      seqDiv.className = 'flex-1';

      // Group characters and create spans for each group
      for (let i = 0; i < lineChars.length; i += charsPerGroup) {
        const group = lineChars.slice(i, i + charsPerGroup);

        // Create a group with individual character spans
        const groupSpan = document.createElement('span');
        groupSpan.className = 'mr-1';

        for (let j = 0; j < group.length; j++) {
          const position = lineStart + i + j;
          const char = group[j];
          const charSpan = document.createElement('span');

          // Style based on highlights and selections
          const highlight = highlights.find(h =>
            position >= h.start - rangeStart && position <= h.end - rangeStart
          );

          const isSelected = highlightedPosition === position + rangeStart;

          if (isSelected) {
            charSpan.className = 'inline-block px-0.5 bg-yellow-300 text-black font-bold';
          } else if (highlight) {
            charSpan.className = `inline-block px-0.5 font-medium ${highlight.className || ''}`;
            charSpan.style.backgroundColor = highlight.color || '#4285F4';
            charSpan.style.color = 'white';
          } else {
            charSpan.className = 'inline-block px-0.5';
          }

          // Add click handler for selection
          charSpan.addEventListener('click', () => {
            if (onPositionSelect) onPositionSelect(position + rangeStart);
          });

          charSpan.textContent = char;
          groupSpan.appendChild(charSpan);
        }

        seqDiv.appendChild(groupSpan);
      }

      lineDiv.appendChild(seqDiv);

      // Position number at end of line
      const endNumberDiv = document.createElement('div');
      endNumberDiv.className = 'w-12 text-left pl-2 text-gray-500';
      endNumberDiv.textContent = String(Math.min(rangeStart + lineStart + lineChars.length - 1, rangeStart + sequence.length - 1));
      lineDiv.appendChild(endNumberDiv);

      sequenceContainer.appendChild(lineDiv);
    }

    container.appendChild(sequenceContainer);
  }, [sequence, rangeStart, highlights, highlightedPosition]);

  return (
    <div className="sequence-viewer w-full overflow-x-auto" ref={containerRef}>
      {/* Initial loading state */}
      {!sequence && <div className="h-40 bg-gray-100 animate-pulse"></div>}
    </div>
  );
}

// Main component
export default function DomainDetailPage({ params }: DomainPageParams) {
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<DomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [structureLoaded, setStructureLoaded] = useState<boolean>(false);
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    style: 'cartoon',
    colorScheme: 'chain',
    showSideChains: false,
    showLigands: true,
    showWater: false,
    quality: 'medium'
  });

  // Store refs to visualization components for method access
  const structureViewerRef = useRef(null);

  // Fetch domain data based on ID
  useEffect(() => {
    setLoading(true);

    // In a real implementation, this would fetch data from your API
    // For demo, we'll simulate a delay and return mock data
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
    setSelectedPosition(position);

    // Highlight the residue in the structure viewer if it's available
    if (structureViewerRef.current && structureViewerRef.current.highlightResidue) {
      structureViewerRef.current.highlightResidue(position);
    }
  };

  // Handle selection of a residue in the structure viewer
  const handleStructureResidueSelect = (position) => {
    setSelectedPosition(position);
  };

  // Update viewer options
  const updateViewerOptions = (newOptions) => {
    setViewerOptions(prev => ({
      ...prev,
      ...newOptions
    }));
  };

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">ECOD</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="flex items-center hover:text-blue-200">
                  <Home className="mr-1 h-4 w-4" />
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center">
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-t-transparent mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Domain Data</h2>
            <p className="text-gray-500 mt-2">
              Retrieving information for {params.id}...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // If error, show an error state
  if (error || !domain) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">ECOD</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="flex items-center hover:text-blue-200">
                  <Home className="mr-1 h-4 w-4" />
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center">
          <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-md">
            <div className="text-center text-red-500 text-5xl mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Domain Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || `We couldn't find domain with ID: ${params.id}`}
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/" className="bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition">
                Return to Home
              </Link>
              <Link href="/search" className="bg-gray-200 text-gray-800 py-2 rounded text-center hover:bg-gray-300 transition">
                Search for Domains
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If domain data is loaded, render the domain detail view
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with navigation */}
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
              <Link href="/distribution" className="flex items-center hover:text-blue-200">
                <Download className="mr-1 h-4 w-4" />
                Download
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
              <Link href="/distribution" className="flex items-center hover:text-blue-200 py-2">
                <Download className="mr-2 h-5 w-5" />
                Download
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

      {/* Main content */}
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href="/search" className="hover:text-blue-600">Search</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link
                href={`/protein/${domain.protein.id}`}
                className="hover:text-blue-600"
              >
                {domain.protein.id}
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700 font-medium">{domain.id}</span>
            </div>
          </div>
        </div>

        {/* Domain header */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    {domain.id}
                    {domain.representativeFor && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Representative
                      </span>
                    )}
                  </h1>
                  <h2 className="text-xl text-gray-700 mt-1">{domain.description}</h2>
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

              {/* Parent protein link - Prominently displayed */}
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
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Visualization Controls</h3>
                    <button className="p-1 rounded hover:bg-gray-100" title="Reset to defaults">
                      <RotateCw className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Style selector */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Style</label>
                    <select
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      value={viewerOptions.style}
                      onChange={e => updateViewerOptions({ style: e.target.value as any })}
                    >
                      <option value="cartoon">Cartoon</option>
                      <option value="ball-and-stick">Ball & Stick</option>
                      <option value="surface">Surface</option>
                      <option value="spacefill">Spacefill</option>
                    </select>
                  </div>

                  {/* Color scheme */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
                    <select
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      value={viewerOptions.colorScheme}
                      onChange={e => updateViewerOptions({ colorScheme: e.target.value as any })}
                    >
                      <option value="chain">Chain</option>
                      <option value="secondary-structure">Secondary Structure</option>
                      <option value="residue-type">Residue Type</option>
                      <option value="hydrophobicity">Hydrophobicity</option>
                    </select>
                  </div>

                  {/* Quality selector */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rendering Quality
                      <span className="text-xs text-gray-500 ml-1">(for performance)</span>
                    </label>
                    <select
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      value={viewerOptions.quality}
                      onChange={e => updateViewerOptions({ quality: e.target.value as any })}
                    >
                      <option value="low">Low (Faster)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Slower)</option>
                    </select>
                  </div>

                  {/* Toggle options */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showSideChains"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={viewerOptions.showSideChains}
                        onChange={e => updateViewerOptions({ showSideChains: e.target.checked })}
                      />
                      <label htmlFor="showSideChains" className="ml-2 text-sm text-gray-700">
                        Show side chains
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showLigands"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={viewerOptions.showLigands}
                        onChange={e => updateViewerOptions({ showLigands: e.target.checked })}
                      />
                      <label htmlFor="showLigands" className="ml-2 text-sm text-gray-700">
                        Show ligands
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showWater"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={viewerOptions.showWater}
                        onChange={e => updateViewerOptions({ showWater: e.target.checked })}
                      />
                      <label htmlFor="showWater" className="ml-2 text-sm text-gray-700">
                        Show water molecules
                      </label>
                    </div>
                  </div>
                </div>

                {/* ECOD Classification */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-medium mb-3">ECOD Classification</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold mr-2">A</div>
                      <div className="flex-1">
                        <div className="font-medium">{domain.classification.architecture}</div>
                        <div className="text-xs text-gray-500">Architecture</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-2">X</div>
                      <div className="flex-1">
                        <Link
                          href={`/tree?node=${domain.classification.xgroup.id}`}
                          className="font-medium hover:text-blue-600"
                        >
                          {domain.classification.xgroup.name}
                        </Link>
                        <div className="text-xs text-gray-500">X-group (Possible homology)</div>
                      </div>
                      <div className="text-xs text-gray-500">{domain.classification.xgroup.id}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-2">H</div>
                      <div className="flex-1">
                        <Link
                          href={`/tree?node=${domain.classification.hgroup.id}`}
                          className="font-medium hover:text-blue-600"
                        >
                          {domain.classification.hgroup.name}
                        </Link>
                        <div className="text-xs text-gray-500">H-group (Homology)</div>
                      </div>
                      <div className="text-xs text-gray-500">{domain.classification.hgroup.id}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold mr-2">T</div>
                      <div className="flex-1">
                        <Link
                          href={`/tree?node=${domain.classification.tgroup.id}`}
                          className="font-medium hover:text-blue-600"
                        >
                          {domain.classification.tgroup.name}
                        </Link>
                        <div className="text-xs text-gray-500">T-group (Topology)</div>
                      </div>
                      <div className="text-xs text-gray-500">{domain.classification.tgroup.id}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold mr-2">F</div>
                      <div className="flex-1">
                        <Link
                          href={`/tree?node=${domain.classification.fgroup.id}`}
                          className="font-medium hover:text-blue-600"
                        >
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
                    <div className="flex space-x-1">
                      <button className="p-1 rounded hover:bg-gray-200" title="Zoom In">
                        <ZoomIn className="h-4 w-4 text-gray-700" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200" title="Rotate">
                        <RotateCw className="h-4 w-4 text-gray-700" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200" title="Fullscreen">
                        <Maximize2 className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="p-0">
                    <ClientOnly>
                      <div className="h-96 bg-gray-50 relative">
                          <StructureViewer
                            ref={structureViewerRef}
                            pdbId={domain.pdbId}
                            style={viewerOptions.style}
                            colorScheme={viewerOptions.colorScheme as any}
                            showSideChains={viewerOptions.showSideChains}
                            showLigands={viewerOptions.showLigands}
                            showWater={viewerOptions.showWater}
                            quality={viewerOptions.quality as any}
                            highlights={[{
                              start: domain.rangeStart,
                              end: domain.rangeEnd,
                              chainId: domain.chainId,
                              color: '#FF5722'
                            }]}
                            selectedPosition={selectedPosition}
                            onResidueSelect={handleStructureResidueSelect}
                            onLoaded={handleStructureLoaded}
                            onError={handleStructureError}
                          />

                        {!structureLoaded && (
                          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                            <div className="text-center">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-t-transparent mb-2"></div>
                              <p className="text-gray-700">Loading structure...</p>
                            </div>
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
                        onClick={() => setSelectedPosition(null)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Clear selection
                      </button>
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200">
                        <Download className="inline-block h-3 w-3 mr-1" />
                        FASTA
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded border overflow-x-auto">
                    <NightingaleSequenceViewer
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
                      highlightedPosition={selectedPosition}
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

                  {selectedPosition && (
                    <div className="mt-2 p-2 bg-blue-50 text-sm rounded">
                      <span className="font-medium">Selected position:</span> {selectedPosition}
                      <span className="ml-2 text-gray-500">
                        (Residue {domain.sequence[selectedPosition - domain.rangeStart]})
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
                        className="flex items-center border rounded p-3 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <Link
                            href={`/domain/${similar.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {similar.id}
                          </Link>
                          <div className="text-sm text-gray-600">{similar.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-700">
                            {similar.similarity}% similar
                          </div>
                          <div className="text-xs text-gray-500">
                            {/* Visual similarity bar */}
                            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${similar.similarity}%` }}
                              ></div>
                            </div>
                          </div>
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
}
