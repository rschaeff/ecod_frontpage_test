'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import {
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize, Download,
  Settings, Eye, EyeOff, Info, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { ProteinData, ViewerOptions, ThreeDMolDomain, convertDomainFormat } from '@/types/protein';

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
  protein: ProteinData;
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
}

interface ProteinStructureViewerRef {
  reset: () => void;
  exportImage: () => string | null;
  highlightDomain: (domainIndex: number) => void;
  zoomToDomain: (domainIndex: number) => void;
  isLoaded: () => boolean;
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
  className = ''
}, ref) => {
  // State management
  const [structureLoaded, setStructureLoaded] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [localViewerOptions, setLocalViewerOptions] = useState<ViewerOptions>(viewerOptions);

  // Refs
  const threeDMolViewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract chain ID from first domain (assuming format like e4ubpA1)
  const getChainId = (): string => {
    if (!protein.domains.length) return 'A';
    const firstDomainId = protein.domains[0].id;
    const match = firstDomainId.match(/e\w{4}([A-Z])\d+/);
    return match ? match[1] : 'A';
  };

  const chainId = getChainId();

  // Convert protein domains to 3DMol format
  const getThreeDMolDomains = (): ThreeDMolDomain[] => {
    if (!protein?.domains) return [];
    return protein.domains.map(domain => convertDomainFormat(domain, chainId));
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (threeDMolViewerRef.current?.current) {
        try {
          threeDMolViewerRef.current.current.reset();
        } catch (error) {
          console.warn('Error resetting viewer:', error);
        }
      }
    },
    exportImage: () => {
      if (threeDMolViewerRef.current?.current) {
        try {
          return threeDMolViewerRef.current.current.exportImage();
        } catch (error) {
          console.warn('Error exporting image:', error);
          return null;
        }
      }
      return null;
    },
    highlightDomain: (domainIndex: number) => {
      if (threeDMolViewerRef.current?.current && protein.domains[domainIndex]) {
        try {
          threeDMolViewerRef.current.current.highlightDomain(domainIndex);
        } catch (error) {
          console.warn('Error highlighting domain:', error);
        }
      }
    },
    zoomToDomain: (domainIndex: number) => {
      // Same as highlight for now, could be extended
      if (threeDMolViewerRef.current?.current && protein.domains[domainIndex]) {
        try {
          threeDMolViewerRef.current.current.highlightDomain(domainIndex);
        } catch (error) {
          console.warn('Error zooming to domain:', error);
        }
      }
    },
    isLoaded: () => structureLoaded
  }));

  // Handle structure loading events
  const handleStructureLoaded = () => {
    console.log(`Structure ${protein.id} loaded successfully`);
    setStructureLoaded(true);
    setStructureError(null);
    setIsLoading(false);

    if (onStructureLoaded) {
      onStructureLoaded();
    }
  };

  const handleStructureError = (error: string) => {
    console.error(`Structure ${protein.id} loading error:`, error);
    setStructureError(error);
    setStructureLoaded(false);
    setIsLoading(false);

    if (onStructureError) {
      onStructureError(error);
    }
  };

  // Handle viewer option changes
  const updateViewerOptions = (newOptions: Partial<ViewerOptions>) => {
    const updatedOptions = { ...localViewerOptions, ...newOptions };
    setLocalViewerOptions(updatedOptions);

    if (onViewerOptionsChange) {
      onViewerOptionsChange(updatedOptions);
    }
  };

  // Handle domain highlighting from external source
  useEffect(() => {
    if (structureLoaded && highlightedDomain && threeDMolViewerRef.current?.current) {
      const domainIndex = protein.domains.findIndex(d => d.id === highlightedDomain);
      if (domainIndex !== -1) {
        try {
          threeDMolViewerRef.current.current.highlightDomain(domainIndex);
        } catch (error) {
          console.warn('Error highlighting domain from external trigger:', error);
        }
      }
    }
  }, [highlightedDomain, structureLoaded, protein.domains]);

  // Control handlers
  const handleReset = () => {
    if (threeDMolViewerRef.current?.current) {
      try {
        threeDMolViewerRef.current.current.reset();
      } catch (error) {
        console.warn('Error resetting view:', error);
      }
    }
  };

  const handleExportImage = () => {
    if (threeDMolViewerRef.current?.current) {
      try {
        const dataUrl = threeDMolViewerRef.current.current.exportImage();
        if (dataUrl) {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${protein.id}_structure.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.warn('Error exporting image:', error);
      }
    }
  };

  const handleDomainSelect = (domainId: string, domainIndex: number) => {
    // Highlight in 3D viewer
    if (threeDMolViewerRef.current?.current) {
      try {
        threeDMolViewerRef.current.current.highlightDomain(domainIndex);
      } catch (error) {
        console.warn('Error highlighting selected domain:', error);
      }
    }

    // Notify parent component
    if (onDomainClick) {
      onDomainClick(domainId);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setStructureError(null);
    setStructureLoaded(false);
  };

  return (
    <div ref={containerRef} className={`relative bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with controls */}
      {showControls && (
        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-800">
              3D Structure: {protein.id}
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
              onClick={() => updateViewerOptions({ zoom: Math.min(localViewerOptions.zoom + 0.2, 3) })}
              disabled={!structureLoaded}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={() => updateViewerOptions({ zoom: Math.max(localViewerOptions.zoom - 0.2, 0.3) })}
              disabled={!structureLoaded}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            {/* Reset view */}
            <button
              onClick={handleReset}
              disabled={!structureLoaded}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset View"
            >
              <Maximize className="h-4 w-4" />
            </button>

            {/* Export image */}
            <button
              onClick={handleExportImage}
              disabled={!structureLoaded}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export Image"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded hover:bg-gray-200"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-gray-200"
              title="Refresh Structure"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Style selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Representation</label>
              <select
                value={localViewerOptions.style}
                onChange={(e) => updateViewerOptions({ style: e.target.value as any })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="cartoon">Cartoon</option>
                <option value="ball-and-stick">Ball & Stick</option>
                <option value="surface">Surface</option>
                <option value="spacefill">Space Fill</option>
              </select>
            </div>

            {/* Display options */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Display</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localViewerOptions.showSideChains}
                    onChange={(e) => updateViewerOptions({ showSideChains: e.target.checked })}
                    className="mr-2"
                  />
                  <span>Side Chains</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localViewerOptions.showLigands}
                    onChange={(e) => updateViewerOptions({ showLigands: e.target.checked })}
                    className="mr-2"
                  />
                  <span>Ligands</span>
                </label>
              </div>
            </div>

            {/* Labels and info */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Labels</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localViewerOptions.showLabels}
                  onChange={(e) => updateViewerOptions({ showLabels: e.target.checked })}
                  className="mr-2"
                />
                <span>Show Labels</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main viewer area */}
      <div className="relative" style={{ height, width }}>
        {/* 3D Viewer */}
        <ThreeDMolViewer
          ref={threeDMolViewerRef}
          pdbId={protein.id}
          chainId={chainId}
          domains={getThreeDMolDomains()}
          height="100%"
          width="100%"
          onStructureLoaded={handleStructureLoaded}
          onError={handleStructureError}
          showControls={false} // We have our own controls
          showLoading={false}  // We have our own loading state
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <div className="text-lg font-medium text-gray-700">Loading Structure</div>
              <div className="text-sm text-gray-500 mt-1">{protein.id} • Chain {chainId}</div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {structureError && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex items-center justify-center z-20">
            <div className="max-w-md text-center p-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Structure Loading Error</h3>
              <p className="text-sm text-red-700 mb-4">{structureError}</p>

              <div className="space-y-2">
                <button
                  onClick={handleRefresh}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Try Again
                </button>

                <a
                  href={`https://www.rcsb.org/structure/${protein.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm transition-colors"
                >
                  View in RCSB PDB
                </a>
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
                    <span>Range: {domain.range}</span>
                    <span className="mx-2">•</span>
                    <span>ECOD: {domain.ecod.fgroup}</span>
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
              Domains ({protein.domains.length})
            </h4>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
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
                    ? 'bg-gray-200 border-gray-400 text-gray-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                disabled={!structureLoaded}
                title={`${domain.description} (${domain.range})`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: domain.color }}
                />
                <span>{domain.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="bg-gray-50 border-t px-4 py-2 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>PDB: {protein.id}</span>
          <span>Chain: {chainId}</span>
          <span>Method: {protein.method}</span>
          <span>Resolution: {protein.resolution}</span>
        </div>
        <div>
          <span>{protein.domains.length} domain{protein.domains.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
});

ProteinStructureViewer.displayName = 'ProteinStructureViewer';

export default ProteinStructureViewer;
