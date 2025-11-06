'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Database, Search, Home, Download, HelpCircle, ExternalLink,
  Menu, X, ChevronRight, Info, Eye, BookOpen, Share2
} from 'lucide-react';
import { ProteinChain, ProteinDomain, ViewerOptions, parseProteinId } from '@/types/protein';
import ProteinStructureViewer from '@/components/protein/ProteinStructureViewer';

interface ProteinPageParams {
  params: {
    id: string;  // Should be "2UUB_A" or "2UUB" format
  };
}

export default function ProteinViewWithId({ params }: ProteinPageParams) {
  const [loading, setLoading] = useState<boolean>(true);
  const [protein, setProtein] = useState<ProteinChain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [structureLoaded, setStructureLoaded] = useState<boolean>(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);

  // Structure viewer options
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions>({
    style: 'cartoon',
    showSideChains: false,
    showLigands: true,
    showLabels: true,
    zoom: 1
  });

  // Refs for components
  const proteinStructureViewerRef = useRef<any>(null);

  // Fetch protein data based on ID
  useEffect(() => {
    const fetchProteinData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call the real API endpoint
        const response = await fetch(`/api/proteins/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Protein ${params.id} not found`);
          } else {
            setError('Failed to load protein data');
          }
          setProtein(null);
          setLoading(false);
          return;
        }

        const apiData = await response.json();

        // Parse the protein ID to get PDB ID and chain ID
        const { pdbId, chainId } = parseProteinId(params.id);

        // Get sequence from API if available (for now we'll need to fetch separately)
        // TODO: Extend API to include sequence data
        const sequenceResponse = await fetch(`/api/sequences/${apiData.pdb_id}_${apiData.chain_id || chainId}`).catch(() => null);
        let sequence = '';

        if (sequenceResponse && sequenceResponse.ok) {
          const seqData = await sequenceResponse.json();
          sequence = seqData.sequence || '';
        }

        // Calculate protein length from domains or sequence
        const length = sequence.length ||
          (apiData.domains.length > 0 ?
            Math.max(...apiData.domains.map((d: any) => d.rangeEnd || 0)) : 0);

        // Transform API response to component's expected format
        const proteinData: ProteinChain = {
          pdbId: apiData.pdb_id,
          chainId: apiData.chain_id || chainId,
          id: apiData.id,
          entityId: 1,
          uniprotId: apiData.uniprotId || '',
          name: apiData.name || `Protein ${apiData.pdb_id}`,
          organism: apiData.organism || 'Unknown organism',
          length: length,
          sequence: sequence,
          domains: apiData.domains.map((d: any) => ({
            id: d.id,
            range: d.range,
            rangeStart: d.rangeStart,
            rangeEnd: d.rangeEnd,
            chainId: apiData.chain_id || chainId,
            ecod: {
              architecture: 'Unknown', // Not in current API response
              xgroup: d.ecod.xgroup,
              hgroup: d.ecod.hgroup,
              tgroup: d.ecod.tgroup,
              fgroup: d.ecod.fgroup
            },
            color: d.color,
            description: d.description
          })),
          resolution: apiData.resolution ? `${apiData.resolution}Å` : 'N/A',
          method: apiData.method || 'Unknown',
          releaseDate: 'N/A' // Not available in current API
        };

        setProtein(proteinData);
        setError(null);
      } catch (err) {
        console.error('Error fetching protein data:', err);
        setError('Failed to load protein data');
        setProtein(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProteinData();
  }, [params.id]);

  // Download PDB structure
  const handleDownloadPDB = async () => {
    if (!protein) return;

    try {
      const response = await fetch(`/api/structures/${protein.pdbId}`);
      if (!response.ok) {
        console.error('Failed to download PDB structure');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${protein.pdbId}.pdb`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDB structure:', error);
    }
  };

  // Download chain FASTA
  const handleDownloadFasta = async () => {
    if (!protein) return;

    try {
      const response = await fetch(`/api/sequences/${protein.id}?format=fasta`);
      if (!response.ok) {
        console.error('Failed to download FASTA');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${protein.id}.fasta`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading FASTA:', error);
    }
  };

  // Download domain JSON
  const handleDownloadDomainJSON = () => {
    if (!protein) return;

    const domainData = {
      protein_id: protein.id,
      pdb_id: protein.pdbId,
      chain_id: protein.chainId,
      name: protein.name,
      organism: protein.organism,
      length: protein.length,
      domains: protein.domains.map(d => ({
        id: d.id,
        range: d.range,
        ecod_classification: d.ecod,
        description: d.description
      }))
    };

    const dataStr = JSON.stringify(domainData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${protein.id}_domains.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Generate citation text
  const generateCitation = (format: 'bibtex' | 'apa' | 'mla') => {
    if (!protein) return '';

    const year = new Date().getFullYear();
    const url = `https://prodata.swmed.edu/ecod/complete/protein/${protein.id}`;

    switch (format) {
      case 'bibtex':
        return `@misc{ecod_${protein.id},
  title = {ECOD Protein ${protein.id}: ${protein.name}},
  author = {ECOD Consortium},
  year = {${year}},
  howpublished = {\\url{${url}}},
  note = {Evolutionary Classification of Protein Domains}
}`;

      case 'apa':
        return `ECOD Consortium. (${year}). ECOD Protein ${protein.id}: ${protein.name}. Retrieved from ${url}`;

      case 'mla':
        return `ECOD Consortium. "ECOD Protein ${protein.id}: ${protein.name}." ECOD Database, ${year}, ${url}.`;

      default:
        return '';
    }
  };

  // Copy citation to clipboard
  const copyCitation = async (format: 'bibtex' | 'apa' | 'mla') => {
    const citation = generateCitation(format);
    try {
      await navigator.clipboard.writeText(citation);
      alert(`${format.toUpperCase()} citation copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  };

  // Handle domain hover
  const handleDomainHover = (domainId: string | null) => {
    setHighlightedDomain(domainId);
  };

  // Handle structure loading completion
  const handleStructureLoaded = () => {
    console.log('Structure loaded successfully');
    setStructureLoaded(true);
    setStructureError(null);
  };

  // Handle structure loading error
  const handleStructureError = (err: string) => {
    console.error('Structure loading error:', err);
    setStructureError(err);
    setStructureLoaded(false);
  };

  // Handle domain clicks from the structure viewer
  const handleDomainClick = (domainId: string) => {
    setHighlightedDomain(domainId);
  };

  // Handle viewer options changes
  const handleViewerOptionsChange = (newOptions: ViewerOptions) => {
    setViewerOptions(newOptions);
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
            <h2 className="text-xl font-semibold text-gray-700">Loading Protein Data</h2>
            <p className="text-gray-500 mt-2">
              Retrieving information for {params.id.toUpperCase()}...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // If error, show an error state
  if (error || !protein) {
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
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Protein Chain Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || `We couldn't find protein chain with ID: ${params.id.toUpperCase()}`}
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/" className="bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition">
                Return to Home
              </Link>
              <Link href="/search" className="bg-gray-200 text-gray-800 py-2 rounded text-center hover:bg-gray-300 transition">
                Search for Proteins
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate coverage percentage correctly
  const coveragePercent = protein.domains.length > 0 ?
    Math.round((protein.domains.reduce((sum, d) => sum + (d.rangeEnd - d.rangeStart + 1), 0) / protein.length) * 100) :
    0;

  // If protein data is loaded, render the protein view
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
              <span className="text-gray-700 font-medium">{protein.id} Protein View</span>
            </div>
          </div>
        </div>

        {/* Protein header - CORRECTED */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    {protein.id}  {/* Now shows "2UUB_A" instead of just "2UUB" */}
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      PDB
                    </span>
                  </h1>
                  <h2 className="text-xl text-gray-700 mt-1">{protein.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {protein.organism} • {protein.length} residues {/* CORRECTED: actual length */}
                    <span className="ml-2 text-sm">Chain {protein.chainId}</span>
                  </p>
                </div>

                <div className="mt-4 md:mt-0 space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">PDB ID:</span> {protein.pdbId}</div>
                  <div><span className="font-medium">Chain:</span> {protein.chainId}</div>
                  <div><span className="font-medium">Method:</span> {protein.method}</div>
                  <div><span className="font-medium">Resolution:</span> {protein.resolution}</div>
                  <div><span className="font-medium">Released:</span> {protein.releaseDate}</div>
                  {protein.uniprotId && (
                    <div>
                      <span className="font-medium">UniProt:</span>
                      <a href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                        {protein.uniprotId}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/domain/${protein.domains[0].id}`}
                  className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                >
                  {protein.domains.length} domains
                </Link>
                <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                  {protein.domains.map(d => d.ecod.hgroup).filter((v, i, a) => a.indexOf(v) === i).length} H-groups
                </span>
                <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  {coveragePercent}% coverage
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main content grid */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Enhanced 3D Structure viewer */}
              <div className="lg:col-span-1">
                <ProteinStructureViewer
                  ref={proteinStructureViewerRef}
                  protein={{
                    id: protein.id,
                    uniprotId: protein.uniprotId || '',
                    name: protein.name,
                    pdbId: protein.pdbId,
                    chainId: protein.chainId,
                    organism: protein.organism,
                    length: protein.length,
                    sequence: protein.sequence,
                    domains: protein.domains.map(d => ({
                        id: d.id,
                        range: d.range,
                        rangeStart: d.rangeStart,
                        rangeEnd: d.rangeEnd,
                        chainId: d.chainId,  // Added missing chainId property
                        ecod: {
                          architecture: d.ecod.architecture,  // Added missing architecture
                          xgroup: d.ecod.xgroup,
                          hgroup: d.ecod.hgroup,
                          tgroup: d.ecod.tgroup,
                          fgroup: d.ecod.fgroup
                        },
                        color: d.color,
                        description: d.description
                    })),
                    resolution: protein.resolution || '',
                    method: protein.method,
                    releaseDate: protein.releaseDate
                  }}
                  highlightedDomain={highlightedDomain}
                  viewerOptions={viewerOptions}
                  onViewerOptionsChange={handleViewerOptionsChange}
                  onStructureLoaded={handleStructureLoaded}
                  onStructureError={handleStructureError}
                  onDomainClick={handleDomainClick}
                  height="600px"
                  showControls={true}
                  showDomainSelector={true}
                  className="mb-4"
                />

                {/* External links */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <h3 className="font-medium mb-3">External Resources</h3>
                  <div className="space-y-2">
                    <a href={`https://www.rcsb.org/structure/${protein.pdbId}`}
                       target="_blank"
                       rel="noreferrer"
                       className="flex items-center text-blue-600 hover:underline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in RCSB PDB
                    </a>
                    {protein.uniprotId && (
                      <a href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center text-blue-600 hover:underline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        UniProt Entry
                      </a>
                    )}
                    {protein.uniprotId && (
                      <a href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center text-blue-600 hover:underline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        AlphaFold Structure
                      </a>
                    )}
                  </div>
                </div>

                {/* References */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-medium mb-3">References</h3>
                  <div className="text-sm space-y-3">
                    {(protein.pmid || protein.doi) && (
                      <div className="flex">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-1" />
                        <p className="text-gray-700">
                          <span className="font-medium">Structure:</span> View the original publication{' '}
                          {protein.doi && (
                            <a
                              href={`https://doi.org/${protein.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              via DOI
                            </a>
                          )}
                          {protein.doi && protein.pmid && ' or '}
                          {protein.pmid && (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${protein.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              via PubMed
                            </a>
                          )}
                        </p>
                      </div>
                    )}
                    {!protein.pmid && !protein.doi && (
                      <div className="flex">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-1" />
                        <p className="text-gray-700">
                          <span className="font-medium">Structure:</span> View details on{' '}
                          <a
                            href={`https://www.rcsb.org/structure/${protein.pdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            RCSB PDB
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="flex">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">
                        <span className="font-medium">Classification:</span> Cheng H, et al. (2014). "ECOD: An Evolutionary Classification of Protein Domains."{' '}
                        <a
                          href="https://doi.org/10.1371/journal.pcbi.1003926"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          PLoS Comput Biol
                        </a>
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

                  {/* Domain details - CORRECTED ECOD format */}
                  <div className="mt-8">
                    <h4 className="font-medium mb-2">Domain Details</h4>
                    <div className="space-y-2">
                      {protein.domains.map(domain => (
                        <div
                          key={domain.id}
                          className={`border rounded-md p-3 transition-all cursor-pointer ${
                            highlightedDomain === domain.id
                              ? 'border-gray-500 bg-gray-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onMouseEnter={() => handleDomainHover(domain.id)}
                          onMouseLeave={() => handleDomainHover(null)}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-sm mr-2"
                              style={{ backgroundColor: domain.color }}
                            ></div>
                            <div className="flex-1">
                              <div className="font-medium">{domain.description}</div>
                              <div className="text-sm text-gray-500">
                                <span>ECOD: {domain.ecod.fgroup}</span> {/* CORRECTED: no F. prefix */}
                                <span className="mx-2">•</span>
                                <span>Residues: {domain.range}</span>
                                <span className="mx-2">•</span>
                                <span>Chain: {domain.chainId}</span>
                              </div>
                            </div>
                            <Link
                              href={`/domain/${domain.id}`}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sequence viewer */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Chain {protein.chainId} Sequence</h3>
                    <div>
                      <button
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200"
                        onClick={handleDownloadFasta}
                      >
                        <Download className="inline-block h-3 w-3 mr-1" />
                        Download FASTA
                      </button>
                    </div>
                  </div>

                  {/* Interactive sequence display */}
                  <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                    <div className="font-mono text-sm leading-relaxed whitespace-pre">
                      {/* Format sequence with colors based on domains */}
                      {Array.from({ length: Math.ceil(protein.sequence.length / 60) }).map((_, lineIndex) => {
                        const lineStart = lineIndex * 60;
                        const lineChars = protein.sequence.slice(lineStart, lineStart + 60);

                        return (
                          <div key={lineIndex} className="flex">
                            <div className="w-12 text-right pr-2 font-medium text-gray-500">
                              {lineStart + 1}
                            </div>
                            <div>
                              {Array.from(lineChars).map((char, i) => {
                                const position = lineStart + i + 1;
                                const color = getColorForPosition(position);
                                const isHighlighted = color && highlightedDomain &&
                                  highlightedDomain === protein.domains.find(d =>
                                    position >= d.rangeStart && position <= d.rangeEnd
                                  )?.id;

                                return (
                                  <span
                                    key={i}
                                    style={{
                                      backgroundColor: color || undefined,
                                      color: color ? 'white' : undefined,
                                      fontWeight: color ? 'bold' : undefined,
                                      opacity: color && highlightedDomain && !isHighlighted ? 0.5 : 1,
                                      padding: '0 1px'
                                    }}
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

                  {/* Sequence info */}
                  <div className="mt-3 text-sm text-gray-500 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    <span>Hovering over domains will highlight their regions in the sequence and 3D structure.</span>
                  </div>
                </div>

                {/* Download section */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-3">Download Data</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200"
                      onClick={handleDownloadPDB}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDB Structure
                    </button>
                    <button
                      className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200"
                      onClick={handleDownloadFasta}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Chain FASTA
                    </button>
                    <button
                      className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200"
                      onClick={handleDownloadDomainJSON}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Domain JSON
                    </button>
                    <button
                      className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded border border-blue-200"
                      onClick={() => setShowCitationModal(true)}
                    >
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

      {/* Citation Modal */}
      {showCitationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Cite This Protein</h2>
                <button
                  onClick={() => setShowCitationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* BibTeX */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">BibTeX</h3>
                    <button
                      onClick={() => copyCitation('bibtex')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded border text-xs overflow-x-auto">
                    {generateCitation('bibtex')}
                  </pre>
                </div>

                {/* APA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">APA</h3>
                    <button
                      onClick={() => copyCitation('apa')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border text-sm">
                    {generateCitation('apa')}
                  </div>
                </div>

                {/* MLA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">MLA</h3>
                    <button
                      onClick={() => copyCitation('mla')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border text-sm">
                    {generateCitation('mla')}
                  </div>
                </div>

                {/* Reference */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Primary Citation</h3>
                  <p className="text-xs text-gray-600">
                    Cheng, H., Schaeffer, R. D., Liao, Y., Kinch, L. N., Pei, J., Shi, S., Kim, B.-H., & Grishin, N. V. (2014).
                    <span className="italic"> ECOD: an evolutionary classification of protein domains.</span> PLoS Computational Biology, 10(12), e1003926.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCitationModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
