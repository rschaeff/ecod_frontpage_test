'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, Search, Home, Download, HelpCircle, ExternalLink, Menu, X, ChevronRight, ChevronDown, File, BookOpen, FileText, Code, Github } from 'lucide-react';

export default function DocumentationPage() {
  type SectionKey = 'overview' | 'classification' | 'access' | 'api' | 'faq' | 'citation';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
      overview: true,
      classification: false,
      access: false,
      api: false,
      faq: false,
      citation: false
    });

    const toggleSection = (section: SectionKey) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

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
              <Link href="/documentation" className="flex items-center text-blue-200 border-b-2 border-blue-200">
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
              <Link href="/documentation" className="flex items-center text-blue-200 border-b border-blue-200 py-2">
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
            <h1 className="text-3xl font-bold text-gray-800">Documentation & Help</h1>
            <p className="text-gray-600 mt-2">
              Learn about ECOD classification, methodology, and how to use the database
            </p>
          </div>
        </section>

        {/* Documentation content with sidebar */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar navigation */}
              <aside className="md:w-1/4 mb-6 md:mb-0">
                <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h2 className="font-medium text-blue-800">Documentation</h2>
                  </div>
                  <nav className="p-4">
                    <ul className="space-y-1">
                      <li>
                        <a href="#overview" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-blue-700 font-medium">
                          Overview
                        </a>
                      </li>
                      <li>
                        <a href="#classification" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                          Classification Levels
                        </a>
                      </li>
                      <li>
                        <a href="#access" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                          Accessing ECOD
                        </a>
                      </li>
                      <li>
                        <a href="#api" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                          API Documentation
                        </a>
                      </li>
                      <li>
                        <a href="#faq" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a href="#citation" className="block px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700">
                          Citation & References
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>

                {/* Help resources box */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h2 className="font-medium text-blue-800">Additional Resources</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <a
                      href="#"
                      className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                    >
                      <File className="h-4 w-4 mr-2" />
                      User Guide PDF
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Tutorial Videos
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Example Scripts
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Repository
                    </a>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="md:w-3/4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 prose max-w-none">
                    {/* Overview section */}
                    <section id="overview" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('overview')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">Overview</h2>
                        {expandedSections.overview ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.overview && (
                        <div className="mt-4">
                          <p>
                            ECOD (Evolutionary Classification of Protein Domains) is a hierarchical classification of protein domains based on evolutionary relationships. ECOD is designed to highlight remote homology between proteins, providing insights into their shared evolutionary origins.
                          </p>

                          <p className="mt-4">
                            The database is updated weekly with new structures from the Protein Data Bank (PDB). Domain boundaries are determined using a combination of automated algorithms and manual curation by experts.
                          </p>

                          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Features</h3>
                            <ul className="list-disc pl-6">
                              <li>Hierarchical classification of protein domains</li>
                              <li>Emphasis on evolutionary relationships and remote homology</li>
                              <li>Weekly updates with new PDB structures</li>
                              <li>Integration with structure, sequence, and functional information</li>
                              <li>Comprehensive API for programmatic access</li>
                              <li>Downloadable datasets for offline analysis</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Classification levels section */}
                    <section id="classification" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('classification')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">Classification Levels</h2>
                        {expandedSections.classification ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.classification && (
                        <div className="mt-4">
                          <p>
                            ECOD classifies protein domains in a hierarchical system with five primary levels, each representing different aspects of evolutionary relationships and structural similarity.
                          </p>

                          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-5 border-b">
                              <div className="bg-gray-50 p-3 font-medium text-center">Level</div>
                              <div className="bg-gray-50 p-3 font-medium text-center">Symbol</div>
                              <div className="bg-gray-50 p-3 font-medium text-center md:col-span-2">Description</div>
                              <div className="bg-gray-50 p-3 font-medium text-center">Example</div>
                            </div>

                            {/* Architecture level */}
                            <div className="grid grid-cols-1 md:grid-cols-5 border-b">
                              <div className="p-3 bg-red-50 font-medium">Architecture</div>
                              <div className="p-3 text-center">
                                <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-800 text-center font-bold">A</span>
                              </div>
                              <div className="p-3 md:col-span-2">
                                Domains with similar secondary structure compositions and arrangements, regardless of connectivity.
                              </div>
                              <div className="p-3">
                                <span className="text-sm">A.1 - All alpha proteins</span>
                              </div>
                            </div>

                            {/* Possible homology level */}
                            <div className="grid grid-cols-1 md:grid-cols-5 border-b">
                              <div className="p-3 bg-blue-50 font-medium">X-group</div>
                              <div className="p-3 text-center">
                                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-center font-bold">X</span>
                              </div>
                              <div className="p-3 md:col-span-2">
                                Possible homology groups, containing domains with possible but inadequate evidence of homologous relationships.
                              </div>
                              <div className="p-3">
                                <span className="text-sm">X.1.1 - Globin-like</span>
                              </div>
                            </div>

                            {/* Homology level */}
                            <div className="grid grid-cols-1 md:grid-cols-5 border-b">
                              <div className="p-3 bg-green-50 font-medium">H-group</div>
                              <div className="p-3 text-center">
                                <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-800 text-center font-bold">H</span>
                              </div>
                              <div className="p-3 md:col-span-2">
                                Homologous groups, containing domains with evidence for homologous relationships based on sequence similarity, functional similarity, and/or structural evidence.
                              </div>
                              <div className="p-3">
                                <span className="text-sm">H.1.1.1 - Globin-like</span>
                              </div>
                            </div>

                            {/* Topology level */}
                            <div className="grid grid-cols-1 md:grid-cols-5 border-b">
                              <div className="p-3 bg-purple-50 font-medium">T-group</div>
                              <div className="p-3 text-center">
                                <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-center font-bold">T</span>
                              </div>
                              <div className="p-3 md:col-span-2">
                                Topology groups, containing domains with the same topology (fold) and similar connectivity of secondary structure elements.
                              </div>
                              <div className="p-3">
                                <span className="text-sm">T.1.1.1.1 - Globin</span>
                              </div>
                            </div>

                            {/* Family level */}
                            <div className="grid grid-cols-1 md:grid-cols-5">
                              <div className="p-3 bg-yellow-50 font-medium">F-group</div>
                              <div className="p-3 text-center">
                                <span className="inline-block w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-center font-bold">F</span>
                              </div>
                              <div className="p-3 md:col-span-2">
                                Family groups, containing domains with significant sequence similarity that indicates clear homology, often corresponding to functional families.
                              </div>
                              <div className="p-3">
                                <span className="text-sm">F.1.1.1.1.1 - Hemoglobin, alpha-chain</span>
                              </div>
                            </div>
                          </div>

                          <p className="mt-4">
                            Each domain in ECOD is assigned a unique identifier that reflects its position in this hierarchy. The hierarchical system allows users to explore evolutionary relationships at different levels of granularity.
                          </p>
                        </div>
                      )}
                    </section>

                    {/* Accessing ECOD section */}
                    <section id="access" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('access')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">Accessing ECOD</h2>
                        {expandedSections.access ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.access && (
                        <div className="mt-4">
                          <p>
                            ECOD can be accessed through multiple interfaces, depending on your needs. Here are the main ways to interact with the database:
                          </p>

                          <div className="mt-4 space-y-4">
                            {/* Web interface */}
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-blue-50 p-3 font-medium border-b">
                                Web Interface
                              </div>
                              <div className="p-4">
                                <p>
                                  The most straightforward way to explore ECOD is through this web interface. You can:
                                </p>
                                <ul className="list-disc pl-6 mt-2">
                                  <li>Search for domains by keywords, PDB IDs, UniProt accessions, or domain IDs</li>
                                  <li>Browse the classification hierarchy through the tree browser</li>
                                  <li>View detailed information about individual domains</li>
                                  <li>Perform sequence (BLAST) and structure searches</li>
                                  <li>Download domain definitions and classification data</li>
                                </ul>
                                <div className="mt-4">
                                  <Link href="/" className="text-blue-600 hover:underline">
                                    Go to ECOD homepage →
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* REST API */}
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-blue-50 p-3 font-medium border-b">
                                REST API
                              </div>
                              <div className="p-4">
                                <p>
                                  For programmatic access, ECOD provides a comprehensive REST API that allows you to:
                                </p>
                                <ul className="list-disc pl-6 mt-2">
                                  <li>Query domains by various criteria</li>
                                  <li>Retrieve domain boundaries and classifications</li>
                                  <li>Get domain sequences and structural information</li>
                                  <li>Access classification hierarchy data</li>
                                </ul>
                                <div className="mt-4">
                                  <Link href="#api" className="text-blue-600 hover:underline">
                                    View API documentation →
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Downloadable datasets */}
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-blue-50 p-3 font-medium border-b">
                                Downloadable Datasets
                              </div>
                              <div className="p-4">
                                <p>
                                  For large-scale analysis, you can download complete datasets in various formats:
                                </p>
                                <ul className="list-disc pl-6 mt-2">
                                  <li>Domain definitions (boundary files)</li>
                                  <li>Classification hierarchy</li>
                                  <li>Representative domain sets</li>
                                  <li>Domain sequences in FASTA format</li>
                                  <li>Structure files for domains</li>
                                </ul>
                                <div className="mt-4">
                                  <Link href="/distribution" className="text-blue-600 hover:underline">
                                    Go to download page →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* API Documentation section */}
                    <section id="api" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('api')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">API Documentation</h2>
                        {expandedSections.api ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.api && (
                        <div className="mt-4">
                          <p>
                            The ECOD REST API provides programmatic access to the database. All API endpoints return data in JSON format.
                          </p>

                          <div className="mt-4 bg-gray-100 p-4 rounded-md">
                            <p className="font-medium">Base URL:</p>
                            <code className="block bg-gray-800 text-white p-2 rounded mt-1">
                              https://api.ecod.org/v1
                            </code>
                          </div>

                          <h3 className="text-xl font-semibold mt-6 mb-3">Endpoints</h3>

                          {/* Search endpoint */}
                          <div className="border rounded-lg overflow-hidden mt-4">
                            <div className="bg-blue-50 p-3 font-medium border-b flex justify-between">
                              <span>Search Domains</span>
                              <span className="text-green-700 font-mono text-sm">GET /search</span>
                            </div>
                            <div className="p-4">
                              <p className="mb-2">
                                Search for domains using various criteria.
                              </p>
                              <div className="mt-3">
                                <h4 className="font-medium">Parameters:</h4>
                                <div className="mt-2 overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-4 py-2 text-left">Parameter</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">q</td>
                                        <td className="px-4 py-2">string</td>
                                        <td className="px-4 py-2">Keyword query</td>
                                      </tr>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">pdb</td>
                                        <td className="px-4 py-2">string</td>
                                        <td className="px-4 py-2">PDB ID</td>
                                      </tr>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">unp_acc</td>
                                        <td className="px-4 py-2">string</td>
                                        <td className="px-4 py-2">UniProt accession</td>
                                      </tr>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">limit</td>
                                        <td className="px-4 py-2">integer</td>
                                        <td className="px-4 py-2">Maximum number of results (default: 20, max: 100)</td>
                                      </tr>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">offset</td>
                                        <td className="px-4 py-2">integer</td>
                                        <td className="px-4 py-2">Results offset for pagination</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div className="mt-4">
                                <h4 className="font-medium">Example:</h4>
                                <code className="block bg-gray-800 text-white p-2 rounded mt-1">
                                  GET /search?q=globin&limit=10
                                </code>
                              </div>
                            </div>
                          </div>

                          {/* Domain endpoint */}
                          <div className="border rounded-lg overflow-hidden mt-4">
                            <div className="bg-blue-50 p-3 font-medium border-b flex justify-between">
                              <span>Get Domain</span>
                              <span className="text-green-700 font-mono text-sm">GET /domain/{'{id}'}</span>
                            </div>
                            <div className="p-4">
                              <p className="mb-2">
                                Retrieve detailed information about a specific domain.
                              </p>
                              <div className="mt-3">
                                <h4 className="font-medium">Path Parameters:</h4>
                                <div className="mt-2 overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="px-4 py-2 text-left">Parameter</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-t">
                                        <td className="px-4 py-2 font-mono">id</td>
                                        <td className="px-4 py-2">string</td>
                                        <td className="px-4 py-2">Domain ID (e.g., e4ubpA1)</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div className="mt-4">
                                <h4 className="font-medium">Example:</h4>
                                <code className="block bg-gray-800 text-white p-2 rounded mt-1">
                                  GET /domain/e4ubpA1
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6">
                            <p>
                              For full API documentation, including all endpoints, request/response formats, and authentication methods, please refer to:
                            </p>
                            <a
                              href="#"
                              className="mt-2 inline-block text-blue-600 hover:underline"
                            >
                              ECOD API Reference →
                            </a>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* FAQ section */}
                    <section id="faq" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('faq')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">Frequently Asked Questions</h2>
                        {expandedSections.faq ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.faq && (
                        <div className="mt-4 space-y-6">
                          {/* FAQ item */}
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                              How often is ECOD updated?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              ECOD is updated weekly with new structures from the Protein Data Bank (PDB). Updates usually occur every Monday, incorporating all new PDB entries released during the previous week.
                            </p>
                          </div>

                          {/* FAQ item */}
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                              How are domain boundaries determined?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              Domain boundaries in ECOD are determined using a combination of automated algorithms and manual curation. The process begins with automated detection based on structural and sequence information, followed by expert review to ensure consistency with evolutionary relationships. In cases of uncertainty, boundaries are adjusted based on homology to previously classified domains.
                            </p>
                          </div>

                          {/* FAQ item */}
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                              What is the difference between ECOD and other domain databases like SCOP or CATH?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              While SCOP, CATH, and ECOD all classify protein domains based on structure, ECOD specifically emphasizes evolutionary relationships. ECOD's primary organizing principle is homology rather than structural similarity alone. ECOD also features more frequent updates, a more comprehensive coverage of PDB structures, and includes both experimentally determined and predicted (e.g., AlphaFold) structures.
                            </p>
                          </div>

                          {/* FAQ item */}
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                              Can I get a non-redundant set of domains for my analysis?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              Yes, ECOD provides several representative domain sets at different sequence identity thresholds (e.g., 40%, 70%, 90%). These sets are available on the Downloads page. Additionally, you can create custom non-redundant sets using the API with specific sequence identity cutoffs.
                            </p>
                          </div>

                          {/* FAQ item */}
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                              How can I cite ECOD in my publication?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              Please cite the primary ECOD publication: H. Cheng, et al., "ECOD: An Evolutionary Classification of Protein Domains", PLoS Computational Biology, 2014. For specific version information, please include the version number and release date of the ECOD database you used.
                            </p>
                          </div>

                          {/* FAQ item */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              How do I report issues or suggest improvements?
                            </h3>
                            <p className="mt-2 text-gray-600">
                              We welcome feedback from the community. You can report issues, suggest improvements, or contribute to ECOD in several ways:
                            </p>
                            <ul className="list-disc pl-6 mt-2 text-gray-600">
                              <li>Contact us via email at ecod-support@example.com</li>
                              <li>Submit issues through our GitHub repository</li>
                              <li>Use the feedback form available on the website</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Citation section */}
                    <section id="citation" className="mb-8">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection('citation')}
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-0">Citation & References</h2>
                        {expandedSections.citation ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {expandedSections.citation && (
                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-3">Primary Citation</h3>
                          <div className="bg-gray-50 p-4 rounded border text-sm">
                            <p className="mb-2">
                              Cheng H, Schaeffer RD, Liao Y, Kinch LN, Pei J, Shi S, Kim BH, Grishin NV. (2014) <strong>ECOD: An Evolutionary Classification of Protein Domains</strong>. <em>PLoS Computational Biology</em> 10(12): e1003926.
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                              <a
                                href="https://doi.org/10.1371/journal.pcbi.1003926"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                https://doi.org/10.1371/journal.pcbi.1003926
                              </a>
                              <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                BibTeX
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-medium mt-6 mb-3">Additional Publications</h3>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded border text-sm">
                              <p className="mb-2">
                                Cheng H, et al. (2015) <strong>ECOD: an evolutionary classification of protein domains</strong>. <em>Nucleic Acids Research</em> 43(Database issue): D376-D382.
                              </p>
                              <div className="mt-2">
                                <a
                                  href="https://doi.org/10.1093/nar/gku1221"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  https://doi.org/10.1093/nar/gku1221
                                </a>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border text-sm">
                              <p className="mb-2">
                                Pei J, et al. (2020) <strong>Recent developments in the ECOD (Evolutionary Classification of Protein Domains) database</strong>. <em>BMC Bioinformatics</em> 21(1): 175.
                              </p>
                              <div className="mt-2">
                                <a
                                  href="https://doi.org/10.1186/s12859-020-3472-3"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  https://doi.org/10.1186/s12859-020-3472-3
                                </a>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg font-medium mt-6 mb-3">Related Resources</h3>
                          <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>
                              <a
                                href="https://scop.berkeley.edu/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                SCOP - Structural Classification of Proteins
                              </a>
                            </li>
                            <li>
                              <a
                                href="http://www.cathdb.info/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                CATH - Protein Structure Classification Database
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://pfam.xfam.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Pfam - Protein Families Database
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.rcsb.org/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                RCSB Protein Data Bank
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </section>
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
