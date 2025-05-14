'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, Search, Home, Download, HelpCircle, ExternalLink, 
  Menu, X, ChevronRight, Info, Eye, BookOpen 
} from 'lucide-react';

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

interface ProteinPageParams {
  params: {
    id: string;
  };
}

export default function ProteinViewWithId({ params }: ProteinPageParams) {
  const [loading, setLoading] = useState<boolean>(true);
  const [protein, setProtein] = useState<ProteinData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Fetch protein data based on ID
  useEffect(() => {
    setLoading(true);
    
    // In a real implementation, this would fetch data from your API
    // For demo, let's simulate a delay and return mock data
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
            description: "Domain 1"
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
            description: "Domain 2"
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
              Protein Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {error || `We couldn't find protein with ID: ${params.id.toUpperCase()}`}
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
        
        {/* Protein header */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    {protein.id}
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      PDB
                    </span>
                  </h1>
                  <h2 className="text-xl text-gray-700 mt-1">{protein.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {protein.organism} • {protein.length} residues
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 space-y-1 text-sm text-gray-600">
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
              </div>
            </div>
          </div>
        </section>
        
        {/* Main content grid */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Structure viewer */}
              <div className="lg:col-span-1">
                {/* Structure Viewer */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-medium">Protein Structure</h3>
                    <div className="flex space-x-1">
                      <button className="p-1 rounded hover:bg-gray-200" title="Zoom In">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200" title="Rotate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.5 2v6h-6"></path>
                          <path d="M2.5 12.2v-6h6"></path>
                          <path d="M21.5 11.8V18h-6"></path>
                          <path d="M2.5 18h6"></path>
                          <path d="M3 7.2A9 9 0 0 1 14.2 3"></path>
                          <path d="M14.2 21A9 9 0 0 1 3 16.8"></path>
                        </svg>
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200" title="Reset View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Mock 3D Viewer */}
                  <div className="aspect-square bg-gray-100 p-4 flex items-center justify-center relative">
                    {/* This would be replaced with a real 3D viewer in production */}
                    <div className="w-56 h-56 bg-white rounded-full shadow-inner relative">
                      {/* Visual representation of domain structure */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 220 220">
                          {/* Mock protein backbone */}
                          <path 
                            d="M30,110 C70,40 150,40 190,110 C150,180 70,180 30,110 Z" 
                            fill="none" 
                            stroke="#CCCCCC" 
                            strokeWidth="3"
                          />
                          
                          {/* Domain 1 */}
                          <path 
                            d="M30,110 C70,40 110,40 110,110" 
                            fill="none" 
                            stroke={protein.domains[0].color}
                            strokeWidth={highlightedDomain === protein.domains[0].id ? "6" : "4"}
                            opacity={highlightedDomain && highlightedDomain !== protein.domains[0].id ? "0.5" : "1"}
                          />
                          
                          {/* Domain 2 */}
                          <path 
                            d="M110,110 C110,180 150,180 190,110" 
                            fill="none" 
                            stroke={protein.domains[1].color}
                            strokeWidth={highlightedDomain === protein.domains[1].id ? "6" : "4"}
                            opacity={highlightedDomain && highlightedDomain !== protein.domains[1].id ? "0.5" : "1"}
                          />
                          
                          {/* Domain labels */}
                          <text x="55" y="70" fill={protein.domains[0].color} fontWeight="bold" fontSize="12">
                            {protein.domains[0].description}
                          </text>
                          <text x="140" y="150" fill={protein.domains[1].color} fontWeight="bold" fontSize="12">
                            {protein.domains[1].description}
                          </text>
                          
                          {/* N and C terminus labels */}
                          <text x="20" y="115" fill="#333" fontWeight="bold" fontSize="14">N</text>
                          <text x="195" y="115" fill="#333" fontWeight="bold" fontSize="14">C</text>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Highlighted domain info overlay */}
                    {highlightedDomain && (
                      <div className="absolute bottom-2 left-2 right-2 bg-white rounded shadow-md p-2 text-sm border">
                        <div className="font-medium" style={{ color: protein.domains.find(d => d.id === highlightedDomain)?.color }}>
                          {protein.domains.find(d => d.id === highlightedDomain)?.description}
                        </div>
                        <div className="text-gray-600 text-xs">
                          Residues {protein.domains.find(d => d.id === highlightedDomain)?.range}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Structure viewer controls */}
                  <div className="p-2 bg-gray-50 border-t flex justify-between items-center text-sm">
                    <div>
                      <select className="border rounded px-2 py-1 text-sm bg-white">
                        <option>Cartoon</option>
                        <option>Surface</option>
                        <option>Ball & Stick</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" checked />
                        <span className="text-xs">Labels</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-1" />
                        <span className="text-xs">Ligands</span>
                      </label>
                    </div>
                  </div>
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
                      <BookOpen className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">
                        <span className="font-medium">Structure:</span> Smith J, et al. (2023). "Crystal structure of {protein.name}." <a href="#" className="text-blue-600 hover:underline">J Mol Biol</a>
                      </p>
                    </div>
                    <div className="flex">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-1" />
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
                        <div 
                          key={domain.id}
                          className={`border rounded-md p-3 transition-all ${
                            highlightedDomain === domain.id
                              ? 'border-gray-500 bg-gray-50 shadow-sm'
                              : 'border-gray-200'
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
                                <span>ECOD: {domain.ecod.fgroup}</span>
                                <span className="mx-2">•</span>
                                <span>Residues: {domain.range}</span>
                              </div>
                            </div>
                            <Link 
                              href={`/domain/${domain.id}`}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100"
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
                    <h3 className="text-lg font-medium">Protein Sequence</h3>
                    <div>
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm border border-blue-200">
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
