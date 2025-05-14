'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Database, Search, Home, Download, HelpCircle, ExternalLink, Menu, X, FileText } from 'lucide-react';
import SearchForm from '@/components/SearchForm';

interface SearchResult {
  id: string;
  range: string;
  xname: string;
  hname: string;
  tname: string;
  proteinName: string;
}

interface ClusterResult {
  id: string;
  label: string;
  name: string;
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

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, pdbId, uniprotId]);

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
                defaultQuery={query || pdbId || uniprotId}
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
                      ({results.totalResults} results)
                    </span>
                  )}
                </h1>

                <div className="text-gray-600">
                  {loading ? (
                    <p>Searching...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : results ? (
                    <p>
                      {query && <span>Keyword: <strong>{query}</strong></span>}
                      {pdbId && <span>PDB ID: <strong>{pdbId}</strong></span>}
                      {uniprotId && <span>UniProt ID: <strong>{uniprotId}</strong></span>}
                    </p>
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
                      <button className="px-4 py-2 border-b-2 border-blue-600 font-medium text-blue-600">
                        Domains ({results.domains.length})
                      </button>
                      <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                        Clusters ({results.clusters.length})
                      </button>
                    </div>
                  </div>

                  {/* Domain results table */}
                  {results.domains.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Group</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H-Group</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Group</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.domains.map((domain) => (
                            <tr key={domain.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/domain/${domain.id}`} className="text-blue-600 hover:underline font-medium">
                                  {domain.id}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.range}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.xname}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.hname}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.tname}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.proteinName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No domain results found for your search criteria.
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
