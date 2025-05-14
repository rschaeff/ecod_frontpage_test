// Create components/ui/LoadingState.tsx
interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingState({ 
  message = 'Loading...', 
  size = 'medium' 
}: LoadingStateProps) {
  const spinnerSize = size === 'small' ? 'h-6 w-6' : size === 'large' ? 'h-16 w-16' : 'h-12 w-12';
  
  return (
    <div className="flex items-center justify-center p-8 text-center">
      <div>
        <div className={`inline-block animate-spin rounded-full ${spinnerSize} border-4 border-solid border-blue-500 border-t-transparent mb-4`}></div>
        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      </div>
    </div>
  );
}
