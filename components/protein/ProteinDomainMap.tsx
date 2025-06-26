'use client';

import Link from 'next/link';
import { ProteinChain } from '@/types/protein';

interface ProteinDomainMapProps {
  protein: ProteinData;
  highlightedDomain: string | null;
  onDomainHover: (domainId: string | null) => void;
}

export default function ProteinDomainMap({
  protein,
  highlightedDomain,
  onDomainHover
}: ProteinDomainMapProps) {
  // Calculate positions based on protein length
  const positionPercentage = (position: number) => {
    return (position / protein.length) * 100;
  };
  
  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Domain Architecture</h3>
      
      {/* Protein sequence visualization */}
      <div className="relative h-16 mb-4">
        {/* Protein backbone */}
        <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
        
        {/* N-terminus label */}
        <div className="absolute top-4 left-0 transform -translate-x-2">
          <div className="font-bold text-gray-700">N</div>
        </div>
        
        {/* C-terminus label */}
        <div className="absolute top-4 right-0 transform translate-x-2">
          <div className="font-bold text-gray-700">C</div>
        </div>
        
        {/* Domains */}
        {protein.domains.map(domain => (
          <div 
            key={domain.id}
            className="absolute h-6 rounded-lg cursor-pointer transform -translate-y-1/2 transition-all duration-200"
            style={{
              top: '30px',
              left: `${positionPercentage(domain.rangeStart)}%`,
              width: `${positionPercentage(domain.rangeEnd - domain.rangeStart + 1)}%`,
              backgroundColor: domain.color,
              opacity: highlightedDomain && highlightedDomain !== domain.id ? 0.6 : 1,
              border: highlightedDomain === domain.id ? '2px solid #333' : '1px solid rgba(0,0,0,0.1)',
              zIndex: highlightedDomain === domain.id ? 10 : 1
            }}
            onMouseEnter={() => onDomainHover(domain.id)}
            onMouseLeave={() => onDomainHover(null)}
          >
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              {domain.description}
            </div>
            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs">
              {domain.range}
            </div>
          </div>
        ))}
        
        {/* Position markers */}
        <div className="absolute top-9 left-0 text-xs text-gray-500">1</div>
        <div className="absolute top-9 right-0 text-xs text-gray-500">{protein.length}</div>
      </div>
      
      {/* Domain legend */}
      <div className="border-t pt-3 mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Domains</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {protein.domains.map(domain => (
            <div 
              key={domain.id} 
              className={`flex items-center p-2 rounded border ${highlightedDomain === domain.id ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}`}
              onMouseEnter={() => onDomainHover(domain.id)}
              onMouseLeave={() => onDomainHover(null)}
            >
              <div 
                className="w-4 h-4 rounded mr-2 flex-shrink-0" 
                style={{ backgroundColor: domain.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{domain.description}</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="mr-2">
                    <Link href={`/domain/${domain.id}`} className="text-blue-600 hover:underline font-medium">
                      {domain.id}
                    </Link>
                  </span>
                  <span>Range: {domain.range}</span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 pl-2">
                {domain.ecod.fgroup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
