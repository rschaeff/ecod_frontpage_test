// components/SearchResults.tsx
'use client';

import React from 'react';
import { Search, Database, ExternalLink, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

interface SearchResultsProps {
  className?: string;
}

export default function SearchResults({ className = '' }: SearchResultsProps) {
  const { state, clearSearch, dispatch } = useSearch();

  // Don't render if no query has been made
  if (!state.query && !state.loading && !state.error) {
    return null;
  }

  return (
    <div className={`search-results-container bg-white border-t shadow-lg ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">
              {state.loading ? 'Searching...' : 'Search Results'}
            </h2>
            {state.query && !state.loading && (
              <span className="ml-2 text-gray-600">for "{state.query}"</span>
            )}
          </div>
          <button
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Searching ECOD database...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="font-medium text-red-800">Search Error</h3>
                <p className="text-red-700 text-sm mt-1">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {state.results && !state.loading && (
          <div>
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800">
                    <strong>{state.results.totalResults}</strong> total results found
                  </p>
                  <p className="text-blue-600 text-sm">
                    {state.results.domains.length} domains • {state.results.clusters.length} classification groups
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'domains' })}
                    className={`px-3 py-1 rounded text-sm ${
                      state.activeView === 'domains'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-600'
                    }`}
                  >
                    Domains ({state.results.domains.length})
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'clusters' })}
                    className={`px-3 py-1 rounded text-sm ${
                      state.activeView === 'clusters'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-600'
                    }`}
                  >
                    Groups ({state.results.clusters.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Domain Results */}
            {state.activeView === 'domains' && state.results.domains.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  Protein Domains
                </h3>
                <div className="space-y-3">
                  {state.results.domains.map((domain, index) => (
                    <div
                      key={`${domain.id}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-mono text-lg font-semibold text-blue-600">
                              {domain.id}
                            </h4>
                            {domain.isRepresentative === true && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Representative
                              </span>
                            )}
                            {domain.isManual === true && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-1">
                                Manual
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {domain.sourceType.toUpperCase()}
                            </span>
                          </div>

                          {domain.range && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Range:</strong> {domain.range}
                              {domain.domainLength && (
                                <span className="ml-2">({domain.domainLength} residues)</span>
                              )}
                            </p>
                          )}

                          <div className="text-sm text-gray-700 space-y-1">
                            {domain.xname && (
                              <p><strong>X-group:</strong> {domain.xname}</p>
                            )}
                            {domain.hname && (
                              <p><strong>H-group:</strong> {domain.hname}</p>
                            )}
                            {domain.tname && (
                              <p><strong>T-group:</strong> {domain.tname}</p>
                            )}
                            {domain.proteinName && (
                              <p><strong>F-group:</strong> {domain.proteinName}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <div className="text-right text-sm text-gray-500">
                            <div>Score: {domain.relevanceScore}</div>
                          </div>
                          <button
                            onClick={() => window.open(`/domain/${domain.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View domain details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cluster Results */}
            {state.activeView === 'clusters' && state.results.clusters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  Classification Groups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.results.clusters.map((cluster, index) => (
                    <div
                      key={`${cluster.id}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(`/classification/${cluster.id}`, '_blank')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          cluster.type === 'A' ? 'bg-red-100 text-red-800' :
                          cluster.type === 'X' ? 'bg-orange-100 text-orange-800' :
                          cluster.type === 'H' ? 'bg-yellow-100 text-yellow-800' :
                          cluster.type === 'T' ? 'bg-green-100 text-green-800' :
                          cluster.type === 'F' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cluster.type}-group
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <h4 className="font-mono text-sm font-semibold text-blue-600 mb-1">
                        {cluster.id}
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {cluster.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {state.results.domains.length === 0 && state.results.clusters.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-600">
                  No domains or classification groups match your search query.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try different keywords, a PDB ID, or a UniProt accession.
                </p>
              </div>
            )}

            {/* Pagination Info */}
            {state.results.pagination && state.results.totalResults > state.results.domains.length && (
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Showing {state.results.domains.length} of {state.results.totalResults} results
                  (Page {state.results.pagination.currentPage} of {state.results.pagination.totalPages})
                </p>
                <p className="text-xs mt-1">
                  Use the API directly for pagination:
                  <code className="bg-gray-100 px-1 rounded ml-1">
                    /api/search?q={state.query}&limit=20&offset=20
                  </code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
