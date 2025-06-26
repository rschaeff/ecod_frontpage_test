'use client';

import { Download } from 'lucide-react';
import { ProteinChain } from '@/types/protein';

interface ExportSectionProps {
  protein: ProteinChain;
}

export default function ExportSection({ protein }: ExportSectionProps) {
  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Export Options</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Domain PDB files</div>
            <div className="text-xs text-blue-600">Individual structure files</div>
          </div>
        </button>

        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Protein FASTA</div>
            <div className="text-xs text-blue-600">Full protein sequence</div>
          </div>
        </button>

        <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-3 flex items-center text-blue-700">
          <Download className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Domain JSON</div>
            <div className="text-xs text-blue-600">Classification data</div>
          </div>
        </button>
      </div>
    </div>
  );
}
