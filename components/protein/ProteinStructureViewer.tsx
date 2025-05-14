'use client';

import { useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize } from 'lucide-react';
import { ProteinData, ViewerOptions } from '@/types/protein';
import StructureViewer from '@/components/StructureViewer';

interface ProteinStructureViewerProps {
  protein: ProteinData;
  highlightedDomain: string | null;
  viewerOptions: ViewerOptions;
  onViewerOptionsChange?: (options: ViewerOptions) => void;
}

export default function EnhancedProteinStructureViewer({
  protein,
  highlightedDomain,
  viewerOptions,
  onViewerOptionsChange
}: ProteinStructureViewerProps) {
  const structureViewerRef = useRef(null);
  const highlightedDomainData = protein.domains.find(d => d.id === highlightedDomain);

  // Create highlight config for the 3D viewer
  const highlights = highlightedDomain
    ? protein.domains
        .filter(d => d.id === highlightedDomain)
        .map(d => ({
          start: d.rangeStart,
          end: d.rangeEnd,
          chainId: 'A', // Assuming chain A - in real app, would get from domain data
          color: d.color
        }))
    : [];

  // Handler for viewer controls
  const handleViewerOptionChange = (option: string, value: any) => {
    if (onViewerOptionsChange) {
      const newOptions = { ...viewerOptions, [option]: value };
      onViewerOptionsChange(newOptions);
    }
  };

  // Handle viewer controls
  const handleZoomIn = () => {
    const newZoom = Math.min(viewerOptions.zoom + 0.2, 2);
    handleViewerOptionChange('zoom', newZoom);

    // If using the StructureViewer, we can access its methods via ref
    if (structureViewerRef.current) {
      // For example: structureViewerRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(viewerOptions.zoom - 0.2, 0.5);
    handleViewerOptionChange('zoom', newZoom);

    // If using the StructureViewer, we can access its methods via ref
    if (structureViewerRef.current) {
      // For example: structureViewerRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (structureViewerRef.current) {
      // For example: structureViewerRef.current.resetView();
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg border overflow-hidden relative">
      <div className="p-3 bg-gray-200 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Protein Structure: {protein.id}</h3>
        <div className="flex space-x-2">
          <button
            className="p-1 hover:bg-gray-300 rounded"
            title="Zoom in"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </button>
          <button
            className="p-1 hover:bg-gray-300 rounded"
            title="Zoom out"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </button>
          <button
            className="p-1 hover:bg-gray-300 rounded"
            title="Rotate left"
            onClick={() => {
              if (structureViewerRef.current) {
                // Access rotation controls if available
              }
            }}
          >
            <RotateCcw className="h-4 w-4 text-gray-700" />
          </button>
          <button
            className="p-1 hover:bg-gray-300 rounded"
            title="Rotate right"
            onClick={() => {
              if (structureViewerRef.current) {
                // Access rotation controls if available
              }
            }}
          >
            <RotateCw className="h-4 w-4 text-gray-700" />
          </button>
          <button
            className="p-1 hover:bg-gray-300 rounded"
            title="Reset view"
            onClick={handleResetView}
          >
            <Maximize className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="aspect-square">
        <StructureViewer
          ref={structureViewerRef}
          pdbId={protein.id}
          style={viewerOptions.style as 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill'}
          showSideChains={viewerOptions.showSideChains}
          showLigands={true}
          highlights={highlights}
          height="100%"
          width="100%"
          onLoaded={() => console.log('Structure loaded')}
          onError={(error) => console.error('Error loading structure:', error)}
        />
      </div>

      {/* Display info about highlighted domain */}
      {highlightedDomainData && (
        <div className="absolute bottom-16 left-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md text-sm">
          <p className="font-medium" style={{ color: highlightedDomainData.color }}>
            {highlightedDomainData.description} ({highlightedDomainData.range})
          </p>
        </div>
      )}
      
      {/* Viewer options */}
      <div className="p-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <select 
            className="bg-white border px-2 py-1 rounded text-xs"
            value={viewerOptions.style}
            onChange={(e) => handleViewerOptionChange('style', e.target.value)}
          >
            <option value="cartoon">Cartoon</option>
            <option value="surface">Surface</option>
            <option value="ball-and-stick">Ball and Stick</option>
          </select>
          
          <label className="flex items-center space-x-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={viewerOptions.showLabels} 
              onChange={(e) => handleViewerOptionChange('showLabels', e.target.checked)}
              className="rounded" 
            />
            <span>Labels</span>
          </label>
          
          <label className="flex items-center space-x-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={viewerOptions.showSideChains} 
              onChange={(e) => handleViewerOptionChange('showSideChains', e.target.checked)}
              className="rounded" 
            />
            <span>Side chains</span>
          </label>
        </div>
        
        <div className="text-xs text-gray-500">
          <span>Resolution: {protein.resolution}</span>
        </div>
      </div>
    </div>
  );
}
