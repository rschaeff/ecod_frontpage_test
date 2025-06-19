// Updated ThreeDMolViewer.tsx - Focus on protein chain only

'use client'

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Domain colors with high contrast
const DOMAIN_COLORS = [
  '#FF0000', // Red
  '#0066FF', // Blue
  '#00CC00', // Green
  '#FF6600', // Orange
  '#9900CC', // Purple
  '#00CCCC', // Cyan
  '#CC6600', // Brown
  '#FF99CC', // Pink
  '#666666', // Gray
  '#336699', // Steel Blue
];

export interface Domain {
  id: string;
  chainId: string;
  start: number;
  end: number;
  color: string;
  label?: string;
  pdb_range?: string;
  pdb_start?: string;
  pdb_end?: string;
  classification?: {
    t_group?: string;
    h_group?: string;
    x_group?: string;
    a_group?: string;
  };
}

interface ThreeDMolViewerProps {
  pdbId: string;
  chainId?: string;
  domains?: Domain[];
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  onStructureLoaded?: () => void;
  onError?: (error: string) => void;
  showLoading?: boolean;
  showControls?: boolean;
}

const ThreeDMolViewer = forwardRef<any, ThreeDMolViewerProps>(({
  pdbId,
  chainId,
  domains = [],
  width = '100%',
  height = '400px',
  className = '',
  style = {},
  backgroundColor = '#ffffff',
  onStructureLoaded,
  onError,
  showLoading = true,
  showControls = false
}, ref) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const loadedRef = useRef(false);
  const lastAppliedDomainsRef = useRef<Domain[]>([]);
  const structureInfoRef = useRef<any>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[3DMol] ${message}`, data || '');
    }
  };

  // Analyze structure to understand residue numbering and available chains
  const analyzeStructure = (viewer: any, targetChain?: string, mmcifData?: string) => {
    try {
      // Get all atoms first to see what chains are available
      const allAtoms = viewer.selectedAtoms({});
      const chainInfo = new Map();

      // Analyze each chain to determine if it's protein, DNA, RNA, etc.
      allAtoms.forEach((atom: any) => {
        if (!chainInfo.has(atom.chain)) {
          chainInfo.set(atom.chain, {
            chain: atom.chain,
            atomCount: 0,
            caCount: 0,
            pCount: 0,
            residues: new Set(),
            atomTypes: new Set()
          });
        }

        const info = chainInfo.get(atom.chain);
        info.atomCount++;
        info.atomTypes.add(atom.atom);

        if (atom.atom === 'CA') info.caCount++;  // Protein alpha carbon
        if (atom.atom === 'P') info.pCount++;    // Nucleic acid phosphorus
        if (atom.resi) info.residues.add(atom.resi);
      });

      // Classify chains
      const chains = Array.from(chainInfo.values()).map(info => ({
        ...info,
        residueCount: info.residues.size,
        isProtein: info.caCount > 10, // Has many CA atoms = protein
        isNucleicAcid: info.pCount > 5, // Has many P atoms = DNA/RNA
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
          actualChain = null;
        } else if (!targetInfo.isProtein) {
          debugLog(`Target chain ${targetChain} is not a protein (CA count: ${targetInfo.caCount})`);
          // Don't override - user explicitly requested this chain
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
          // No protein chains found - this might be DNA/RNA only structure
          const allChainsList = chains.map(c => c.chain).join(', ');
          const error = `No protein chains found in structure. Available chains: ${allChainsList}`;
          debugLog(error);
          throw new Error(error);
        }
      }

      // Analyze the selected chain
      const targetChainInfo = chains.find(c => c.chain === actualChain);
      if (!targetChainInfo) {
        throw new Error(`Chain ${actualChain} not found`);
      }

      const atoms = viewer.selectedAtoms({chain: actualChain});
      const residues = new Set<number>();
      atoms.forEach((atom: any) => {
        if (atom.resi) {
          residues.add(parseInt(atom.resi));
        }
      });

      const sortedResidues = Array.from(residues).sort((a, b) => a - b);
      const info = {
        actualChain,
        originalChain: targetChain,
        minResidue: sortedResidues[0],
        maxResidue: sortedResidues[sortedResidues.length - 1],
        totalResidues: sortedResidues.length,
        residueList: sortedResidues,
        allChains: chains.map(c => c.chain),
        chainType: targetChainInfo.isProtein ? 'protein' :
                   targetChainInfo.isNucleicAcid ? 'nucleic acid' : 'unknown'
      };

      debugLog(`Structure analysis for chain ${actualChain}:`, info);
      return info;
    } catch (error) {
      debugLog('Error analyzing structure:', error);
      return null;
    }
  };

  // Enhanced coordinate mapping
  const mapSequenceToStructure = (seqStart: number, seqEnd: number, structureInfo: any) => {
    if (!structureInfo) return null;

    // Try direct mapping first (common case)
    if (seqStart >= structureInfo.minResidue && seqEnd <= structureInfo.maxResidue) {
      return `${seqStart}-${seqEnd}`;
    }

    // Try offset mapping (sequence starts from 1, structure might start from different number)
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

  // Check if selection exists with detailed feedback
  const checkSelectionExists = (viewer: any, selection: any): boolean => {
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

  // Expose the viewer methods via ref
  useImperativeHandle(ref, () => ({
    current: {
      viewerRef: viewerRef,
      reset: () => {
        if (viewerRef.current) {
          try {
            // Apply the original domain styling
            applyDomainStyling(viewerRef.current);

            // Focus on the protein chain only
            const targetChain = structureInfoRef.current?.actualChain || chainId;
            if (targetChain) {
              viewerRef.current.zoomTo({chain: targetChain});
            } else {
              viewerRef.current.zoomTo();
            }

            viewerRef.current.render();
          } catch (error) {
            debugLog('Error in reset:', error);
          }
        }
      },
      exportImage: () => {
        if (viewerRef.current) {
          return viewerRef.current.pngURI();
        }
        return null;
      },
      highlightDomain: (domainIndex: number) => {
        if (!viewerRef.current || domains.length <= domainIndex) return;

        const domain = domains[domainIndex];
        const targetChain = structureInfoRef.current?.actualChain || domain.chainId || chainId || 'A';

        try {
          debugLog(`Highlighting domain: ${domain.id}, range: ${domain.start}-${domain.end}, chain: ${targetChain}`);

          // Get mapped range
          const mappedRange = getMappedRange(domain);
          if (!mappedRange) {
            debugLog('Could not map domain range for highlighting');
            return;
          }

          const selection = {
            chain: targetChain,
            resi: mappedRange
          };

          // Set background to low opacity (protein chain only)
          viewerRef.current.setStyle({chain: targetChain}, { cartoon: { color: 'gray', opacity: 0.3 } });

          // Highlight the specific domain
          viewerRef.current.setStyle(selection, {
            cartoon: {
              color: domain.color,
              opacity: 1.0
            }
          });

          // Zoom to the domain
          viewerRef.current.zoomTo(selection);
          viewerRef.current.render();
        } catch (error) {
          debugLog('Error highlighting domain:', error);
          // Recovery: restore original styling
          try {
            applyDomainStyling(viewerRef.current);
            viewerRef.current.render();
          } catch (recoveryError) {
            debugLog('Failed to recover from highlighting error:', recoveryError);
          }
        }
      }
    }
  }));

  // Get mapped range for a domain
  const getMappedRange = (domain: Domain): string | null => {
    // Use PDB range if available
    if (domain.pdb_range) {
      return domain.pdb_range;
    }

    if (domain.pdb_start && domain.pdb_end) {
      return `${domain.pdb_start}-${domain.pdb_end}`;
    }

    // Try to map sequence coordinates to structure
    if (structureInfoRef.current && domain.start && domain.end) {
      return mapSequenceToStructure(domain.start, domain.end, structureInfoRef.current);
    }

    // Fallback to sequence range
    if (domain.start && domain.end) {
      return `${domain.start}-${domain.end}`;
    }

    return null;
  };

  // Safe error handler
  const handleError = (message: string) => {
    debugLog(`Error: ${message}`);
    setErrorMessage(message);
    setIsLoading(false);
    if (onError) {
      try {
        onError(message);
      } catch (callbackError) {
        debugLog('Error in onError callback:', callbackError);
      }
    }
  };

  // Apply domain styling with improved approach - PROTEIN CHAIN ONLY
  const applyDomainStyling = (viewer: any) => {
    if (!viewer) return;

    const targetChain = structureInfoRef.current?.actualChain || chainId || 'A';
    debugLog(`Applying styling for ${domains.length} domains on protein chain ${targetChain}`);

    // CRITICAL: Hide all non-protein chains and focus on target chain only
    // Step 1: Hide everything first
    viewer.setStyle({}, { cartoon: { opacity: 0 }, stick: { opacity: 0 }, sphere: { opacity: 0 } });

    // Step 2: Show only the target protein chain in gray
    viewer.setStyle({chain: targetChain}, {
      cartoon: {
        color: 'gray',
        opacity: 0.8
      }
    });

    // Step 3: Apply domain colors on top of the gray background
    if (domains.length > 0) {
      let successfulDomains = 0;

      domains.forEach((domain, index) => {
        try {
          debugLog(`Processing domain ${index} (${domain.id}):`, {
            start: domain.start,
            end: domain.end,
            pdb_range: domain.pdb_range,
            pdb_start: domain.pdb_start,
            pdb_end: domain.pdb_end,
            color: domain.color,
            chainId: domain.chainId
          });

          // Get the best range to use
          const mappedRange = getMappedRange(domain);

          if (!mappedRange) {
            debugLog(`Skipping domain ${domain.id} - no valid range`);
            return;
          }

          // Use the domain's chain ID or fall back to target chain
          const domainChainId = domain.chainId || targetChain;
          const selection = {
            chain: domainChainId,
            resi: mappedRange
          };

          // Check if this selection exists in the structure
          const selectionExists = checkSelectionExists(viewer, selection);

          if (selectionExists) {
            // Apply domain color
            const domainColor = domain.color || DOMAIN_COLORS[index % DOMAIN_COLORS.length];

            viewer.setStyle(selection, {
              cartoon: {
                color: domainColor,
                opacity: 1.0
              }
            });

            successfulDomains++;
            debugLog(`✓ Styled domain ${domain.id} with range ${mappedRange} on chain ${domainChainId}`);
          } else {
            debugLog(`⚠ Domain ${domain.id} range ${mappedRange} not found in chain ${domainChainId}`);
          }

        } catch (domainError) {
          debugLog(`Error processing domain ${domain.id}:`, domainError);
        }
      });

      debugLog(`Successfully styled ${successfulDomains}/${domains.length} domains`);
    }

    // Step 4: Force render
    viewer.render();
    lastAppliedDomainsRef.current = [...domains];
  };

  // Initialize and load structure
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Reset state for new PDB ID
    setIsLoading(true);
    setErrorMessage(null);
    loadedRef.current = false;
    lastAppliedDomainsRef.current = [];
    structureInfoRef.current = null;

    const init3DMol = async () => {
      try {
        // Import 3DMol dynamically to avoid SSR issues
        const $3Dmol = await import('3dmol');
        debugLog('3DMol library loaded');

        // Clean up previous viewer if it exists
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

        // Create a new viewer
        const config = {
          backgroundColor: backgroundColor || 'white',
          id: containerRef.current.id
        };

        debugLog('Creating 3DMol viewer with config:', config);
        const viewer = $3Dmol.createViewer(containerRef.current, config);
        viewerRef.current = viewer;

        // Load structure using mmCIF format
        debugLog(`Loading PDB ID: ${pdbId} (mmCIF format) for chain: ${chainId || 'auto-detect'}`);

        // Try the local API first (now serves mmCIF)
        const structureUrl = `/api/pdb/${pdbId}`;

        // Load structure with fetch and explicit format
        try {
          const response = await fetch(structureUrl);
          if (response.ok) {
            const structureData = await response.text();

            // Validate mmCIF data
            if (structureData.includes('data_') || structureData.includes('_entry.id')) {
              debugLog('mmCIF structure loaded successfully from local API');

              // Add model with explicit mmCIF format
              const model = viewer.addModel(structureData, 'cif');
              if (model) {
                processLoadedStructure(viewer, structureData);
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
          debugLog('Local API failed, trying RCSB mmCIF direct:', apiError);

          // Fallback to RCSB direct mmCIF
          const rcsbUrl = `https://files.rcsb.org/download/${pdbId.toLowerCase()}.cif`;

          try {
            const response = await fetch(rcsbUrl);
            if (response.ok) {
              const structureData = await response.text();
              if (structureData.includes('data_') || structureData.includes('_entry.id')) {
                debugLog('mmCIF structure loaded from RCSB direct');
                const model = viewer.addModel(structureData, 'cif');
                if (model) {
                  processLoadedStructure(viewer, structureData);
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

      } catch (error) {
        handleError(`Error initializing 3DMol.js: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    // Process loaded structure - FOCUS ON PROTEIN CHAIN
    const processLoadedStructure = (viewer: any, mmcifData?: string) => {
      try {
        debugLog('Processing loaded mmCIF structure');

        // Analyze the structure to understand residue numbering and find correct protein chain
        structureInfoRef.current = analyzeStructure(viewer, chainId, mmcifData);

        if (!structureInfoRef.current) {
          throw new Error('Could not analyze structure - no protein chains found');
        }

        // Apply domain styling (protein chain only)
        applyDomainStyling(viewer);

        // Focus on the correct protein chain ONLY
        const targetChain = structureInfoRef.current.actualChain;
        debugLog(`Focusing on protein chain: ${targetChain} (type: ${structureInfoRef.current.chainType})`);

        try {
          viewer.zoomTo({chain: targetChain});
        } catch (e) {
          debugLog('Error zooming to chain, using default zoom:', e);
          viewer.zoomTo();
        }

        // Update loading state
        setIsLoading(false);
        loadedRef.current = true;

        // Call onStructureLoaded callback
        if (onStructureLoaded) {
          try {
            onStructureLoaded();
          } catch (callbackError) {
            debugLog('Error in onStructureLoaded callback:', callbackError);
          }
        }
      } catch (processingError) {
        handleError(`Error processing structure: ${processingError instanceof Error ? processingError.message : String(processingError)}`);
      }
    };

    // Start initialization
    init3DMol();

    // Cleanup function
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

  // Update domain styling when domains or chainId change
  useEffect(() => {
    if (viewerRef.current && loadedRef.current) {
      // Check if domains actually changed
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
  }, [domains, chainId, showControls]);

  return (
    <div
      ref={containerRef}
      id={`3dmol-viewer-${pdbId}-${Date.now()}`} // Unique ID to prevent conflicts
      className={`three-dmol-viewer ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        ...style
      }}
    >
      {showLoading && isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              border: '4px solid rgba(0, 0, 0, 0.1)',
              borderTopColor: '#3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading structure...</div>
            {chainId && <div style={{ fontSize: '12px', color: '#666' }}>Chain {chainId}</div>}

            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      {errorMessage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#e74c3c',
          zIndex: 20,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '80%',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Error</div>
            <div>{errorMessage}</div>
            {chainId && (
              <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                Target chain: {chainId}
              </div>
            )}
          </div>
        </div>
      )}

      {showControls && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          display: 'flex',
          gap: '5px'
        }}>
          <button
            onClick={() => {
              if (viewerRef.current) {
                const targetChain = structureInfoRef.current?.actualChain || chainId;
                if (targetChain) {
                  viewerRef.current.zoomTo({chain: targetChain});
                } else {
                  viewerRef.current.zoomTo();
                }
                viewerRef.current.render();
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset View
          </button>
          <button
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
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Screenshot
          </button>
        </div>
      )}
    </div>
  );
});

ThreeDMolViewer.displayName = 'ThreeDMolViewer';

export default ThreeDMolViewer;
