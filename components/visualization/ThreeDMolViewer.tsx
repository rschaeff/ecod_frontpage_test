// components/visualization/ThreeDMolViewer.tsx
'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { AlertTriangle, RefreshCw, Camera, ZoomIn, ZoomOut, RotateCcw, Settings, ExternalLink } from 'lucide-react';

// =============================================================================
// UI COMPONENTS (Missing imports - implemented here)
// =============================================================================

interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  size = 'md',
  variant = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  title
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
    destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    destructive: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => (
  <div className={`relative group ${className}`}>
    {children}
    <div className="invisible group-hover:visible absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded-md whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface Domain {
  id: string;
  chainId: string;
  start: number;
  end: number;
  color: string;
  label?: string;
  pdb_range?: string;
  pdb_start?: string | number;
  pdb_end?: string | number;
  classification?: {
    t_group?: string;
    h_group?: string;
    x_group?: string;
    a_group?: string;
  };
}

interface StructureSelection {
  chain?: string;
  resi?: string | number;
  atom?: string;
}

interface StructureInfo {
  actualChain: string;
  originalChain?: string;
  minResidue: number;
  maxResidue: number;
  totalResidues: number;
  residueList: number[];
  allChains: string[];
  chainType: 'protein' | 'nucleic acid' | 'unknown';
}

interface ChainInfo {
  chain: string;
  atomCount: number;
  caCount: number;
  pCount: number;
  residues: Set<number>;
  atomTypes: Set<string>;
  residueCount: number;
  isProtein: boolean;
  isNucleicAcid: boolean;
  proteinScore: number;
  nucAcidScore: number;
}

interface ViewerMethods {
  reset: () => void;
  exportImage: () => string | null;
  highlightDomain: (domainIndex: number) => void;
  zoomToDomain: (domainIndex: number) => void;
  reload: () => void;
  updateStyle: (options: any) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface ThreeDMolViewerProps {
  pdbId: string;
  chainId?: string;
  domains?: Domain[];
  highlightedDomain?: string | null;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  onStructureLoaded?: () => void;
  onError?: (error: string) => void;
  showLoading?: boolean;
  showControls?: boolean;
  viewerOptions?: {
    style?: string;
    showSideChains?: boolean;
    showLigands?: boolean;
    showLabels?: boolean;
  };
}

// Domain colors with high contrast
const DOMAIN_COLORS = [
  '#FF0000', '#0066FF', '#00CC00', '#FF6600', '#9900CC', '#00CCCC',
  '#CC6600', '#FF99CC', '#666666', '#336699', '#FF6B6B', '#4ECDC4'
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ThreeDMolViewer = forwardRef<ViewerMethods, ThreeDMolViewerProps>(({
  pdbId,
  chainId,
  domains = [],
  highlightedDomain = null,
  width = '100%',
  height = '400px',
  className = '',
  style = {},
  backgroundColor = '#ffffff',
  onStructureLoaded,
  onError,
  showLoading = true,
  showControls = false,
  viewerOptions = {}
}, ref) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const lastAppliedDomainsRef = useRef<Domain[]>([]);
  const structureInfoRef = useRef<StructureInfo | null>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentViewerOptions, setCurrentViewerOptions] = useState({
    style: 'cartoon',
    showSideChains: false,
    showLigands: true,
    showLabels: false,
    ...viewerOptions
  });

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[3DMol] ${message}`, data || '');
    }
  };

  const handleError = (message: string) => {
    debugLog(`Error: ${message}`);
    setErrorMessage(message);
    setIsLoading(false);
    onError?.(message);
  };

  // Analyze structure to understand residue numbering and available chains
  const analyzeStructure = (viewer: any, targetChain?: string): StructureInfo | null => {
    try {
      const allAtoms = viewer.selectedAtoms({});
      const chainInfoMap = new Map<string, ChainInfo>();

      // Analyze each chain
      allAtoms.forEach((atom: any) => {
        if (!chainInfoMap.has(atom.chain)) {
          chainInfoMap.set(atom.chain, {
            chain: atom.chain,
            atomCount: 0,
            caCount: 0,
            pCount: 0,
            residues: new Set(),
            atomTypes: new Set(),
            residueCount: 0,
            isProtein: false,
            isNucleicAcid: false,
            proteinScore: 0,
            nucAcidScore: 0
          });
        }

        const info = chainInfoMap.get(atom.chain)!;
        info.atomCount++;
        info.atomTypes.add(atom.atom);

        if (atom.atom === 'CA') info.caCount++;
        if (atom.atom === 'P') info.pCount++;
        if (atom.resi) info.residues.add(parseInt(atom.resi));
      });

      // Classify chains
      const chains: ChainInfo[] = Array.from(chainInfoMap.values()).map(info => ({
        ...info,
        residueCount: info.residues.size,
        isProtein: info.caCount > 10,
        isNucleicAcid: info.pCount > 5,
        proteinScore: info.caCount / Math.max(info.atomCount, 1),
        nucAcidScore: info.pCount / Math.max(info.atomCount, 1)
      }));

      debugLog('Chain analysis:', chains);

      // Find the best protein chain
      let actualChain = targetChain;

      if (targetChain) {
        const targetInfo = chains.find(c => c.chain === targetChain);
        if (!targetInfo) {
          debugLog(`Target chain ${targetChain} not found`);
          actualChain = undefined;
        } else if (!targetInfo.isProtein) {
          debugLog(`Target chain ${targetChain} is not a protein (CA count: ${targetInfo.caCount})`);
        }
      }

      // If no target chain or target not found, find best protein chain
      if (!actualChain) {
        const proteinChains = chains
          .filter(c => c.isProtein)
          .sort((a, b) => b.caCount - a.caCount);

        if (proteinChains.length > 0) {
          actualChain = proteinChains[0].chain;
          debugLog(`Auto-selected protein chain: ${actualChain} (${proteinChains[0].caCount} CA atoms)`);
        } else {
          const allChainsList = chains.map(c => c.chain).join(', ');
          throw new Error(`No protein chains found. Available chains: ${allChainsList}`);
        }
      }

      // Analyze the selected chain
      const targetChainInfo = chains.find(c => c.chain === actualChain);
      if (!targetChainInfo) {
        throw new Error(`Chain ${actualChain} not found`);
      }

      const atoms = viewer.selectedAtoms({ chain: actualChain });
      const residues = new Set<number>();
      atoms.forEach((atom: any) => {
        if (atom.resi) {
          residues.add(parseInt(atom.resi));
        }
      });

      const sortedResidues = Array.from(residues).sort((a, b) => a - b);

      return {
        actualChain,
        originalChain: targetChain,
        minResidue: sortedResidues[0] || 1,
        maxResidue: sortedResidues[sortedResidues.length - 1] || 1,
        totalResidues: sortedResidues.length,
        residueList: sortedResidues,
        allChains: chains.map(c => c.chain),
        chainType: targetChainInfo.isProtein ? 'protein' :
                   targetChainInfo.isNucleicAcid ? 'nucleic acid' : 'unknown'
      };
    } catch (error) {
      debugLog('Error analyzing structure:', error);
      return null;
    }
  };

  // Enhanced coordinate mapping
  const mapSequenceToStructure = (seqStart: number, seqEnd: number, structureInfo: StructureInfo): string | null => {
    // Try direct mapping first
    if (seqStart >= structureInfo.minResidue && seqEnd <= structureInfo.maxResidue) {
      return `${seqStart}-${seqEnd}`;
    }

    // Try offset mapping
    const offset = structureInfo.minResidue - 1;
    const mappedStart = seqStart + offset;
    const mappedEnd = seqEnd + offset;

    if (mappedStart >= structureInfo.minResidue && mappedEnd <= structureInfo.maxResidue) {
      debugLog(`Mapped sequence ${seqStart}-${seqEnd} to structure ${mappedStart}-${mappedEnd}`);
      return `${mappedStart}-${mappedEnd}`;
    }

    debugLog(`Could not map sequence range ${seqStart}-${seqEnd} to structure`);
    return null;
  };

  // Check if selection exists
  const checkSelectionExists = (viewer: any, selection: StructureSelection): boolean => {
    if (!viewer) return false;

    try {
      const atoms = viewer.selectedAtoms(selection);
      const exists = atoms && atoms.length > 0;
      debugLog(`Selection ${JSON.stringify(selection)} has ${atoms?.length || 0} atoms`);
      return exists;
    } catch (err) {
      debugLog('Error checking selection:', err);
      return false;
    }
  };

  // Get mapped range for a domain
  const getMappedRange = (domain: Domain): string | null => {
    if (domain.pdb_range) {
      return domain.pdb_range;
    }

    if (domain.pdb_start && domain.pdb_end) {
      return `${domain.pdb_start}-${domain.pdb_end}`;
    }

    if (structureInfoRef.current && domain.start && domain.end) {
      return mapSequenceToStructure(domain.start, domain.end, structureInfoRef.current);
    }

    if (domain.start && domain.end) {
      return `${domain.start}-${domain.end}`;
    }

    return null;
  };

  // Apply domain styling
  const applyDomainStyling = (viewer: any) => {
    if (!viewer || !structureInfoRef.current) return;

    const targetChain = structureInfoRef.current.actualChain;
    debugLog(`Applying styling for ${domains.length} domains on protein chain ${targetChain}`);

    try {
      // Hide everything first
      viewer.setStyle({}, {
        cartoon: { opacity: 0 },
        stick: { opacity: 0 },
        sphere: { opacity: 0 }
      });

      // Show only the target protein chain
      viewer.setStyle({ chain: targetChain }, {
        cartoon: {
          color: 'gray',
          opacity: 0.8
        }
      });

      // Apply domain colors
      if (domains.length > 0) {
        let successfulDomains = 0;

        domains.forEach((domain, index) => {
          try {
            const mappedRange = getMappedRange(domain);
            if (!mappedRange) {
              debugLog(`Skipping domain ${domain.id} - no valid range`);
              return;
            }

            const domainChainId = domain.chainId || targetChain;
            const selection = {
              chain: domainChainId,
              resi: mappedRange
            };

            if (checkSelectionExists(viewer, selection)) {
              const domainColor = domain.color || DOMAIN_COLORS[index % DOMAIN_COLORS.length];

              viewer.setStyle(selection, {
                cartoon: {
                  color: domainColor,
                  opacity: 1.0
                }
              });

              successfulDomains++;
              debugLog(`✓ Styled domain ${domain.id} with range ${mappedRange}`);
            } else {
              debugLog(`⚠ Domain ${domain.id} range ${mappedRange} not found`);
            }
          } catch (domainError) {
            debugLog(`Error processing domain ${domain.id}:`, domainError);
          }
        });

        debugLog(`Successfully styled ${successfulDomains}/${domains.length} domains`);
      }

      viewer.render();
      lastAppliedDomainsRef.current = [...domains];
    } catch (error) {
      debugLog('Error in applyDomainStyling:', error);
    }
  };

  // =============================================================================
  // EXPOSED METHODS VIA REF
  // =============================================================================

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (viewerRef.current && structureInfoRef.current) {
        try {
          applyDomainStyling(viewerRef.current);
          const targetChain = structureInfoRef.current.actualChain;
          viewerRef.current.zoomTo({ chain: targetChain });
          viewerRef.current.render();
        } catch (error) {
          debugLog('Error in reset:', error);
        }
      }
    },
    exportImage: () => {
      if (viewerRef.current) {
        try {
          return viewerRef.current.pngURI();
        } catch (error) {
          debugLog('Error exporting image:', error);
          return null;
        }
      }
      return null;
    },
    highlightDomain: (domainIndex: number) => {
      if (!viewerRef.current || domains.length <= domainIndex || !structureInfoRef.current) return;

      const domain = domains[domainIndex];
      const targetChain = structureInfoRef.current.actualChain;

      try {
        const mappedRange = getMappedRange(domain);
        if (!mappedRange) {
          debugLog('Could not map domain range for highlighting');
          return;
        }

        const selection = {
          chain: targetChain,
          resi: mappedRange
        };

        // Set background to low opacity
        viewerRef.current.setStyle({ chain: targetChain }, {
          cartoon: { color: 'gray', opacity: 0.3 }
        });

        // Highlight the specific domain
        viewerRef.current.setStyle(selection, {
          cartoon: {
            color: domain.color,
            opacity: 1.0
          }
        });

        viewerRef.current.zoomTo(selection);
        viewerRef.current.render();
      } catch (error) {
        debugLog('Error highlighting domain:', error);
        applyDomainStyling(viewerRef.current);
      }
    },
    zoomToDomain: (domainIndex: number) => {
      if (!viewerRef.current || domains.length <= domainIndex || !structureInfoRef.current) return;

      const domain = domains[domainIndex];
      const targetChain = structureInfoRef.current.actualChain;
      const mappedRange = getMappedRange(domain);

      if (mappedRange) {
        try {
          viewerRef.current.zoomTo({ chain: targetChain, resi: mappedRange });
          viewerRef.current.render();
        } catch (error) {
          debugLog('Error zooming to domain:', error);
        }
      }
    },
    reload: () => {
      setIsLoading(true);
      setErrorMessage(null);
      loadedRef.current = false;
      // Trigger re-initialization
      if (containerRef.current) {
        initializeViewer();
      }
    },
    updateStyle: (options: any) => {
      setCurrentViewerOptions(prev => ({ ...prev, ...options }));
      if (viewerRef.current) {
        applyDomainStyling(viewerRef.current);
      }
    },
    zoomIn: () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.zoom(1.2);
          viewerRef.current.render();
        } catch (error) {
          debugLog('Error zooming in:', error);
        }
      }
    },
    zoomOut: () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.zoom(0.8);
          viewerRef.current.render();
        } catch (error) {
          debugLog('Error zooming out:', error);
        }
      }
    },
    highlightResidue: (residueNumber: number) => {
      if (!viewerRef.current || !structureInfoRef.current) return;

      const targetChain = structureInfoRef.current.actualChain;

      try {
        // Clear any previous labels
        viewerRef.current.removeAllLabels();

        // Reapply domain styling to reset any previous highlights
        applyDomainStyling(viewerRef.current);

        // Highlight the specific residue with a bright color and sphere representation
        const selection = {
          chain: targetChain,
          resi: residueNumber
        };

        // Add sphere representation for the residue
        viewerRef.current.addStyle(selection, {
          sphere: {
            color: 'yellow',
            radius: 1.5
          }
        });

        // Add label for the residue
        viewerRef.current.addLabel(
          `Residue ${residueNumber}`,
          {
            position: selection,
            backgroundColor: 'black',
            backgroundOpacity: 0.8,
            fontColor: 'white',
            fontSize: 12
          }
        );

        // Zoom to the residue
        viewerRef.current.zoomTo(selection, 500);
        viewerRef.current.render();
      } catch (error) {
        debugLog('Error highlighting residue:', error);
      }
    },
    clearHighlight: () => {
      if (!viewerRef.current) return;

      try {
        // Remove all labels
        viewerRef.current.removeAllLabels();

        // Reapply domain styling to clear highlights
        applyDomainStyling(viewerRef.current);
        viewerRef.current.render();
      } catch (error) {
        debugLog('Error clearing highlight:', error);
      }
    }
  }));

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  const initializeViewer = async () => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    setIsLoading(true);
    setErrorMessage(null);
    loadedRef.current = false;
    structureInfoRef.current = null;

    try {
      const $3Dmol = await import('3dmol');
      debugLog('3DMol library loaded');

      // Clean up previous viewer
      if (viewerRef.current) {
        try {
          viewerRef.current.removeAllModels();
          if (typeof viewerRef.current.destroy === 'function') {
            viewerRef.current.destroy();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        viewerRef.current = null;
      }

      // Create new viewer
      const config = {
        backgroundColor: backgroundColor || 'white',
        id: containerRef.current.id
      };

      debugLog('Creating 3DMol viewer with config:', config);
      const viewer = $3Dmol.createViewer(containerRef.current, config);
      viewerRef.current = viewer;

      // Load structure
      await loadStructure(viewer);

    } catch (error) {
      handleError(`Error initializing 3DMol.js: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const loadStructure = async (viewer: any) => {
    debugLog(`Loading PDB ID: ${pdbId} for chain: ${chainId || 'auto-detect'}`);

    try {
      // Try local API first
      const structureUrl = `/api/pdb/${pdbId}`;
      const response = await fetch(structureUrl);

      if (response.ok) {
        const structureData = await response.text();
        if (structureData.includes('data_') || structureData.includes('_entry.id')) {
          debugLog('mmCIF structure loaded successfully from local API');
          const model = viewer.addModel(structureData, 'cif');
          if (model) {
            processLoadedStructure(viewer);
          } else {
            throw new Error('Failed to parse mmCIF data');
          }
        } else {
          throw new Error('Invalid mmCIF data received');
        }
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (apiError) {
      debugLog('Local API failed, trying RCSB direct:', apiError);

      try {
        const rcsbUrl = `https://files.rcsb.org/download/${pdbId.toLowerCase()}.cif`;
        const response = await fetch(rcsbUrl);

        if (response.ok) {
          const structureData = await response.text();
          if (structureData.includes('data_') || structureData.includes('_entry.id')) {
            debugLog('mmCIF structure loaded from RCSB direct');
            const model = viewer.addModel(structureData, 'cif');
            if (model) {
              processLoadedStructure(viewer);
            } else {
              throw new Error('Failed to parse mmCIF data from RCSB');
            }
          } else {
            throw new Error('Invalid mmCIF data from RCSB');
          }
        } else {
          throw new Error(`RCSB returned ${response.status}: ${response.statusText}`);
        }
      } catch (rcsbError) {
        handleError(`Failed to load structure ${pdbId} from all sources: ${rcsbError}`);
      }
    }
  };

  const processLoadedStructure = (viewer: any) => {
    try {
      debugLog('Processing loaded structure');

      structureInfoRef.current = analyzeStructure(viewer, chainId);
      if (!structureInfoRef.current) {
        throw new Error('Could not analyze structure - no protein chains found');
      }

      applyDomainStyling(viewer);

      const targetChain = structureInfoRef.current.actualChain;
      debugLog(`Focusing on protein chain: ${targetChain}`);

      try {
        viewer.zoomTo({ chain: targetChain });
      } catch (e) {
        debugLog('Error zooming to chain, using default zoom:', e);
        viewer.zoomTo();
      }

      setIsLoading(false);
      loadedRef.current = true;
      onStructureLoaded?.();

    } catch (processingError) {
      handleError(`Error processing structure: ${processingError instanceof Error ? processingError.message : String(processingError)}`);
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    initializeViewer();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.removeAllModels();
          if (typeof viewerRef.current.destroy === 'function') {
            viewerRef.current.destroy();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [pdbId, backgroundColor, chainId]);

  useEffect(() => {
    if (viewerRef.current && loadedRef.current) {
      const prevDomains = lastAppliedDomainsRef.current;
      const domainsChanged = domains.length !== prevDomains.length ||
        domains.some((d, i) => {
          return !prevDomains[i] ||
            d.start !== prevDomains[i].start ||
            d.end !== prevDomains[i].end ||
            d.pdb_range !== prevDomains[i].pdb_range ||
            d.chainId !== prevDomains[i].chainId;
        });

      if (domainsChanged) {
        debugLog('Domain info changed, updating styling');
        applyDomainStyling(viewerRef.current);
      }
    }
  }, [domains, chainId]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div
      ref={containerRef}
      id={`3dmol-viewer-${pdbId}-${Date.now()}`}
      className={`three-dmol-viewer relative ${className}`}
      style={{
        width,
        height,
        ...style
      }}
    >
      {/* Loading overlay */}
      {showLoading && isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-700">Loading Structure</div>
            <div className="text-sm text-gray-500 mt-1">
              {pdbId} {chainId ? `• Chain ${chainId}` : ''}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Fetching from RCSB PDB...
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {errorMessage && (
        <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex items-center justify-center z-20">
          <Card className="max-w-md p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Structure Loading Error</h3>
              <p className="text-sm text-red-700 mb-2">{chainId && `Chain ${chainId}: `}{errorMessage}</p>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    setErrorMessage(null);
                    initializeViewer();
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.open(`https://www.rcsb.org/structure/${pdbId}`, '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in RCSB PDB
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          <Tooltip content="Reset view">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (viewerRef.current && structureInfoRef.current) {
                  viewerRef.current.zoomTo({ chain: structureInfoRef.current.actualChain });
                  viewerRef.current.render();
                }
              }}
              disabled={!loadedRef.current}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Zoom in">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (viewerRef.current) {
                  viewerRef.current.zoom(1.2);
                  viewerRef.current.render();
                }
              }}
              disabled={!loadedRef.current}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Zoom out">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (viewerRef.current) {
                  viewerRef.current.zoom(0.8);
                  viewerRef.current.render();
                }
              }}
              disabled={!loadedRef.current}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Export image">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (viewerRef.current) {
                  const dataUrl = viewerRef.current.pngURI();
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = `${pdbId}${chainId ? '_' + chainId : ''}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              disabled={!loadedRef.current}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Settings">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-12 left-2 z-10 w-64">
          <Card className="p-3">
            <h4 className="font-medium mb-3 text-sm">Viewer Settings</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Style</label>
                <select
                  value={currentViewerOptions.style}
                  onChange={(e) => {
                    const newOptions = { ...currentViewerOptions, style: e.target.value };
                    setCurrentViewerOptions(newOptions);
                    if (viewerRef.current) {
                      applyDomainStyling(viewerRef.current);
                    }
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="cartoon">Cartoon</option>
                  <option value="stick">Stick</option>
                  <option value="sphere">Sphere</option>
                  <option value="line">Line</option>
                </select>
              </div>

              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewerOptions.showSideChains}
                  onChange={(e) => {
                    const newOptions = { ...currentViewerOptions, showSideChains: e.target.checked };
                    setCurrentViewerOptions(newOptions);
                  }}
                  className="mr-2"
                />
                Show side chains
              </label>

              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewerOptions.showLigands}
                  onChange={(e) => {
                    const newOptions = { ...currentViewerOptions, showLigands: e.target.checked };
                    setCurrentViewerOptions(newOptions);
                  }}
                  className="mr-2"
                />
                Show ligands
              </label>

              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewerOptions.showLabels}
                  onChange={(e) => {
                    const newOptions = { ...currentViewerOptions, showLabels: e.target.checked };
                    setCurrentViewerOptions(newOptions);
                  }}
                  className="mr-2"
                />
                Show labels
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 z-10">
        <Badge
          variant={loadedRef.current ? 'default' : isLoading ? 'secondary' : 'destructive'}
          className="text-xs"
        >
          {loadedRef.current ? '✓ Loaded' : isLoading ? '⏳ Loading' : '✗ Error'}
        </Badge>
      </div>
    </div>
  );
});

ThreeDMolViewer.displayName = 'ThreeDMolViewer';

export default ThreeDMolViewer;
