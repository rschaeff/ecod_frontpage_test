'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Database, Search, Home, Download, HelpCircle, ExternalLink, 
  Menu, X, ChevronRight, Info, Upload, ZoomIn, ZoomOut, 
  RotateCcw, RotateCw, Maximize, Minimize, Eye, EyeOff 
} from 'lucide-react';

// Types for protein domains
interface ProteinDomain {
  id: string;         // Domain ID (e.g., e4ubpA1)
  range: string;      // Residue range (e.g., '1-150')
  rangeStart: number; // Numeric start of range
  rangeEnd: number;   // Numeric end of range
  ecod: {             // ECOD classification
    xgroup: string;   // X-group (possible homology)
    hgroup: string;   // H-group (homology)
    tgroup: string;   // T-group (topology)
    fgroup: string;   // F-group (family)
  };
  color: string;      // Color for visualization
  description: string; // Domain description/name
}

interface ProteinData {
  id: string;          // Protein ID (e.g., PDB ID)
  uniprotId: string;   // UniProt accession
  name: string;        // Protein name
  organism: string;    // Source organism
  length: number;      // Sequence length
  sequence: string;    // Full amino acid sequence
  domains: ProteinDomain[]; // Array of domains in the protein
  resolution: string;  // Structure resolution (if applicable)
  method: string;      // Experimental method
  releaseDate: string; // Structure release date
}

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

// Protein Structure Viewer component (mock)
const ProteinStructureViewer = ({ 
  protein, 
  highlightedDomain, 
  viewerOptions 
}: { 
  protein: ProteinData; 
  highlightedDomain: string | null;
  viewerOptions: {
    style: 'cartoon' | 'surface' | 'ball-and-stick';
    showLabels: boolean;
    showSideChains: boolean;
    zoom: number;
  };
}) => {
  // This is a mock component - in a real application, this would use a molecular
  // visualization library like NGL, Mol*, or 3Dmol.js

  // Determine which domain is highlighted
  const highlightedDomainData = protein.domains.find(d => d.id === highlightedDomain);
  
  return (
    <div className="bg-gray-100 rounded-lg border overflow-hidden relative">
      <div className="p-3 bg-gray-200 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Protein Structure: {protein.id}</h3>
        <div className="flex space-x-2">
          <button className="p-1 hover:bg-gray-300 rounded" title="Zoom in">
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded" title="Zoom out">
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded" title="Rotate left">
            <RotateCcw className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded" title="Rotate right">
            <RotateCw className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded" title="Fullscreen">
            <Maximize className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="aspect-square flex items-center justify-center relative">
        {/* Mock structure representation */}
        <div className="w-64 h-64 relative flex items-center justify-center">
          {/* Base protein structure representation */}
          <div className="w-56 h-56 bg-white rounded-full border shadow-inner relative overflow-hidden">
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
                
                {/* Domain 1 representation */}
                <path 
                  d="M30,110 C70,40 110,40 110,110" 
                  fill="none" 
                  stroke={protein.domains[0].color}
                  strokeWidth={highlightedDomain === protein.domains[0].id ? "6" : "4"}
                  opacity={highlightedDomain && highlightedDomain !== protein.domains[0].id ? "0.5" : "1"}
                />
                
                {/* Domain 2 representation */}
                <path 
                  d="M110,110 C110,180 150,180 190,110" 
                  fill="none" 
                  stroke={protein.domains[1].color}
                  strokeWidth={highlightedDomain === protein.domains[1].id ? "6" : "4"}
                  opacity={highlightedDomain && highlightedDomain !== protein.domains[1].id ? "0.5" : "1"}
                />
                
                {/* Domain labels */}
                <text x="55" y="70" fill={protein.domains[0].color} fontWeight="bold" fontSize="12">
                  Domain 1
                </text>
                <text x="140" y="150" fill={protein.domains[1].color} fontWeight="bold" fontSize="12">
                  Domain 2
                </text>
                
                {/* N and C terminus labels */}
                <text x="20" y="115" fill="#333" fontWeight="bold" fontSize="14">N</text>
                <text x="195" y="115" fill="#333" fontWeight="bold" fontSize="14">C</text>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Display info about highlighted domain */}
        {highlightedDomainData && (
          <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md text-sm">
            <p className="font-medium" style={{ color: highlightedDomainData.color }}>
              {highlightedDomainData.description} ({highlightedDomainData.range})
            </p>
          </div>
        )}
      </div>
      
      {/* Viewer options */}
      <div className="p-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <select 
            className="bg-white border px-2 py-1 rounded text-xs"
            value={viewerOptions.style}
          >
            <option value="cartoon">Cartoon</option>
            <option value="surface">Surface</option>
            <option value="ball-and-stick">Ball and Stick</option>
          </select>
          
          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={viewerOptions.showLabels} className="rounded" />
            <span>Labels</span>
          </label>
          
          <label className="flex items-center space-x-1 cursor-pointer">
            <input type="checkbox" checked={viewerOptions.showSideChains} className="rounded" />
            <span>Side chains</span>
          </label>
        </div>
        
        <div className="text-xs text-gray-500">
          <span>Resolution: {protein.resolution}</span>
        </div>
      </div>
    </div>
  );
};

// Protein Domain Map component
const ProteinDomainMap = ({ 
  protein, 
  highlightedDomain, 
  onDomainHover 
}: { 
  protein: ProteinData; 
  highlightedDomain: string | null; 
  onDomainHover: (domainId: string | null) => void;
}) => {
  // Calculate positions based on protein length
  const positionPercentage = (position: number) => {
    return (position / protein.length) * 100;
  };
  
  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Domain Architecture</h3>
      
      {/* Protein sequence visualization */}
      <div className="relative h-16 mb-4">
        {/* Protein backbone */}
        <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
        
        {/* N-terminus label */}
        <div className="absolute top-4 left-0 transform -translate-x-2">
          <div className="font-bold text-gray-700">N</div>
        </div>
        
        {/* C-terminus label */}
        <div className="absolute top-4 right-0 transform translate-x-2">
          <div className="font-bold text-gray-700">C</div>
        </div>
        
        {/* Domains */}
        {protein.domains.map(domain => (
          <div 
            key={domain.id}
            className="absolute h-6 rounded-lg cursor-pointer transform -translate-y-1/2 transition-all duration-200"
            style={{
              top: '30px',
              left: `${positionPercentage(domain.rangeStart)}%`,
              width: `${positionPercentage(domain.rangeEnd - domain.rangeStart + 1)}%`,
              backgroundColor: domain.color,
              opacity: highlightedDomain && highlightedDomain !== domain.id ? 0.6 : 1,
              border: highlightedDomain === domain.id ? '2px solid #333' : '1px solid rgba(0,0,0,0.1)',
              zIndex: highlightedDomain === domain.id ? 10 : 1
            }}
            onMouseEnter={() => onDomainHover(domain.id)}
            onMouseLeave={() => onDomainHover(null)}
          >
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              {domain.description}
            </div>
            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs">
              {domain.range}
            </div>
          </div>
        ))}
        
        {/* Position markers */}
        <div className="absolute top-9 left-0 text-xs text-gray-500">1</div>
        <div className="absolute top-9 right-0 text-xs text-gray-500">{protein.length}</div>
      </div>
      
      {/* Domain legend */}
      <div className="border-t pt-3 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Domains</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {protein.domains.map(domain => (
            <div 
              key={domain.id} 
              className={`flex items-center p-2 rounded border ${highlightedDomain === domain.id ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}`}
              onMouseEnter={() => onDomainHover(domain.id)}
              onMouseLeave={() => onDomainHover(null)}
            >
              <div 
                className="w-4 h-4 rounded mr-2 flex-shrink-0" 
                style={{ backgroundColor: domain.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{domain.description}</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="mr-2">
                    <Link href={`/domain/${domain.id}`} className="text-blue-600 hover:underline font-medium">
                      {domain.id}
                    </Link>
                  </span>
                  <span>Range: {domain.range}</span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 pl-2">
                {domain.ecod.fgroup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sequence Viewer component
const SequenceViewer = ({ 
  protein, 
  highlightedDomain 
}: { 
  protein: ProteinData; 
  highlightedDomain: string | null;
}) => {
  // Find the highlighted domain data
  const highlightedDomainData = highlightedDomain 
    ? protein.domains.find(d => d.id === highlightedDomain) 
    : null;
  
  // Function to get the style for each amino acid based on domain
  const getResidueStyle = (index: number) => {
    // 1-indexed to 0-indexed
    const position = index + 1;
    
    // Find which domain this residue belongs to
    const domain = protein.domains.find(
      d => position >= d.rangeStart && position <= d.rangeEnd
    );
    
    if (!domain) {
      return {};
    }
    
    return {
      backgroundColor: domain.color,
      color: 'white',
      fontWeight: 'bold',
      opacity: highlightedDomain && highlightedDomain !== domain.id ? 0.5 : 1
    };
  };
  
  // Format the sequence with 10 residues per group and 6 groups per line
  const formatSequence = () => {
    const sequence = protein.sequence;
    const formattedSequence = [];
    
    // Group by 10 residues
    for (let i = 0; i < sequence.length; i += 10) {
      const group = sequence.slice(i, i + 10);
      formattedSequence.push(
        <span key={`group-${i}`} className="mr-1">
          {group.split('').map((aa, index) => (
            <span 
              key={i + index} 
              className="inline-block monospace px-0.5"
              style={getResidueStyle(i + index)}
            >
              {aa}
            </span>
          ))}
        </span>
      );
    }
    
    // Group by 6 groups per line (60 residues per line)
    const lines = [];
    for (let i = 0; i < formattedSequence.length; i += 6) {
      const lineGroups = formattedSequence.slice(i, i + 6);
      lines.push(
        <div key={`line-${i}`} className="flex mb-1">
          <div className="w-10 text-right pr-2 text-xs text-gray-500">
            {i * 10 + 1}
          </div>
          <div className="flex-1">
            {lineGroups}
          </div>
          <div className="w-10 text-left pl-2 text-xs text-gray-500">
            {Math.min((i + 6) * 10, protein.sequence.length)}
          </div>
        </div>
      );
    }
    
    return lines;
  };
  
  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-800">Protein Sequence</h3>
        <div className="flex items-center space-x-2">
          <button className="text-xs flex items-center text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
            <Download className="h-3 w-3 mr-1" />
            FASTA
          </button>
          <button className="text-xs flex items-center text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
            <Eye className="h-3 w-3 mr-1" />
            Show all
          </button>
        </div>
      </div>
      
      {/* Highlight info */}
      {highlightedDomainData && (
        <div className="bg-gray-50 p-2 rounded mb-3 text-sm flex items-center">
          <Info className="h-4 w-4 text-blue-500 mr-2" />
          <span>
            Highlighting domain: <strong>{highlightedDomainData.description}</strong> (residues {highlightedDomainData.range})
          </span>
        </div>
      )}
      
      {/* Sequence display */}
      <div className="bg-gray-50 p-3 rounded border overflow-x-auto font-mono text-sm">
        {formatSequence()}
      </div>
    </div>
  );
};

// Export details section
const ExportSection = ({ protein }: { protein: ProteinData }) => {
  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Export Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Domain PDB files</div>
            <div className="text-xs text-blue-600">Individual structure files</div>
          </div>
        </button>
        
        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Protein FASTA</div>
            <div className="text-xs text-blue-600">Full protein sequence</div>
          </div>
        </button>
        
        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Domain JSON</div>
            <div className="text-xs text-blue-600">Classification data</div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Main ProteinView page component
export default function ProteinView() {
  const [protein] = useState<ProteinData>(mockProteinData);
  const [highlightedDomain, setHighlightedDomain] = useState<string | null>(null);
  const [viewerOptions, setViewerOptions] = useState({
    style: 'cartoon' as const,
    showLabels: true,
    showSideChains: false,
    zoom: 1
  });
  
  // Handlers
  const handleDomainHover = (domainId: string | null) => {
    setHighlightedDomain(domainId);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with navigation (simplified here) */}
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
            </nav>
          </div>
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
        
        {/* Protein info header */}
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
        
        {/* Main content sections */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Structure viewer section */}
              <div className="md:col-span-1">
                <ProteinStructureViewer 
                  protein={protein} 
                  highlightedDomain={highlightedDomain}
                  viewerOptions={viewerOptions}
                />
                
                {/* Quick links and alternatives */}
                <div className="mt-4 bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">External Resources</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <a 
                      href={`https://www.rcsb.org/structure/${protein.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>View in RCSB PDB</span>
                    </a>
                    <a 
                      href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${protein.id.toLowerCase()}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>View in PDBe</span>
                    </a>
                    <a 
                      href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>UniProt Entry</span>
                    </a>
                    <a 
                      href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>AlphaFold Structure</span>
                    </a>
                  </div>
                </div>
                
                {/* Upload alternative structure */}
                <div className="mt-4 bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Upload Alternative Structure</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop a PDB or mmCIF file here
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition">
                      Browse Files
                    </button>
                  </div>
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
                
                {/* Sequence viewer */}
                <SequenceViewer 
                  protein={protein}
                  highlightedDomain={highlightedDomain}
                />
                
                {/* Export section */}
                <ExportSection protein={protein} />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-8">
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
