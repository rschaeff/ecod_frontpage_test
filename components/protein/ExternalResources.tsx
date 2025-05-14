'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ExternalResourcesProps {
  pdbId: string;
  uniprotId: string;
}

/**
 * ExternalResources component displays links to external databases for the protein
 */
export default function ExternalResources({ pdbId, uniprotId }: ExternalResourcesProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">External Resources</h3>
      <div className="grid grid-cols-1 gap-2">
        <a 
          href={`https://www.rcsb.org/structure/${pdbId}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>View in RCSB PDB</span>
        </a>
        <a 
          href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>View in PDBe</span>
        </a>
        <a 
          href={`https://www.uniprot.org/uniprot/${uniprotId}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>UniProt Entry</span>
        </a>
        <a 
          href={`https://alphafold.ebi.ac.uk/entry/${uniprotId}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center text-blue-700 hover:bg-blue-50 p-2 rounded"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>AlphaFold Structure</span>
        </a>
      </div>
    </div>
  );
}
