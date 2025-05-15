'use client';

import { useState } from 'react';
import StructureViewer from '@/components/StructureViewer';

export default function TestMolstar() {
  const [pdbId, setPdbId] = useState('1enh_A');
  const [style, setStyle] = useState('cartoon');
  const [showLigands, setShowLigands] = useState(true);
  const [showWater, setShowWater] = useState(false);
  const [localBasePath, setLocalBasePath] = useState('/data/ecod/chain_data');
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: Error) => {
    console.error("Structure viewer error:", err);
    setError(err.message);
  };

  const handleLoad = () => {
    console.log("Structure loaded successfully");
    setError(null);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mol* Structure Viewer Test</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">PDB ID</label>
          <input
            type="text"
            value={pdbId}
            onChange={(e) => setPdbId(e.target.value)}
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

        <div className="w-full">
          <label className="block text-sm font-medium mb-1">Local Base Path</label>
          <input
            type="text"
            value={localBasePath}
            onChange={(e) => setLocalBasePath(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-lg"
          />
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
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
            localBasePath={localBasePath}
            style={style as any}
            showLigands={showLigands}
            showWater={showWater}
            highlights={[
              { start: 15, end: 30, chainId: 'A', color: '#ff5722' }
            ]}
            onLoaded={handleLoad}
            onError={handleError}
          />
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        <p className="font-medium">Local structure examples:</p>
        <ul className="mt-2 space-y-1">
          <li className="flex items-center">
            <button
              onClick={() => setPdbId('1enh_A')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1enh_A
            </button>
            <span className="ml-2">- Engrailed homeodomain</span>
          </li>
          <li className="flex items-center">
            <button
              onClick={() => setPdbId('1ubq_A')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1ubq_A
            </button>
            <span className="ml-2">- Ubiquitin</span>
          </li>
          <li className="flex items-center">
            <button
              onClick={() => setPdbId('1crn_A')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1crn_A
            </button>
            <span className="ml-2">- Crambin</span>
          </li>
        </ul>
        <p className="mt-2 text-sm">Format: [pdbid]_[chain]</p>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Debugging Info:</h3>
          <p>Current path will be constructed as:</p>
          <code className="block bg-gray-800 text-white p-2 rounded mt-1 text-sm">
            {localBasePath}/{pdbId.split('_')[0].substring(0, 2)}/{pdbId}.pdb
          </code>
          <p className="mt-2 text-sm">Make sure this file exists on your server.</p>
        </div>
      </div>
    </div>
  );
}
