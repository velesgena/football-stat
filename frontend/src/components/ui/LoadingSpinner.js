export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }[size] || 'h-8 w-8';

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-primary ${sizeClass}`} />
    </div>
  );
} 