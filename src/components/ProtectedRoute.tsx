/**
 * Protected Route Component
 * 
 * Provides role-based access control for routes.
 * Redirects unauthenticated users to login page.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import type { AppRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route. If empty, any authenticated user can access. */
  allowedRoles?: AppRole[];
  /** Redirect path for unauthenticated users */
  redirectTo?: string;
  /** Show loading spinner while checking auth */
  showLoader?: boolean;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * 
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={['student', 'teacher']}>
 *   <StudentDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth',
  showLoader = true,
}: ProtectedRouteProps): JSX.Element {
  const location = useLocation();
  const { user, role, loading: authLoading } = useAuth();
  const { isOnline, getOfflineAuthData } = useOfflineAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Check for offline authentication
  const offlineData = getOfflineAuthData();
  const isOfflineAuthenticated = !isOnline && offlineData && localStorage.getItem('offlineSessionActive') === 'true';

  // Determine effective auth state
  const isAuthenticated = user || isOfflineAuthenticated;
  const effectiveRole = role || offlineData?.userRole;

  useEffect(() => {
    // Wait for auth loading to complete
    if (!authLoading) {
      setIsChecking(false);
    }
  }, [authLoading]);

  // Show loading spinner
  if (isChecking && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Preserve the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    // User is authenticated but doesn't have required role
    // Redirect to their appropriate dashboard
    const dashboardPath = getDashboardPath(effectiveRole);
    return <Navigate to={dashboardPath} replace />;
  }

  // Authenticated and authorized
  return <>{children}</>;
}

/**
 * Get the dashboard path for a given role
 */
function getDashboardPath(role: AppRole | null): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher';
    case 'student':
    default:
      return '/student';
  }
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
): React.FC<P> {
  return function ProtectedRouteWrapper(props: P) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;
