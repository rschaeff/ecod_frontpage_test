'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, Info, Filter, Download } from 'lucide-react';
import Link from 'next/link';

// Import modular components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import SearchForm from '@/components/SearchForm';
import DataTable from '@/components/ui/DataTable';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

// Import context hooks
import { useTree } from '@/contexts/TreeContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

// Types for tree nodes and state
interface TreeNode {
  id: string;
  name: string;
  type: 'A' | 'X' | 'H' | 'T' | 'F';
  children?: TreeNode[];
}

interface RepresentativeNode {
  id: string;
  range: string;
  description: string;
  structureType: 'experimental' | 'theoretical';
  resolution?: string;
  plddt?: string;
  ligands?: {
    id: string;
    name: string;
    count: number;
  }[];
}

interface PfamAccession {
  id: string;
  name: string;
}

/**
 * ECODTreePage component - ECOD Classification Tree Browser
 */
export default function ECODTreePage() {
  // Use contexts
  const {
    state: treeState,
    toggleNode,
    fetchNodeData,
    setActiveFilter,
    expandAll,
    collapseAll
  } = useTree();
  const { preferences } = useUserPreferences();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TreeNode[]>([]);

  // Create breadcrumb items for navigation
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Classification Browser' }
  ];

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate search - in a real app, this would be an API call
    setTimeout(() => {
      // Mock search results
      const results: TreeNode[] = [
        { id: 'A1', name: 'Alpha proteins', type: 'A' },
        { id: 'X1.1', name: 'Globin-like', type: 'X' },
        { id: 'H1.1.1', name: 'Globin-like', type: 'H' }
      ].filter(node =>
        node.id.toLowerCase().includes(query.toLowerCase()) ||
        node.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  return (
    <AppLayout
      title="ECOD Classification Tree Browser"
      subtitle="Browse the hierarchical classification of protein domains by A, X, H, T, and F groups"
      activePage="tree"
      breadcrumbs={breadcrumbs}
    >
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map(result => (
                        <li key={result.id} className="border-b last:border-b-0">
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              // Navigate to the node and expand it
                              fetchNodeData(result.id);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            <div className="flex items-center">
                              <span className={`inline-block w-6 h-6 rounded-full mr-2 text-center text-xs font-bold ${
                                result.type === 'A' ? 'bg-red-100 text-red-800' :
                                result.type === 'X' ? 'bg-blue-100 text-blue-800' :
                                result.type === 'H' ? 'bg-green-100 text-green-800' :
                                result.type === 'T' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.type}
                              </span>
                              <span className="font-medium">{result.id}</span>
                              <span className="ml-2 text-gray-600">{result.name}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="md:w-1/2 flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'A' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter('A')}
              >
                A-groups
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'X' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter('X')}
              >
                X-groups
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'H' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter('H')}
              >
                H-groups
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'T' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter('T')}
              >
                T-groups
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treeState.activeFilter === 'F' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

      {/* Tree actions toolbar */}
      <section className="py-3 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={expandAll}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Collapse All
              </button>
            </div>

            {treeState.selectedNodeId && (
              <div className="text-sm">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium ml-1">{treeState.selectedNodeId}</span>
                <button
                  className="ml-3 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs flex items-center"
                  onClick={() => {
                    // Simulate CSV export
                    alert(`Exporting ${treeState.selectedNodeId} to CSV...`);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main tree container */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {/* Tree browser with loading state */}
          {treeState.error ? (
            <ErrorState
              title="Failed to load tree data"
              message={treeState.error}
              actions={
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              }
            />
          ) : treeState.loadingNode ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <LoadingState message={`Loading ${treeState.loadingNode}...`} size="small" />
            </div>
          ) : (
            <ECODTreeBrowser />
          )}
        </div>
      </section>
    </AppLayout>
  );
}

/**
 * ECODTreeBrowser component - Tree visualization component
 */
function ECODTreeBrowser() {
  // Use tree context
  const { state: treeState, toggleNode } = useTree();

  // Example tree data structure - in a real app this would come from the context
  const treeData: TreeNode = {
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
                    type: 'F'
                  },
                  {
                    id: 'F1.1.1.1.2',
                    name: 'Hemoglobin, beta-chain',
                    type: 'F'
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
        type: 'X'
      }
    ]
  };

  // Example representative domains for F-groups - in a real app these would come from the context
  const representativeDomains: Record<string, RepresentativeNode[]> = {
    'F1.1.1.1.1': [
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
      }
    ],
    'F1.1.1.1.2': [
      {
        id: 'e1hhoB1',
        range: 'B:1-146',
        description: 'Hemoglobin beta subunit - Human',
        structureType: 'experimental',
        resolution: '1.74Å'
      }
    ]
  };

  // Example Pfam mappings for F-groups
  const pfamMappings: Record<string, PfamAccession[]> = {
    'F1.1.1.1.1': [
      { id: 'PF00042', name: 'Globin' }
    ],
    'F1.1.1.1.2': [
      { id: 'PF00042', name: 'Globin' }
    ]
  };

  // Render a tree node
  const renderNode = (node: TreeNode, level = 0) => {
    const isExpanded = treeState.expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = treeState.selectedNodeId === node.id;

    // Check if there are representative domains for this node
    const hasRepresentatives = node.type === 'F' && representativeDomains[node.id]?.length > 0;

    // Check if there are Pfam mappings for this node
    const hasPfamMappings = node.type === 'F' && pfamMappings[node.id]?.length > 0;

    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className={`flex items-center py-2 hover:bg-gray-50 border-b border-gray-100 ${
          isSelected ? 'bg-blue-50' : ''
        }`}>
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

          {/* Export button for T and F groups */}
          {(node.type === 'T' || node.type === 'F') && (
            <button
              onClick={() => alert(`Exporting ${node.id} to CSV...`)}
              className="ml-auto flex items-center text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </button>
          )}
        </div>

        {/* Display Pfam mappings for F-groups */}
        {node.type === 'F' && hasPfamMappings && isExpanded && (
          <div className="ml-8 py-1.5 pl-2 flex flex-wrap items-center text-xs text-gray-700">
            <span className="font-medium mr-2">Pfam:</span>
            {pfamMappings[node.id].map((pfam, idx) => (
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
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}

        {/* Representative domains for F-groups */}
        {node.type === 'F' && hasRepresentatives && isExpanded && (
          <div className="ml-8 border-l-2 border-gray-200 pl-2">
            <div className="py-2 mt-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                Representative Domains
              </div>

              {representativeDomains[node.id].map(rep => (
                <div key={rep.id} className="mb-2 border-l-2 border-blue-200 pl-2 bg-blue-50 rounded-r-md">
                  <div className="flex items-center py-1.5 text-sm">
                    <Link href={`/domain/${rep.id}`} className="text-blue-600 hover:underline font-medium">{rep.id}</Link>
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

      {/* No data state */}
      {Object.keys(treeState.nodeData).length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No nodes loaded</h3>
          <p className="text-gray-500 text-sm">
            Use the search box above to find and load classification nodes.
          </p>
        </div>
      ) : (
        // Render the tree starting with the root node
        renderNode(treeData)
      )}
    </div>
  );
}
