/**
 * Loading Screen Component
 * 
 * Full-screen loading indicator with optional message.
 * Used for initial app loading and route transitions.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  /** Loading message to display */
  message?: string;
  /** Whether to take full screen height */
  fullScreen?: boolean;
  /** Additional className */
  className?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * LoadingScreen - Displays a centered loading spinner
 * 
 * @example
 * ```tsx
 * if (loading) {
 *   return <LoadingScreen message="Loading content..." />;
 * }
 * ```
 */
export function LoadingScreen({
  message,
  fullScreen = true,
  className,
  size = 'md',
}: LoadingScreenProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-background',
        fullScreen && 'min-h-screen',
        !fullScreen && 'py-12',
        className
      )}
      role="status"
      aria-label={message || 'Loading'}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 
          className={cn(
            'animate-spin text-primary',
            sizeClasses[size]
          )} 
        />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loading spinner for smaller contexts
 */
export function LoadingSpinner({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}): JSX.Element {
  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
}

export default LoadingScreen;
