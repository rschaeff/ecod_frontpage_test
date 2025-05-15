'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PresetStructureRepresentations } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StateObjectSelector } from 'molstar/lib/mol-state';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { Color } from 'molstar/lib/mol-util/color';
import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { Structure } from 'molstar/lib/mol-model/structure';
import { StructureElement } from 'molstar/lib/mol-model/structure/structure';

// Define prop types for the component
interface StructureViewerProps {
  pdbId?: string;
  url?: string;
  localBasePath?: string;
  style?: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  colorScheme?: 'chain' | 'secondary-structure' | 'residue-type' | 'hydrophobicity';
  showSideChains?: boolean;
  showLigands?: boolean;
  showWater?: boolean;
  quality?: 'low' | 'medium' | 'high';
  height?: string;
  width?: string;
  highlights?: {
    start: number;
    end: number;
    chainId: string;
    color?: string;
  }[];
  selectedPosition?: number | null;
  onResidueSelect?: (residueNumber: number) => void;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

const StructureViewer = forwardRef<any, StructureViewerProps>(({
  pdbId,
  url,
  localBasePath = '/data/ecod/chain_data',
  style = 'cartoon',
  colorScheme = 'chain',
  showSideChains = false,
  showLigands = true,
  showWater = false,
  quality = 'medium',
  height = '100%',
  width = '100%',
  highlights = [],
  selectedPosition = null,
  onResidueSelect,
  onLoaded,
  onError
}, ref) => {
  // Create a portal container for Mol* to render into
  // This will be outside of React's DOM management
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginContext | null>(null);
  const structureRef = useRef<StateObjectSelector<PluginStateObject.Molecule.Structure> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When the wrapper div is mounted, create the portal container
  useEffect(() => {
    if (!wrapperRef.current) return;

    // Create a container div that will be outside React's control
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    container.style.overflow = 'hidden'; // Add overflow constraint
    container.className = 'mol-viewer-portal';

    // Append it to the wrapper (managed by React)
    wrapperRef.current.appendChild(container);
    setPortalContainer(container);

    // Clean up function
    return () => {
      if (wrapperRef.current && wrapperRef.current.contains(container)) {
        try {
          // Remove it directly so React doesn't try to
          wrapperRef.current.removeChild(container);
        } catch (err) {
          console.error('Error removing portal container:', err);
        }
      }
    };
  }, []);

  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    // Highlight a specific residue in the structure
    highlightResidue: (residueNumber: number) => {
      highlightSelectedResidue(residueNumber);
    },

    // Reset the view to default orientation
    resetView: () => {
      if (pluginRef.current) {
        try {
          pluginRef.current.managers.camera.reset();
          pluginRef.current.managers.camera.focus();
        } catch (err) {
          console.error("Error resetting view:", err);
        }
      }
    },

    // Export the current view as an image
    exportImage: async (options: { width?: number, height?: number } = {}) => {
      if (!pluginRef.current) return null;

      try {
        // Get canvas size if not specified
        const canvas = pluginRef.current.canvas3d?.webgl.gl.canvas;
        const width = options.width || (canvas as HTMLCanvasElement).width;
        const height = options.height || (canvas as HTMLCanvasElement).height;

        // Request image from mol*
        const imageData = await pluginRef.current.helpers.imageExport.getImageData({ width, height });
        return imageData;
      } catch (err) {
        console.error("Error exporting image:", err);
        return null;
      }
    },

    // Get the plugin instance
    getPlugin: () => pluginRef.current
  }));

  // Initialize the mol* viewer when portal container is ready
  useEffect(() => {
    if (!portalContainer || isInitialized) return;

    let unmounted = false;

    const initMolstar = async () => {
      try {
        // Create a new plugin instance with default spec
        const plugin = await createPluginUI({
          target: portalContainer,
          spec: {
            ...DefaultPluginUISpec(),
            layout: {
              initial: {
                isExpanded: false,
                showControls: false
              }
            },
            components: {
              remoteState: 'none'
            }
          },
          render: renderReact18
        });

        if (unmounted) {
          plugin.dispose();
          return;
        }

        pluginRef.current = plugin;

        // Initialize the plugin
        plugin.layout.setRoot({ kind: 'canvas3d' });
        plugin.canvas3d?.setProps({
          camera: { fov: 45 },
          renderer: {
            backgroundColor: { r: 0.9, g: 0.9, b: 0.9 },
            pickingAlphaThreshold: 0.5,
          }
        });

        // Set initial canvas size
        plugin.layout.setProps({
          layoutIsExpanded: false,
          showControls: false,
          showSequence: false,
          showLog: false,
          showLeftPanel: false
        });

        plugin.canvas3d?.resized();

        // Add interactions for residue selection
        if (onResidueSelect) {
          plugin.behaviors.interaction.click.subscribe(e => {
            if (e.current.loci.kind === 'element-loci') {
              // Get the residue number from the clicked element
              const loc = e.current.loci;
              if (!Structure.isLoci(loc)) return;

              const seq_id = StructureElement.Location.is(loc.elements[0])
                ? loc.elements[0].unit.model.atomicHierarchy.residues.label_seq_id.value(loc.elements[0].element)
                : null;

              if (seq_id !== null) {
                onResidueSelect(seq_id);
              }
            }
          });
        }

        setIsInitialized(true);

        // Load structure if pdbId or url is provided
        if (pdbId) {
          loadStructureLocal(plugin, pdbId);
        } else if (url) {
          loadStructureFromUrl(plugin, url);
        } else {
          setIsLoading(false);
          if (onLoaded) onLoaded();
        }
      } catch (err) {
        console.error('Error initializing mol* viewer:', err);
        if (!unmounted) {
          setError('Failed to initialize 3D viewer');
          setIsLoading(false);
          if (onError) onError(err as Error);
        }
      }
    };

    // Start initialization
    initMolstar();

    // Cleanup
    return () => {
      unmounted = true;
    };
  }, [portalContainer, isInitialized]);

  // Clean up Mol* when component unmounts
  useEffect(() => {
    return () => {
      // Properly dispose of the plugin
      if (pluginRef.current) {
        try {
          // First clear structures
          if (pluginRef.current.managers.structure?.hierarchy) {
            pluginRef.current.managers.structure.hierarchy.removeAll();
          }

          // Dispose the plugin itself
          pluginRef.current.dispose();
        } catch (err) {
          console.error('Error disposing Mol* plugin:', err);
        }

        pluginRef.current = null;
        structureRef.current = null;
      }
    };
  }, []);

  // Load structure when pdbId changes
  useEffect(() => {
    if (isInitialized && pluginRef.current && pdbId) {
      loadStructureLocal(pluginRef.current, pdbId);
    }
  }, [pdbId, isInitialized]);

  // Load structure from URL when url changes
  useEffect(() => {
    if (isInitialized && pluginRef.current && url) {
      loadStructureFromUrl(pluginRef.current, url);
    }
  }, [url, isInitialized]);

  // Update visualization when style, highlights, or options change
  useEffect(() => {
    if (isInitialized && pluginRef.current && !isLoading && structureRef.current) {
      updateVisualization();
    }
  }, [
    isInitialized,
    isLoading,
    style,
    colorScheme,
    showSideChains,
    showLigands,
    showWater,
    quality,
    highlights
  ]);

  // Handle selected position changes
  useEffect(() => {
    if (isInitialized && pluginRef.current && !isLoading && structureRef.current && selectedPosition !== null) {
      highlightSelectedResidue(selectedPosition);
    }
  }, [isInitialized, isLoading, selectedPosition]);

  // Generate path to the local structure file based on PDB ID and chain
  const getLocalStructurePath = (pdbId: string): string => {
    // Extract the base name and chain from pdbId (format could be "1abc" or "1abc_A")
    const idParts = pdbId.toLowerCase().split('_');
    const baseName = idParts[0];
    const chain = idParts.length > 1 ? idParts[1] : '';

    // Get the first two characters for the subdirectory
    const subDir = baseName.substring(0, 2);

    // Construct the path
    let path = `${localBasePath}/${subDir}/${baseName}`;
    if (chain) {
      path += `_${chain}`;
    }
    path += '.pdb'; // Assuming PDB format

    return path;
  };

  // Load structure from local repository
  const loadStructureLocal = async (plugin: PluginContext, id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear any existing structures
      if (structureRef.current) {
        plugin.builders.structure.hierarchy.removeAll();
        structureRef.current = null;
      }

      // Get the path to the local structure file
      const localPath = getLocalStructurePath(id);

      // Create a download component
      const data = await plugin.builders.data.download({ url: localPath, isBinary: false }, { state: { isGhost: true } });

      // Determine format based on file extension
      const format = localPath.toLowerCase().endsWith('.pdb') ? 'pdb' : 'mmcif';

      const trajectory = await plugin.builders.structure.parseTrajectory(data, format);

      // Create the molecular structure
      const model = await plugin.builders.structure.createModel(trajectory);
      const structure = await plugin.builders.structure.createStructure(model);

      // Store the structure reference
      structureRef.current = structure;

      // Apply initial visualization
      await updateVisualization();

      // Set loading complete
      setIsLoading(false);
      if (onLoaded) onLoaded();
    } catch (err) {
      console.error('Error loading structure from local path:', err);
      setError(`Failed to load structure: ${err}`);
      setIsLoading(false);
      if (onError) onError(err as Error);
    }
  };

  // Load structure from URL
  const loadStructureFromUrl = async (plugin: PluginContext, structureUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear any existing structures
      if (structureRef.current) {
        plugin.builders.structure.hierarchy.removeAll();
        structureRef.current = null;
      }

      // Determine format based on URL extension
      const format = structureUrl.toLowerCase().endsWith('.pdb') ? 'pdb' : 'mmcif';

      // Create a download component
      const data = await plugin.builders.data.download({ url: structureUrl, isBinary: false }, { state: { isGhost: true } });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, format);

      // Create the molecular structure
      const model = await plugin.builders.structure.createModel(trajectory);
      const structure = await plugin.builders.structure.createStructure(model);

      // Store the structure reference
      structureRef.current = structure;

      // Apply initial visualization
      await updateVisualization();

      // Set loading complete
      setIsLoading(false);
      if (onLoaded) onLoaded();
    } catch (err) {
      console.error('Error loading structure from URL:', err);
      setError('Failed to load structure');
      setIsLoading(false);
      if (onError) onError(err as Error);
    }
  };

  // Get the representation preset based on style
  const getRepresentationPreset = () => {
    switch (style) {
      case 'cartoon':
        return PresetStructureRepresentations.cartoon.id;
      case 'ball-and-stick':
        return PresetStructureRepresentations.ballAndStick.id;
      case 'surface':
        return PresetStructureRepresentations.surface.id;
      case 'spacefill':
        return PresetStructureRepresentations.spacefill.id;
      default:
        return PresetStructureRepresentations.cartoon.id;
    }
  };

  // Get the color theme based on selection
  const getColorTheme = () => {
    switch (colorScheme) {
      case 'chain':
        return ColorTheme.chain.id;
      case 'secondary-structure':
        return ColorTheme.secondaryStructure.id;
      case 'residue-type':
        return ColorTheme.residueType.id;
      case 'hydrophobicity':
        return ColorTheme.hydrophobicity.id;
      default:
        return ColorTheme.chain.id;
    }
  };

  // Update visualization with current settings
  const updateVisualization = async () => {
    if (!pluginRef.current || !structureRef.current) return;

    try {
      const plugin = pluginRef.current;

      // Remove existing representations
      plugin.builders.structure.representation.removeAll();

      // Quality factor for representation detail
      const qualityFactor = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;

      // Apply the main representation preset
      const preset = getRepresentationPreset();
      const colorThemeId = getColorTheme();

      await plugin.builders.structure.representation.addPreset(
        structureRef.current,
        preset,
        {
          theme: { globalName: colorThemeId },
          quality: {
            value: qualityFactor
          }
        }
      );

      // Handle highlighted regions
      for (const highlight of highlights) {
        // Create a selection for the highlighted region
        const selection = MS.struct.generator.atomGroups({
          'chain-test': MS.core.rel.eq([MS.struct.atomProperty.core.auth_asym_id(), highlight.chainId]),
          'residue-test': MS.core.rel.inRange([
            MS.struct.atomProperty.macromolecular.label_seq_id(),
            highlight.start,
            highlight.end
          ])
        });

        // Apply a selection component
        const selectionComp = await plugin.builders.structure.component.addTrajectory(structureRef.current, selection);

        // Highlight color
        const highlightColor = highlight.color ?
          Color.fromRgb(parseInt(highlight.color.substring(1, 3), 16) / 255,
                         parseInt(highlight.color.substring(3, 5), 16) / 255,
                         parseInt(highlight.color.substring(5, 7), 16) / 255) :
          Color.fromRgb(1, 0.5, 0);

        // Apply representation with highlight color
        await plugin.builders.structure.representation.addRepresentation(
          selectionComp,
          {
            type: preset,
            color: 'uniform',
            colorParams: { value: highlightColor },
            size: 'uniform',
            sizeParams: { value: 1.5 }
          }
        );
      }

      // Handle ligands if enabled
      if (showLigands) {
        const ligandSelection = MS.struct.modifier.union([
          MS.struct.generator.atomGroups({
            'entity-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.entityType(), 'non-polymer'])
          }),
          // Also include nucleic acids which are often bound to proteins
          MS.struct.generator.atomGroups({
            'entity-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.entityType(), 'nucleic'])
          })
        ]);

        const ligandComp = await plugin.builders.structure.component.addTrajectory(structureRef.current, ligandSelection);

        await plugin.builders.structure.representation.addRepresentation(
          ligandComp,
          {
            type: 'ball-and-stick',
            color: 'element-symbol',
            size: 'physical'
          }
        );
      }

      // Handle water molecules if enabled
      if (showWater) {
        const waterSelection = MS.struct.generator.atomGroups({
          'entity-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.entityType(), 'water'])
        });

        const waterComp = await plugin.builders.structure.component.addTrajectory(structureRef.current, waterSelection);

        await plugin.builders.structure.representation.addRepresentation(
          waterComp,
          {
            type: 'ball-and-stick',
            color: 'element-symbol',
            size: 'physical',
            sizeParams: { value: 0.6 },
            transparency: { alpha: 0.5 }
          }
        );
      }

      // Focus the camera on the structure
      plugin.managers.camera.reset();
      plugin.managers.camera.focus();

    } catch (err) {
      console.error('Error updating visualization:', err);
    }
  };

  // Highlight a specific residue
  const highlightSelectedResidue = async (residueNumber: number | null) => {
    if (!pluginRef.current || !structureRef.current || residueNumber === null) return;

    try {
      const plugin = pluginRef.current;

      // Remove any existing selection highlight
      plugin.managers.structure.component.state.select(
        StateTransforms.Misc.CreateSelectionFromBundle.id
      ).forEach(s => plugin.managers.structure.component.state.remove([s.transform.ref]));

      // Create selection for the residue
      const selection = MS.struct.generator.atomGroups({
        'residue-test': MS.core.rel.eq([
          MS.struct.atomProperty.macromolecular.label_seq_id(),
          residueNumber
        ])
      });

      // Create a visual for the selection
      const selectionComp = await plugin.builders.structure.component.addTrajectory(structureRef.current, selection);

      // Add a representation that makes the selection stand out
      await plugin.builders.structure.representation.addRepresentation(
        selectionComp,
        {
          type: 'ball-and-stick',
          color: 'uniform',
          colorParams: { value: Color.fromRgb(1, 0.8, 0) }, // Gold color
          size: 'uniform',
          sizeParams: { value: 1.8 }
        }
      );

      // Focus camera on the selected residue
      const loci = plugin.managers.structure.hierarchy.current.structures[0].components[0].cell.obj?.data.
        valueOf().model.atomicHierarchy.residueAtomSegments;

      if (loci) {
        plugin.managers.camera.focusLoci(loci);
      }

    } catch (err) {
      console.error('Error highlighting residue:', err);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: width,
        height: height,
        position: 'relative',
        background: '#f5f5f5',
        overflow: 'hidden', // Add containment
        contain: 'strict', // Add CSS containment
        isolation: 'isolate' // Create a new stacking context
      }}
      className="mol-viewer-container"
    >
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 235, 235, 0.9)',
          zIndex: 10
        }}>
          <div style={{textAlign: 'center', padding: '1rem'}}>
            <div style={{color: '#e53e3e', fontSize: '1.875rem', marginBottom: '0.5rem'}}>⚠️</div>
            <div style={{color: '#c53030', fontWeight: 'bold'}}>{error}</div>
            <div style={{fontSize: '0.875rem', color: '#e53e3e', marginTop: '0.5rem'}}>
              Please check if the PDB ID is valid or try again later.
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <div style={{textAlign: 'center'}}>
            <div style={{
              display: 'inline-block',
              width: '2rem',
              height: '2rem',
              border: '0.25rem solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '9999px',
              animation: 'spin 1s linear infinite',
              marginBottom: '0.5rem'
            }}></div>
            <p style={{color: '#4b5563'}}>Loading structure...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

StructureViewer.displayName = 'StructureViewer';

export default StructureViewer;
