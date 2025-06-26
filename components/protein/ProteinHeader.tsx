'use client';

import Link from 'next/link';
import { ProteinChain } from '@/types/protein';

interface ProteinHeaderProps {
  protein: ProteinChain;
}

/**
 * ProteinHeader component displays the main protein information at the top of the page
 */
export default function ProteinHeader({ protein }: ProteinHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            {protein.id} 
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              PDB
            </span>
          </h1>
          <h2 className="text-xl text-gray-700 mt-1">{protein.name}</h2>
          <p className="text-gray-600 mt-1">
            {protein.organism} • {protein.length} residues
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-y-1 text-sm text-gray-600">
          <div><span className="font-medium">Method:</span> {protein.method}</div>
          <div><span className="font-medium">Resolution:</span> {protein.resolution}</div>
          <div><span className="font-medium">Released:</span> {protein.releaseDate}</div>
          <div>
            <span className="font-medium">UniProt:</span> 
            <a href={`https://www.uniprot.org/uniprot/${protein.uniprotId}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
              {protein.uniprotId}
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Link 
          href={`/domain/${protein.domains[0].id}`} 
          className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
        >
          {protein.domains.length} domains
        </Link>
        <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
          {protein.domains.map(d => d.ecod.hgroup).filter((v, i, a) => a.indexOf(v) === i).length} H-groups
        </span>
      </div>
    </div>
  );
}
