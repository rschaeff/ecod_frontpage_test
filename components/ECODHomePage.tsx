'use client';

import React, { useState, useEffect } from 'react';
import { Search, Database, Download, HelpCircle, FileSearch, X } from 'lucide-react';
import Link from 'next/link';

// Import modular components
import AppLayout from '@/components/layout/AppLayout'
import SearchForm from '@/components/SearchForm';
import StatCard from '@/components/StatCard';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

// Import context hooks
import { useSearch } from '@/contexts/SearchContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import SearchResults from '@/components/SearchResults';


// Type for the structure files uploaded by users
interface UploadedFile extends File {
  // Add any additional properties we might need
}

// Types for API responses
interface StatsData {
  totalDomains: number;
  pdbDomains: number;
  alphafoldDomains: number;
  fgroups: number;
  hgroups: number;
  tgroups: number;
  xgroups: number;
  manualReps: number;
}

interface StatusData {
  version: string;
  lastUpdate: string;
  status: string;
}

/**
 * ECODHomePage component - Main landing page for ECOD website
 */
export default function ECODHomePage() {
  // Use contexts
  const { state: searchState, performSearch } = useSearch();
  const { preferences } = useUserPreferences();

  // Local state
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'pdb' | 'uniprot' | 'upload'>('pdb');
  const [structureId, setStructureId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  // State for API data
  const [stats, setStats] = useState<StatsData | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [blastSequence, setBlastSequence] = useState<string>('');
  const [blastLoading, setBlastLoading] = useState<boolean>(false);
  const [blastResults, setBlastResults] = useState<any>(null);
  const [blastError, setBlastError] = useState<string | null>(null);


// Inside your ECODHomePage component

// Fetch statistics and status data
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both stats and status in parallel
      const [statsResponse, statusResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/status')
      ]);

      // Check response status codes
      if (!statsResponse.ok) {
        console.error('Stats API Error:', statsResponse.status, statsResponse.statusText);
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
      }

      if (!statusResponse.ok) {
        console.error('Status API Error:', statusResponse.status, statusResponse.statusText);
        throw new Error(`Failed to fetch status: ${statusResponse.status}`);
      }

      // Parse JSON data
      const statsData = await statsResponse.json();
      const statusData = await statusResponse.json();

      // Log the returned data for debugging
      console.log('Stats data received:', statsData);
      console.log('Status data received:', statusData);

      // Validate the shape of the data
      if (!statsData.totalDomains && statsData.totalDomains !== 0) {
        console.warn('Stats data missing totalDomains:', statsData);
      }

      if (!statusData.version) {
        console.warn('Status data missing version:', statusData);
      }

      setStats(statsData);
      setStatus(statusData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  // Handle search dialog submission
    const handleSearchSubmit = async () => {
      if (searchType === 'upload') {
        if (uploadedFile) {
          alert(`File upload for structure search is not yet implemented. File "${uploadedFile.name}" would be uploaded and processed.`);
        }
      } else if (structureId.trim()) {
        try {
          // Close the dialog first
          setSearchDialogOpen(false);

          // Use the search context to perform the search
          if (searchType === 'pdb') {
            await performSearch(structureId.trim());
          } else {
            await performSearch(structureId.trim());
          }

          // Clear the input
          setStructureId('');

        } catch (error) {
          console.error('Structure search error:', error);
          alert('Search failed. Please check your input and try again.');
        }
      }
    };

    const handleBlastSearch = async () => {
      if (!blastSequence.trim()) {
        alert('Please enter a protein sequence to search.');
        return;
      }

      setBlastLoading(true);
      setBlastError(null);
      setBlastResults(null);

      try {
        console.log('Submitting BLAST search...');

        const formData = new FormData();
        formData.append('sequence', blastSequence.trim());

        const response = await fetch('/api/search/blast', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `BLAST search failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('BLAST results:', data);

        setBlastResults(data);

      } catch (error) {
        console.error('BLAST search error:', error);
        setBlastError(error instanceof Error ? error.message : 'BLAST search failed');
      } finally {
        setBlastLoading(false);
      }
    };

  // Example searches for the search form
  const exampleSearches = [
    { id: '1', label: '1.1.1.1', query: '1.1.1.1' },
    { id: '2', label: 'e4ubpA1', query: 'e4ubpA1' },
    { id: '3', label: 'P12345', query: 'P12345' },
    { id: '4', label: 'kinase', query: 'kinase' }
  ];

  return (
    <AppLayout
      title="Evolutionary Classification of Protein Domains"
      activePage="home"
    >
      {/* Structure Search Dialog */}
      {searchDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Search By Structure</h3>
              <button
                onClick={() => setSearchDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`px-4 py-2 ${searchType === 'pdb' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSearchType('pdb')}
                >
                  PDB ID
                </button>
                <button
                  className={`px-4 py-2 ${searchType === 'uniprot' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSearchType('uniprot')}
                >
                  UniProt ACC
                </button>
                <button
                  className={`px-4 py-2 ${searchType === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSearchType('upload')}
                >
                  Upload File
                </button>
              </div>
            </div>

            {searchType !== 'upload' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'pdb' ? 'Enter PDB ID (e.g., 4UBP)' : 'Enter UniProt Accession (e.g., P12345)'}
                </label>
                <input
                  type="text"
                  value={structureId}
                  onChange={(e) => setStructureId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={searchType === 'pdb' ? '4UBP' : 'P12345'}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {searchType === 'pdb'
                    ? 'Enter a 4-character PDB ID to search for domains in this structure.'
                    : 'Enter a UniProt accession to find domains in this protein.'}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Structure File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdb,.ent,.cif,.fasta,.fa,.seq"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file as UploadedFile);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDB, mmCIF, or FASTA file (max 10MB)
                    </p>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-blue-800 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-blue-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md mr-2"
                onClick={() => setSearchDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                onClick={handleSearchSubmit}
                disabled={
                  (searchType !== 'upload' && !structureId.trim()) ||
                  (searchType === 'upload' && !uploadedFile)
                }
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero section with search */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Evolutionary Classification of Protein Domains</h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Hierarchical classification of protein domains based on evolutionary relationships
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchForm
              showExamples={true}
              examples={exampleSearches}
              saveHistory={true}
            />

            {/* Quick access badges/buttons for Sequence and Structure search */}
            <div className="flex justify-center mt-4 space-x-4">
              <Link
                href="/search/sequence"
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-white text-sm font-medium transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Search by Sequence
              </Link>
              <button
                onClick={() => setSearchDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-white text-sm font-medium transition-colors"
              >
                <FileSearch className="mr-2 h-4 w-4" />
                Search by Structure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main action buttons - horizontal and concise */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
            {/* Browse button */}
            <Link href="/tree" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
              <div className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Browse</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Explore the hierarchical classification of protein domains (A, X, H, T, F levels)
                </p>
                <span className="text-blue-600 group-hover:text-blue-800 font-medium inline-flex items-center">
                  Browse Tree
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </div>
            </Link>

            {/* Download button */}
            <Link href="/distribution" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
              <div className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Download</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get classification data, domain definitions, sequences, and structure files
                </p>
                <span className="text-blue-600 group-hover:text-blue-800 font-medium inline-flex items-center">
                  Get Data
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </div>
            </Link>

            {/* Help button */}
            <Link href="/documentation" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
              <div className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Help</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Learn about ECOD classification, methodology, and usage instructions
                </p>
                <span className="text-blue-600 group-hover:text-blue-800 font-medium inline-flex items-center">
                  Documentation
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

    {/* Statistics section */}
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">ECOD Database Statistics</h2>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
            <p>Failed to load statistics: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Domains"
              value={stats.totalDomains ? formatNumber(stats.totalDomains) : 'N/A'}
              description="Total protein domains in the database"
              icon={<Database className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              label="PDB Domains"
              value={stats.pdbDomains ? formatNumber(stats.pdbDomains) : 'N/A'}
              description="Experimental structures from Protein Data Bank"
              valueClassName="text-green-600"
            />
            <StatCard
              label="F-groups"
              value={stats.fgroups ? formatNumber(stats.fgroups) : 'N/A'}
              description="Family classification groups"
              valueClassName="text-yellow-600"
            />
            <StatCard
              label="H-groups"
              value={stats.hgroups ? formatNumber(stats.hgroups) : 'N/A'}
              description="Homology classification groups"
              valueClassName="text-purple-600"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500">No statistics available</div>
        )}

        <div className="mt-8 text-center">
          {status ? (
            <p className="text-gray-600">
              Last Updated: <span className="font-semibold">{status.version}</span>
              {status.lastUpdate && (
                <> - {new Date(status.lastUpdate).toLocaleDateString()}</>
              )}
            </p>
          ) : !isLoading && (
            <p className="text-gray-600">Version information not available</p>
          )}
        </div>
      </div>
    </section>


      {/* Tree browser section - Link to dedicated page */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Classification Browser</h2>

          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <div className="flex justify-center mb-4">
              <Database className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Browse ECOD Classification Tree</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore the hierarchical classification of protein domains by Architecture, X-groups (possible homology),
              H-groups (homology), T-groups (topology), and F-groups (family) in our interactive tree browser.
            </p>
            <Link
              href="/tree"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out"
            >
              <Database className="mr-2 h-5 w-5" />
              Open Tree Browser
            </Link>
          </div>
        </div>
      </section>

      {/* Advanced search section with BLAST and Structure search */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Advanced Search Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Search by Sequence (BLAST) - Updated */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Search by Sequence</h3>
                <p className="text-gray-600 mb-4">
                  Identify domains in your protein sequence by running a BLAST search against the ECOD database.
                </p>

                {/* Show error if any */}
                {blastError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                    <p className="text-sm">{blastError}</p>
                  </div>
                )}

                {/* Show results if any */}
                {blastResults && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
                    <p className="text-sm font-medium">
                      BLAST search completed! Found {blastResults.hits?.length || 0} hits.
                    </p>
                    {blastResults.hits?.length > 0 && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>Top hit: {blastResults.hits[0].domain_id} (E-value: {blastResults.hits[0].e_value})</p>
                        <p>Classification: {blastResults.hits[0].classification?.fgroup?.name}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <label htmlFor="blastSequence" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter protein sequence:
                  </label>
                  <textarea
                    id="blastSequence"
                    rows={6}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder=">Your_Sequence_ID&#10;MVLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRFKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGNFGADAQGAMNKALELFRKDIAAKYKELGYQG"
                    value={blastSequence}
                    onChange={(e) => setBlastSequence(e.target.value)}
                    disabled={blastLoading}
                  />
                </div>

                <button
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-md transition duration-200 ease-in-out w-full flex items-center justify-center"
                  onClick={handleBlastSearch}
                  disabled={blastLoading || !blastSequence.trim()}
                >
                  {blastLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running BLAST Search...
                    </>
                  ) : (
                    'Submit BLAST Search'
                  )}
                </button>
              </div>
            </div>

            {/* Search by Structure */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <FileSearch className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Search by Structure</h3>
                <p className="text-gray-600 mb-4">
                  Find domains by PDB ID, UniProt accession, or upload your own structure file to search against ECOD.
                </p>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-700 mb-4">Choose one of the following options:</p>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Search with a <strong>PDB ID</strong> (e.g., 4UBP)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Search with a <strong>UniProt accession</strong> (e.g., P12345)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Upload a <strong>structure file</strong> (PDB, mmCIF, or FASTA)</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSearchDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200 ease-in-out w-full"
                >
                  Open Structure Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
