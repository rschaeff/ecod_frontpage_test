import React, { useState } from 'react';
import { Database, Search, Home, Download, HelpCircle, ExternalLink, Menu, X, ChevronRight, ChevronDown, FileText } from 'lucide-react';

// Type for ligand information
interface Ligand {
  id: string;
  name: string;
  count: number;
}

// Type for Pfam accession
interface PfamAccession {
  id: string;
  name: string;
}

// Type for representatives
interface Representative {
  id: string;
  range: string;
  description: string;
  structureType: 'experimental' | 'theoretical';
  resolution?: string;
  plddt?: string;
  ligands?: Ligand[];
}

// Type for tree node
interface TreeNode {
  id: string;
  name: string;
  type: 'A' | 'X' | 'H' | 'T' | 'F';
  children?: TreeNode[];
  representatives?: Representative[];
  pfamAccessions?: PfamAccession[];
}

// Component props type
interface ECODTreePageProps {
  // Add any props here if needed
}

// State types
interface ExpandedNodesState {
  [key: string]: boolean;
}

export default function ECODTreePage({}: ECODTreePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodesState>({
    'A1': true,
    'X1.1': true
  });

  // ... rest of the component

// ECODTreePage component - Main component for the tree view page
export default function ECODTreePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
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
              <a href="/" className="flex items-center hover:text-blue-200">
                <Home className="mr-1 h-4 w-4" />
                Home
              </a>
              <a href="/tree" className="flex items-center text-blue-200 border-b-2 border-blue-200">
                <Database className="mr-1 h-4 w-4" />
                Browse
              </a>
              <a href="/distribution" className="flex items-center hover:text-blue-200">
                <Download className="mr-1 h-4 w-4" />
                Download
              </a>
              <a href="/documentation" className="flex items-center hover:text-blue-200">
                <HelpCircle className="mr-1 h-4 w-4" />
                Help
              </a>
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
              <a href="/" className="flex items-center hover:text-blue-200 py-2">
                <Home className="mr-2 h-5 w-5" />
                Home
              </a>
              <a href="/tree" className="flex items-center text-blue-200 border-b border-blue-200 py-2">
                <Database className="mr-2 h-5 w-5" />
                Browse
              </a>
              <a href="/distribution" className="flex items-center hover:text-blue-200 py-2">
                <Download className="mr-2 h-5 w-5" />
                Download
              </a>
              <a href="/documentation" className="flex items-center hover:text-blue-200 py-2">
                <HelpCircle className="mr-2 h-5 w-5" />
                Help
              </a>
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
        {/* Page title section */}
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">ECOD Classification Tree Browser</h1>
            <p className="text-gray-600 mt-2">
              Browse the hierarchical classification of protein domains by A, X, H, T, and F groups
            </p>
          </div>
        </section>
        
        {/* Search and filters section */}
        <section className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search box */}
              <div className="md:w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by ID, name, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Filters */}
              <div className="md:w-1/2 flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'A' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('A')}
                >
                  A-groups
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'X' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('X')}
                >
                  X-groups
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'H' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('H')}
                >
                  H-groups
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'T' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('T')}
                >
                  T-groups
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === 'F' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('F')}
                >
                  F-groups
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Classification legend */}
        <section className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <div className="bg-gray-50 p-3 text-sm border rounded-md">
              <h3 className="font-semibold mb-2">ECOD Classification Levels:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-800 text-center font-bold mr-2">A</span>
                  <span className="font-medium">Architecture groups</span>
                  <p className="ml-8 text-xs text-gray-600">Domains with similar secondary structure compositions</p>
                </div>
                <div>
                  <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-center font-bold mr-2">X</span>
                  <span className="font-medium">Possible homology</span>
                  <p className="ml-8 text-xs text-gray-600">Domains with possible but inadequate evidence of homology</p>
                </div>
                <div>
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-800 text-center font-bold mr-2">H</span>
                  <span className="font-medium">Homology groups</span>
                  <p className="ml-8 text-xs text-gray-600">Domains with evidence for homologous relationships</p>
                </div>
                <div>
                  <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-center font-bold mr-2">T</span>
                  <span className="font-medium">Topology groups</span>
                  <p className="ml-8 text-xs text-gray-600">Domains with similar topological connections</p>
                </div>
                <div>
                  <span className="inline-block w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-center font-bold mr-2">F</span>
                  <span className="font-medium">Family groups</span>
                  <p className="ml-8 text-xs text-gray-600">Domains with significant sequence similarity</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main tree container */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            {/* Tree view component */}
            <ECODTreeBrowser />
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

// ECODTreeBrowser component for displaying the hierarchical classification
function ECODTreeBrowser() {
  // State to track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState({
    'A1': true,
    'X1.1': true
  });
  
  // Mock data structure
  const treeData = {
    id: 'A1',
    name: 'Alpha proteins',
    type: 'A',
    children: [
      {
        id: 'X1.1',
        name: 'Globin-like',
        type: 'X',
        children: [
          {
            id: 'H1.1.1',
            name: 'Globin-like',
            type: 'H',
            children: [
              {
                id: 'T1.1.1.1',
                name: 'Globin',
                type: 'T',
                children: [
                  {
                    id: 'F1.1.1.1.1',
                    name: 'Hemoglobin, alpha-chain',
                    type: 'F',
                    pfamAccessions: [
                      { id: 'PF00042', name: 'Globin' },
                      { id: 'PF14788', name: 'Globin_3' }
                    ],
                    representatives: [
                      { 
                        id: 'e1hhoA1', 
                        range: 'A:1-141', 
                        description: 'Hemoglobin alpha subunit - Human',
                        structureType: 'experimental',
                        resolution: '1.74Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 },
                          { id: 'O2', name: 'Oxygen', count: 1 }
                        ]
                      },
                      { 
                        id: 'AF_P69905_F1', 
                        range: 'A:1-142', 
                        description: 'Hemoglobin alpha chain - Human (AlphaFold)',
                        structureType: 'theoretical',
                        plddt: '94.3'
                      }
                    ]
                  },
                  {
                    id: 'F1.1.1.1.2',
                    name: 'Hemoglobin, beta-chain',
                    type: 'F',
                    pfamAccessions: [
                      { id: 'PF00042', name: 'Globin' }
                    ],
                    representatives: [
                      { 
                        id: 'e1hhoB1', 
                        range: 'B:1-146', 
                        description: 'Hemoglobin beta subunit - Human',
                        structureType: 'experimental',
                        resolution: '1.74Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 },
                          { id: 'O2', name: 'Oxygen', count: 1 }
                        ]
                      },
                      { 
                        id: 'e2hhbB1', 
                        range: 'B:1-146', 
                        description: 'Hemoglobin beta subunit - Human (deoxy form)',
                        structureType: 'experimental',
                        resolution: '1.80Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                id: 'T1.1.1.2',
                name: 'Myoglobin',
                type: 'T',
                children: [
                  {
                    id: 'F1.1.1.2.1',
                    name: 'Myoglobin',
                    type: 'F',
                    pfamAccessions: [
                      { id: 'PF00042', name: 'Globin' }
                    ],
                    representatives: [
                      { 
                        id: 'e1a6mA1', 
                        range: 'A:1-151', 
                        description: 'Myoglobin - Horse',
                        structureType: 'experimental',
                        resolution: '1.60Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 },
                          { id: 'O2', name: 'Oxygen', count: 1 }
                        ]
                      },
                      { 
                        id: 'e1mboA1', 
                        range: 'A:1-153', 
                        description: 'Myoglobin - Sperm whale',
                        structureType: 'experimental',
                        resolution: '1.65Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'H1.1.2',
            name: 'Phycocyanin-like',
            type: 'H',
            children: [
              {
                id: 'T1.1.2.1',
                name: 'Phycocyanin',
                type: 'T',
                children: [
                  {
                    id: 'F1.1.2.1.1',
                    name: 'Phycocyanin alpha chain',
                    type: 'F',
                    pfamAccessions: [
                      { id: 'PF00502', name: 'Phycobilisome' }
                    ],
                    representatives: [
                      { 
                        id: 'e1cpcA1', 
                        range: 'A:1-162', 
                        description: 'Phycocyanin alpha chain - Cyanobacteria',
                        structureType: 'experimental',
                        resolution: '2.10Å',
                        ligands: [
                          { id: 'PCB', name: 'Phycocyanobilin', count: 1 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'X1.2',
        name: 'Four-helical up-and-down bundle',
        type: 'X',
        children: [
          {
            id: 'H1.2.1',
            name: 'Cytochrome',
            type: 'H',
            children: [
              {
                id: 'T1.2.1.1',
                name: 'Cytochrome c',
                type: 'T',
                children: [
                  {
                    id: 'F1.2.1.1.1',
                    name: 'Cytochrome c family',
                    type: 'F',
                    pfamAccessions: [
                      { id: 'PF00034', name: 'Cytochrome_c' }
                    ],
                    representatives: [
                      { 
                        id: 'e1hrcA1', 
                        range: 'A:1-104', 
                        description: 'Cytochrome c - Horse heart',
                        structureType: 'experimental',
                        resolution: '1.90Å',
                        ligands: [
                          { id: 'HEM', name: 'Heme', count: 1 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'X1.3',
        name: 'DNA/RNA-binding 3-helical bundle',
        type: 'X',
        children: [
          {
            id: 'H1.3.1',
            name: 'Homeodomain-like',
            type: 'H',
            children: []
          }
        ]
      }
    ]
  };
  
  // Toggle node expansion
  const toggleNode = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Export to CSV function
  const exportToCSV = (nodeId, nodeName, nodeType) => {
    console.log(`Exporting ${nodeType}-group ${nodeId}`);
    alert(`CSV export started for ${nodeType}-group: ${nodeName}`);
  };
  
  // Render a tree node
  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    const hasRepresentatives = node.representatives && node.representatives.length > 0;
    const hasPfamAccessions = node.pfamAccessions && node.pfamAccessions.length > 0;
    const showExportButton = node.type === 'T' || node.type === 'F';
    
    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center py-2 hover:bg-gray-50 border-b border-gray-100">
          {/* Toggle button */}
          {(hasChildren || hasRepresentatives) ? (
            <button 
              onClick={() => toggleNode(node.id)} 
              className="p-1 mr-1 rounded-sm hover:bg-gray-200"
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                <ChevronRight className="h-4 w-4 text-gray-500" />
              }
            </button>
          ) : (
            <span className="w-6"></span>
          )}
          
          {/* Node type badge */}
          <span className={`mr-2 font-bold text-sm px-1.5 py-0.5 rounded ${
            node.type === 'A' ? 'bg-red-100 text-red-800' :
            node.type === 'X' ? 'bg-blue-100 text-blue-800' :
            node.type === 'H' ? 'bg-green-100 text-green-800' :
            node.type === 'T' ? 'bg-purple-100 text-purple-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {node.type}
          </span>
          
          {/* Node name */}
          <span className="font-medium">{node.id}</span>
          <span className="ml-2 text-sm text-gray-700">{node.name}</span>
          
          {/* Export button */}
          {showExportButton && (
            <button 
              onClick={() => exportToCSV(node.id, node.name, node.type)}
              className="ml-auto flex items-center text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </button>
          )}
        </div>
        
        {/* Pfam accessions for F-groups */}
        {node.type === 'F' && hasPfamAccessions && isExpanded && (
          <div className="ml-8 py-1.5 pl-2 flex flex-wrap items-center text-xs text-gray-700">
            <span className="font-medium mr-2">Pfam:</span>
            {node.pfamAccessions.map((pfam, idx) => (
              <a 
                key={idx}
                href={`https://pfam.xfam.org/family/${pfam.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 border border-green-200 rounded px-2 py-0.5 mr-2 mb-1 inline-flex items-center hover:bg-green-100"
              >
                <span className="font-medium text-green-700">{pfam.id}</span>
                <span className="mx-1 text-gray-500">·</span>
                <span>{pfam.name}</span>
              </a>
            ))}
          </div>
        )}
        
        {/* Child nodes */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
        
        {/* Representative domains */}
        {isExpanded && hasRepresentatives && (
          <div className="ml-8 border-l-2 border-gray-200 pl-2">
            {/* Experimental structures */}
            <div className="py-2 mt-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                Experimental Structures
              </div>
              
              {node.representatives
                .filter(rep => rep.structureType === 'experimental')
                .map(rep => (
                  <div key={rep.id} className="mb-2 border-l-2 border-blue-200 pl-2 bg-blue-50 rounded-r-md">
                    <div className="flex items-center py-1.5 text-sm">
                      <FileText className="h-3.5 w-3.5 text-blue-500 mr-2" />
                      <a href={`/domain/${rep.id}`} className="text-blue-600 hover:underline font-medium">{rep.id}</a>
                      <span className="ml-2 text-gray-500">[{rep.range}]</span>
                      <span className="ml-2 text-gray-700 truncate">{rep.description}</span>
                      <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {rep.resolution}
                      </span>
                    </div>
                    
                    {/* Ligands */}
                    {rep.ligands && rep.ligands.length > 0 && (
                      <div className="text-xs text-gray-600 py-1 pl-7 pr-2 flex flex-wrap items-center">
                        <span className="font-medium mr-1">Ligands:</span>
                        {rep.ligands.map((ligand, idx) => (
                          <a 
                            key={idx} 
                            href={`https://www.rcsb.org/ligand/${ligand.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-50 border border-yellow-200 rounded px-1 py-0.5 mr-1 mb-1 inline-flex items-center hover:bg-yellow-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span>
                            <span className="font-medium text-yellow-700">{ligand.id}</span>
                            <span className="mx-0.5">·</span>
                            <span>{ligand.name}</span>
                            {ligand.count > 1 && <span className="ml-0.5 text-yellow-700">×{ligand.count}</span>}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              
              {node.representatives.filter(rep => rep.structureType === 'experimental').length === 0 && (
                <div className="text-xs italic text-gray-500 pl-2 py-1">No experimental structures available</div>
              )}
            </div>
            
            {/* Theoretical structures */}
            <div className="py-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                Theoretical Structures (AlphaFold)
              </div>
              
              {node.representatives
                .filter(rep => rep.structureType === 'theoretical')
                .map(rep => (
                  <div key={rep.id} className="mb-2 border-l-2 border-purple-200 pl-2 bg-purple-50 rounded-r-md">
                    <div className="flex items-center py-1.5 text-sm">
                      <FileText className="h-3.5 w-3.5 text-purple-500 mr-2" />
                      <a href={`/domain/${rep.id}`} className="text-purple-600 hover:underline font-medium">{rep.id}</a>
                      <span className="ml-2 text-gray-500">[{rep.range}]</span>
                      <span className="ml-2 text-gray-700 truncate">{rep.description}</span>
                      <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        pLDDT: {rep.plddt}
                      </span>
                    </div>
                  </div>
                ))}
              
              {node.representatives.filter(rep => rep.structureType === 'theoretical').length === 0 && (
                <div className="text-xs italic text-gray-500 pl-2 py-1">No theoretical structures available</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="border rounded-md overflow-auto max-h-screen bg-white">
      {/* Legend */}
      <div className="bg-gray-50 p-2 border-b sticky top-0 z-10">
        <div className="text-xs text-gray-700 flex flex-wrap items-center gap-3">
          <span className="font-medium">Structure Types:</span>
          <div className="inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            <span>Experimental (PDB)</span>
          </div>
          <div className="inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
            <span>Theoretical (AlphaFold)</span>
          </div>
          <div className="inline-flex items-center ml-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span>
            <span>Ligands</span>
          </div>
          <div className="inline-flex items-center ml-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
            <span>Pfam Families</span>
          </div>
        </div>
      </div>
      
      {renderNode(treeData)}
    </div>
  );
}
