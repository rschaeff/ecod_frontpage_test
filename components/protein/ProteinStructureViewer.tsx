'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import {
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize, Download,
  Settings, Eye, EyeOff, Info, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, Camera, Move3D, Square
} from 'lucide-react';
import { ProteinChain, ViewerOptions, ThreeDMolDomain, convertDomainFormat } from '@/types/protein';

// Dynamic import for 3DMol viewer to avoid SSR issues
const ThreeDMolViewer = dynamic(
  () => import('@/components/visualization/ThreeDMolViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading 3D viewer...</div>
        </div>
      </div>
    )
  }
);

interface ProteinStructureViewerProps {
  protein: ProteinChain;
  highlightedDomain?: string | null;
  viewerOptions?: ViewerOptions;
  onViewerOptionsChange?: (options: ViewerOptions) => void;
  onStructureLoaded?: () => void;
  onStructureError?: (error: string) => void;
  onDomainClick?: (domainId: string) => void;
  height?: string;
  width?: string;
  showControls?: boolean;
  showDomainSelector?: boolean;
  className?: string;
  forceChainId?: string;
}

interface ProteinStructureViewerRef {
  reset: () => void;
  exportImage: () => string | null;
  highlightDomain: (domainIndex: number) => void;
  zoomToDomain: (domainIndex: number) => void;
  isLoaded: () => boolean;
  getViewer: () => any;
}

const ProteinStructureViewer = forwardRef<ProteinStructureViewerRef, ProteinStructureViewerProps>(({
  protein,
  highlightedDomain = null,
  viewerOptions = {
    style: 'cartoon',
    showSideChains: false,
    showLigands: true,
    showLabels: true,
    zoom: 1
  },
  onViewerOptionsChange,
  onStructureLoaded,
  onStructureError,
  onDomainClick,
  height = '500px',
  width = '100%',
  showControls = true,
  showDomainSelector = true,
  className = '',
  forceChainId
}, ref) => {
  // State management
  const [structureLoaded, setStructureLoaded] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [localViewerOptions, setLocalViewerOptions] = useState<ViewerOptions>(viewerOptions);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const threeDMolViewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local options when parent options change
  useEffect(() => {
    setLocalViewerOptions(viewerOptions);
  }, [viewerOptions]);

  // Extract chain ID with better logic
  const getChainId = (): string => {
    // 1. Use explicit override if provided
    if (forceChainId) {
      console.log(`Using forced chain ID: ${forceChainId}`);
      return forceChainId;
    }

    // 2. If protein has explicit chainId field (new data model)
    if ('chainId' in protein && protein.chainId) {
      console.log(`Using protein.chainId: ${protein.chainId}`);
      return protein.chainId;
    }

    // 3. Extract from domain IDs (e.g., e2uubA1 -> A)
    if (protein.domains && protein.domains.length > 0) {
      for (const domain of protein.domains) {
        const match = domain.id.match(/^e\w{4}([A-Z])\d+$/);
        if (match) {
          console.log(`Extracted chain ID from domain ${domain.id}: ${match[1]}`);
          return match[1];
        }
      }
    }

    // 4. Extract from protein ID if in format "2UUB_A"
    if (protein.id && protein.id.includes('_')) {
      const parts = protein.id.split('_');
      if (parts.length === 2) {
        console.log(`Extracted chain ID from protein.id: ${parts[1]}`);
        return parts[1];
      }
    }

    // 5. Default fallback (but log warning)
    console.warn(`Could not determine chain ID, defaulting to 'A' for protein ${protein.id}`);
    return 'A';
  };

  const chainId = getChainId();

  // Convert protein domains to 3DMol format with explicit chain
  const getThreeDMolDomains = (): ThreeDMolDomain[] => {
    if (!protein?.domains) return [];

    return protein.domains.map(domain => {
      const threeDMolDomain = convertDomainFormat(domain);

      // CRITICAL: Ensure chain ID is correctly set
      threeDMolDomain.chainId = chainId;

      console.log(`Converted domain ${domain.id} to 3DMol format:`, {
        id: threeDMolDomain.id,
        chainId: threeDMolDomain.chainId,
        start: threeDMolDomain.start,
        end: threeDMolDomain.end,
        range: `${threeDMolDomain.start}-${threeDMolDomain.end}`
      });

      return threeDMolDomain;
    });
  };

  // Enhanced structure loading with chain validation
  const handleStructureLoaded = () => {
    console.log(`✅ Structure ${protein.id} loaded successfully for chain ${chainId}`);
    setStructureLoaded(true);
    setStructureError(null);
    setIsLoading(false);

    if (onStructureLoaded) {
      onStructureLoaded();
    }
  };

  const handleStructureError = (error: string) => {
    console.error(`❌ Structure ${protein.id} loading error for chain ${chainId}:`, error);
    setStructureError(error);
    setStructureLoaded(false);
    setIsLoading(false);

    if (onStructureError) {
      onStructureError(error);
    }
  };

  // Handle domain selection
  const handleDomainSelect = (domainId: string, index: number) => {
    console.log(`Domain selected: ${domainId} (index: ${index})`);

    // Call the parent's onDomainClick if provided
    if (onDomainClick) {
      onDomainClick(domainId);
    }

    // Zoom to domain if viewer is loaded
    if (structureLoaded && threeDMolViewerRef.current && threeDMolViewerRef.current.zoomToDomain) {
      threeDMolViewerRef.current.zoomToDomain(index);
    }
  };

  // Handle viewer option changes
  const handleViewerOptionChange = (option: keyof ViewerOptions, value: any) => {
    const newOptions = { ...localViewerOptions, [option]: value };
    setLocalViewerOptions(newOptions);

    if (onViewerOptionsChange) {
      onViewerOptionsChange(newOptions);
    }

    // Apply changes to 3DMol viewer if available
    if (structureLoaded && threeDMolViewerRef.current && threeDMolViewerRef.current.updateStyle) {
      threeDMolViewerRef.current.updateStyle(newOptions);
    }
  };

  // Control functions
  const handleReset = () => {
    if (threeDMolViewerRef.current && threeDMolViewerRef.current.reset) {
      threeDMolViewerRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    if (threeDMolViewerRef.current && threeDMolViewerRef.current.zoomIn) {
      threeDMolViewerRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (threeDMolViewerRef.current && threeDMolViewerRef.current.zoomOut) {
      threeDMolViewerRef.current.zoomOut();
    }
  };

  const handleExportImage = () => {
    if (threeDMolViewerRef.current && threeDMolViewerRef.current.exportImage) {
      const imageData = threeDMolViewerRef.current.exportImage();
      if (imageData) {
        // Create download link
        const link = document.createElement('a');
        link.download = `${protein.id}_structure.png`;
        link.href = imageData;
        link.click();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    reset: handleReset,
    exportImage: () => {
      if (threeDMolViewerRef.current && threeDMolViewerRef.current.exportImage) {
        return threeDMolViewerRef.current.exportImage();
      }
      return null;
    },
    highlightDomain: (domainIndex: number) => {
      if (threeDMolViewerRef.current && threeDMolViewerRef.current.highlightDomain) {
        threeDMolViewerRef.current.highlightDomain(domainIndex);
      }
    },
    zoomToDomain: (domainIndex: number) => {
      if (threeDMolViewerRef.current && threeDMolViewerRef.current.zoomToDomain) {
        threeDMolViewerRef.current.zoomToDomain(domainIndex);
      }
    },
    isLoaded: () => structureLoaded,
    getViewer: () => threeDMolViewerRef.current
  }));

  return (
    <div ref={containerRef} className={`relative bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with controls */}
      {showControls && (
        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-800">
              3D Structure: {protein.id} (Chain {chainId})
            </h3>
            <div className={`w-2 h-2 rounded-full ${
              structureLoaded ? 'bg-green-500' :
              structureError ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <span className="text-xs text-gray-500">
              {structureLoaded ? 'Loaded' :
               structureError ? 'Error' :
               'Loading...'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Zoom controls */}
            <button
              onClick={handleZoomIn}
              disabled={!structureLoaded}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={!structureLoaded}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            {/* Reset view */}
            <button
              onClick={handleReset}
              disabled={!structureLoaded}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset view"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Export image */}
            <button
              onClick={handleExportImage}
              disabled={!structureLoaded}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export image"
            >
              <Camera className="h-4 w-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-gray-200"
              title="Toggle fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1 rounded hover:bg-gray-200 ${showSettings ? 'bg-gray-200' : ''}`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b px-4 py-3">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Viewer Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Style selection */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Style</label>
              <select
                value={localViewerOptions.style}
                onChange={(e) => handleViewerOptionChange('style', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="cartoon">Cartoon</option>
                <option value="stick">Stick</option>
                <option value="sphere">Sphere</option>
                <option value="line">Line</option>
                <option value="surface">Surface</option>
              </select>
            </div>

            {/* Show side chains */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showSideChains"
                checked={localViewerOptions.showSideChains}
                onChange={(e) => handleViewerOptionChange('showSideChains', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showSideChains" className="text-xs text-gray-600">Show side chains</label>
            </div>

            {/* Show ligands */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLigands"
                checked={localViewerOptions.showLigands}
                onChange={(e) => handleViewerOptionChange('showLigands', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLigands" className="text-xs text-gray-600">Show ligands</label>
            </div>

            {/* Show labels */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLabels"
                checked={localViewerOptions.showLabels}
                onChange={(e) => handleViewerOptionChange('showLabels', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLabels" className="text-xs text-gray-600">Show labels</label>
            </div>
          </div>
        </div>
      )}

      {/* Main viewer area */}
      <div className="relative" style={{ height, width }}>
        {/* 3DMol Viewer */}
        <ThreeDMolViewer
          ref={threeDMolViewerRef}
          pdbId={protein.pdbId || protein.id.split('_')[0] || protein.id}
          chainId={chainId}
          domains={getThreeDMolDomains()}
          highlightedDomain={highlightedDomain}
          viewerOptions={localViewerOptions}
          height="100%"
          width="100%"
          onStructureLoaded={handleStructureLoaded}
          onError={handleStructureError}
          showControls={false}
          showLoading={false}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <div className="text-lg font-medium text-gray-700">Loading Structure</div>
              <div className="text-sm text-gray-500 mt-1">
                {protein.id} • Chain {chainId}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Fetching from RCSB PDB...
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {structureError && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex items-center justify-center z-20">
            <div className="max-w-md text-center p-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Structure Loading Error</h3>
              <p className="text-sm text-red-700 mb-2">Chain {chainId}: {structureError}</p>
              <p className="text-xs text-red-600 mb-4">
                The structure may not be available or the chain ID might be incorrect.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setStructureError(null);
                    setStructureLoaded(false);
                    // Trigger reload of the ThreeDMolViewer
                    if (threeDMolViewerRef.current && threeDMolViewerRef.current.reload) {
                      threeDMolViewerRef.current.reload();
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  <RefreshCw className="inline h-4 w-4 mr-2" />
                  Try Again
                </button>

                <a
                  href={`https://www.rcsb.org/structure/${protein.pdbId || protein.id.split('_')[0] || protein.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm transition-colors"
                >
                  View in RCSB PDB
                </a>

                {protein.uniprotId && (
                  <a
                    href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded text-sm transition-colors"
                  >
                    View AlphaFold Model
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Highlighted domain info overlay */}
        {highlightedDomain && structureLoaded && (
          <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg z-10">
            {(() => {
              const domain = protein.domains.find(d => d.id === highlightedDomain);
              return domain ? (
                <div>
                  <div className="font-medium text-gray-800" style={{ color: domain.color }}>
                    {domain.description}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Chain {chainId}: {domain.range}</span>
                    <span className="mx-2">•</span>
                    <span>ECOD: {domain.ecod.fgroup}</span>
                    <span className="mx-2">•</span>
                    <span>{domain.rangeEnd - domain.rangeStart + 1} residues</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Domain selector */}
      {showDomainSelector && protein.domains.length > 0 && (
        <div className="bg-gray-50 border-t p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Chain {chainId} Domains ({protein.domains.length})
            </h4>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {protein.domains.map((domain, index) => (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id, index)}
                className={`px-3 py-1 text-xs border rounded-full transition-colors flex items-center space-x-1 ${
                  highlightedDomain === domain.id
                    ? 'bg-gray-200 border-gray-400 text-gray-800 ring-2 ring-blue-300'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                }`}
                disabled={!structureLoaded}
                title={`${domain.description} (Chain ${chainId}: ${domain.range})`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: domain.color }}
                />
                <span>{domain.id}</span>
              </button>
            ))}
          </div>

          {/* Show all/none buttons */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (onDomainClick) {
                    onDomainClick('all');
                  }
                }}
                disabled={!structureLoaded}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Show all
              </button>
              <button
                onClick={() => {
                  if (onDomainClick) {
                    onDomainClick('none');
                  }
                }}
                disabled={!structureLoaded}
                className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Show none
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Click domains to highlight in 3D
            </div>
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="bg-gray-50 border-t px-4 py-2 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>PDB: {protein.pdbId || protein.id.split('_')[0] || protein.id}</span>
          <span>Chain: {chainId}</span>
          <span>Method: {protein.method}</span>
          <span>Resolution: {protein.resolution}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{protein.domains.length} domain{protein.domains.length !== 1 ? 's' : ''}</span>
          {protein.uniprotId && (
            <a
              href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
              title="View in UniProt"
            >
              {protein.uniprotId}
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

ProteinStructureViewer.displayName = 'ProteinStructureViewer';

export default ProteinStructureViewer;
