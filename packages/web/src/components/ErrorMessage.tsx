interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-bg-secondary rounded-2xl text-center">
      <svg className="text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-text-secondary">{message}</p>
      {onRetry && (
        <button
          className="py-3 px-6 bg-accent text-white rounded-xl font-medium transition-all duration-200 hover:bg-accent-hover"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
