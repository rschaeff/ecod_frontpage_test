'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Search, Home, Download, HelpCircle, ExternalLink, 
  Menu, X, ChevronRight, ChevronDown, Info, Check, AlertCircle,
  Eye, Maximize2, RotateCw, ZoomIn, ZoomOut, Filter, Clock, BookOpen
} from 'lucide-react';

// Types for the manual representative domain view
interface TaxonomyCount {
  name: string;
  count: number;
  children?: TaxonomyCount[];
}

interface LengthDistribution {
  min: number;
  max: number;
  mean: number;
  median: number;
  bins: {
    range: string;
    count: number;
  }[];
}

interface ExperimentalDistribution {
  experimental: number;
  theoretical: number;
  unknownMethod: number;
}

interface ChildDomain {
  id: string;
  range: string;
  pdbId: string;
  chainId: string;
  title: string;
  organism: string;
  isExperimental: boolean;
  method: string;
  resolution?: string;
  similarity: number;
  length: number;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
}

interface ManualDomainData {
  id: string;
  title: string;
  range: string;
  pdbId: string;
  chainId: string;
  method: string;
  resolution?: string;
  length: number;
  sequence: string;
  classification: {
    architecture: string;
    xgroup: { id: string; name: string; };
    hgroup: { id: string; name: string; };
    tgroup: { id: string; name: string; };
    fgroup: { id: string; name: string; };
  };
  organism: string;
  curationNotes: string;
  curatedBy: string;
  curationDate: string;
  childDomains: ChildDomain[];
  taxonomyDistribution: TaxonomyCount[];
  lengthDistribution: LengthDistribution;
  experimentalDistribution: ExperimentalDistribution;
}

interface RepresentativePageParams {
  params: {
    id: string;
  };
}

export default function ManualRepresentativeView({ params }: RepresentativePageParams) {
  // State for loading and domain data
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<ManualDomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // UI state for tabs and filters
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'taxonomy' | 'length'>('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'domain-info': true,
    'curation-notes': true,
    'experimental-dist': true
  });
  
  // Child domain filter state
  const [childDomainsFilters, setChildDomainsFilters] = useState({
    showExperimental: true,
    showTheoretical: true,
    taxonomyFilter: 'all',
    sortBy: 'similarity' as 'similarity' | 'pdbId' | 'length'
  });
  
  // Fetch domain data based on ID
  useEffect(() => {
    setLoading(true);
    
    // In a real implementation, this would fetch data from your API
    // For demo, let's simulate a delay and return mock data
    const timer = setTimeout(() => {
      // Mock a manually curated representative domain
      const mockData: ManualDomainData = {
        id: `m${params.id}`,
        title: "TBP-like transcription factor",
        range: "10-180",
        pdbId: params.id.substring(0, 4).toUpperCase(),
        chainId: "A",
        method: "X-ray diffraction",
        resolution: "1.9Å",
        length: 171,
        sequence: "MADEQPQLQNQGQVGQPQVQGQVGQPQVGQPQVGQCIVLTSLGQEKVSALSIIKRPGLDFSILLSNSGRKDDILKIQFPSLCSLPGTGQDGVRVAPGLFVKADLPGDFVCISKGSKFQQYSPVLVAQGKSISKISMEIALKLKENEIAMIIVKNKMDLPELESDQQVD",
        classification: {
          architecture: "Alpha+beta proteins",
          xgroup: { id: "X.1.1", name: "TBP-like" },
          hgroup: { id: "H.1.1.1", name: "TATA-binding protein-like" },
          tgroup: { id: "T.1.1.1.1", name: "TATA-binding protein" },
          fgroup: { id: "F.1.1.1.1.1", name: "TATA-box binding protein family" }
        },
        organism: "Homo sapiens",
        curationNotes: "Manually selected as a high-quality representative domain for the TATA-binding protein family. This structure provides a clear view of the characteristic saddle-shaped DNA binding fold with a 10-stranded antiparallel beta-sheet and has been experimentally validated through both structural and functional studies.",
        curatedBy: "J. Smith",
        curationDate: "2023-05-15",
        childDomains: [
          {
            id: "e1cdcA1",
            range: "10-180",
            pdbId: "1CDC",
            chainId: "A",
            title: "TATA-box binding protein",
            organism: "Saccharomyces cerevisiae",
            isExperimental: true,
            method: "X-ray diffraction",
            resolution: "2.5Å",
            similarity: 95,
            length: 171,
            taxonomy: {
              kingdom: "Fungi",
              phylum: "Ascomycota",
              class: "Saccharomycetes",
              order: "Saccharomycetales",
              family: "Saccharomycetaceae",
              genus: "Saccharomyces",
              species: "S. cerevisiae"
            }
          },
          {
            id: "e2z8uA1",
            range: "15-178",
            pdbId: "2Z8U",
            chainId: "A",
            title: "TATA-box binding protein",
            organism: "Drosophila melanogaster",
            isExperimental: true,
            method: "X-ray diffraction",
            resolution: "2.1Å",
            similarity: 82,
            length: 164,
            taxonomy: {
              kingdom: "Animalia",
              phylum: "Arthropoda",
              class: "Insecta",
              order: "Diptera",
              family: "Drosophilidae",
              genus: "Drosophila",
              species: "D. melanogaster"
            }
          },
          {
            id: "e1vokA1",
            range: "12-175",
            pdbId: "1VOK",
            chainId: "A",
            title: "TBP-interacting protein",
            organism: "Encephalitozoon cuniculi",
            isExperimental: true,
            method: "X-ray diffraction",
            resolution: "1.9Å",
            similarity: 78,
            length: 164,
            taxonomy: {
              kingdom: "Fungi",
              phylum: "Microsporidia",
              class: "Microsporea",
              order: "Microsporida",
              family: "Unikaryonidae",
              genus: "Encephalitozoon",
              species: "E. cuniculi"
            }
          },
          {
            id: "e1mp9A1",
            range: "10-180",
            pdbId: "1MP9",
            chainId: "A",
            title: "TATA-binding protein",
            organism: "Arabidopsis thaliana",
            isExperimental: true,
            method: "X-ray diffraction",
            resolution: "1.9Å",
            similarity: 74,
            length: 171,
            taxonomy: {
              kingdom: "Plantae",
              phylum: "Tracheophyta",
              class: "Magnoliopsida",
              order: "Brassicales",
              family: "Brassicaceae",
              genus: "Arabidopsis",
              species: "A. thaliana"
            }
          },
          {
            id: "AF_P73131_F1",
            range: "8-177",
            pdbId: "AF_P73131",
            chainId: "F",
            title: "TATA-box binding protein",
            organism: "Synechococcus sp.",
            isExperimental: false,
            method: "AlphaFold prediction",
            similarity: 65,
            length: 170,
            taxonomy: {
              kingdom: "Bacteria",
              phylum: "Cyanobacteria",
              class: "Cyanophyceae",
              order: "Synechococcales",
              family: "Synechococcaceae",
              genus: "Synechococcus",
              species: "Synechococcus sp."
            }
          },
          {
            id: "AF_P58178_F1",
            range: "12-182",
            pdbId: "AF_P58178",
            chainId: "F",
            title: "TBP domain-containing protein",
            organism: "Methanocaldococcus jannaschii",
            isExperimental: false,
            method: "AlphaFold prediction",
            similarity: 58,
            length: 171,
            taxonomy: {
              kingdom: "Archaea",
              phylum: "Euryarchaeota",
              class: "Methanococci",
              order: "Methanococcales",
              family: "Methanocaldococcaceae",
              genus: "Methanocaldococcus",
              species: "M. jannaschii"
            }
          }
        ],
        taxonomyDistribution: [
          {
            name: "Bacteria",
            count: 15,
            children: [
              { name: "Proteobacteria", count: 6 },
              { name: "Firmicutes", count: 5 },
              { name: "Cyanobacteria", count: 3 },
              { name: "Other", count: 1 }
            ]
          },
          {
            name: "Archaea",
            count: 8,
            children: [
              { name: "Euryarchaeota", count: 5 },
              { name: "Crenarchaeota", count: 2 },
              { name: "Other", count: 1 }
            ]
          },
          {
            name: "Eukaryota",
            count: 48,
            children: [
              { name: "Fungi", count: 14 },
              { name: "Metazoa", count: 20, 
                children: [
                  { name: "Vertebrata", count: 12 },
                  { name: "Arthropoda", count: 5 },
                  { name: "Other", count: 3 }
                ]
              },
              { name: "Viridiplantae", count: 8 },
              { name: "Protists", count: 6 }
            ]
          }
        ],
        lengthDistribution: {
          min: 140,
          max: 182,
          mean: 168.4,
          median: 170,
          bins: [
            { range: "140-150", count: 3 },
            { range: "151-160", count: 8 },
            { range: "161-170", count: 32 },
            { range: "171-180", count: 25 },
            { range: "181-190", count: 3 }
          ]
        },
        experimentalDistribution: {
          experimental: 42,
          theoretical: 29,
          unknownMethod: 0
        }
      };
      
      if (params.id) {
        setDomain(mockData);
        setError(null);
      } else {
        setError("Invalid representative domain ID");
        setDomain(null);
      }
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Filter function for child domains
  const getFilteredChildDomains = () => {
    if (!domain) return [];
    
    return domain.childDomains.filter(child => {
      // Filter by experimental/theoretical
      if (!childDomainsFilters.showExperimental && child.isExperimental) return false;
      if (!childDomainsFilters.showTheoretical && !child.isExperimental) return false;
      
      // Filter by taxonomy
      if (childDomainsFilters.taxonomyFilter !== 'all') {
        if (child.taxonomy.kingdom.toLowerCase() !== childDomainsFilters.taxonomyFilter.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort based on selected sort option
      if (childDomainsFilters.sortBy === 'similarity') {
        return b.similarity - a.similarity;
      } else if (childDomainsFilters.sortBy === 'pdbId') {
        return a.pdbId.localeCompare(b.pdbId);
      } else {
        return a.length - b.length;
      }
    });
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading Representative Domain</h2>
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
              Representative Domain Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || `We couldn't find representative domain with ID: ${params.id}`}
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
              <Link href="/tree" className="hover:text-blue-600">Browse</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href={`/tree?id=${domain.classification.fgroup.id}`} className="hover:text-blue-600">
                {domain.classification.fgroup.id}
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700 font-medium">{domain.id}</span>
            </div>
          </div>
        </div>
        
        {/* Representative Domain header */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">{domain.id}</h1>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Manual Representative
                    </span>
                  </div>
                  <h2 className="text-xl text-gray-700">{domain.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {domain.organism} • {domain.length} residues
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">PDB:</span> {domain.pdbId} (Chain {domain.chainId})</div>
                  <div><span className="font-medium">Method:</span> {domain.method}</div>
                  <div><span className="font-medium">Resolution:</span> {domain.resolution}</div>
                  <div><span className="font-medium">ECOD:</span> {domain.classification.fgroup.id}</div>
                </div>
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
                <div className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                  {domain.childDomains.length} associated domains
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Navigation tabs */}
        <section className="mb-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex border-b overflow-x-auto">
                <button
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'children' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('children')}
                >
                  Associated Domains ({domain.childDomains.length})
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'taxonomy' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('taxonomy')}
                >
                  Taxonomy Distribution
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'length' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('length')}
                >
                  Length Distribution
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tab content */}
        <section className="mb-8">
          <div className="container mx-auto px-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Domain visualization and info */}
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
                          {/* Stylized representation of TBP protein domain */}
                          <g transform="translate(100,100)">
                            {/* Main saddle-like beta-sheet structure */}
                            <path 
                              d="M-50,-15 C-40,-25 -20,-30 0,-25 C20,-30 40,-25 50,-15 C40,-5 20,0 0,-5 C-20,0 -40,-5 -50,-15 Z" 
                              fill="#80cbc4" 
                              stroke="#26a69a" 
                              strokeWidth="1.5"
                            />
                            <path 
                              d="M-50,15 C-40,25 -20,30 0,25 C20,30 40,25 50,15 C40,5 20,0 0,5 C-20,0 -40,5 -50,15 Z" 
                              fill="#80cbc4" 
                              stroke="#26a69a" 
                              strokeWidth="1.5"
                            />
                            
                            {/* Alpha helices */}
                            <ellipse cx="-35" cy="-40" rx="12" ry="8" fill="#ef9a9a" stroke="#e57373" strokeWidth="1.5" />
                            <ellipse cx="35" cy="-40" rx="12" ry="8" fill="#ef9a9a" stroke="#e57373" strokeWidth="1.5" />
                            <ellipse cx="-35" cy="40" rx="12" ry="8" fill="#ef9a9a" stroke="#e57373" strokeWidth="1.5" />
                            <ellipse cx="35" cy="40" rx="12" ry="8" fill="#ef9a9a" stroke="#e57373" strokeWidth="1.5" />
                            
                            {/* Connecting loops */}
                            <path 
                              d="M-23,-40 C-15,-40 -15,-30 -10,-30 C-5,-30 -5,-20 0,-20" 
                              fill="none" 
                              stroke="#9e9e9e" 
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeDasharray="2,2"
                            />
                            <path 
                              d="M23,-40 C15,-40 15,-30 10,-30 C5,-30 5,-20 0,-20" 
                              fill="none" 
                              stroke="#9e9e9e" 
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeDasharray="2,2"
                            />
                            
                            {/* DNA binding groove */}
                            <path 
                              d="M-40,0 C-30,10 -20,15 0,10 C20,15 30,10 40,0" 
                              fill="none" 
                              stroke="#90caf9" 
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            
                            {/* N and C terminus labels */}
                            <text x="-45" y="-45" fontSize="10" fontWeight="bold">N</text>
                            <text x="40" y="45" fontSize="10" fontWeight="bold">C</text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Domain information */}
                  <div className="mt-6 bg-white rounded-lg shadow-md">
                    <div 
                      className="p-4 border-b flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('domain-info')}
                    >
                      <h3 className="font-medium">Domain Information</h3>
                      {expandedSections['domain-info'] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections['domain-info'] && (
                      <div className="p-4">
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Domain ID:</div>
                            <div className="col-span-2">{domain.id}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Title:</div>
                            <div className="col-span-2">{domain.title}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">PDB ID:</div>
                            <div className="col-span-2">
                              <a 
                                href={`https://www.rcsb.org/structure/${domain.pdbId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {domain.pdbId}
                              </a>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Chain:</div>
                            <div className="col-span-2">{domain.chainId}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Range:</div>
                            <div className="col-span-2">{domain.range}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Length:</div>
                            <div className="col-span-2">{domain.length} residues</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Method:</div>
                            <div className="col-span-2">{domain.method}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Resolution:</div>
                            <div className="col-span-2">{domain.resolution}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 border-b pb-2">
                            <div className="font-medium">Organism:</div>
                            <div className="col-span-2">{domain.organism}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Classification:</div>
                            <div className="col-span-2">
                              <div>{domain.classification.architecture}</div>
                              <div>
                                <Link 
                                  href={`/tree?id=${domain.classification.xgroup.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {domain.classification.xgroup.name}
                                </Link>
                              </div>
                              <div>
                                <Link 
                                  href={`/tree?id=${domain.classification.hgroup.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {domain.classification.hgroup.name}
                                </Link>
                              </div>
                              <div>
                                <Link 
                                  href={`/tree?id=${domain.classification.tgroup.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {domain.classification.tgroup.name}
                                </Link>
                              </div>
                              <div>
                                <Link 
                                  href={`/tree?id=${domain.classification.fgroup.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {domain.classification.fgroup.name}
                                </Link>
                                <span className="ml-2 text-gray-500">{domain.classification.fgroup.id}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Curation notes */}
                  <div className="mt-6 bg-white rounded-lg shadow-md">
                    <div 
                      className="p-4 border-b flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('curation-notes')}
                    >
                      <h3 className="font-medium">Curation Notes</h3>
                      {expandedSections['curation-notes'] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections['curation-notes'] && (
                      <div className="p-4">
                        <div className="flex mb-3">
                          <BookOpen className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-gray-700 text-sm">{domain.curationNotes}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500 flex items-center mt-4">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Curated by {domain.curatedBy} on {domain.curationDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right column - distributions and sequence */}
                <div className="lg:col-span-2">
                  {/* Experimental/Theoretical distribution */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div 
                      className="p-4 border-b flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('experimental-dist')}
                    >
                      <h3 className="font-medium">Experimental vs. Theoretical Distribution</h3>
                      {expandedSections['experimental-dist'] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedSections['experimental-dist'] && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Pie chart */}
                          <div className="flex items-center justify-center">
                            <div className="w-48 h-48 relative">
                              {/* SVG Pie Chart */}
                              <svg viewBox="0 0 100 100" width="100%" height="100%">
                                {/* Experimental slice - calculate percentages for stroke-dasharray */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  stroke="#4caf50"
                                  strokeWidth="20"
                                  strokeDasharray={`${(domain.experimentalDistribution.experimental / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod) * 251.2)} 251.2`}
                                  strokeDashoffset="0"
                                />
                                
                                {/* Theoretical slice */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  stroke="#2196f3"
                                  strokeWidth="20"
                                  strokeDasharray={`${(domain.experimentalDistribution.theoretical / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod) * 251.2)} 251.2`}
                                  strokeDashoffset={`-${(domain.experimentalDistribution.experimental / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod) * 251.2)}`}
                                />
                                
                                {/* Center circle */}
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="30" 
                                  fill="white" 
                                />
                                
                                {/* Text */}
                                <text x="50" y="45" textAnchor="middle" fontSize="10" fontWeight="bold">
                                  {domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical}
                                </text>
                                <text x="50" y="55" textAnchor="middle" fontSize="7">
                                  total domains
                                </text>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Stats table */}
                          <div>
                            <div className="text-sm">
                              <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b">
                                <div className="font-medium">Type</div>
                                <div className="font-medium text-right">Count</div>
                                <div className="font-medium text-right">Percentage</div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 mb-1 items-center">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                  Experimental
                                </div>
                                <div className="text-right">{domain.experimentalDistribution.experimental}</div>
                                <div className="text-right">
                                  {Math.round((domain.experimentalDistribution.experimental / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod)) * 100)}%
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 mb-1 items-center">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                  Theoretical
                                </div>
                                <div className="text-right">{domain.experimentalDistribution.theoretical}</div>
                                <div className="text-right">
                                  {Math.round((domain.experimentalDistribution.theoretical / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod)) * 100)}%
                                </div>
                              </div>
                              
                              {domain.experimentalDistribution.unknownMethod > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-1 items-center">
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                    Unknown
                                  </div>
                                  <div className="text-right">{domain.experimentalDistribution.unknownMethod}</div>
                                  <div className="text-right">
                                    {Math.round((domain.experimentalDistribution.unknownMethod / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod)) * 100)}%
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t font-medium">
                                <div>Total</div>
                                <div className="text-right">
                                  {domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical + domain.experimentalDistribution.unknownMethod}
                                </div>
                                <div className="text-right">100%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Domain sequence */}
                  <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Domain Sequence</h3>
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
                                {domain.range.split('-')[0] * 1 + start}
                              </div>
                              <div>
                                {formattedGroups.join(' ')}
                              </div>
                              <div className="w-12 text-left pl-2 text-gray-500">
                                {Math.min(domain.range.split('-')[0] * 1 + start + lineChars.length - 1, domain.range.split('-')[1] * 1)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick stats cards */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Associated domains card */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="text-lg font-bold text-blue-600">
                        {domain.childDomains.length}
                      </div>
                      <div className="text-sm text-gray-600">Associated domains</div>
                      <div className="mt-2 text-xs text-gray-500">
                        From {domain.taxonomyDistribution.length} major taxa
                      </div>
                      <button 
                        className="mt-3 text-xs text-blue-600 flex items-center"
                        onClick={() => setActiveTab('children')}
                      >
                        View all <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                    
                    {/* Length stats card */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="text-lg font-bold text-green-600">
                        {domain.lengthDistribution.median}
                      </div>
                      <div className="text-sm text-gray-600">Median length (aa)</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Range: {domain.lengthDistribution.min}-{domain.lengthDistribution.max} aa
                      </div>
                      <button 
                        className="mt-3 text-xs text-green-600 flex items-center"
                        onClick={() => setActiveTab('length')}
                      >
                        View distribution <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                    
                    {/* Experimental stats card */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="text-lg font-bold text-amber-600">
                        {Math.round((domain.experimentalDistribution.experimental / (domain.experimentalDistribution.experimental + domain.experimentalDistribution.theoretical)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Experimental structures</div>
                      <div className="mt-2 text-xs text-gray-500">
                        {domain.experimentalDistribution.experimental} experimental domains
                      </div>
                      <button 
                        className="mt-3 text-xs text-amber-600 flex items-center"
                        onClick={() => toggleSection('experimental-dist')}
                      >
                        View breakdown <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Associated Domains Tab */}
            {activeTab === 'children' && (
              <div>
                <div className="bg-white rounded-lg shadow-md">
                  {/* Filter and controls */}
                  <div className="p-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{getFilteredChildDomains().length}</span> of <span className="font-medium">{domain.childDomains.length}</span> domains associated with this representative
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center text-sm">
                            <input 
                              type="checkbox" 
                              className="mr-1" 
                              checked={childDomainsFilters.showExperimental}
                              onChange={() => setChildDomainsFilters({
                                ...childDomainsFilters,
                                showExperimental: !childDomainsFilters.showExperimental
                              })}
                            />
                            <span>Experimental</span>
                          </label>
                          
                          <label className="flex items-center text-sm">
                            <input 
                              type="checkbox" 
                              className="mr-1" 
                              checked={childDomainsFilters.showTheoretical}
                              onChange={() => setChildDomainsFilters({
                                ...childDomainsFilters,
                                showTheoretical: !childDomainsFilters.showTheoretical
                              })}
                            />
                            <span>Theoretical</span>
                          </label>
                        </div>
                        
                        <select 
                          className="border text-sm rounded px-2 py-1"
                          value={childDomainsFilters.taxonomyFilter}
                          onChange={(e) => setChildDomainsFilters({
                            ...childDomainsFilters,
                            taxonomyFilter: e.target.value
                          })}
                        >
                          <option value="all">All taxa</option>
                          <option value="bacteria">Bacteria</option>
                          <option value="archaea">Archaea</option>
                          <option value="eukaryota">Eukaryota</option>
                        </select>
                        
                        <select 
                          className="border text-sm rounded px-2 py-1"
                          value={childDomainsFilters.sortBy}
                          onChange={(e) => setChildDomainsFilters({
                            ...childDomainsFilters,
                            sortBy: e.target.value as 'similarity' | 'pdbId' | 'length'
                          })}
                        >
                          <option value="similarity">Sort by similarity</option>
                          <option value="pdbId">Sort by PDB ID</option>
                          <option value="length">Sort by length</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Domain list */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Domain ID
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PDB
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Organism
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Similarity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredChildDomains().map((child) => (
                          <tr key={child.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Link 
                                href={`/domain/${child.id}`}
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {child.id}
                              </Link>
                              <div className="text-xs text-gray-500">{child.range}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <a 
                                href={`https://www.rcsb.org/structure/${child.pdbId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {child.pdbId}
                              </a>
                              <div className="text-xs text-gray-500">Chain {child.chainId}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">{child.title}</div>
                              <div className="text-xs text-gray-500">{child.length} residues</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">{child.organism}</div>
                              <div className="text-xs text-gray-500">{child.taxonomy.kingdom}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${child.isExperimental ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                <div className="text-sm">{child.method}</div>
                              </div>
                              {child.resolution && (
                                <div className="text-xs text-gray-500 ml-4">{child.resolution}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="text-sm font-medium">{child.similarity}%</div>
                              <div className="w-16 h-2 bg-gray-200 rounded-full inline-block">
                                <div 
                                  className="h-full bg-green-500 rounded-full" 
                                  style={{ width: `${child.similarity}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Empty state */}
                  {getFilteredChildDomains().length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Filter className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No domains match the filter criteria</h3>
                      <p className="text-gray-500 text-sm">
                        Try changing the filter settings to see more domains.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Top Taxa cards */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {domain.taxonomyDistribution.map((taxa) => (
                    <div key={taxa.name} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-lg font-bold">{taxa.count}</div>
                          <div className="text-sm text-gray-600">{taxa.name}</div>
                        </div>
                        <div 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: taxa.name === 'Bacteria' ? '#e3f2fd' : 
                                            taxa.name === 'Archaea' ? '#f3e5f5' : 
                                            '#e8f5e9',
                            color: taxa.name === 'Bacteria' ? '#1565c0' : 
                                  taxa.name === 'Archaea' ? '#7b1fa2' : 
                                  '#2e7d32'
                          }}
                        >
                          {Math.round((taxa.count / domain.childDomains.length) * 100)}%
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {taxa.children?.slice(0, 3).map((child) => (
                          <div key={child.name} className="flex justify-between items-center text-xs">
                            <div className="text-gray-600">{child.name}</div>
                            <div className="text-gray-500">{child.count}</div>
                          </div>
                        ))}
                        {(taxa.children?.length ?? 0) > 3 && (
                          <div className="text-xs text-blue-600">
                            + {(taxa.children?.length ?? 0) - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Taxonomy Distribution Tab */}
            {activeTab === 'taxonomy' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4">Taxonomy Distribution</h3>
                  
                  {/* Taxonomy visualization */}
                  <div className="aspect-video bg-gray-50 border rounded-md p-4 flex items-center justify-center mb-6">
                    {/* This would be replaced with a real treemap or sunburst visualization */}
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <Database className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-gray-700 font-medium">
                        Interactive Taxonomy Visualization
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        In a real implementation, this would be an interactive treemap or sunburst chart<br />
                        showing the hierarchical taxonomy distribution of domains.
                      </p>
                    </div>
                  </div>
                  
                  {/* Kingdom breakdown */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-3">Kingdom-level Distribution</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {domain.taxonomyDistribution.map((kingdom) => (
                        <div key={kingdom.name} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium" style={{ 
                              color: kingdom.name === 'Bacteria' ? '#1565c0' : 
                                  kingdom.name === 'Archaea' ? '#7b1fa2' : 
                                  '#2e7d32'
                            }}>
                              {kingdom.name}
                            </h5>
                            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100">
                              {kingdom.count} domains
                            </span>
                          </div>
                          
                          {/* Progress bar for percentage */}
                          <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${(kingdom.count / domain.childDomains.length) * 100}%`,
                                backgroundColor: kingdom.name === 'Bacteria' ? '#2196f3' : 
                                              kingdom.name === 'Archaea' ? '#9c27b0' : 
                                              '#4caf50'
                              }}
                            ></div>
                          </div>
                          
                          {/* Children breakdown */}
                          <div className="space-y-2">
                            {kingdom.children?.map((phylum) => (
                              <div key={phylum.name} className="flex justify-between items-center text-sm">
                                <div>{phylum.name}</div>
                                <div className="text-gray-500">{phylum.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Table view for more detailed taxonomy */}
                  <div>
                    <h4 className="font-medium mb-3">Detailed Taxonomy Breakdown</h4>
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kingdom
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phylum
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Class
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* For brevity, just showing a few rows */}
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap" rowSpan={4}>Eukaryota</td>
                            <td className="px-4 py-3 whitespace-nowrap">Metazoa</td>
                            <td className="px-4 py-3 whitespace-nowrap">Vertebrata</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">12</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">17%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap">Metazoa</td>
                            <td className="px-4 py-3 whitespace-nowrap">Arthropoda</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">5</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">7%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap">Fungi</td>
                            <td className="px-4 py-3 whitespace-nowrap">Ascomycota</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">14</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">20%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap">Viridiplantae</td>
                            <td className="px-4 py-3 whitespace-nowrap">Embryophyta</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">8</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">11%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap" rowSpan={2}>Bacteria</td>
                            <td className="px-4 py-3 whitespace-nowrap">Proteobacteria</td>
                            <td className="px-4 py-3 whitespace-nowrap">Gammaproteobacteria</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">6</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">8%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap">Firmicutes</td>
                            <td className="px-4 py-3 whitespace-nowrap">Bacilli</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">5</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">7%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap" rowSpan={2}>Archaea</td>
                            <td className="px-4 py-3 whitespace-nowrap">Euryarchaeota</td>
                            <td className="px-4 py-3 whitespace-nowrap">Methanococci</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">5</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">7%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 whitespace-nowrap">Crenarchaeota</td>
                            <td className="px-4 py-3 whitespace-nowrap">Thermoprotei</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">2</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">3%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Length Distribution Tab */}
            {activeTab === 'length' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4">Length Distribution</h3>
                  
                  {/* Length stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">{domain.lengthDistribution.min}</div>
                      <div className="text-sm text-gray-600">Minimum Length</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{domain.lengthDistribution.mean.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Mean Length</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{domain.lengthDistribution.median}</div>
                      <div className="text-sm text-gray-600">Median Length</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">{domain.lengthDistribution.max}</div>
                      <div className="text-sm text-gray-600">Maximum Length</div>
                    </div>
                  </div>
                  
                  {/* Length histogram */}
                  <div className="mb-8">
                    <h4 className="font-medium mb-3">Length Distribution Histogram</h4>
                    <div className="aspect-video bg-white border rounded-lg p-6">
                      {/* Simple histogram visualization */}
                      <div className="h-full flex items-end justify-around">
                        {domain.lengthDistribution.bins.map((bin, index) => {
                          const maxCount = Math.max(...domain.lengthDistribution.bins.map(b => b.count));
                          const height = (bin.count / maxCount) * 100;
                          
                          return (
                            <div key={index} className="flex flex-col items-center">
                              <div 
                                className="w-16 bg-blue-500 rounded-t"
                                style={{ height: `${height}%` }}
                              >
                                <div className="text-white text-center mt-1 text-xs font-medium">
                                  {bin.count}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">{bin.range}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* X-axis label */}
                      <div className="text-center text-sm text-gray-600 mt-6">
                        Length (amino acids)
                      </div>
                    </div>
                  </div>
                  
                  {/* Length stats table */}
                  <div>
                    <h4 className="font-medium mb-3">Length Distribution Details</h4>
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Length Range
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Distribution
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {domain.lengthDistribution.bins.map((bin, index) => {
                            const totalCount = domain.lengthDistribution.bins.reduce((sum, b) => sum + b.count, 0);
                            const percentage = (bin.count / totalCount) * 100;
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {bin.range} aa
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {bin.count}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {percentage.toFixed(1)}%
                                </td>
                                <td className="px-4 py-3">
                                  <div className="w-full h-4 bg-gray-100 rounded-full">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
