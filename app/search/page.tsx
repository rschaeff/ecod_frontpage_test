'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Database, Search, Home, Download, HelpCircle, ExternalLink,
  Menu, X, FileText, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc
} from 'lucide-react';
import SearchForm from '@/components/SearchForm';

interface SearchResult {
  id: string;
  range: string;
  xname: string;
  hname: string;
  tname: string;
  proteinName: string;
  sourceType: 'pdb' | 'csm';
  relevanceScore?: number;
  isRepresentative?: boolean;
  domainLength?: number;
}

interface ClusterResult {
  id: string;
  label: string;
  name: string;
  relevanceScore?: number;
}

interface SearchResultsData {
  query: string;
  domains: SearchResult[];
  clusters: ClusterResult[];
  totalResults: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab and sorting state
  const [activeTab, setActiveTab] = useState<'domains' | 'clusters'>('domains');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Search parameters
  const query = searchParams.get('kw') || searchParams.get('q') || '';
  const pdbId = searchParams.get('pdb') || '';
  const uniprotId = searchParams.get('unp_acc') || '';

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);

      try {
        let url = '/api/search?';

        if (query) {
          url += `q=${encodeURIComponent(query)}`;
        } else if (pdbId) {
          url += `pdb=${encodeURIComponent(pdbId)}`;
        } else if (uniprotId) {
          url += `unp_acc=${encodeURIComponent(uniprotId)}`;
        } else {
          throw new Error('No search parameters provided');
        }

        // Add sorting parameters
        url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);

        // Auto-switch to clusters tab if no domains found but clusters exist
        if (data.domains.length === 0 && data.clusters.length > 0) {
          setActiveTab('clusters');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, pdbId, uniprotId, sortBy, sortOrder]);

  // Helper function to get search type
  const getSearchType = () => {
    if (query) return 'keyword';
    if (pdbId) return 'PDB ID';
    if (uniprotId) return 'UniProt ID';
    return 'unknown';
  };

  // Helper function to get search value
  const getSearchValue = () => {
    return query || pdbId || uniprotId;
  };

  // Sorting controls component
  const SortingControls = () => (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
            >
              <option value="relevance">Relevance</option>
              <option value="id">Domain ID</option>
              <option value="classification">Classification</option>
              <option value="representatives">Representatives First</option>
              <option value="length">Domain Length</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Order:</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm bg-white hover:bg-gray-50"
            >
              {sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />}
              {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            </button>
          </div>
        </div>

        {/* Quick sort buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setSortBy('relevance'); setSortOrder('desc'); }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              sortBy === 'relevance' && sortOrder === 'desc'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Best Match
          </button>
          <button
            onClick={() => { setSortBy('representatives'); setSortOrder('desc'); }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              sortBy === 'representatives' && sortOrder === 'desc'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Curated First
          </button>
          <button
            onClick={() => { setSortBy('id'); setSortOrder('asc'); }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              sortBy === 'id' && sortOrder === 'asc'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Alphabetical
          </button>
        </div>
      </div>
    </div>
  );

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
        {/* Search form section */}
        <section className="bg-blue-700 py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <SearchForm
                defaultQuery={getSearchValue()}
                saveHistory={true}
              />
            </div>
          </div>
        </section>

        {/* Search results section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Search info header */}
              <div className="mb-6 pb-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Search Results
                  {!loading && results && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({results.totalResults} total results)
                    </span>
                  )}
                </h1>

                <div className="text-gray-600">
                  {loading ? (
                    <p>Searching ECOD database...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : results ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getSearchType()}
                      </span>
                      <span className="font-medium">{getSearchValue()}</span>
                      {results.domains.length > 0 && (
                        <span className="text-gray-400">•</span>
                      )}
                      {results.domains.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {results.domains.length} domains, {results.clusters.length} clusters
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Results content */}
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Searching ECOD database...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md inline-block">
                    <p className="font-medium">Search Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : results ? (
                <div>
                  {/* Tabs for result types */}
                  <div className="mb-6 border-b">
                    <div className="flex space-x-8">
                      <button
                        className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                          activeTab === 'domains'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('domains')}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Domains ({results.domains.length})
                        </div>
                      </button>
                      <button
                        className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                          activeTab === 'clusters'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('clusters')}
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Classification Clusters ({results.clusters.length})
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Conditional content based on active tab */}
                  {activeTab === 'domains' ? (
                    <div>
                      {results.domains.length > 0 && <SortingControls />}

                      {results.domains.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Domain ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Range
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  X-Group
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  H-Group
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  T-Group
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Source
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {results.domains.map((domain) => (
                                <tr key={domain.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <Link href={`/domain/${domain.id}`} className="text-blue-600 hover:underline font-medium">
                                        {domain.id}
                                      </Link>
                                      {domain.isRepresentative && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          Rep
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {domain.range}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="truncate max-w-xs" title={domain.xname}>
                                      {domain.xname}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="truncate max-w-xs" title={domain.hname}>
                                      {domain.hname}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="truncate max-w-xs" title={domain.tname}>
                                      {domain.tname}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      domain.sourceType === 'pdb'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {domain.sourceType === 'pdb' ? 'Experimental' : 'Theoretical'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Link href={`/domain/${domain.id}`}
                                            className="text-blue-600 hover:text-blue-900">
                                        View
                                      </Link>
                                      <span className="text-gray-300">•</span>
                                      <Link href={`/sequences/${domain.id}?format=fasta`}
                                            className="text-green-600 hover:text-green-900">
                                        FASTA
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-gray-400 mb-4">
                            <FileText className="mx-auto h-12 w-12" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No domains found</h3>
                          <p className="text-gray-500 mb-4">
                            No domain results found for your search criteria.
                          </p>
                          {results.clusters.length > 0 && (
                            <button
                              onClick={() => setActiveTab('clusters')}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Check classification clusters ({results.clusters.length}) →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Clusters results */
                    <div>
                      {results.clusters.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Classification ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Level
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {results.clusters.map((cluster) => (
                                <tr key={cluster.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/tree?selected=${cluster.id}`}
                                          className="text-blue-600 hover:underline font-medium">
                                      {cluster.id}
                                    </Link>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      cluster.label === 'A' ? 'bg-red-100 text-red-800' :
                                      cluster.label === 'X' ? 'bg-blue-100 text-blue-800' :
                                      cluster.label === 'H' ? 'bg-green-100 text-green-800' :
                                      cluster.label === 'T' ? 'bg-purple-100 text-purple-800' :
                                      cluster.label === 'F' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {cluster.label}-group
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="truncate max-w-md" title={cluster.name}>
                                      {cluster.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Link href={`/tree?selected=${cluster.id}`}
                                            className="text-blue-600 hover:text-blue-900">
                                        Browse
                                      </Link>
                                      <span className="text-gray-300">•</span>
                                      <Link href={`/export/classification/${cluster.id}`}
                                            className="text-green-600 hover:text-green-900">
                                        Export
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-gray-400 mb-4">
                            <Database className="mx-auto h-12 w-12" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No classification clusters found</h3>
                          <p className="text-gray-500 mb-4">
                            No classification clusters found for your search criteria.
                          </p>
                          {results.domains.length > 0 && (
                            <button
                              onClick={() => setActiveTab('domains')}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Check domain results ({results.domains.length}) →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
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
