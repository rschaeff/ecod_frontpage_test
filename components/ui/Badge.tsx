// Create components/ui/Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ 
  variant = 'default', 
  size = 'sm',
  className = '',
  children 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const variantClasses = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    destructive: 'bg-red-600 text-white'
  };
  
  return (
    <span 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
