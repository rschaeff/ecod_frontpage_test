// components/StructureViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ClientOnly from './ClientOnly';

interface StructureViewerProps {
  pdbId?: string;
  url?: string;
  height?: string;
  width?: string;
  style?: 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill';
  showLigands?: boolean;
  showWater?: boolean;
  colorScheme?: 'chain-id' | 'residue-type' | 'secondary-structure' | 'sequence-id';
  highlights?: {
    start: number;
    end: number;
    chainId: string;
    color?: string;
  }[];
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

function MolstarViewer({
  pdbId,
  url,
  height = '400px',
  width = '100%',
  style = 'cartoon',
  showLigands = true,
  showWater = false,
  colorScheme = 'chain-id',
  highlights = [],
  onLoaded,
  onError
}: StructureViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initViewer = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import Mol* to avoid SSR issues
        const molstar = await import('molstar/lib/mol-plugin-ui');
        const plugin = new molstar.PluginUIContext({
          layoutIsExpanded: false,
          layoutShowControls: false,
          layoutShowRemoteState: false,
          layoutControlsDisplay: 'reactive',
          layoutShowSequence: true,
          layoutShowLog: false,
          layoutShowLeftPanel: false,
        });

        await plugin.init();
        plugin.render(containerRef.current);
        
        // Save reference to the viewer
        viewerRef.current = plugin;
        
        // Load structure if ID provided
        if (pdbId) {
          loadStructure(plugin, pdbId);
        } else if (url) {
          loadStructureFromUrl(plugin, url);
        }
      } catch (err) {
        console.error('Error initializing Mol* viewer:', err);
        if (isMounted) {
          setError('Failed to initialize 3D viewer');
          setLoading(false);
          if (onError) onError(err as Error);
        }
      }
    };

    initViewer();

    // Cleanup
    return () => {
      isMounted = false;
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);

  // Handle changes to visualization options
  useEffect(() => {
    if (viewerRef.current && !loading) {
      updateVisualization();
    }
  }, [style, showLigands, showWater, colorScheme, highlights, loading]);

  // Handle changes to PDB ID
  useEffect(() => {
    if (viewerRef.current && pdbId) {
      loadStructure(viewerRef.current, pdbId);
    }
  }, [pdbId]);

  // Load structure from PDB ID
  const loadStructure = async (plugin: any, id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear existing structure
      await plugin.clear();
      
      // Download from RCSB PDB
      const data = await plugin.builders.data.download({ url: `https://files.rcsb.org/download/${id}.cif`, isBinary: false }, { state: { isGhost: false } });
      
      if (data) {
        // Create molecular structure
        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model);
        
        // Apply visualization
        await updateVisualization();
        
        setLoading(false);
        if (onLoaded) onLoaded();
      }
    } catch (err) {
      console.error('Error loading structure:', err);
      setError('Failed to load structure');
      setLoading(false);
      if (onError) onError(err as Error);
    }
  };

  // Load structure from URL
  const loadStructureFromUrl = async (plugin: any, structureUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear existing structure
      await plugin.clear();
      
      // Download from URL
      const data = await plugin.builders.data.download({ url: structureUrl }, { state: { isGhost: false } });
      
      if (data) {
        // Determine format based on URL extension
        const format = structureUrl.endsWith('.pdb') ? 'pdb' : 'mmcif';
        
        // Create molecular structure
        const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model);
        
        // Apply visualization
        await updateVisualization();
        
        setLoading(false);
        if (onLoaded) onLoaded();
      }
    } catch (err) {
      console.error('Error loading structure from URL:', err);
      setError('Failed to load structure');
      setLoading(false);
      if (onError) onError(err as Error);
    }
  };

  // Update visualization style, colors, etc.
  const updateVisualization = async () => {
    if (!viewerRef.current) return;
    
    try {
      const plugin = viewerRef.current;
      
      // Get current structure
      const structure = plugin.managers.structure.hierarchy.current.structures[0];
      if (!structure) return;
      
      // Clear existing representations
      const update = plugin.build();
      update.delete(plugin.managers.structure.hierarchy.current.structures[0].representations);
      await update.commit();

      // Add main representation
      const reprProps = getRepresentationProps(style);
      const colorProps = getColorProps(colorScheme);
      
      // Create visual for main structure
      const structureVisual = plugin.build()
        .to(structure)
        .add(plugin.builders.structure.representation.molecularSurface, {
          ...reprProps,
          color: colorProps
        });
      
      // Add highlighted regions if specified
      if (highlights.length > 0) {
        const mol = await import('molstar/lib/mol-script/language/builder');
        
        for (const hl of highlights) {
          const selection = mol.MolScriptBuilder.struct.generator.atomGroups({
            chain_id: hl.chainId,
            residue_test: mol.MolScriptBuilder.core.rel.inRange([
              mol.MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(),
              hl.start, 
              hl.end
            ])
          });
          
          structureVisual.add(plugin.builders.structure.representation.molecularSurface, {
            ...reprProps,
            color: {
              name: 'uniform',
              params: { value: { r: 1, g: 0.5, b: 0 } } // Orange highlight color by default
            }
          }, { selector: selection });
        }
      }
      
      // Add ligands if enabled
      if (showLigands) {
        const mol = await import('molstar/lib/mol-script/language/builder');
        const ligandSelection = mol.MolScriptBuilder.struct.generator.atomGroups({
          entity_test: mol.MolScriptBuilder.core.rel.eq([
            mol.MolScriptBuilder.struct.atomProperty.macromolecular.entityType(),
            'non-polymer'
          ])
        });
        
        structureVisual.add(plugin.builders.structure.representation.ballAndStick, {
          sizeTheme: { name: 'physical' },
          color: { name: 'element-symbol' }
        }, { selector: ligandSelection });
      }
      
      // Add water molecules if enabled
      if (showWater) {
        const mol = await import('molstar/lib/mol-script/language/builder');
        const waterSelection = mol.MolScriptBuilder.struct.generator.atomGroups({
          entity_test: mol.MolScriptBuilder.core.rel.eq([
            mol.MolScriptBuilder.struct.atomProperty.macromolecular.entityType(),
            'water'
          ])
        });
        
        structureVisual.add(plugin.builders.structure.representation.ballAndStick, {
          sizeTheme: { name: 'physical' },
          color: { name: 'element-symbol' },
          alpha: 0.5
        }, { selector: waterSelection });
      }
      
      // Commit all changes
      await structureVisual.commit();
      
      // Adjust camera to focus on structure
      plugin.managers.camera.reset();
      plugin.managers.camera.focus();
    } catch (err) {
      console.error('Error updating visualization:', err);
    }
  };

  // Helper to get representation properties based on style
  const getRepresentationProps = (visualStyle: string) => {
    switch (visualStyle) {
      case 'cartoon':
        return {
          alpha: 1.0,
          quality: 'auto' as const,
          material: { metalness: 0, roughness: 1 }
        };
      case 'ball-and-stick':
        return {
          alpha: 1.0,
          sizeTheme: { name: 'physical' as const },
          linkScale: 0.4,
          linkSpacing: 1.0,
          ignoreHydrogens: false,
          quality: 'auto' as const
        };
      case 'surface':
        return {
          alpha: 0.7,
          quality: 'medium' as const
        };
      case 'spacefill':
        return {
          alpha: 1.0,
          quality: 'medium' as const,
          material: { metalness: 0, roughness: 1 }
        };
      default:
        return {
          alpha: 1.0,
          quality: 'auto' as const
        };
    }
  };

  // Helper to get color properties based on scheme
  const getColorProps = (scheme: string) => {
    switch (scheme) {
      case 'chain-id':
        return { name: 'chain-id' as const };
      case 'residue-type':
        return { name: 'residue-type' as const };
      case 'secondary-structure':
        return { name: 'secondary-structure' as const };
      case 'sequence-id':
        return { name: 'sequence-id' as const };
      default:
        return { name: 'chain-id' as const };
    }
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {loading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
            zIndex: 10
          }}
        >
          <div 
            style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 2s linear infinite'
            }} 
          />
        </div>
      )}
      
      {error && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255,200,200,0.8)',
            zIndex: 10,
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '24px', color: '#e53e3e', marginBottom: '10px' }}>⚠️</div>
            <div style={{ fontWeight: 'bold', color: '#e53e3e' }}>{error}</div>
            <div style={{ fontSize: '14px', color: '#742a2a', marginTop: '5px' }}>
              Please check if the PDB ID is valid or try again later.
            </div>
          </div>
        </div>
      )}
      
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// Wrap with ClientOnly to prevent SSR issues
export default function StructureViewer(props: StructureViewerProps) {
  return (
    <ClientOnly fallback={
      <div 
        style={{ 
          width: props.width || '100%', 
          height: props.height || '400px',
          background: '#f1f1f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}
      >
        <div>Loading viewer...</div>
      </div>
    }>
      <MolstarViewer {...props} />
    </ClientOnly>
  );
}
