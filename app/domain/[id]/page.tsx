'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Search, Home, Download, HelpCircle, ExternalLink, Menu, X, FileText, Info, ChevronRight } from 'lucide-react';

interface DomainParams {
  params: {
    id: string;
  };
}

interface DomainDetail {
  id: string;
  range: string;
  xgroup: {
    id: string;
    name: string;
  };
  hgroup: {
    id: string;
    name: string;
  };
  tgroup: {
    id: string;
    name: string;
  };
  fgroup: {
    id: string;
    name: string;
  };
  chain: string;
  pdbId: string;
  resolution: string;
  releaseDate: string;
  experimentType: string;
  proteinName: string;
  organism: string;
  pfamAccessions?: {
    id: string;
    name: string;
  }[];
  ligands?: {
    id: string;
    name: string;
    count: number;
  }[];
  sequence: string;
}

export default function DomainPage({ params }: DomainParams) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [domain, setDomain] = useState<DomainDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, we would fetch domain data from an API
    // For now, we'll simulate with mock data based on the ID
    setLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Mock data based on the domain ID pattern
      if (params.id.startsWith('e')) {
        // For experimental structures (e.g., e4ubpA1)
        setDomain({
          id: params.id,
          range: 'A:1-185',
          xgroup: { id: 'X.1.1', name: 'TBP-like' },
          hgroup: { id: 'H.1.1.1', name: 'TATA-binding protein-like' },
          tgroup: { id: 'T.1.1.1.1', name: 'TATA-binding protein' },
          fgroup: { id: 'F.1.1.1.1.1', name: 'TATA-box binding protein family' },
          chain: 'A',
          pdbId: params.id.substring(1, 5).toUpperCase(),
          resolution: '2.10Å',
          releaseDate: '2022-03-15',
          experimentType: 'X-ray diffraction',
          proteinName: 'TATA-box binding protein',
          organism: 'Homo sapiens',
          pfamAccessions: [
            { id: 'PF00352', name: 'TBP' },
          ],
          ligands: [
            { id: 'DNA', name: 'DNA fragment', count: 1 },
          ],
          sequence: 'MADEQPQLQNQGQVGQPQVQGQVGQPQVGQPQVGQCIVLTSLGQEKVSALSIIKRPGLDFSILLSNSGRKDDILKIQFPSLCSLPGTGQDGVRVAPGLFVKADLPGDFVCISKGSKFQQYSPVLVAQGKSISKISMEIALKLKENEIAMIIVKNKMDLPELESDQQVDQFKKALDGFPKALDEQQVTIQVLNAVPKDLSDLVEIYSKNTPSEYISLSDMFKLPKITILEEGKLLQEQNTLSVTLPGQSVCFLEYKVKIPNNQIALRCKGYVVEESFIPGTNLQMHSLMLSVKRPGLDFSLLVLSEKEFSGMTLQYQDPSFPVSSTVETVR'
        });
      } else if (params.id.startsWith('AF_')) {
        // For AlphaFold predicted structures
        setDomain({
          id: params.id,
          range: 'A:1-142',
          xgroup: { id: 'X.1.1', name: 'Globin-like' },
          hgroup: { id: 'H.1.1.1', name: 'Globin-like' },
          tgroup: { id: 'T.1.1.1.1', name: 'Globin' },
          fgroup: { id: 'F.1.1.1.1.1', name: 'Hemoglobin, alpha-chain' },
          chain: 'A',
          pdbId: 'AF_P69905',
          resolution: 'pLDDT: 94.3',
          releaseDate: '2023-05-22',
          experimentType: 'AlphaFold prediction',
          proteinName: 'Hemoglobin alpha chain',
          organism: 'Homo sapiens',
          pfamAccessions: [
            { id: 'PF00042', name: 'Globin' },
          ],
          sequence: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR'
        });
      } else {
        // If ID doesn't match expected patterns
        setError('Invalid domain ID format');
      }

      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [params.id]);

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
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link href="/search" className="hover:text-blue-600">Search</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700 font-medium">{params.id}</span>
            </div>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading domain information...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md inline-block">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : domain ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main information card */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b bg-blue-50 px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                      {domain.id}
                      <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {domain.range}
                      </span>
                    </h1>
                    <p className="text-gray-600 mt-1">{domain.proteinName} - {domain.organism}</p>
                  </div>

                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Domain Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Classification</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-center font-bold mr-2">X</span>
                            <Link href={`/tree?nodeId=${domain.xgroup.id}`} className="text-blue-600 hover:underline">
                              {domain.xgroup.id} - {domain.xgroup.name}
                            </Link>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-800 text-center font-bold mr-2">H</span>
                            <Link href={`/tree?nodeId=${domain.hgroup.id}`} className="text-blue-600 hover:underline">
                              {domain.hgroup.id} - {domain.hgroup.name}
                            </Link>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-center font-bold mr-2">T</span>
                            <Link href={`/tree?nodeId=${domain.tgroup.id}`} className="text-blue-600 hover:underline">
                              {domain.tgroup.id} - {domain.tgroup.name}
                            </Link>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-center font-bold mr-2">F</span>
                            <Link href={`/tree?nodeId=${domain.fgroup.id}`} className="text-blue-600 hover:underline">
                              {domain.fgroup.id} - {domain.fgroup.name}
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Structure Details</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">PDB ID:</span>
                            <a
                              href={`https://www.rcsb.org/structure/${domain.pdbId.substring(0, 4)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:underline"
                            >
                              {domain.pdbId.substring(0, 4)}
                            </a>
                          </p>
                          <p><span className="font-medium">Chain:</span> <span className="ml-2">{domain.chain}</span></p>
                          <p><span className="font-medium">Resolution:</span> <span className="ml-2">{domain.resolution}</span></p>
                          <p><span className="font-medium">Method:</span> <span className="ml-2">{domain.experimentType}</span></p>
                          <p><span className="font-medium">Release Date:</span> <span className="ml-2">{domain.releaseDate}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Pfam accessions */}
                    {domain.pfamAccessions && domain.pfamAccessions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pfam Families</h3>
                        <div className="flex flex-wrap gap-2">
                          {domain.pfamAccessions.map((pfam, idx) => (
                            <a
                              key={idx}
                              href={`https://pfam.xfam.org/family/${pfam.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-50 border border-green-200 rounded px-2 py-1 text-sm inline-flex items-center hover:bg-green-100"
                            >
                              <span className="font-medium text-green-700">{pfam.id}</span>
                              <span className="mx-1 text-gray-500">·</span>
                              <span>{pfam.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ligands */}
                    {domain.ligands && domain.ligands.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Ligands</h3>
                        <div className="flex flex-wrap gap-2">
                          {domain.ligands.map((ligand, idx) => (
                            <a
                              key={idx}
                              href={`https://www.rcsb.org/ligand/${ligand.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-sm inline-flex items-center hover:bg-yellow-100"
                            >
                              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                              <span className="font-medium text-yellow-700">{ligand.id}</span>
                              <span className="mx-1">·</span>
                              <span>{ligand.name}</span>
                              {ligand.count > 1 && <span className="ml-1 text-yellow-700">×{ligand.count}</span>}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sequence section */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Domain Sequence</h3>
                      <div className="bg-gray-50 p-4 rounded border font-mono text-xs overflow-x-auto">
                        {domain.sequence.match(/.{1,10}/g)?.join(' ').match(/.{1,55}/g)?.join('\n')}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download FASTA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar with structure viewer and tools */}
                <div className="space-y-6">
                  {/* Structure viewer card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h2 className="font-medium">Structure Viewer</h2>
                    </div>
                    <div className="p-4">
                      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center p-6">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            Structure viewer not available in this demo.
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            Would typically show a 3D molecular visualization.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download PDB
                        </button>
                        <a
                          href={`https://www.rcsb.org/structure/${domain.pdbId.substring(0, 4)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View in RCSB
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tools card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h2 className="font-medium">Tools</h2>
                    </div>
                    <div className="p-4 space-y-3">
                      <a
                        href="#"
                        className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                      >
                        Find similar domains (BLAST)
                      </a>
                      <a
                        href="#"
                        className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                      >
                        Find structural neighbors
                      </a>
                      <a
                        href="#"
                        className="block w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                      >
                        View multiple alignment
                      </a>
                    </div>
                  </div>

                  {/* References card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h2 className="font-medium">References</h2>
                    </div>
                    <div className="p-4 text-sm space-y-3">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-gray-600">
                          <span className="font-medium">Primary citation:</span> Cheng H, et al.
                          "ECOD: An Evolutionary Classification of Protein Domains."
                          <a href="#" className="text-blue-600 hover:underline ml-1">PLoS Comput Biol. 2014</a>
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-gray-600">
                          <span className="font-medium">Structure citation:</span>
                          <a href="#" className="text-blue-600 hover:underline ml-1">View on PubMed</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
