// Fix for ProteinSequenceViewer.tsx
// Update the interface and callback handling

'use client';

import { useRef } from 'react';
import { Download, Eye, Info } from 'lucide-react';
import { ProteinChain } from '@/types/protein';
import SequenceViewer from '@/components/SequenceViewer';

interface EnhancedSequenceViewerProps {
  protein: ProteinChain;
  highlightedDomain: string | null;
  onPositionSelect?: (position: number | null) => void;  // FIXED: Allow null
}

export default function EnhancedProteinSequenceViewer({
  protein,
  highlightedDomain,
  onPositionSelect
}: EnhancedSequenceViewerProps) {
  const sequenceViewerRef = useRef(null);
  const highlightedDomainData = highlightedDomain
    ? protein.domains.find(d => d.id === highlightedDomain)
    : null;

  // Create highlights for the sequence viewer
  const highlights = protein.domains.map(domain => ({
    start: domain.rangeStart,
    end: domain.rangeEnd,
    color: domain.color,
    metadata: { domainId: domain.id }
  }));

  // Get highlighted position (first residue of highlighted domain)
  const highlightedPosition = highlightedDomainData ? highlightedDomainData.rangeStart : null;

  // Download FASTA sequence
  const downloadFasta = () => {
    const fastaHeader = `>${protein.id}|${protein.uniprotId}|${protein.name}|${protein.organism}`;
    const fastaContent = `${fastaHeader}\n${protein.sequence}`;

    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${protein.id}.fasta`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-800">Protein Sequence</h3>
        <div className="flex items-center space-x-2">
          <button
            className="text-xs flex items-center text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
            onClick={downloadFasta}
          >
            <Download className="h-3 w-3 mr-1" />
            FASTA
          </button>
          <button className="text-xs flex items-center text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
            <Eye className="h-3 w-3 mr-1" />
            Show all
          </button>
        </div>
      </div>

      {/* Highlight info */}
      {highlightedDomainData && (
        <div className="bg-gray-50 p-2 rounded mb-3 text-sm flex items-center">
          <Info className="h-4 w-4 text-blue-500 mr-2" />
          <span>
            Highlighting domain: <strong>{highlightedDomainData.description}</strong> (residues {highlightedDomainData.range})
          </span>
        </div>
      )}

      {/* Sequence display using the enhanced SequenceViewer component */}
      <div className="rounded border bg-gray-50">
        <SequenceViewer
          ref={sequenceViewerRef}
          sequence={protein.sequence}
          rangeStart={1}
          highlights={highlights}
          highlightedPosition={highlightedPosition}
          onPositionSelect={onPositionSelect}
          showNumbering={true}
          showAxis={true}
          displayHeight={300}
          displayFormat="wrap"
          residuesPerLine={60}
          renderingMode="default"
        />
      </div>
    </div>
  );
}
