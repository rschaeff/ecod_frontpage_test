// Create components/domain/DomainCard.tsx
interface DomainCardProps {
  domain: {
    id: string;
    range: string;
    description: string;
    similarity?: number;
  };
  isHighlighted?: boolean;
  onHover?: (domainId: string | null) => void;
  onClick?: (domainId: string) => void;
}

export default function DomainCard({
  domain,
  isHighlighted = false,
  onHover,
  onClick
}: DomainCardProps) {
  return (
    <div 
      className={`border rounded-md p-3 transition-all ${
        isHighlighted ? 'border-gray-500 bg-gray-50 shadow-sm' : 'border-gray-200'
      }`}
      onMouseEnter={() => onHover && onHover(domain.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onClick && onClick(domain.id)}
    >
      <div className="flex items-center">
        <div className="flex-1">
          <div className="font-medium">{domain.description}</div>
          <div className="text-sm text-gray-500">
            <span>Residues: {domain.range}</span>
          </div>
        </div>
        
        {domain.similarity !== undefined && (
          <div className="text-right">
            <div className="font-medium text-green-700">
              {domain.similarity}% similar
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${domain.similarity}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Link 
          href={`/domain/${domain.id}`}
          className="ml-3 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100"
          onClick={e => e.stopPropagation()}
        >
          View
        </Link>
      </div>
    </div>
  );
}
