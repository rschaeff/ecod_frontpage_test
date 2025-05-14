'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, Search, Home, Download, HelpCircle, ExternalLink, Menu, X, File, FileText, Archive, ChevronDown, ArrowDown } from 'lucide-react';

export default function DistributionPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState('classification');

  const toggleSection = (section: string) => {
    setExpandedSection(section === expandedSection ? '' : section);
  };

  // Current version info
  const currentVersion = 'develop292';
  const releaseDate = '08/30/2024';

  // Release history
  const releaseHistory = [
    { version: 'develop292', date: '08/30/2024', domains: '2,532,845', pdbEntries: '202,451' },
    { version: 'develop291', date: '08/23/2024', domains: '2,528,673', pdbEntries: '202,104' },
    { version: 'develop290', date: '08/16/2024', domains: '2,523,912', pdbEntries: '201,758' },
    { version: 'develop289', date: '08/09/2024', domains: '2,519,145', pdbEntries: '201,412' },
    { version: 'develop288', date: '08/02/2024', domains: '2,514,381', pdbEntries: '201,067' },
  ];

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
              <Link href="/distribution" className="flex items-center text-blue-200 border-b-2 border-blue-200">
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
              <Link href="/distribution" className="flex items-center text-blue-200 border-b border-blue-200 py-2">
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
        {/* Page title */}
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">Download ECOD Data</h1>
            <p className="text-gray-600 mt-2">
              Access classification data, domain definitions, sequences, and structure files
            </p>
          </div>
        </section>

        {/* Current version info */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">Current Version: {currentVersion}</h2>
                  <p className="text-gray-600 mt-1">Released on {releaseDate}</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <a
                    href="#classification"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </a>
                  <Link
                    href="/documentation"
                    className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-300 font-medium py-2 px-4 rounded transition-colors flex items-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Documentation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download sections */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main column with download sections */}
              <div className="md:col-span-2 space-y-6">
                {/* Classification data section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden" id="classification">
                  <div
                    className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('classification')}
                  >
                    <h2 className="text-lg font-semibold text-blue-800">Classification Data</h2>
                    <ChevronDown className={`h-5 w-5 text-blue-600 transform ${expandedSection === 'classification' ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </div>

                  {expandedSection === 'classification' && (
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        Classification data files provide the hierarchical organization of protein domains in ECOD.
                      </p>

                      <div className="space-y-4">
                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.hierarchy.txt</h3>
                                <p className="text-sm text-gray-500">Complete hierarchy (A, X, H, T, F levels)</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">151 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Tab-delimited format</span>
                          </div>
                        </div>

                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.taxonomy.txt</h3>
                                <p className="text-sm text-gray-500">Mapping of domains to taxonomy information</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">98 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Tab-delimited format</span>
                          </div>
                        </div>

                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.json</h3>
                                <p className="text-sm text-gray-500">Complete hierarchy in JSON format</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">283 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">JSON format</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Domain definitions section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden" id="domain-definitions">
                  <div
                    className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('domain-definitions')}
                  >
                    <h2 className="text-lg font-semibold text-blue-800">Domain Definitions</h2>
                    <ChevronDown className={`h-5 w-5 text-blue-600 transform ${expandedSection === 'domain-definitions' ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </div>

                  {expandedSection === 'domain-definitions' && (
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        Domain definition files provide the residue ranges and chain information for each domain.
                      </p>

                      <div className="space-y-4">
                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.domains.txt</h3>
                                <p className="text-sm text-gray-500">Domain definitions with chain and residue ranges</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">175 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Tab-delimited format</span>
                          </div>
                        </div>

                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.mapping.txt</h3>
                                <p className="text-sm text-gray-500">Mapping of domains to PDB chains</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">112 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Tab-delimited format</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sequences section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden" id="sequences">
                  <div
                    className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('sequences')}
                  >
                    <h2 className="text-lg font-semibold text-blue-800">Sequences</h2>
                    <ChevronDown className={`h-5 w-5 text-blue-600 transform ${expandedSection === 'sequences' ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </div>

                  {expandedSection === 'sequences' && (
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        Sequence files contain the amino acid sequences of domains in FASTA format.
                      </p>

                      <div className="space-y-4">
                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.fasta</h3>
                                <p className="text-sm text-gray-500">Sequences of all domains in FASTA format</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">342 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">FASTA format</span>
                          </div>
                        </div>

                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.representatives.fasta</h3>
                                <p className="text-sm text-gray-500">Sequences of representative domains at 70% identity</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">78 MB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">FASTA format</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Structure files section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden" id="structures">
                  <div
                    className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('structures')}
                  >
                    <h2 className="text-lg font-semibold text-blue-800">Structure Files</h2>
                    <ChevronDown className={`h-5 w-5 text-blue-600 transform ${expandedSection === 'structures' ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </div>

                  {expandedSection === 'structures' && (
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        Structure files contain 3D coordinates for domains in PDB format.
                      </p>

                      <div className="space-y-4">
                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Archive className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.domain_pdbs.tar.gz</h3>
                                <p className="text-sm text-gray-500">PDB files for all domains (compressed archive)</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">14.2 GB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Compressed TAR archive</span>
                          </div>
                        </div>

                        {/* File item */}
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Archive className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h3 className="font-medium">ecod.{currentVersion}.representatives.tar.gz</h3>
                                <p className="text-sm text-gray-500">PDB files for representative domains (70% identity)</p>
                              </div>
                            </div>
                            <a
                              href="#"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-1.5 px-3 rounded-md flex items-center transition-colors"
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 rounded px-2 py-0.5 mr-2">3.8 GB</span>
                            <span className="bg-gray-100 rounded px-2 py-0.5">Compressed TAR archive</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
                        <h3 className="font-medium text-yellow-800">Note on Individual Structure Files</h3>
                        <p className="mt-1 text-gray-700">
                          Individual domain structure files can be downloaded directly from domain detail pages.
                          Navigate to the specific domain of interest and use the download button provided there.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Programmatic access section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden" id="api">
                  <div
                    className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('api')}
                  >
                    <h2 className="text-lg font-semibold text-blue-800">Programmatic Access (API)</h2>
                    <ChevronDown className={`h-5 w-5 text-blue-600 transform ${expandedSection === 'api' ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                  </div>

                  {expandedSection === 'api' && (
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">
                        ECOD provides a RESTful API for programmatic access to the database. This allows you to integrate ECOD data into your own applications or workflows.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h3 className="font-medium mb-2">API Base URL:</h3>
                        <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                          https://api.ecod.org/v1
                        </code>
                      </div>

                      <p className="text-gray-600 mb-2">
                        Example API endpoints:
                      </p>

                      <ul className="space-y-2 text-sm">
                        <li className="bg-gray-50 p-2 rounded">
                          <code className="font-mono text-blue-700">GET /domains?pdb=4UBP</code> - Get domains from a PDB structure
                        </li>
                        <li className="bg-gray-50 p-2 rounded">
                          <code className="font-mono text-blue-700">GET /domain/e4ubpA1</code> - Get details for a specific domain
                        </li>
                        <li className="bg-gray-50 p-2 rounded">
                          <code className="font-mono text-blue-700">GET /hierarchy/F.1.1.1.1</code> - Get hierarchy data for a specific node
                        </li>
                      </ul>

                      <div className="mt-4">
                        <Link
                          href="/documentation#api"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1.5" />
                          View full API documentation
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Release info card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="font-medium">Release History</h2>
                  </div>
                  <div className="p-4">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domains</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {releaseHistory.map((release, index) => (
                          <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={index === 0 ? 'font-medium text-blue-700' : ''}>
                                {release.version}
                              </span>
                              {index === 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                                  current
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {release.date}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {release.domains}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View all releases
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick links card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="font-medium">Quick Links</h2>
                  </div>
                  <div className="p-4">
                    <nav className="space-y-2">
                      <a
                        href="#classification"
                        className="block px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Classification Data
                      </a>
                      <a
                        href="#domain-definitions"
                        className="block px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Domain Definitions
                      </a>
                      <a
                        href="#sequences"
                        className="block px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sequences
                      </a>
                      <a
                        href="#structures"
                        className="block px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Structure Files
                      </a>
                      <a
                        href="#api"
                        className="block px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        API Access
                      </a>
                    </nav>
                  </div>
                </div>

                {/* Help card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="font-medium">Need Help?</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Having trouble downloading or using ECOD data? Check out our documentation or contact us for assistance.
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/documentation"
                        className="block px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium flex items-center"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        View Documentation
                      </Link>
                      <a
                        href="mailto:support@ecod.org"
                        className="block px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </a>
                    </div>
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

// Mail icon component for the contact support link
function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
