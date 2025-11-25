"use client";

import { RouteGuard } from './route-guard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'USER' | 'ADMIN' | 'SADMIN'>;
}

/**
 * Alias pour RouteGuard pour une utilisation plus simple
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  return (
    <RouteGuard requiredRoles={requiredRoles}>
      {children}
    </RouteGuard>
  );
}

