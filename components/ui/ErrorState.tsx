import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actions?: React.ReactNode;
}

/**
 * ErrorState component - Displays error messages with optional actions
 */
export default function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  actions
}: ErrorStateProps) {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-md">
        <div className="text-center text-red-500 text-5xl mb-4">
          <AlertCircle className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>
        {actions && (
          <div className="flex justify-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
