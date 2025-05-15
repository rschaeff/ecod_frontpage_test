'use client';

import { useRef, useState } from 'react';
import StructureViewer from '@/components/StructureViewer';

export default function TestMolstar() {
  const [pdbId, setPdbId] = useState('1enh_A');
  const [style, setStyle] = useState('cartoon');
  const [showLigands, setShowLigands] = useState(true);
  const [showWater, setShowWater] = useState(false);
  const [localBasePath, setLocalBasePath] = useState('/data/ecod/chain_data');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'local' | 'url' | 'file'>('local');
  const [url, setUrl] = useState('https://files.rcsb.org/download/1ENH.pdb');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (err: Error) => {
    console.error("Structure viewer error:", err);
    setError(err.message);
  };

  const handleLoad = () => {
    console.log("Structure loaded successfully");
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const fetchAndInspectPdb = async () => {
    try {
      setError(null);
      const localPath = getLocalPath(pdbId);
      const response = await fetch(localPath);

      if (!response.ok) {
        setError(`Failed to fetch PDB file: ${response.status} ${response.statusText}`);
        return;
      }

      const content = await response.text();
      console.log("First 500 characters of PDB file:");
      console.log(content.substring(0, 500));

      if (content.length < 100) {
        setError("PDB file seems too small or empty - possibly not a valid PDB");
        return;
      }

      // Basic format check
      if (!content.includes("ATOM") && !content.includes("HETATM")) {
        setError("File doesn't contain ATOM or HETATM records - possibly not a valid PDB");
        return;
      }

      setFileContent(content);
      setMode('file');

      alert("PDB file fetched and seems valid. Switching to 'Load from Content' mode.");
    } catch (err) {
      setError(`Error fetching PDB: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getLocalPath = (id: string) => {
    const idParts = id.toLowerCase().split('_');
    const baseName = idParts[0];
    const chain = idParts.length > 1 ? idParts[1] : '';
    const baseNameLetters = baseName.replace(/^\d+/, '');
    const subDir = baseNameLetters.substring(0, 2);

    let path;
    if (localBasePath.endsWith('/')) {
      path = `${localBasePath}${subDir}/`;
    } else {
      path = `${localBasePath}/${subDir}/`;
    }

    if (chain) {
      path += `${baseName}_${chain}.pdb`;
    } else {
      path += `${baseName}.pdb`;
    }

    return path;
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mol* Structure Viewer Test</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4 space-x-4">
        <button
          onClick={() => setMode('local')}
          className={`px-4 py-2 rounded ${mode === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Load from Local Path
        </button>
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Load from URL
        </button>
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Load from Content
        </button>
      </div>

      {mode === 'local' && (
        <div className="mb-4 flex flex-wrap gap-4 bg-gray-50 p-4 rounded">
          <div>
            <label className="block text-sm font-medium mb-1">PDB ID</label>
            <input
              type="text"
              value={pdbId}
              onChange={(e) => setPdbId(e.target.value)}
              className="border rounded px-3 py-2 w-32"
            />
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

          <div className="w-full">
            <button
              onClick={fetchAndInspectPdb}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Fetch and Inspect PDB File
            </button>
            <p className="text-sm text-gray-600 mt-1">
              This will try to fetch the PDB from the server and inspect it for validity.
            </p>
          </div>
        </div>
      )}

      {mode === 'url' && (
        <div className="mb-4 bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium mb-1">Structure URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="https://files.rcsb.org/download/1ENH.pdb"
          />
          <p className="text-sm text-gray-600 mt-1">
            For testing, you can use URLs like https://files.rcsb.org/download/1ENH.pdb
          </p>
        </div>
      )}

      {mode === 'file' && (
        <div className="mb-4 bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium mb-1">Upload PDB File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdb,.cif,.ent"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full"
          />

          {fileContent && (
            <div className="mt-2">
              <div className="text-sm text-gray-600">File content preview:</div>
              <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto h-24">
                {fileContent.substring(0, 500)}...
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
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
            pdbId={mode === 'local' ? pdbId : undefined}
            url={mode === 'url' ? url : undefined}
            fileData={mode === 'file' ? fileContent ?? undefined : undefined}
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
              onClick={() => { setPdbId('1enh_A'); setMode('local'); }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1enh_A
            </button>
            <span className="ml-2">- Engrailed homeodomain</span>
          </li>
          <li className="flex items-center">
            <button
              onClick={() => { setPdbId('1ubq_A'); setMode('local'); }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1ubq_A
            </button>
            <span className="ml-2">- Ubiquitin</span>
          </li>
          <li className="flex items-center">
            <button
              onClick={() => { setPdbId('1crn_A'); setMode('local'); }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              1crn_A
            </button>
            <span className="ml-2">- Crambin</span>
          </li>
        </ul>
        <p className="mt-2 text-sm">Format: [pdbid]_[chain]</p>
      </div>
    </div>
  );
}
