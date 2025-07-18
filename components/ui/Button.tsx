// Create components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  size = 'md',
  variant = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white',
    destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
