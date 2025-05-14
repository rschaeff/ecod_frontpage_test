// app/test-molstar/page.tsx
'use client';

import { useState } from 'react';
import StructureViewer from '@/components/StructureViewer';

export default function TestMolstar() {
  const [pdbId, setPdbId] = useState('4UBP');
  const [style, setStyle] = useState('cartoon');
  const [showLigands, setShowLigands] = useState(true);
  const [showWater, setShowWater] = useState(false);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mol* Structure Viewer Test</h1>
      
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block text-sm font-medium mb-1">PDB ID</label>
          <input 
            type="text" 
            value={pdbId} 
            onChange={(e) => setPdbId(e.target.value.toUpperCase())} 
            className="border rounded px-3 py-2 w-32"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Style</label>
          <select 
            value={style} 
            onChange={(e) => setStyle(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="cartoon">Cartoon</option>
            <option value="ball-and-stick">Ball & Stick</option>
            <option value="surface">Surface</option>
            <option value="spacefill">Spacefill</option>
          </select>
        </div>
        
        <div className="flex items-end space-x-4">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={showLigands} 
              onChange={(e) => setShowLigands(e.target.checked)}
              className="mr-2"
            />
            <span>Show Ligands</span>
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={showWater} 
              onChange={(e) => setShowWater(e.target.checked)}
              className="mr-2"
            />
            <span>Show Water</span>
          </label>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-white shadow-md">
        <div style={{ height: '500px' }}>
          <StructureViewer
            pdbId={pdbId}
            style={style as any}
            showLigands={showLigands}
            showWater={showWater}
            highlights={[
              { start: 159, end: 252, chainId: 'A', color: '#ff5722' }
            ]}
            onLoaded={() => console.log('Structure loaded')}
            onError={(err) => console.error('Error:', err)}
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Try different PDB IDs: 4UBP, 1UBQ, 1CRN, 3PQR, etc.
      </div>
    </div>
  );
}
