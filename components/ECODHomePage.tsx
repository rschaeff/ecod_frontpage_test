'use client';

import React, { useState } from 'react';
import { Search, Home, Download, Database, HelpCircle, ExternalLink, Menu, X, FileSearch } from 'lucide-react';

// Define types for the components
interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

interface SearchFormProps {
  className?: string;
}

// Type for the structure files uploaded by users
interface UploadedFile extends File {
  // Add any additional properties we might need
}

// StatCard component
const StatCard: React.FC<StatCardProps> = ({ label, value, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md text-center ${className}`}>
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
};

// SearchForm component
const SearchForm: React.FC<SearchFormProps> = ({ className = '' }) => {
  const [query, setQuery] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    // In a real implementation, this would navigate to the search results page
    console.log(`Searching for: ${query}`);
    window.location.href = `/search?kw=${encodeURIComponent(query)}`;
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center bg-white rounded-lg overflow-hidden shadow-lg p-1">
        <input
          type="text"
          placeholder="Search by keyword, PDB ID, UniProt ID, or domain ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow p-3 text-gray-800 outline-none w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200 ease-in-out w-full md:w-auto mt-2 md:mt-0"
        >
          <Search className="inline mr-2 h-5 w-5" />
          Search
        </button>
      </form>

      <div className="mt-3 text-sm text-blue-100 flex flex-wrap justify-center gap-3">
        <span>Example searches: </span>
        <a href="/search?kw=1.1.1.1" className="hover:text-white hover:underline">1.1.1.1</a>
        <a href="/search?kw=e4ubpA1" className="hover:text-white hover:underline">e4ubpA1</a>
        <a href="/search?kw=P12345" className="hover:text-white hover:underline">P12345</a>
        <a href="/search?kw=kinase" className="hover:text-white hover:underline">kinase</a>
      </div>
    </div>
  );
};

// Main ECODHomePage component
const ECODHomePage: React.FC = () => {
  // State definitions with proper TypeScript types
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'pdb' | 'uniprot' | 'upload'>('pdb');
  const [structureId, setStructureId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                onClick={() => {
                  if (searchType === 'upload') {
                    if (uploadedFile) {
                      // In a real app, we'd handle file upload with a form submission
                      alert(`File "${uploadedFile.name}" would be uploaded and processed for structure search.`);
                    }
                  } else if (structureId.trim()) {
                    // Redirect to search results
                    const param = searchType === 'pdb' ? 'pdb' : 'unp_acc';
                    window.location.href = `/search?${param}=${structureId.trim()}`;
                  }
                }}
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
              <a href="#" className="flex items-center hover:text-blue-200">
                <Home className="mr-1 h-4 w-4" />
                Home
              </a>
              <a href="#browse" className="flex items-center hover:text-blue-200">
                <Database className="mr-1 h-4 w-4" />
                Browse
              </a>
              <a href="#download" className="flex items-center hover:text-blue-200">
                <Download className="mr-1 h-4 w-4" />
                Download
              </a>
              <a href="#help" className="flex items-center hover:text-blue-200">
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
              <a href="#" className="flex items-center hover:text-blue-200 py-2">
                <Home className="mr-2 h-5 w-5" />
                Home
              </a>
              <a href="#browse" className="flex items-center hover:text-blue-200 py-2">
                <Database className="mr-2 h-5 w-5" />
                Browse
              </a>
              <a href="#download" className="flex items-center hover:text-blue-200 py-2">
                <Download className="mr-2 h-5 w-5" />
                Download
              </a>
              <a href="#help" className="flex items-center hover:text-blue-200 py-2">
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
        {/* Hero section with search */}
        <section className="bg-gradient-to-b from-blue-700 to-blue-600 text-white py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Evolutionary Classification of Protein Domains</h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Hierarchical classification of protein domains based on evolutionary relationships
            </p>

            <div className="max-w-2xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Main action buttons - horizontal and concise */}
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
              {/* Browse button */}
              <a href="/tree" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
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
              </a>

              {/* Download button */}
              <a href="/distribution" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
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
              </a>

              {/* Help button */}
              <a href="/documentation" className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden text-center group">
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
              </a>
            </div>
          </div>
        </section>

        {/* Statistics section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">ECOD Database Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Domains" value="2,500,000+" />
              <StatCard label="F-groups" value="15,000+" />
              <StatCard label="H-groups" value="2,000+" />
              <StatCard label="Last Updated" value="08-30-2024" />
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
              <a
                href="/tree"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out"
              >
                <Database className="mr-2 h-5 w-5" />
                Open Tree Browser
              </a>
            </div>
          </div>
        </section>

        {/* Advanced search section with BLAST and Structure search */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Advanced Search Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Search by Sequence (BLAST) */}
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
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <label htmlFor="blastSequence" className="block text-sm font-medium text-gray-700 mb-2">Enter protein sequence:</label>
                    <textarea
                      id="blastSequence"
                      rows={6}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder=">Your_Sequence_ID&#10;MVLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRFKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGNFGADAQGAMNKALELFRKDIAAKYKELGYQG"
                    ></textarea>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200 ease-in-out w-full">
                    Submit BLAST Search
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold mb-2">ECOD</h2>
              <p className="text-gray-400">Evolutionary Classification of Protein Domains</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Resources</h3>
                <ul className="text-gray-400 space-y-2">
                  <li><a href="#" className="hover:text-white">Browse</a></li>
                  <li><a href="#" className="hover:text-white">Download</a></li>
                  <li><a href="#" className="hover:text-white">Search</a></li>
                  <li><a href="#" className="hover:text-white">Help</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Related</h3>
                <ul className="text-gray-400 space-y-2">
                  <li><a href="http://prodata.swmed.edu/" className="hover:text-white">Grishin Lab</a></li>
                  <li><a href="https://www.hhmi.org/" className="hover:text-white">HHMI</a></li>
                  <li><a href="https://www.utsouthwestern.edu/" className="hover:text-white">UTSW</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact</h3>
                <ul className="text-gray-400 space-y-2">
                  <li><a href="#" className="hover:text-white">Email Us</a></li>
                  <li><a href="#" className="hover:text-white">Report Issues</a></li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2014-2025 Grishin lab/HHMI/UTSW</p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Last database update: develop292 - 08302024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ECODHomePage;
