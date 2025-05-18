'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Download, HelpCircle, ExternalLink, 
  ChevronRight, ChevronDown, Info, Check, 
  Eye, Maximize2, RotateCw, ZoomIn, ZoomOut, Filter, Clock, BookOpen
} from 'lucide-react';

// Import layout components
import AppLayout from '@/components/layout/AppLayout';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

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

interface RepresentativePageProps {
  domainId: string;
}

export default function ECODRepresentativePage({ domainId }: RepresentativePageProps) {
  // State for loading and domain data
  const [loading, setLoading] = useState<boolean>(true);
  const [domain, setDomain] = useState<ManualDomainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // UI state for tabs and filters
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'taxonomy' | 'length'>('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'domain-info': true,
    'curation-notes': true,
    'experimental-dist': true
  });
  
  // Child domain filter and pagination state
  const [childDomainsFilters, setChildDomainsFilters] = useState({
    showExperimental: true,
    showTheoretical: true,
    taxonomyFilter: 'all',
    sortBy: 'similarity' as 'similarity' | 'pdbId' | 'length'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({ key: 'similarity', direction: 'descending' });

  // Create breadcrumb items
  const breadcrumbs = domain ? [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/tree' },
    { label: domain.classification.fgroup.id, href: `/tree?id=${domain.classification.fgroup.id}` },
    { label: domain.id }
  ] : [];
  
  // Fetch domain data based on ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch from your API
        // For demo, we'll simulate the API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock a manually curated representative domain
        const mockData: ManualDomainData = {
          id: `m${domainId}`,
          title: "TBP-like transcription factor",
          range: "10-180",
          pdbId: domainId.substring(1, 5).toUpperCase(),
          chainId: "A",
          method: "X-ray diffraction",
          resolution: "1.9Å",
          length: 171,
          sequence: "MADEQPQLQNQGQVGQPQVQGQVGQPQVGQPQVGQCIVLTSLGQEKVSALSIIKRPGLDFSILLSNSGRKDDILKIQFPSLCSLPGTGQDGVRVAPGLFVKADLPGDFVCISKGSKFQQYSPVLVAQGKSISKISMEIALKLKENEIAMIIVKNKMDLPELESDQQVD",
          classification: {
            architecture: "Alpha+beta proteins",
            xgroup: { id: "x.1.1", name: "TBP-like" },
            hgroup: { id: "h.1.1.1", name: "TATA-binding protein-like" },
            tgroup: { id: "t.1.1.1.1", name: "TATA-binding protein" },
            fgroup: { id: "f.1.1.1.1.1", name: "TATA-box binding protein family" }
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
            // Add more domains as needed...
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
                { name: "Metazoa", count: 20 },
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
        
        setDomain(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load representative domain');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [domainId]);
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Filter and pagination logic for child domains
  const filteredDomains = domain ? domain.childDomains.filter(child => {
    if (!childDomainsFilters.showExperimental && child.isExperimental) return false;
    if (!childDomainsFilters.showTheoretical && !child.isExperimental) return false;
    
    if (childDomainsFilters.taxonomyFilter !== 'all') {
      if (child.taxonomy.kingdom.toLowerCase() !== childDomainsFilters.taxonomyFilter.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    const aValue = a[sortConfig.key as keyof ChildDomain];
    const bValue = b[sortConfig.key as keyof ChildDomain];
    
    if (sortConfig.direction === 'ascending') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  }) : [];
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const paginatedDomains = filteredDomains.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);
  
  // Generate pagination range
  const paginationRange = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationRange.push(i);
  }
  
  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };
  
  if (loading) {
    return (
      <AppLayout
        title="Loading Manual Representative..."
        activePage="tree"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/tree' }, { label: 'Loading...' }]}
      >
        <div className="flex justify-center items-center min-h-64">
          <LoadingState message={`Loading representative domain ${domainId}...`} size="large" />
        </div>
      </AppLayout>
    );
  }
  
  if (error || !domain) {
    return (
      <AppLayout
        title="Representative Domain Not Found"
        activePage="tree"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/tree' }, { label: 'Error' }]}
      >
        <ErrorState
          title="Representative Domain Not Found"
          message={error || `We couldn't find representative domain with ID: ${domainId}`}
          actions={
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
              >
                Return to Home
              </Link>
              <Link 
                href="/search" 
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-300 transition"
              >
                Search for Domains
              </Link>
            </div>
          }
        />
      </AppLayout>
    );
  }
  
  return (
    <AppLayout
      title={`${domain.id} - Manual Representative`}
      subtitle={domain.title}
      activePage="tree"
      breadcrumbs={breadcrumbs}
    >
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
              
              {/* Right column - sequence and quick stats */}
              <div className="lg:col-span-2">
                {/* Domain sequence */}
                <div className="bg-white rounded-lg shadow-md p-4">
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
                              {parseInt(domain.range.split('-')[0]) + start}
                            </div>
                            <div>
                              {formattedGroups.join(' ')}
                            </div>
                            <div className="w-12 text-left pl-2 text-gray-500">
                              {Math.min(parseInt(domain.range.split('-')[0]) + start + lineChars.length - 1, parseInt(domain.range.split('-')[1]))}
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
                      Showing <span className="font-medium">{paginatedDomains.length}</span> of <span className="font-medium">{filteredDomains.length}</span> domains
                      {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
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
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Domain list */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            Domain ID
                            {sortConfig.key === 'id' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('pdbId')}
                        >
                          <div className="flex items-center">
                            PDB
                            {sortConfig.key === 'pdbId' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('title')}
                        >
                          <div className="flex items-center">
                            Title
                            {sortConfig.key === 'title' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('organism')}
                        >
                          <div className="flex items-center">
                            Organism
                            {sortConfig.key === 'organism' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('method')}
                        >
                          <div className="flex items-center">
                            Method
                            {sortConfig.key === 'method' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('similarity')}
                        >
                          <div className="flex items-center justify-end">
                            Similarity
                            {sortConfig.key === 'similarity' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDomains.map((child) => (
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
                {filteredDomains.length === 0 && (
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

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="flex-1 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">
                          {Math.min(indexOfFirstItem + itemsPerPage, filteredDomains.length)}
                        </span> of <span className="font-medium">{filteredDomains.length}</span> domains
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          First
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>

                        {paginationRange.map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Taxonomy and Length tabs would go here - simplified for brevity */}
          {activeTab === 'taxonomy' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Taxonomy Distribution</h3>
              <p className="text-gray-600">Taxonomy distribution visualization and breakdown would be displayed here.</p>
            </div>
          )}
          
          {activeTab === 'length' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Length Distribution</h3>
              <p className="text-gray-600">Length distribution histogram and statistics would be displayed here.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
