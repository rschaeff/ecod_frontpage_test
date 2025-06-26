// Updated ProteinStructureViewer.tsx - Fix chain handling

'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import {
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize, Download,
  Settings, Eye, EyeOff, Info, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp
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
  // NEW: Allow explicit chain override
  forceChainId?: string;
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
  className = '',
  forceChainId
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

  // IMPROVED: Extract chain ID with better logic
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
      const threeDMolDomain = convertDomainFormat(domain, chainId);

      // CRITICAL: Ensure chain ID is correctly set
      threeDMolDomain.chainId = chainId;

      console.log(`Converted domain ${domain.id} to 3DMol format:`, {
        id: threeDMolDomain.id,
        chainId: threeDMolDomain.chainId,
        start: threeDMolDomain.start,
        end: threeDMolDomain.end,
        pdb_range: threeDMolDomain.pdb_range
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

  // Rest of the component remains the same...
  // [Previous implementation continues here]

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
            {/* ... control buttons ... */}
          </div>
        </div>
      )}

      {/* Main viewer area */}
      <div className="relative" style={{ height, width }}>
        {/* CRITICAL: Pass explicit chain ID to 3D Viewer */}
        <ThreeDMolViewer
          ref={threeDMolViewerRef}
          pdbId={protein.id.split('_')[0] || protein.id} // Extract PDB ID from "2UUB_A" -> "2UUB"
          chainId={chainId}  // EXPLICIT chain ID
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
              <div className="text-sm text-gray-500 mt-1">
                {protein.id} • Chain {chainId}
              </div>
            </div>
          </div>
        )}

        {/* Error overlay with chain info */}
        {structureError && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex items-center justify-center z-20">
            <div className="max-w-md text-center p-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Structure Loading Error</h3>
              <p className="text-sm text-red-700 mb-2">Chain {chainId}: {structureError}</p>

              <div className="space-y-2 mt-4">
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setStructureError(null);
                    setStructureLoaded(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Try Again
                </button>

                <a
                  href={`https://www.rcsb.org/structure/${protein.id.split('_')[0] || protein.id}`}
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

        {/* Chain info in highlighted domain overlay */}
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
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Domain selector with chain info */}
      {showDomainSelector && protein.domains.length > 0 && (
        <div className="bg-gray-50 border-t p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Chain {chainId} Domains ({protein.domains.length})
            </h4>
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
        </div>
      )}

      {/* Footer with metadata including chain info */}
      <div className="bg-gray-50 border-t px-4 py-2 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>PDB: {protein.id.split('_')[0] || protein.id}</span>
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
