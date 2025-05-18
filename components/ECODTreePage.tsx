'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, Filter, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Import modular components
import AppLayout from '@/components/layout/AppLayout';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

// Import context hooks
import { useTree } from '@/contexts/TreeContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

// Types for search results
interface SearchResult {
  id: string;
  name: string;
  level: 'A' | 'X' | 'H' | 'T' | 'F';
  parent?: string;
  domainCount?: number;
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
    selectNode,
    setActiveFilter,
    expandAll,
    collapseAll
  } = useTree();
  const { preferences } = useUserPreferences();

  // Local state for search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Create breadcrumb items for navigation
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Classification Browser' }
  ];

  // Handle search using the real API
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tree/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSearchResultClick = async (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);

    // Select and fetch the node
    selectNode(result.id);
    await fetchNodeData(result.id);
  };

  // Handle export
  const handleExport = (nodeId: string) => {
    const exportUrl = `/api/export/classification/${nodeId}`;
    window.open(exportUrl, '_blank');
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
            <div className="md:w-1/2 relative">
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
                            onClick={() => handleSearchResultClick(result)}
                          >
                            <div className="flex items-center">
                              <span className={`inline-block w-6 h-6 rounded-full mr-2 text-center text-xs font-bold ${
                                result.level === 'A' ? 'bg-red-100 text-red-800' :
                                result.level === 'X' ? 'bg-blue-100 text-blue-800' :
                                result.level === 'H' ? 'bg-green-100 text-green-800' :
                                result.level === 'T' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.level}
                              </span>
                              <span className="font-medium">{result.id}</span>
                              <span className="ml-2 text-gray-600">{result.name}</span>
                              {result.domainCount && (
                                <span className="ml-auto text-xs text-gray-500">
                                  {result.domainCount.toLocaleString()} domains
                                </span>
                              )}
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
                disabled={treeState.loadingNode !== null}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                disabled={treeState.loadingNode !== null}
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Collapse All
              </button>
            </div>

            {treeState.selectedNodeId && (
              <div className="text-sm flex items-center">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium ml-1">{treeState.selectedNodeId}</span>
                <span className="ml-2 text-gray-500">
                  ({treeState.nodeData[treeState.selectedNodeId]?.name})
                </span>
                <button
                  className="ml-3 text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs flex items-center border border-blue-200 hover:border-blue-300"
                  onClick={() => handleExport(treeState.selectedNodeId!)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main tree container */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {/* Tree browser with loading and error states */}
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
          ) : treeState.loadingNode === 'root' ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <LoadingState message="Loading classification tree..." size="large" />
            </div>
          ) : (
            <ECODTreeBrowser onExport={handleExport} />
          )}
        </div>
      </section>
    </AppLayout>
  );
}

/**
 * ECODTreeBrowser component - Tree visualization component
 */
interface ECODTreeBrowserProps {
  onExport: (nodeId: string) => void;
}

function ECODTreeBrowser({ onExport }: ECODTreeBrowserProps) {
  // Use tree context
  const { state: treeState, toggleNode, selectNode, fetchNodeData } = useTree();

  // Filter nodes based on active filter
  const getFilteredNodes = (nodes: any[]) => {
    if (treeState.activeFilter === 'all') return nodes;
    return nodes.filter(node => node.level === treeState.activeFilter);
  };

  // Render a tree node recursively
  const renderNode = (node: any, level = 0) => {
    const isExpanded = treeState.expandedNodes[node.id] || false;
    const isSelected = treeState.selectedNodeId === node.id;
    const isLoading = treeState.loadingNode === node.id;

    // Get node data if available
    const nodeData = treeState.nodeData[node.id];
    const hasChildren = nodeData?.children?.length > 0;
    const hasRepresentatives = nodeData?.representatives?.length > 0;
    const canExpand = hasChildren || hasRepresentatives || !nodeData; // Can expand if we haven't loaded data yet

    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className={`flex items-center py-2 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
          isSelected ? 'bg-blue-50' : ''
        }`}>
          {/* Toggle button */}
          {canExpand ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 mr-1 rounded-sm hover:bg-gray-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6"></span>
          )}

          {/* Node content */}
          <div
            className="flex-1 flex items-center"
            onClick={() => selectNode(node.id)}
          >
            {/* Node type badge */}
            <span className={`mr-2 font-bold text-sm px-1.5 py-0.5 rounded ${
              node.level === 'A' ? 'bg-red-100 text-red-800' :
              node.level === 'X' ? 'bg-blue-100 text-blue-800' :
              node.level === 'H' ? 'bg-green-100 text-green-800' :
              node.level === 'T' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {node.level}
            </span>

            {/* Node name and info */}
            <span className="font-medium">{node.id}</span>
            <span className="ml-2 text-sm text-gray-700">{node.name}</span>
            {node.domainCount !== undefined && (
              <span className="ml-2 text-xs text-gray-500">
                ({node.domainCount.toLocaleString()} domain{node.domainCount !== 1 ? 's' : ''})
              </span>
            )}
          </div>

          {/* Export button for T and F groups */}
          {(node.level === 'T' || node.level === 'F') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport(node.id);
              }}
              className="ml-2 flex items-center text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </button>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && nodeData && (
          <div className="ml-6">
            {/* Child nodes */}
            {hasChildren && (
              <div>
                {getFilteredNodes(nodeData.children).map(child =>
                  renderNode(child, level + 1)
                )}
              </div>
            )}

            {/* Representative domains for F-groups */}
            {hasRepresentatives && node.level === 'F' && (
              <div className="mt-2 border-l-2 border-gray-200 pl-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                  Representative Domains ({nodeData.representatives.length})
                </div>

                {nodeData.representatives.map(rep => (
                  <div key={rep.id} className="mb-2 border-l-2 border-blue-200 pl-3 bg-blue-50 rounded-r-md py-1.5">
                    <div className="flex items-center text-sm">
                      <Link
                        href={rep.isManual ? `/representative/${rep.id}` : `/domain/${rep.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {rep.id}
                      </Link>
                      {rep.isManual && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                          Manual Rep
                        </span>
                      )}
                      <span className="ml-2 text-gray-500">[{rep.range}]</span>
                      {rep.pdb_id && (
                        <span className="ml-2 text-gray-600">
                          PDB: {rep.pdb_id}{rep.chain && `/${rep.chain}`}
                        </span>
                      )}
                      {rep.uniprot && (
                        <a
                          href={`https://www.uniprot.org/uniprotkb/${rep.uniprot}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-green-600 hover:text-green-800 text-xs flex items-center"
                        >
                          {rep.uniprot}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      {rep.isManual && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded">
                          Manual
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* Legend */}
      <div className="bg-gray-50 p-3 border-b">
        <div className="text-xs text-gray-700 flex flex-wrap items-center gap-4">
          <span className="font-medium">Legend:</span>
          <div className="inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
            <span>Representative Domains</span>
          </div>
          <div className="inline-flex items-center">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded mr-1"></span>
            <span>Manual Representative</span>
          </div>
          <div className="inline-flex items-center">
            <ExternalLink className="h-3 w-3 text-green-600 mr-1" />
            <span>External Link</span>
          </div>
        </div>
      </div>

      {/* Tree content */}
      <div className="max-h-[600px] overflow-y-auto">
        {treeState.rootNodes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No data available</h3>
            <p className="text-gray-500 text-sm">
              Unable to load classification tree. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="p-4">
            {getFilteredNodes(treeState.rootNodes).map(node => renderNode(node))}
          </div>
        )}
      </div>
    </div>
  );
}
