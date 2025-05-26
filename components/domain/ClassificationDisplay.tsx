// Create components/domain/ClassificationDisplay.tsx

import Link from 'next/link';
import React from 'react';

interface ClassificationProps {
  classification: {
    architecture: string;
    xgroup: { id: string; name: string; };
    hgroup: { id: string; name: string; };
    tgroup: { id: string; name: string; };
    fgroup: { id: string; name: string; };
  };
}

export default function ClassificationDisplay({ classification }: ClassificationProps) {
  return (
    <div className="space-y-3">
      <ClassificationItem 
        type="A" 
        name={classification.architecture} 
        id="" 
        bgColor="bg-red-100" 
        textColor="text-red-800" 
      />
      <ClassificationItem 
        type="X" 
        name={classification.xgroup.name} 
        id={classification.xgroup.id} 
        bgColor="bg-blue-100" 
        textColor="text-blue-800" 
      />
      {/* ...other levels... */}
    </div>
  );
}

interface ClassificationItemProps {
  type: string;
  name: string;
  id: string;
  bgColor: string;
  textColor: string;
}

function ClassificationItem({ type, name, id, bgColor, textColor }: ClassificationItemProps) {
  return (
    <div className="flex items-center">
      <div className={`w-6 h-6 rounded-full ${bgColor} ${textColor} flex items-center justify-center font-bold mr-2`}>
        {type}
      </div>
      <div className="flex-1">
        {id ? (
          <Link href={`/tree?node=${id}`} className="font-medium hover:text-blue-600">{name}</Link>
        ) : (
          <div className="font-medium">{name}</div>
        )}
        <div className="text-xs text-gray-500">
          {type === 'A' && 'Architecture'}
          {type === 'X' && 'X-group (Possible homology)'}
          {type === 'H' && 'H-group (Homology)'}
          {type === 'T' && 'T-group (Topology)'}
          {type === 'F' && 'F-group (Family)'}
        </div>
      </div>
      {id && <div className="text-xs text-gray-500">{id}</div>}
    </div>
  );
}
