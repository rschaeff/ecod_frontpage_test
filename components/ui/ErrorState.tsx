// Create components/ui/ErrorState.tsx
interface ErrorStateProps {
  title?: string;
  message: string;
  actions?: React.ReactNode;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  actions
}: ErrorStateProps) {
  return (
    <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-md">
      <div className="text-center text-red-500 text-5xl mb-4">
        <AlertCircle className="h-16 w-16 mx-auto" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-600 mb-6 text-center">{message}</p>
      {actions && <div className="flex flex-col space-y-3">{actions}</div>}
    </div>
  );
}
