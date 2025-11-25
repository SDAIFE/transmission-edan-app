"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: Array<'USER' | 'ADMIN' | 'SADMIN'>;
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes
 */
export function RouteGuard({ 
  children, 
  requiredRoles,
  redirectTo = '/dashboard'
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        if (!hasRole(requiredRoles)) {
          router.push(redirectTo);
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, hasRole, router, pathname, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

