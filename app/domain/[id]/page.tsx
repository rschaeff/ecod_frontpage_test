'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database, Search, Home, Download, HelpCircle, ExternalLink,
  Menu, X, ChevronRight, Info, ArrowRight, Share2, AlertCircle,
  Eye, Maximize2, RotateCw, ZoomIn, ZoomOut
} from 'lucide-react';

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
  similar: {              // Similar domains
    id: string;
    similarity: number;   // Percentage similarity
    description: string;
  }[];
  pfam: {                 // Pfam mappings
    id: string;
    name: string;
    evalue: number;
  }[];
  ligands: {              // Bound ligands
    id: string;
    name: string;
    count: number;
  }[];
}

interface DomainPageParams {
  params: {
    id: string;
  };
}

export default function DomainDetailPage({ params }: DomainPageParams) {
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<DomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [viewerOptions, setViewerOptions] = useState({
    style: 'cartoon' as const,
    showSideChains: false,
    showLigands: true
  });

  // Fetch domain data based on ID
  useEffect(() => {
    setLoading(true);

    // In a real implementation, this would fetch data from your API
    // For demo, let's simulate a delay and return mock data
    const timer = setTimeout(() => {
      // Extract components of the domain ID
      // Format is typically e[PDBID][Chain][Number], e.g., e4ubpA1
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
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

        {/* Main content grid */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Structure viewer and classification */}
              <div className="lg:col-span-1">
                {/* Domain structure viewer */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-medium">Domain Structure</h3>
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

                  {/* Domain 3D visualization (mock) */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {/* Mock structure visualization */}
                    <div className="w-56 h-56 relative flex items-center justify-center">
                      <svg viewBox="0 0 200 200" width="200" height="200">
                        {/* Stylized representation of a protein domain */}
                        <g transform="translate(100,100)">
                          {/* Alpha helices */}
                          <path
                            d="M-50,-30 C-55,-50 -35,-60 -20,-50 C-10,-45 -5,-30 -15,-20 C-25,-10 -40,-15 -50,-30Z"
                            fill="#4285F4"
                            stroke="#2A56C6"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M-10,0 C-20,15 -10,35 10,40 C25,42 35,30 30,15 C25,0 10,-5 -10,0Z"
                            fill="#4285F4"
                            stroke="#2A56C6"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M-20,-15 C-15,-5 -5,0 10,-5 C20,-10 20,-25 10,-35 C0,-40 -25,-25 -20,-15Z"
                            fill="#4285F4"
                            stroke="#2A56C6"
                            strokeWidth="1.5"
                          />
                          {/* Beta strands */}
                          <path
                            d="M15,-40 L40,-30 L40,-10 L15,-20 Z"
                            fill="#EA4335"
                            stroke="#B31412"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M20,-15 L45,-5 L45,15 L20,5 Z"
                            fill="#EA4335"
                            stroke="#B31412"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M15,10 L40,20 L40,40 L15,30 Z"
                            fill="#EA4335"
                            stroke="#B31412"
                            strokeWidth="1.5"
                          />
                          {/* Connecting loops */}
                          <path
                            d="M-20,-15 Q0,-30 15,-40"
                            fill="none"
                            stroke="#AAAAAA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="2,2"
                          />
                          <path
                            d="M15,-20 Q5,-25 20,-15"
                            fill="none"
                            stroke="#AAAAAA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="2,2"
                          />
                          <path
                            d="M20,5 Q0,10 15,10"
                            fill="none"
                            stroke="#AAAAAA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="2,2"
                          />
                          <path
                            d="M-10,0 Q-25,-5 -15,-20"
                            fill="none"
                            stroke="#AAAAAA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="2,2"
                          />
                          <path
                            d="M15,30 Q0,35 10,40"
                            fill="none"
                            stroke="#AAAAAA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="2,2"
                          />

                          {/* Ligand (if any) */}
                          {domain.ligands.length > 0 && (
                            <g transform="translate(30,-15)">
                              <rect x="-10" y="-5" width="20" height="10" fill="#FBBC05" stroke="#EA8600" />
                              <text x="0" y="2" textAnchor="middle" fontSize="6" fill="#000">DNA</text>
                            </g>
                          )}

                          {/* N and C terminus labels */}
                          <text x="-55" y="-35" fontSize="10" fontWeight="bold">N</text>
                          <text x="25" y="45" fontSize="10" fontWeight="bold">C</text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Structure viewer controls */}
                  <div className="p-2 bg-gray-50 border-t flex justify-between items-center text-sm">
                    <div>
                      <select
                        className="border rounded px-2 py-1 text-xs bg-white"
                        value={viewerOptions.style}
                        onChange={(e) => setViewerOptions({
                          ...viewerOptions,
                          style: e.target.value as 'cartoon'
                        })}
                      >
                        <option value="cartoon">Cartoon</option>
                        <option value="surface">Surface</option>
                        <option value="ballAndStick">Ball & Stick</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={viewerOptions.showSideChains}
                          onChange={(e) => setViewerOptions({
                            ...viewerOptions,
                            showSideChains: e.target.checked
                          })}
                        />
                        <span className="text-xs">Side chains</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={viewerOptions.showLigands}
                          onChange={(e) => setViewerOptions({
                            ...viewerOptions,
                            showLigands: e.target.checked
                          })}
                        />
                        <span className="text-xs">Ligands</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ECOD Classification */}
                <div className="mt-4 bg-white rounded-lg shadow-md p-4">
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

              {/* Right column - Domain details and sequence */}
              <div className="lg:col-span-2">
                {/* Domain in protein context */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Domain in Protein Context</h3>
                    <Link
                      href={`/protein/${domain.protein.id}`}
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      View full protein
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>

                  {/* Protein architecture visualization */}
                  <div className="relative h-16 mb-6 bg-gray-50 p-3 rounded-lg">
                    {/* Protein backbone */}
                    <div className="absolute top-8 left-0 right-0 h-1.5 bg-gray-300 rounded-full"></div>

                    {/* N and C terminus labels */}
                    <div className="absolute top-8 -left-4 transform -translate-y-1/2 font-bold text-xs">N</div>
                    <div className="absolute top-8 -right-4 transform -translate-y-1/2 font-bold text-xs">C</div>

                    {/* Current domain highlight */}
                    <div
                      className="absolute h-6 rounded-md bg-blue-500 border-2 border-blue-700"
                      style={{
                        top: '24px',
                        left: `${(domain.rangeStart / domain.protein.length) * 100}%`,
                        width: `${((domain.rangeEnd - domain.rangeStart + 1) / domain.protein.length) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap text-blue-800">
                        {domain.range}
                      </div>
                    </div>

                    {/* Other domains (mockup) */}
                    {domain.domainNum === 1 && (
                      <div
                        className="absolute h-6 rounded-md bg-red-500"
                        style={{
                          top: '24px',
                          left: `${(253 / domain.protein.length) * 100}%`,
                          width: `${((339 - 253 + 1) / domain.protein.length) * 100}%`,
                        }}
                      ></div>
                    )}
                    {domain.domainNum === 2 && (
                      <div
                        className="absolute h-6 rounded-md bg-green-500"
                        style={{
                          top: '24px',
                          left: `${(159 / domain.protein.length) * 100}%`,
                          width: `${((252 - 159 + 1) / domain.protein.length) * 100}%`,
                        }}
                      ></div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      This domain is located at residues <strong>{domain.range}</strong> of the full protein structure,
                      which is <strong>{domain.protein.length}</strong> residues in length.
                    </p>
                  </div>
                </div>

                {/* Domain sequence */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Domain Sequence</h3>
                    <div>
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200">
                        <Download className="inline-block h-3 w-3 mr-1" />
                        FASTA
                      </button>
                    </div>
                  </div>

                  {/* Sequence display */}
                  <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                    <div className="font-mono text-sm leading-relaxed whitespace-pre">
                      {/* Format sequence with 10 chars per group and 5 groups per line */}
                      {Array.from({ length: Math.ceil(domain.sequence.length / 50) }).map((_, lineIndex) => {
                        const start = lineIndex * 50;
                        const lineChars = domain.sequence.slice(start, start + 50);
                        const formattedGroups = [];

                        // Group by 10 characters
                        for (let i = 0; i < lineChars.length; i += 10) {
                          formattedGroups.push(lineChars.slice(i, i + 10));
                        }

                        return (
                          <div key={lineIndex} className="flex mb-1">
                            <div className="w-12 text-right pr-2 font-medium text-gray-500">
                              {domain.rangeStart + start}
                            </div>
                            <div>
                              {formattedGroups.join(' ')}
                            </div>
                            <div className="w-12 text-left pl-2 text-gray-500">
                              {Math.min(domain.rangeStart + start + lineChars.length - 1, domain.rangeEnd)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

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
